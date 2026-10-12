"""Run: python -m unittest discover -s backend/tests  (stdlib only; FakeDb covers just the equality/$set queries used)."""
import asyncio
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from content_migrations import _impact_categories_2026_10  # noqa: E402
from impact_categories import CategoryError, create_category, delete_category, update_category  # noqa: E402


class FakeCursor:
    def __init__(self, docs):
        self.docs = docs

    def sort(self, key, direction):
        self.docs = sorted(self.docs, key=lambda d: d.get(key, 0), reverse=direction < 0)
        return self

    def limit(self, n):
        self.docs = self.docs[:n]
        return self

    async def to_list(self, n):
        return self.docs[:n]


class FakeColl:
    def __init__(self):
        self.docs = []

    @staticmethod
    def _match(d, flt):
        return all(d.get(k) == v for k, v in flt.items())

    async def find_one(self, flt):
        return next((d for d in self.docs if self._match(d, flt)), None)

    def find(self, flt, proj=None):
        return FakeCursor([d for d in self.docs if self._match(d, flt)])

    async def insert_one(self, doc):
        self.docs.append(doc)

    async def update_one(self, flt, upd):
        d = await self.find_one(flt)
        if d:
            d.update(upd["$set"])

    async def update_many(self, flt, upd):
        for d in self.docs:
            if self._match(d, flt):
                d.update(upd["$set"])

    async def count_documents(self, flt):
        return sum(self._match(d, flt) for d in self.docs)

    async def delete_one(self, flt):
        d = await self.find_one(flt)
        if d:
            self.docs.remove(d)


class FakeDb:
    def __init__(self):
        self.impact_categories, self.impact_items = FakeColl(), FakeColl()


def run(coro):
    return asyncio.run(coro)


async def seeded():
    db = FakeDb()
    await _impact_categories_2026_10(db)
    return db


def cat(db, key):
    return next(c for c in db.impact_categories.docs if c["key"] == key)


class MigrationTests(unittest.TestCase):
    def test_seeds_three_exactly_and_is_idempotent(self):
        async def go():
            db = await seeded()
            first = [(c["key"], c["label"], c["subtitle"], c["icon"], c["order"], c["is_published"]) for c in db.impact_categories.docs]
            self.assertEqual(await _impact_categories_2026_10(db), 0)
            return db, first

        db, first = run(go())
        self.assertEqual(first, [
            ("Feature", "Features", "Digital Publications", "Newspaper", 0, True),
            ("Podcast", "Podcasts", "Audio Interviews", "Mic", 1, True),
            ("TV & Video", "TV & Video Appearances", "Broadcast & Video", "Tv", 2, True),
        ])
        self.assertEqual(len(db.impact_categories.docs), 3)


class CascadeTests(unittest.TestCase):
    def test_rename_key_updates_items_only_for_that_key(self):
        async def go():
            db = await seeded()
            db.impact_items.docs += [{"id": "a", "category": "Podcast"}, {"id": "b", "category": "Podcast"}, {"id": "c", "category": "Feature"}]
            fields = {"key": "Audio", "label": "Podcasts", "subtitle": "", "icon": "Mic", "order": None, "is_published": True}
            await update_category(db, cat(db, "Podcast")["id"], fields)
            return db

        db = run(go())
        self.assertEqual([i["category"] for i in db.impact_items.docs], ["Audio", "Audio", "Feature"])
        self.assertEqual(cat(db, "Audio")["order"], 1)  # order None keeps existing

    def test_rename_to_existing_key_refused(self):
        async def go():
            db = await seeded()
            with self.assertRaises(CategoryError) as cm:
                await update_category(db, cat(db, "Podcast")["id"], {"key": "Feature"})
            self.assertEqual(cm.exception.status, 409)

        run(go())

    def test_create_assigns_next_order_and_rejects_duplicate_key(self):
        async def go():
            db = await seeded()
            doc = await create_category(db, {"id": "n", "key": "Award", "label": "Awards"})
            self.assertEqual(doc["order"], 3)
            with self.assertRaises(CategoryError):
                await create_category(db, {"id": "m", "key": "Award", "label": "Dup"})

        run(go())


class DeleteTests(unittest.TestCase):
    def test_refused_without_target_when_items_exist(self):
        async def go():
            db = await seeded()
            db.impact_items.docs.append({"id": "a", "category": "Podcast"})
            with self.assertRaises(CategoryError) as cm:
                await delete_category(db, cat(db, "Podcast")["id"])
            self.assertEqual(cm.exception.status, 409)
            return db

        db = run(go())
        self.assertEqual(len(db.impact_categories.docs), 3)
        self.assertEqual(db.impact_items.docs[0]["category"], "Podcast")

    def test_moves_items_when_target_given(self):
        async def go():
            db = await seeded()
            db.impact_items.docs += [{"id": "a", "category": "Podcast"}, {"id": "b", "category": "Podcast"}]
            return db, await delete_category(db, cat(db, "Podcast")["id"], "Feature")

        db, moved = run(go())
        self.assertEqual(moved, 2)
        self.assertEqual({i["category"] for i in db.impact_items.docs}, {"Feature"})
        self.assertEqual([c["key"] for c in db.impact_categories.docs], ["Feature", "TV & Video"])

    def test_bad_target_refused_and_nothing_changes(self):
        async def go():
            db = await seeded()
            db.impact_items.docs.append({"id": "a", "category": "Podcast"})
            for target in ("Podcast", "Nope"):
                with self.assertRaises(CategoryError) as cm:
                    await delete_category(db, cat(db, "Podcast")["id"], target)
                self.assertEqual(cm.exception.status, 400)
            return db

        db = run(go())
        self.assertEqual(len(db.impact_categories.docs), 3)

    def test_empty_category_deletes_without_target(self):
        async def go():
            db = await seeded()
            return db, await delete_category(db, cat(db, "Podcast")["id"])

        db, moved = run(go())
        self.assertEqual(moved, 0)
        self.assertEqual(len(db.impact_categories.docs), 2)


if __name__ == "__main__":
    unittest.main()
