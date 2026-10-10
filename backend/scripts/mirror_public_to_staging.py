"""
Fill the STAGING database with what the live site shows, so staging looks like brettonkey.com.

- Reads only the live site's PUBLIC API (what any visitor sees). Never connects to the
  production database, never needs admin credentials.
- Refuses to run unless DB_NAME contains "staging".
- Runs as the staging pre-deploy step: does nothing if staging already has content
  (so CMS edits made on staging are kept). Set MIRROR_FORCE=1 to refresh from live.

Run: python scripts/mirror_public_to_staging.py
"""
import json
import os
import sys
import urllib.request

from pymongo import MongoClient

SOURCE = os.environ.get("MIRROR_SOURCE", "https://api.brettonkey.com/api").rstrip("/")
DB_NAME = os.environ.get("DB_NAME", "")
FORCE = os.environ.get("MIRROR_FORCE") == "1"

# public endpoint -> collection (public endpoints return full documents minus _id)
LISTS = {
    "career-entries": "career_entries",
    "testimonials": "testimonials",
    "projects": "projects",
    "services": "services",
    "thoughts": "thoughts",
    "impact-items": "impact_items",
}


def fetch(path):
    req = urllib.request.Request(f"{SOURCE}/{path}", headers={"User-Agent": "bk-staging-mirror"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def replace(db, coll, docs):
    db[coll].delete_many({})
    if docs:
        db[coll].insert_many([dict(d) for d in docs])
    print(f"  {coll}: {len(docs)}")


def main():
    if "staging" not in DB_NAME.lower():
        sys.exit(f"Refusing to run: DB_NAME '{DB_NAME}' is not a staging database.")
    db = MongoClient(os.environ["MONGO_URL"])[DB_NAME]
    if db.sections.count_documents({}) and not FORCE:
        print("Staging already has content; skipping mirror (set MIRROR_FORCE=1 to refresh).")
        return
    try:
        home = fetch("public/page/home")
        lists = {coll: fetch(f"public/{ep}") for ep, coll in LISTS.items()}
        nav = fetch("public/navigation")
        settings = fetch("public/global-settings")
    except Exception as e:  # live site unreachable: keep staging as is, don't block the deploy
        print(f"Mirror skipped, could not read {SOURCE}: {e}")
        return

    print(f"Mirroring {SOURCE} into {DB_NAME}:")
    db.pages.delete_many({"slug": "home"})
    db.pages.insert_one(dict(home["page"]))
    replace(db, "sections", home.get("sections", []))
    for coll, docs in lists.items():
        replace(db, coll, docs)
    # Manual nav items carry is_visible; auto-derived ones rebuild from sections on their own.
    replace(db, "navigation_items", [n for n in nav if "is_visible" in n])
    if settings:
        db.global_settings.replace_one({"key": "site"}, {**settings, "key": "site"}, upsert=True)
        print("  global_settings: 1")
    print("Mirror complete.")


if __name__ == "__main__":
    main()
