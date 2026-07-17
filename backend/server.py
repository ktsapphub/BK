from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Request
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
import time
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from database import db, client, clean_doc, clean_docs
from auth_utils import (
    hash_password, verify_password, create_jwt, seed_admin,
    get_current_admin, now_iso,
)
from storage_utils import init_storage, put_object, get_object
from models import (
    LoginRequest, UserCreate, ChangePasswordRequest, SetPasswordRequest, PageviewCreate, PageCreate, SectionCreate, SectionUpdate,
    CareerEntryCreate, TestimonialCreate, ProjectCreate, ServiceCreate,
    ThoughtCreate, ImpactItemCreate, NavigationItemCreate,
    GlobalSettingsUpdate, InquiryCreate, NewsletterSignup, ReorderRequest,
    VALID_SECTION_TYPES, VALID_STATUS,
)

APP_NAME = os.environ.get('APP_NAME', 'bretton-key-site')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")

REORDER_COLLECTIONS = {
    "sections": "sections",
    "career_entries": "career_entries",
    "testimonials": "testimonials",
    "projects": "projects",
    "services": "services",
    "thoughts": "thoughts",
    "impact_items": "impact_items",
    "navigation_items": "navigation_items",
}


@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed_admin()
    existing_settings = await db.global_settings.find_one({"key": "site"})
    if not existing_settings:
        await db.global_settings.insert_one({
            "key": "site",
            "site_title": "Bretton J. Key",
            "site_tagline": "Twenty Years in Motion",
            "contact_email": "brettonjkey@icloud.com",
            "contact_phone": "(757) 589-4148",
            "contact_location": "Norfolk, VA",
            "scheduling_url": "https://calendly.com/bretton-j-key",
            "social_instagram": "https://instagram.com/key.to.success",
            "social_threads": "https://www.threads.net/@key.to.success",
            "social_linkedin": "https://linkedin.com/in/brettonjkey",
            "footer_text": "\u00a9 2026 Bretton J. Key. All rights reserved.",
            "seo_default_title": "Bretton J. Key \u2014 Delivery Leader & Builder",
            "seo_default_description": "PMP-certified delivery leader with 20+ years driving mission-critical technical programs.",
            "seo_og_image": None,
            "resume_pdf_url": None,
            "updated_at": now_iso(),
        })
    home_page = await db.pages.find_one({"slug": "home"})
    if not home_page:
        await db.pages.insert_one({
            "id": str(uuid.uuid4()),
            "slug": "home",
            "title": "Home",
            "is_published": True,
            "created_at": now_iso(),
        })

    # Backfill any newly-introduced global settings keys without overwriting existing values.
    connect_defaults = {
        "connect_dialog_heading": "Let's Connect.",
        "connect_dialog_copy": "Tell me what brought you here, and I'll follow up to learn more.",
        "contact_consent_text": "I agree that Bretton Key may contact me by email, phone call, or text message regarding this inquiry. Message and data rates may apply.",
        "contact_consent_supporting_text": "Consent applies only to communications related to this request unless you separately choose to receive marketing updates. You may ask not to be contacted by phone or text at any time.",
        "contact_consent_version": "contact-consent-v1",
        "marketing_consent_text": "Yes, I would also like to receive occasional updates from Bretton about projects, applications, services, and events.",
        "newsletter_enabled": True,
        "privacy_policy_url": "/privacy",
    }
    current_settings = await db.global_settings.find_one({"key": "site"}) or {}
    missing_fields = {k: v for k, v in connect_defaults.items() if k not in current_settings}
    if missing_fields:
        missing_fields["updated_at"] = now_iso()
        await db.global_settings.update_one({"key": "site"}, {"$set": missing_fields}, upsert=True)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ===========================================================================
# AUTH
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
# ADMIN USERS (multi-user, all full access)
# ===========================================================================
@api_router.post("/admin/users")
async def create_admin_user(body: UserCreate, admin=Depends(get_current_admin)):
    username = body.email.strip()
    if not username or len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Username is required and password must be at least 6 characters")
    existing = await db.users.find_one({"email": username})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this username already exists")
    doc = {
        "id": str(uuid.uuid4()),
        "email": username,
        "password_hash": hash_password(body.password),
        "role": "admin",
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    return {"id": doc["id"], "email": doc["email"], "role": doc["role"], "created_at": doc["created_at"]}


@api_router.get("/admin/users")
async def list_admin_users(admin=Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", 1).to_list(200)
    return users


@api_router.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: str, admin=Depends(get_current_admin)):
    total = await db.users.count_documents({})
    if total <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the last remaining admin user")
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["email"] == admin["email"]:
        raise HTTPException(status_code=400, detail="You cannot delete the account you're currently logged in as")
    await db.users.delete_one({"id": user_id})
    return {"success": True}


@api_router.put("/admin/users/{user_id}/password")
async def set_user_password(user_id: str, body: SetPasswordRequest, admin=Depends(get_current_admin)):
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.update_one({"id": user_id}, {"$set": {"password_hash": hash_password(body.new_password)}})
    return {"success": True}


@api_router.post("/admin/change-password")
async def change_own_password(body: ChangePasswordRequest):
    username = body.email.strip()
    user = await db.users.find_one({"email": username})
    if not user or not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Username or current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(body.new_password)}})
    return {"success": True}


# ===========================================================================
# ANALYTICS (self-hosted pageview tracking)
# ===========================================================================
@api_router.post("/public/analytics/pageview")
async def track_pageview(body: PageviewCreate):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    try:
        await db.analytics_pageviews.insert_one(doc)
    except Exception as e:
        logger.error(f"Failed to record pageview: {e}")
    return {"success": True}


@api_router.get("/admin/analytics/summary")
async def analytics_summary(days: int = 30, admin=Depends(get_current_admin)):
    days = max(1, min(days, 365))
    since_iso = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    items = await db.analytics_pageviews.find({"created_at": {"$gte": since_iso}}, {"_id": 0}).to_list(50000)

    total_views = len(items)
    unique_visitors = len({i.get("visitor_id") for i in items if i.get("visitor_id")})

    by_day, by_path, by_referrer, by_device = {}, {}, {}, {}
    for i in items:
        day = (i.get("created_at") or "")[:10]
        if day:
            by_day[day] = by_day.get(day, 0) + 1
        path = i.get("path") or "/"
        by_path[path] = by_path.get(path, 0) + 1
        ref = (i.get("referrer") or "").strip()
        ref_label = "Direct" if not ref else ref
        by_referrer[ref_label] = by_referrer.get(ref_label, 0) + 1
        dev = i.get("device") or "unknown"
        by_device[dev] = by_device.get(dev, 0) + 1

    views_by_day = [{"date": d, "count": c} for d, c in sorted(by_day.items())]
    top_paths = sorted(({"path": p, "count": c} for p, c in by_path.items()), key=lambda x: -x["count"])[:10]
    top_referrers = sorted(({"referrer": r, "count": c} for r, c in by_referrer.items()), key=lambda x: -x["count"])[:10]
    device_breakdown = [{"device": d, "count": c} for d, c in by_device.items()]

    return {
        "total_views": total_views,
        "unique_visitors": unique_visitors,
        "views_by_day": views_by_day,
        "top_paths": top_paths,
        "top_referrers": top_referrers,
        "device_breakdown": device_breakdown,
    }


# ===========================================================================
# MEDIA LIBRARY (object storage)
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
# PAGES (admin)
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
# SECTIONS (admin CRUD + publish + versioning + reorder)
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
    return await db.content_versions.find({"section_id": section_id}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.post("/admin/sections/{section_id}/rollback/{version_id}")
async def rollback_section(section_id: str, version_id: str, admin=Depends(get_current_admin)):
    version = await db.content_versions.find_one({"id": version_id, "section_id": section_id})
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    snapshot = version["snapshot"]
    restore = {k: v for k, v in snapshot.items() if k not in ("id", "_id")}
    restore["updated_at"] = now_iso()
    await db.sections.update_one({"id": section_id}, {"$set": restore})
    return await db.sections.find_one({"id": section_id}, {"_id": 0})


# ===========================================================================
# GENERIC REORDER
# ===========================================================================
@api_router.post("/admin/reorder/{collection}")
async def reorder_collection(collection: str, body: ReorderRequest, admin=Depends(get_current_admin)):
    if collection not in REORDER_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Invalid collection")
    coll = db[REORDER_COLLECTIONS[collection]]
    for item in body.items:
        await coll.update_one({"id": item.id}, {"$set": {"display_order": item.display_order}})
    return {"success": True}


# ===========================================================================
# CAREER ENTRIES (admin + public)
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
    body.pop("id", None); body.pop("_id", None)
    result = await db.career_entries.update_one({"id": entry_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return await db.career_entries.find_one({"id": entry_id}, {"_id": 0})


@api_router.delete("/admin/career-entries/{entry_id}")
async def delete_career_entry(entry_id: str, admin=Depends(get_current_admin)):
    await db.career_entries.delete_one({"id": entry_id})
    return {"success": True}


@api_router.get("/public/career-entries")
async def get_public_career_entries():
    return await db.career_entries.find({"is_visible": True}, {"_id": 0}).sort("display_order", 1).to_list(500)


# ===========================================================================
# TESTIMONIALS (admin + public verified-gate)
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
    body.pop("id", None); body.pop("_id", None)
    result = await db.testimonials.update_one({"id": tid}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return await db.testimonials.find_one({"id": tid}, {"_id": 0})


@api_router.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, admin=Depends(get_current_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"success": True}


@api_router.get("/public/testimonials")
async def get_public_testimonials():
    return await db.testimonials.find({"verified": True, "status": "published"}, {"_id": 0}).sort("display_order", 1).to_list(500)


# ===========================================================================
# PROJECTS (admin + public)
# ===========================================================================
@api_router.post("/admin/projects")
async def create_project(body: ProjectCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.projects.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/projects")
async def list_projects_admin(admin=Depends(get_current_admin)):
    return await db.projects.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.put("/admin/projects/{pid}")
async def update_project(pid: str, body: dict, admin=Depends(get_current_admin)):
    body.pop("id", None); body.pop("_id", None)
    result = await db.projects.update_one({"id": pid}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return await db.projects.find_one({"id": pid}, {"_id": 0})


@api_router.delete("/admin/projects/{pid}")
async def delete_project(pid: str, admin=Depends(get_current_admin)):
    await db.projects.delete_one({"id": pid})
    return {"success": True}


@api_router.get("/public/projects")
async def get_public_projects():
    return await db.projects.find({"is_published": True}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.get("/public/projects/{slug}")
async def get_public_project(slug: str):
    doc = await db.projects.find_one({"$or": [{"slug": slug}, {"id": slug}], "is_published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


# ===========================================================================
# SERVICES (admin + public)
# ===========================================================================
@api_router.post("/admin/services")
async def create_service(body: ServiceCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.services.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/services")
async def list_services_admin(admin=Depends(get_current_admin)):
    return await db.services.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.put("/admin/services/{sid}")
async def update_service(sid: str, body: dict, admin=Depends(get_current_admin)):
    body.pop("id", None); body.pop("_id", None)
    result = await db.services.update_one({"id": sid}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return await db.services.find_one({"id": sid}, {"_id": 0})


@api_router.delete("/admin/services/{sid}")
async def delete_service(sid: str, admin=Depends(get_current_admin)):
    await db.services.delete_one({"id": sid})
    return {"success": True}


@api_router.get("/public/services")
async def get_public_services():
    return await db.services.find({"is_published": True}, {"_id": 0}).sort("display_order", 1).to_list(500)


# ===========================================================================
# THOUGHTS / ARTICLES (admin + public)
# ===========================================================================
@api_router.post("/admin/thoughts")
async def create_thought(body: ThoughtCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.thoughts.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/thoughts")
async def list_thoughts_admin(admin=Depends(get_current_admin)):
    return await db.thoughts.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.put("/admin/thoughts/{tid}")
async def update_thought(tid: str, body: dict, admin=Depends(get_current_admin)):
    body.pop("id", None); body.pop("_id", None)
    result = await db.thoughts.update_one({"id": tid}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Thought not found")
    return await db.thoughts.find_one({"id": tid}, {"_id": 0})


@api_router.delete("/admin/thoughts/{tid}")
async def delete_thought(tid: str, admin=Depends(get_current_admin)):
    await db.thoughts.delete_one({"id": tid})
    return {"success": True}


@api_router.get("/public/thoughts")
async def get_public_thoughts():
    return await db.thoughts.find({"is_published": True}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.get("/public/thoughts/{slug}")
async def get_public_thought(slug: str):
    doc = await db.thoughts.find_one({"$or": [{"slug": slug}, {"id": slug}], "is_published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return doc


# ===========================================================================
# IMPACT / MEDIA LOG (admin + public) -- distinct from testimonials, allows video/podcast
# ===========================================================================
@api_router.post("/admin/impact-items")
async def create_impact_item(body: ImpactItemCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.impact_items.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/impact-items")
async def list_impact_items_admin(admin=Depends(get_current_admin)):
    return await db.impact_items.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.put("/admin/impact-items/{iid}")
async def update_impact_item(iid: str, body: dict, admin=Depends(get_current_admin)):
    body.pop("id", None); body.pop("_id", None)
    result = await db.impact_items.update_one({"id": iid}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Impact item not found")
    return await db.impact_items.find_one({"id": iid}, {"_id": 0})


@api_router.delete("/admin/impact-items/{iid}")
async def delete_impact_item(iid: str, admin=Depends(get_current_admin)):
    await db.impact_items.delete_one({"id": iid})
    return {"success": True}


@api_router.get("/public/impact-items")
async def get_public_impact_items():
    return await db.impact_items.find({"is_published": True}, {"_id": 0}).sort("display_order", 1).to_list(500)


# ===========================================================================
# NAVIGATION (admin + public)
# ===========================================================================
@api_router.post("/admin/navigation-items")
async def create_nav_item(body: NavigationItemCreate, admin=Depends(get_current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.navigation_items.insert_one(doc)
    return clean_doc(doc)


@api_router.get("/admin/navigation-items")
async def list_nav_items_admin(admin=Depends(get_current_admin)):
    return await db.navigation_items.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)


@api_router.delete("/admin/navigation-items/{nid}")
async def delete_nav_item(nid: str, admin=Depends(get_current_admin)):
    await db.navigation_items.delete_one({"id": nid})
    return {"success": True}


@api_router.get("/public/navigation")
async def get_public_navigation():
    manual = await db.navigation_items.find({"is_visible": True}, {"_id": 0}).sort("display_order", 1).to_list(200)
    if manual:
        return manual
    # Auto-derive from published + visible sections that have a navigation_label
    sections = await db.sections.find(
        {"status": "published", "is_visible": True, "navigation_label": {"$nin": [None, ""]}},
        {"_id": 0}
    ).sort("display_order", 1).to_list(200)
    return [
        {"id": s["id"], "label": s["navigation_label"], "section_id": s["id"], "display_order": s["display_order"]}
        for s in sections
    ]


# ===========================================================================
# GLOBAL SETTINGS
# ===========================================================================
@api_router.get("/admin/global-settings")
async def get_global_settings_admin(admin=Depends(get_current_admin)):
    doc = await db.global_settings.find_one({"key": "site"}, {"_id": 0})
    return doc or {}


@api_router.put("/admin/global-settings")
async def update_global_settings(body: GlobalSettingsUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    await db.global_settings.update_one({"key": "site"}, {"$set": update}, upsert=True)
    return await db.global_settings.find_one({"key": "site"}, {"_id": 0})


@api_router.get("/public/global-settings")
async def get_public_global_settings():
    doc = await db.global_settings.find_one({"key": "site"}, {"_id": 0})
    return doc or {}


# ===========================================================================
# INQUIRIES (public submit + admin manage)
# ===========================================================================
CONTACT_CONSENT_VERSION_DEFAULT = "contact-consent-v1"
_RATE_LIMIT_WINDOW_SECONDS = 15 * 60
_RATE_LIMIT_MAX_REQUESTS = 5
_rate_limit_store: dict = {}


def _check_rate_limit(ip: str) -> bool:
    now = time.time()
    timestamps = [t for t in _rate_limit_store.get(ip, []) if now - t < _RATE_LIMIT_WINDOW_SECONDS]
    if len(timestamps) >= _RATE_LIMIT_MAX_REQUESTS:
        _rate_limit_store[ip] = timestamps
        return False
    timestamps.append(now)
    _rate_limit_store[ip] = timestamps
    return True


def _sanitize_text(value: Optional[str], max_len: int = 2000) -> Optional[str]:
    if value is None:
        return None
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", str(value)).strip()
    return cleaned[:max_len] if cleaned else None


@api_router.post("/public/inquiries")
async def submit_inquiry(body: InquiryCreate, request: Request):
    # Honeypot: bots that fill this hidden field get a generic success
    # response but nothing is persisted.
    if body.hp:
        return {"success": True, "message": "Thank you \u2014 your message has been received.", "id": str(uuid.uuid4())}

    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    # Server-side consent re-validation (never trust the client alone).
    if not body.contact_consent or not (body.contact_consent_text or "").strip():
        raise HTTPException(status_code=400, detail="Please provide consent so Bretton can respond to your inquiry.")

    name = _sanitize_text(body.name, 200)
    email = _sanitize_text(body.email, 200)
    message = _sanitize_text(body.message, 1500)
    reason = _sanitize_text(body.reason, 100)
    if not name or not email or not message or not reason:
        raise HTTPException(status_code=400, detail="Name, email, reason, and message are required.")

    # Dedupe-guard: identical email+message resubmitted within 2 minutes
    # (double-click / retry) returns the original success without duplicating.
    recent = await db.inquiries.find_one({"email": email, "message": message}, sort=[("created_at", -1)])
    if recent and recent.get("created_at"):
        try:
            recent_dt = datetime.fromisoformat(recent["created_at"])
            if (datetime.now(timezone.utc) - recent_dt).total_seconds() < 120:
                return {"success": True, "message": "Thank you \u2014 your message has been received.", "id": recent["id"]}
        except Exception:
            pass

    doc = body.model_dump()
    doc.pop("hp", None)
    doc.update({
        "name": name,
        "email": email,
        "message": message,
        "reason": reason,
        "phone": _sanitize_text(body.phone, 40),
        "pick_brain_topic": _sanitize_text(body.pick_brain_topic, 1500),
        "speaking_topic": _sanitize_text(body.speaking_topic, 1500),
        "id": str(uuid.uuid4()),
        "status": "new",
        "contact_consent_version": body.contact_consent_version or CONTACT_CONSENT_VERSION_DEFAULT,
        "contact_consent_at": now_iso(),
        "marketing_consent_at": now_iso() if body.marketing_consent else None,
        "created_at": now_iso(),
    })
    await db.inquiries.insert_one(doc)
    return {"success": True, "message": "Thank you \u2014 your message has been received.", "id": doc["id"]}


@api_router.get("/admin/inquiries")
async def list_inquiries(admin=Depends(get_current_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.put("/admin/inquiries/{iid}")
async def update_inquiry(iid: str, body: dict, admin=Depends(get_current_admin)):
    status = body.get("status")
    if status not in {"new", "handled", "archived"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.inquiries.update_one({"id": iid}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return await db.inquiries.find_one({"id": iid}, {"_id": 0})


@api_router.delete("/admin/inquiries/{iid}")
async def delete_inquiry(iid: str, admin=Depends(get_current_admin)):
    await db.inquiries.delete_one({"id": iid})
    return {"success": True}


# ===========================================================================
# NEWSLETTER SIGNUP
# ===========================================================================
@api_router.post("/public/newsletter")
async def newsletter_signup(body: NewsletterSignup):
    existing = await db.newsletter_subscribers.find_one({"email": body.email})
    if existing:
        return {"success": True, "message": "You're already subscribed."}
    await db.newsletter_subscribers.insert_one({
        "id": str(uuid.uuid4()),
        "email": body.email,
        "created_at": now_iso(),
    })
    return {"success": True, "message": "Subscribed. Thank you for following along."}


@api_router.get("/admin/newsletter-subscribers")
async def list_newsletter_subscribers(admin=Depends(get_current_admin)):
    return await db.newsletter_subscribers.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)


# ===========================================================================
# PAGE / SECTIONS PUBLIC (RLS-equivalent)
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
    safe_sections = []
    for s in sections:
        if s.get("section_type") not in VALID_SECTION_TYPES:
            s["section_type"] = "custom"
            s["content"] = s.get("content") or {}
        safe_sections.append(s)
    return {"page": page, "sections": safe_sections}


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
