"""Impact category rules that touch impact_items: rename cascade and guarded delete."""


class CategoryError(Exception):
    def __init__(self, status: int, detail: str):
        super().__init__(detail)
        self.status, self.detail = status, detail


async def create_category(db, doc: dict) -> dict:
    if await db.impact_categories.find_one({"key": doc["key"]}):
        raise CategoryError(409, f"Category key '{doc['key']}' already exists")
    if doc.get("order") is None:
        last = await db.impact_categories.find({}, {"order": 1}).sort("order", -1).limit(1).to_list(1)
        doc["order"] = (last[0].get("order") or 0) + 1 if last else 0
    await db.impact_categories.insert_one(doc)
    return doc


async def update_category(db, cid: str, fields: dict) -> dict:
    cur = await db.impact_categories.find_one({"id": cid})
    if not cur:
        raise CategoryError(404, "Category not found")
    if fields.get("order") is None:
        fields.pop("order", None)
    old_key, new_key = cur["key"], fields["key"]
    if new_key != old_key and await db.impact_categories.find_one({"key": new_key}):
        raise CategoryError(409, f"Category key '{new_key}' already exists")
    await db.impact_categories.update_one({"id": cid}, {"$set": fields})
    if new_key != old_key:  # cascade; idempotent, so a retry after a partial failure is safe
        await db.impact_items.update_many({"category": old_key}, {"$set": {"category": new_key}})
    return await db.impact_categories.find_one({"id": cid})


async def delete_category(db, cid: str, move_to: str | None = None) -> int:
    """Delete a category; items in it move to `move_to`. Refuses (409) if items exist and no target. Returns items moved."""
    cur = await db.impact_categories.find_one({"id": cid})
    if not cur:
        raise CategoryError(404, "Category not found")
    key = cur["key"]
    n = await db.impact_items.count_documents({"category": key})
    if n:
        if not move_to:
            raise CategoryError(409, f"{n} item(s) still use this category; choose a category to move them to")
        if move_to == key or not await db.impact_categories.find_one({"key": move_to}):
            raise CategoryError(400, "Move target must be a different, existing category")
        await db.impact_items.update_many({"category": key}, {"$set": {"category": move_to}})
    await db.impact_categories.delete_one({"id": cid})
    return n
