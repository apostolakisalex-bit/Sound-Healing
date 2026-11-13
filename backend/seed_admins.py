"""Fixed owner admin accounts.

Either email below signs in to a full admin account using the shared password.
Seeding is idempotent: the password is written only when the account is first
created (``$setOnInsert``), so a restart never resets a changed password, while
the admin role / approval flags are always re-asserted.
"""
from datetime import datetime, timezone
from uuid import uuid4
import os

from pymongo.errors import DuplicateKeyError

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

    # The seed password lives only in the process environment / secret manager,
    # never in source. It is applied solely on first insert ($setOnInsert), so a
    # restart never clobbers an existing password. If the secret is unset we
    # still keep the admin role/approval flags correct and just skip the
    # password (never log the value).
    password = os.environ.get("ADMIN_SEED_PASSWORD") or ""
    password_hash = hash_password(password) if password else None
    if password_hash is None and logger:
        logger.warning("ADMIN_SEED_PASSWORD is unset; skipping admin password seeding")

    for entry in ADMIN_SEED:
        email = entry["email"].strip().lower()
        set_on_insert = {
            "id": str(uuid4()),
            "email": email,
            "name": entry["name"],
            "bio": "",
            "location": "",
            "profile_image": "",
            "level": "L4",
            "xp": 0,
            "stamps": [],
            "unlocked_realms": [],
            "created_at": datetime.now(timezone.utc),
        }
        if password_hash is not None:
            set_on_insert["password_hash"] = password_hash
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
                    "$setOnInsert": set_on_insert,
                },
                upsert=True,
            )
        except DuplicateKeyError:  # pragma: no cover - concurrent worker race
            continue
    if logger:
        logger.info("Admin accounts ensured")
