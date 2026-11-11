"""One-off maintenance script: wipe all test student data and seed 4 sample
student profiles. Admin accounts (role == 'admin') are left untouched.

Run once:  python clean_and_seed_students.py
"""
import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import bcrypt
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

# Shared demo password for the sample student accounts.
SAMPLE_PASSWORD = "demo-student-2026"

LEVEL_TITLES = {
    "L1": "Listener Initiate",
    "L2": "Resonance Apprentice",
    "L3": "Space Holder",
    "L4": "Harmonic Master",
}

# Collections that only ever hold per-student (test) data. Admin-authored
# content (cohorts, CMS content, assessment templates, studio media) is kept.
STUDENT_COLLECTIONS = [
    "school_enrollments",
    "school_practices",
    "school_attendance",
    "member_levels",
    "training_requests",
    "assessment_answers",
    "assessment_invitations",
    "member_notifications",
    "member_chat",
    "chat_messages",
    "audit_events",
    "practice_cycles",
    "form_drafts",
]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


# Four representative Greek student profiles across the four levels.
SAMPLE_STUDENTS = [
    {
        "first_name": "Μαρία",
        "last_name": "Παπαδάκη",
        "email": "maria.papadaki@example.com",
        "level": "L1",
        "bio": "Ξεκίνησα πρόσφατα το ταξίδι μου με τις ηχογαβάθες.",
        "location": "Χανιά",
        "phone": "6940000001",
        "birth_month": 4,
        "birth_year": 1992,
        "instruments": ["Himalayan singing bowls"],
        "levels": [
            {"level_id": "L1", "enabled": True, "target": 7, "historical_completed": 2},
        ],
    },
    {
        "first_name": "Γιώργος",
        "last_name": "Νικολάου",
        "email": "giorgos.nikolaou@example.com",
        "level": "L2",
        "bio": "Συνεχίζω την εξάσκηση και δουλεύω με ομάδες.",
        "location": "Αθήνα",
        "phone": "6940000002",
        "birth_month": 9,
        "birth_year": 1988,
        "instruments": ["Himalayan singing bowls", "Gong"],
        "levels": [
            {"level_id": "L1", "enabled": True, "target": 7, "historical_completed": 7},
            {"level_id": "L2", "enabled": True, "target": 10, "historical_completed": 3},
        ],
    },
    {
        "first_name": "Ελένη",
        "last_name": "Κωνσταντίνου",
        "email": "eleni.konstantinou@example.com",
        "level": "L3",
        "bio": "Συντονίζω ομαδικά sound baths στην πόλη μου.",
        "location": "Θεσσαλονίκη",
        "phone": "6940000003",
        "birth_month": 1,
        "birth_year": 1990,
        "instruments": ["Crystal bowls", "Tuning forks", "Chimes"],
        "levels": [
            {"level_id": "L1", "enabled": True, "target": 7, "historical_completed": 7},
            {"level_id": "L2", "enabled": True, "target": 10, "historical_completed": 10},
            {"level_id": "L3", "enabled": True, "target": 12, "historical_completed": 5},
        ],
    },
    {
        "first_name": "Δημήτρης",
        "last_name": "Αντωνίου",
        "email": "dimitris.antoniou@example.com",
        "level": "L4",
        "bio": "Επαγγελματίας ηχοθεραπευτής, συνεχίζω την εξέλιξή μου.",
        "location": "Ηράκλειο",
        "phone": "6940000004",
        "birth_month": 6,
        "birth_year": 1985,
        "instruments": ["Gong", "Monochord", "Drums", "Voice"],
        "levels": [
            {"level_id": "L1", "enabled": True, "target": 7, "historical_completed": 7},
            {"level_id": "L2", "enabled": True, "target": 10, "historical_completed": 10},
            {"level_id": "L3", "enabled": True, "target": 12, "historical_completed": 12},
            {"level_id": "L4", "enabled": True, "target": 15, "historical_completed": 8},
        ],
    },
]


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # 1) Remove every student account (admins are kept).
    deleted = await db.users.delete_many({"role": "student"})
    print(f"Deleted {deleted.deleted_count} student user(s)")

    # 2) Purge per-student collections entirely for a clean slate.
    for name in STUDENT_COLLECTIONS:
        res = await db[name].delete_many({})
        print(f"Cleared {res.deleted_count:>4} doc(s) from {name}")

    # 3) Seed 4 sample student profiles.
    password_hash = hash_password(SAMPLE_PASSWORD)
    now = datetime.now(timezone.utc)
    for s in SAMPLE_STUDENTS:
        uid = str(uuid4())
        email = s["email"].strip().lower()
        await db.users.insert_one(
            {
                "id": uid,
                "email": email,
                "name": f"{s['first_name']} {s['last_name']}",
                "application": {
                    "first_name": s["first_name"],
                    "last_name": s["last_name"],
                    "birth_month": s["birth_month"],
                    "birth_year": s["birth_year"],
                    "phone": s["phone"],
                    "address": s["location"],
                    "declared_level": s["level"],
                },
                "membership_status": "approved",
                "email_verified": True,
                "password_hash": password_hash,
                "bio": s["bio"],
                "location": s["location"],
                "profile_image": "",
                "instruments": s["instruments"],
                "title": LEVEL_TITLES[s["level"]],
                "level": s["level"],
                "xp": 0,
                "stamps": [],
                "unlocked_realms": ["temple-of-breath"],
                "role": "student",
                "created_at": now,
            }
        )
        for lv in s["levels"]:
            await db.member_levels.insert_one(
                {
                    "id": str(uuid4()),
                    "user_id": uid,
                    "level_id": lv["level_id"],
                    "enabled": lv["enabled"],
                    "target": lv["target"],
                    "historical_completed": lv["historical_completed"],
                    "credited_practice_ids": [],
                    "note": "Ενδεικτικό προφίλ",
                    "revision": 0,
                }
            )
        print(f"Seeded sample student: {s['first_name']} {s['last_name']} ({s['level']})")

    total_students = await db.users.count_documents({"role": "student"})
    total_admins = await db.users.count_documents({"role": "admin"})
    print(f"\nDone. Students now: {total_students} | Admins untouched: {total_admins}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
