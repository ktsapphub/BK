from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header, Query
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ---------------------------------------------------------------------------
# MongoDB connection
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALGO = 'HS256'
JWT_EXPIRE_HOURS = 24 * 7
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'changeme')
APP_NAME = os.environ.get('APP_NAME', 'bretton-key-site')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
storage_key_holder = {"key": None}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Object storage helpers
# ---------------------------------------------------------------------------
def init_storage():
    if storage_key_holder["key"]:
        return storage_key_holder["key"]
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key_holder["key"] = resp.json()["storage_key"]
    return storage_key_holder["key"]


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_jwt(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin user {ADMIN_EMAIL}")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


async def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------
def clean_doc(doc: dict) -> dict:
    if doc is None:
        return doc
    doc.pop("_id", None)
    return doc


VALID_SECTION_TYPES = {
    "hero", "introduction", "values", "thoughts", "resume", "services",
    "projects", "founder_story", "testimonials", "media", "impact",
    "personal", "gallery", "contact", "custom"
}
VALID_STATUS = {"draft", "published", "archived"}


# ===========================================================================
# MODELS
# ===========================================================================
class LoginRequest(BaseModel):
    email: str
    password: str


class SectionCreate(BaseModel):
    page_id: str
    section_type: str
    internal_name: str
    navigation_label: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True
    status: str = "draft"
    theme: Optional[str] = "true_white"
    layout: Optional[str] = None
    transition_style: Optional[str] = "fade"
    content: Dict[str, Any] = Field(default_factory=dict)


class SectionUpdate(BaseModel):
    section_type: Optional[str] = None
    internal_name: Optional[str] = None
    navigation_label: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None
    status: Optional[str] = None
    theme: Optional[str] = None
    layout: Optional[str] = None
    transition_style: Optional[str] = None
    content: Optional[Dict[str, Any]] = None


class PageCreate(BaseModel):
    slug: str
    title: str
    is_published: bool = True


class CareerEntryCreate(BaseModel):
    title: str
    org: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True


class TestimonialCreate(BaseModel):
    name: str
    title: Optional[str] = None
    org: Optional[str] = None
    relationship: Optional[str] = None
    full_quote: str
    short_quote: Optional[str] = None
    portrait_url: Optional[str] = None
    portrait_alt: Optional[str] = None
    linkedin_url: Optional[str] = None
    org_logo_url: Optional[str] = None
    related_project_id: Optional[str] = None
    verified: bool = False
    status: str = "draft"
    display_order: int = 0


# ===========================================================================
# AUTH ROUTES
# ===========================================================================
@api_router.post("/admin/login")
async def admin_login(body: LoginRequest):
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_jwt(user["email"])
    return {"token": token, "email": user["email"], "role": user.get("role", "admin")}


@api_router.get("/admin/me")
async def admin_me(admin=Depends(get_current_admin)):
    return {"email": admin["email"], "role": admin.get("role", "admin")}


# ===========================================================================
# MEDIA ROUTES
# ===========================================================================
@api_router.post("/admin/media/upload")
async def upload_media(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/media/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    media_id = str(uuid.uuid4())
    doc = {
        "id": media_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": now_iso(),
    }
    await db.media_items.insert_one(doc)
    doc["url"] = f"/api/media/{media_id}"
    return clean_doc(doc)


@api_router.get("/admin/media")
async def list_media(admin=Depends(get_current_admin)):
    items = await db.media_items.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for it in items:
        it["url"] = f"/api/media/{it['id']}"
    return items


@api_router.delete("/admin/media/{media_id}")
async def delete_media(media_id: str, admin=Depends(get_current_admin)):
    result = await db.media_items.update_one({"id": media_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"success": True}


@api_router.get("/media/{media_id}")
async def get_media(media_id: str):
    record = await db.media_items.find_one({"id": media_id, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(record["storage_path"])
    return Response(content=data, media_type=record.get("content_type") or content_type)


# ===========================================================================
# PAGE ROUTES (admin)
# ===========================================================================
@api_router.post("/admin/pages")
async def create_page(body: PageCreate, admin=Depends(get_current_admin)):
    existing = await db.pages.find_one({"slug": body.slug})
    if existing:
        return clean_doc(existing)
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.pages.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/pages")
async def list_pages(admin=Depends(get_current_admin)):
    return await db.pages.find({}, {"_id": 0}).to_list(1000)


# ===========================================================================
# SECTION ROUTES (admin CRUD + publish + versioning)
# ===========================================================================
async def snapshot_version(section_doc: dict):
    version = {
        "id": str(uuid.uuid4()),
        "section_id": section_doc["id"],
        "snapshot": {k: v for k, v in section_doc.items() if k != "_id"},
        "created_at": now_iso(),
    }
    await db.content_versions.insert_one(version)


@api_router.post("/admin/sections")
async def create_section(body: SectionCreate, admin=Depends(get_current_admin)):
    if body.status not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    doc["published_at"] = now_iso() if body.status == "published" else None
    await db.sections.insert_one(doc)
    if body.status == "published":
        await snapshot_version(doc)
    return clean_doc(doc)


@api_router.get("/admin/sections")
async def list_sections_admin(page_id: Optional[str] = None, admin=Depends(get_current_admin)):
    query = {"page_id": page_id} if page_id else {}
    return await db.sections.find(query, {"_id": 0}).sort("display_order", 1).to_list(2000)


@api_router.get("/admin/sections/{section_id}")
async def get_section_admin(section_id: str, admin=Depends(get_current_admin)):
    doc = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Section not found")
    return doc


@api_router.put("/admin/sections/{section_id}")
async def update_section(section_id: str, body: SectionUpdate, admin=Depends(get_current_admin)):
    existing = await db.sections.find_one({"id": section_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Section not found")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "status" in update and update["status"] not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")
    update["updated_at"] = now_iso()
    was_published = existing.get("status") == "published"
    will_publish = update.get("status", existing.get("status")) == "published"
    if will_publish and not was_published:
        update["published_at"] = now_iso()
    await db.sections.update_one({"id": section_id}, {"$set": update})
    new_doc = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if will_publish:
        await snapshot_version(new_doc)
    return new_doc


@api_router.delete("/admin/sections/{section_id}")
async def delete_section(section_id: str, admin=Depends(get_current_admin)):
    result = await db.sections.delete_one({"id": section_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"success": True}


@api_router.get("/admin/sections/{section_id}/versions")
async def get_section_versions(section_id: str, admin=Depends(get_current_admin)):
    versions = await db.content_versions.find({"section_id": section_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return versions


@api_router.post("/admin/sections/{section_id}/rollback/{version_id}")
async def rollback_section(section_id: str, version_id: str, admin=Depends(get_current_admin)):
    version = await db.content_versions.find_one({"id": version_id, "section_id": section_id})
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    snapshot = version["snapshot"]
    restore = {k: v for k, v in snapshot.items() if k not in ("id", "_id")}
    restore["updated_at"] = now_iso()
    await db.sections.update_one({"id": section_id}, {"$set": restore})
    new_doc = await db.sections.find_one({"id": section_id}, {"_id": 0})
    return new_doc


# ===========================================================================
# CAREER ENTRIES (admin)
# ===========================================================================
@api_router.post("/admin/career-entries")
async def create_career_entry(body: CareerEntryCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.career_entries.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/career-entries")
async def list_career_entries_admin(admin=Depends(get_current_admin)):
    return await db.career_entries.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.put("/admin/career-entries/{entry_id}")
async def update_career_entry(entry_id: str, body: dict, admin=Depends(get_current_admin)):
    body.pop("id", None)
    body.pop("_id", None)
    result = await db.career_entries.update_one({"id": entry_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return await db.career_entries.find_one({"id": entry_id}, {"_id": 0})


@api_router.delete("/admin/career-entries/{entry_id}")
async def delete_career_entry(entry_id: str, admin=Depends(get_current_admin)):
    await db.career_entries.delete_one({"id": entry_id})
    return {"success": True}


# ===========================================================================
# TESTIMONIALS (admin)
# ===========================================================================
@api_router.post("/admin/testimonials")
async def create_testimonial(body: TestimonialCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.testimonials.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/testimonials")
async def list_testimonials_admin(admin=Depends(get_current_admin)):
    return await db.testimonials.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.put("/admin/testimonials/{tid}")
async def update_testimonial(tid: str, body: dict, admin=Depends(get_current_admin)):
    body.pop("id", None)
    body.pop("_id", None)
    result = await db.testimonials.update_one({"id": tid}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return await db.testimonials.find_one({"id": tid}, {"_id": 0})


@api_router.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, admin=Depends(get_current_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"success": True}


# ===========================================================================
# PUBLIC ROUTES (RLS-equivalent: only published + visible)
# ===========================================================================
@api_router.get("/public/page/{slug}")
async def get_public_page(slug: str):
    page = await db.pages.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    sections = await db.sections.find(
        {"page_id": page["id"], "status": "published", "is_visible": True},
        {"_id": 0}
    ).sort("display_order", 1).to_list(500)
    # Graceful handling of unknown section types
    safe_sections = []
    for s in sections:
        if s.get("section_type") not in VALID_SECTION_TYPES:
            s["section_type"] = "custom"
            s["content"] = s.get("content") or {}
        safe_sections.append(s)
    return {"page": page, "sections": safe_sections}


@api_router.get("/public/career-entries")
async def get_public_career_entries():
    entries = await db.career_entries.find({"is_visible": True}, {"_id": 0}).sort("display_order", 1).to_list(500)
    return entries


@api_router.get("/public/testimonials")
async def get_public_testimonials():
    items = await db.testimonials.find(
        {"verified": True, "status": "published"}, {"_id": 0}
    ).sort("display_order", 1).to_list(500)
    return items


@api_router.get("/")
async def root():
    return {"message": "Bretton Key CMS API"}


# ---------------------------------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
