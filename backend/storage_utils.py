"""
backend/storage_utils.py

Replaces the Emergent object-store proxy with storage you own.

The old version POSTed your EMERGENT_LLM_KEY to
integrations.emergentagent.com/objstore to get a storage key, then pushed every
media upload through Emergent's servers. That call fails outside Emergent's
platform, and even where it works your media lives on infrastructure you do not
control. This module keeps the exact same three-function interface
(init_storage / put_object / get_object) so server.py needs no changes.

Two backends, chosen with the STORAGE_BACKEND env var:

  STORAGE_BACKEND=gridfs   (default)
      Stores files in the MongoDB you are already running. Zero extra services,
      zero extra cost, works the moment you deploy. Good up to a few GB of
      media. Files stream through your API process.

  STORAGE_BACKEND=s3
      Any S3-compatible provider: AWS S3, Cloudflare R2, Backblaze B2, MinIO,
      DigitalOcean Spaces. Better for larger media libraries and lets you put a
      CDN in front later. Cloudflare R2 is the usual pick — no egress fees.

Switching between them later is a config change, not a code change. Note that
existing files do not migrate automatically; see MIGRATION at the bottom.
"""

import os
import io
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "gridfs").strip().lower()

# --- S3 config (only read when STORAGE_BACKEND=s3) ---
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL")  # omit for real AWS S3
S3_REGION = os.environ.get("S3_REGION", "auto")
S3_ACCESS_KEY_ID = os.environ.get("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.environ.get("S3_SECRET_ACCESS_KEY")

_s3_client = None
_gridfs_bucket = None


# =====================================================================
# GridFS backend
# =====================================================================
def _get_gridfs():
    """Lazily build an async GridFS bucket on the existing Motor connection."""
    global _gridfs_bucket
    if _gridfs_bucket is None:
        from motor.motor_asyncio import AsyncIOMotorGridFSBucket
        from database import db
        _gridfs_bucket = AsyncIOMotorGridFSBucket(db, bucket_name="media")
    return _gridfs_bucket


# =====================================================================
# S3 backend
# =====================================================================
def _get_s3():
    global _s3_client
    if _s3_client is None:
        import boto3
        from botocore.config import Config

        if not S3_BUCKET:
            raise RuntimeError(
                "STORAGE_BACKEND=s3 but S3_BUCKET is not set. "
                "Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY "
                "(and S3_ENDPOINT_URL for R2/B2/MinIO)."
            )

        kwargs = {
            "aws_access_key_id": S3_ACCESS_KEY_ID,
            "aws_secret_access_key": S3_SECRET_ACCESS_KEY,
            "region_name": S3_REGION,
            # R2 and most non-AWS providers require SigV4 + path-style.
            "config": Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        }
        if S3_ENDPOINT_URL:
            kwargs["endpoint_url"] = S3_ENDPOINT_URL

        _s3_client = boto3.client("s3", **kwargs)
    return _s3_client


# =====================================================================
# Public interface — same shape server.py already calls
# =====================================================================
def init_storage():
    """Called once at FastAPI startup. Validates config and fails loudly if the
    backend is misconfigured, rather than silently breaking on first upload."""
    if STORAGE_BACKEND == "s3":
        client = _get_s3()
        # head_bucket surfaces bad credentials / wrong bucket name at boot.
        client.head_bucket(Bucket=S3_BUCKET)
        logger.info("Storage backend: s3 (bucket=%s endpoint=%s)", S3_BUCKET, S3_ENDPOINT_URL or "aws")
        return S3_BUCKET

    if STORAGE_BACKEND == "gridfs":
        logger.info("Storage backend: gridfs (MongoDB)")
        return "gridfs"

    raise RuntimeError(f"Unknown STORAGE_BACKEND={STORAGE_BACKEND!r}. Use 's3' or 'gridfs'.")


async def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Store bytes at `path`. Returns {"path": ..., "size": ...}."""
    if STORAGE_BACKEND == "s3":
        _get_s3().put_object(
            Bucket=S3_BUCKET,
            Key=path,
            Body=data,
            ContentType=content_type,
        )
        return {"path": path, "size": len(data)}

    bucket = _get_gridfs()
    # Overwrite semantics: drop any existing file at this path first.
    async for old in bucket.find({"filename": path}):
        await bucket.delete(old._id)
    await bucket.upload_from_stream(
        path,
        io.BytesIO(data),
        metadata={"content_type": content_type},
    )
    return {"path": path, "size": len(data)}


async def get_object(path: str) -> Tuple[bytes, str]:
    """Fetch bytes at `path`. Returns (data, content_type)."""
    if STORAGE_BACKEND == "s3":
        resp = _get_s3().get_object(Bucket=S3_BUCKET, Key=path)
        return resp["Body"].read(), resp.get("ContentType", "application/octet-stream")

    bucket = _get_gridfs()
    stream = await bucket.open_download_stream_by_name(path)
    data = await stream.read()
    content_type = (stream.metadata or {}).get("content_type", "application/octet-stream")
    return data, content_type


async def delete_object(path: str) -> None:
    """Hard-delete. server.py currently only soft-deletes media (is_deleted flag),
    so this is unused today — it's here for when you add real purging."""
    if STORAGE_BACKEND == "s3":
        _get_s3().delete_object(Bucket=S3_BUCKET, Key=path)
        return

    bucket = _get_gridfs()
    async for f in bucket.find({"filename": path}):
        await bucket.delete(f._id)


# =====================================================================
# IMPORTANT — server.py call sites must be awaited
# =====================================================================
# put_object and get_object are now async (GridFS via Motor is async). The old
# Emergent versions were sync. Two lines in backend/server.py need `await`:
#
#   upload_media():
#     - result = put_object(path, data, file.content_type or "application/octet-stream")
#     + result = await put_object(path, data, file.content_type or "application/octet-stream")
#
#   get_media():
#     - data, content_type = get_object(record["storage_path"])
#     + data, content_type = await get_object(record["storage_path"])
#
# Both are already inside `async def` handlers, so no other changes are needed.
#
# =====================================================================
# MIGRATION — existing media
# =====================================================================
# Any files already uploaded live in Emergent's object store and will 404 after
# this swap. The database rows survive, so the admin media library will still
# list them, but the bytes are gone from your side.
#
# If you need them: while your Emergent instance is still running, hit
# GET /api/media/{id} for each item, save the bytes, then re-upload through
# POST /api/admin/media/upload once this is deployed. Do that before you let
# your Emergent subscription lapse.
