"""Fixed owner admin accounts.

Either email below signs in to a full admin account using the shared password.
Seeding is idempotent: the password is written only when the account is first
created (``$setOnInsert``), so a restart never resets a changed password, while
the admin role / approval flags are always re-asserted.
"""
from datetime import datetime, timezone
from uuid import uuid4

from pymongo.errors import DuplicateKeyError

# Shared password for the owner admin accounts (requested by the school owners).
ADMIN_SEED_PASSWORD = "matestzografakis_11.11"

ADMIN_SEED = [
    {"email": "manoliszografakis@gmail.com", "name": "Μανώλης Ζωγραφάκης"},
    {"email": "apostolakisalex@gmail.com", "name": "Αλέξανδρος Αποστολάκης"},
]


async def seed_admins(db, hash_password, logger=None):
    try:
        await db.users.create_index("email", unique=True)
    except Exception as exc:  # pragma: no cover - duplicate-email safety net
        if logger:
            logger.warning("Could not create unique email index: %s", exc)

    password_hash = hash_password(ADMIN_SEED_PASSWORD)
    for entry in ADMIN_SEED:
        email = entry["email"].strip().lower()
        try:
            await db.users.update_one(
                {"email": email},
                {
                    # Always keep these identities as approved, verified admins.
                    "$set": {
                        "role": "admin",
                        "membership_status": "approved",
                        "email_verified": True,
                    },
                    # Written only on first insert — never clobbers a password.
                    "$setOnInsert": {
                        "id": str(uuid4()),
                        "email": email,
                        "name": entry["name"],
                        "password_hash": password_hash,
                        "bio": "",
                        "location": "",
                        "profile_image": "",
                        "level": "L4",
                        "xp": 0,
                        "stamps": [],
                        "unlocked_realms": [],
                        "created_at": datetime.now(timezone.utc),
                    },
                },
                upsert=True,
            )
        except DuplicateKeyError:  # pragma: no cover - concurrent worker race
            continue
    if logger:
        logger.info("Admin accounts ensured")
