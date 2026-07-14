import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


def clean_doc(doc: dict) -> dict:
    if doc is None:
        return doc
    doc.pop("_id", None)
    return doc


def clean_docs(docs) -> list:
    return [clean_doc(d) for d in docs]
