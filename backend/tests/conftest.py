"""Shared fixtures for Sound Healing Greece backend regression tests."""
import os
import uuid
import secrets
import requests
import pytest
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

# Load frontend .env (EXPO_PUBLIC_BACKEND_URL lives here)
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
# Load backend .env (MONGO_URL / DB_NAME — used ONLY to seed isolated legacy-practice fixtures;
# legacy creation via POST /api/practices is retired and returns 410).
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = (
    os.environ.get("SHG_TEST_BASE_URL")
    or os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or ""
).rstrip("/")
ADMIN_EMAIL = os.environ.get("SHG_TEST_ADMIN_EMAIL", "admin@soundhealing.gr")
ADMIN_PASSWORD = os.environ.get("SHG_TEST_ADMIN_PASSWORD", "temple2026")

# Expose to test modules
os.environ["EXPO_PUBLIC_BACKEND_URL"] = BASE_URL


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _register_payload(email: str, password: str = "passw0rd123456"):
    """New register schema requires nested `application` and 10+ char password."""
    return {
        "email": email,
        "password": password,
        "name": "TEST Student",
        "location": "Athens",
        "application": {
            "first_name": "TestFirst",
            "last_name": "TestLast",
            "birth_month": 5,
            "birth_year": 1990,
            "phone": "+306900000000",
            "address": "Test street 1, Athens",
            "declared_level": "L1",
        },
    }


@pytest.fixture(scope="session")
def fresh_user(api, admin_auth):
    """Register a fresh student AND approve them so legacy tests can hit protected endpoints.
    Approval flow: set L1 level record (revision=0 -> 1), then admin decision=approved.
    For a dedicated 'pending' lifecycle test, see test_premium_renewal.TestRegistrationPending.
    """
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    password = "passw0rd123456"
    r = api.post(f"{BASE_URL}/api/auth/register", json=_register_payload(email, password))
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    uid = data["user"]["id"]
    lv = api.put(
        f"{BASE_URL}/api/admin/members/{uid}/levels/L1",
        json={
            "cohort_id": None,
            "credited_practice_ids": [],
            "enabled": True,
            "target": 10,
            "historical_completed": 0,
            "note": "Auto-approve for legacy tests",
            "revision": 0,
        },
        headers=admin_auth,
    )
    assert lv.status_code == 200, f"Level set failed: {lv.status_code} {lv.text}"
    dec = api.post(
        f"{BASE_URL}/api/admin/members/{uid}/decision",
        json={"decision": "approved", "note": "Legacy test auto-approve"},
        headers=admin_auth,
    )
    assert dec.status_code == 200, f"Approve failed: {dec.status_code} {dec.text}"
    data["user"]["membership_status"] = "approved"
    return {
        "email": email,
        "password": password,
        "token": data["token"],
        "user": data["user"],
        "auth": {"Authorization": f"Bearer {data['token']}"},
    }


@pytest.fixture(scope="session")
def approved_user(fresh_user):
    """Alias for approved_user: fresh_user is already approved via admin decision."""
    return fresh_user


# ---------------------------------------------------------------------------
# Legacy practice history fixtures
# ---------------------------------------------------------------------------
# Legacy practice CREATION is retired: POST /api/practices returns 410. To test
# the read-only history + public receiver-feedback flows we seed historical
# records DIRECTLY into an isolated test DB (never by re-enabling creation).
# All seeded docs are id-prefixed "TEST_legacy_" and removed at session teardown.
@pytest.fixture(scope="session")
def mongo_db():
    import pymongo

    url = os.environ.get("MONGO_URL")
    name = os.environ.get("DB_NAME")
    if not url or not name:
        pytest.skip("MONGO_URL/DB_NAME unavailable — cannot seed legacy practice fixtures")
    client = pymongo.MongoClient(url, serverSelectionTimeoutMS=5000)
    db = client[name]
    yield db
    client.close()


@pytest.fixture(scope="session")
def seed_practice(mongo_db):
    """Factory to insert an isolated historical practice record for a given user_id.

    Returns the inserted doc (same shape practice_doc_to_out expects). Seeded docs
    are cleaned up after the session. Pass overrides (e.g. feedback_token=..., id=...).
    """
    created_ids = []

    def _seed(user_id: str, **overrides):
        doc = {
            "id": f"TEST_legacy_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "session_date": "2026-01-15",
            "duration_minutes": 45,
            "session_type": "Tibetan Bowls",
            "protocol": "Full-body grounding",
            "instruments": ["Tibetan Bowls", "Chimes"],
            "intention": "Inner stillness",
            "observations": "Receiver entered deep relaxation",
            "technical_reflections": "Held the F# bowl too long",
            "what_went_well": "Smooth transitions",
            "what_to_improve": "Pacing of closing",
            "safety_concerns": "",
            "contraindications_checked": True,
            "notes": "TEST_seed historical record",
            "receiver_name": "Maria",
            "receiver_email": "TEST_maria@example.com",
            "feedback_token": secrets.token_urlsafe(32),
            "status": "Waiting for Receiver Feedback",
            "xp_awarded": 0,
            "feedback": None,
            "created_at": datetime.now(timezone.utc),
        }
        doc.update(overrides)
        mongo_db.practices.insert_one(dict(doc))
        created_ids.append(doc["id"])
        return doc

    yield _seed
    if created_ids:
        mongo_db.practices.delete_many({"id": {"$in": created_ids}})
