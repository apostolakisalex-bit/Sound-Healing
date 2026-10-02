"""
Iteration 5 — Verify Emergent Google sign-in + Resend transactional email wiring.

Scope (per review_request):
  C) POST /api/auth/session with a bogus session_id must 401 (NOT 500).
  D) POST /api/practices is RETIRED and must return 410 (NOT 500/200), WITH and
     WITHOUT receiver_email. Legacy read-only history + public receiver feedback
     are exercised via isolated seeded fixtures (creation is never re-enabled).
  R) POST /api/admin/members/{uid}/decision regression — still returns ok.
  R) email/password login regression (admin + existing approved student).
  R) GET/POST /api/feedback/{token} public (no auth) still works.
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://healing-universe.preview.emergentagent.com").rstrip("/")
API = BASE_URL + "/api"

ADMIN_EMAIL = "admin@soundhealing.gr"
ADMIN_PASSWORD = "temple2026"
STUDENT_EMAIL = "uitest_167043@test.gr"
STUDENT_PASSWORD = "TestPass12345"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def student_token():
    r = requests.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"approved student not reusable (status={r.status_code}): {r.text}")
    return r.json()["token"]


def auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ----- (C) Google session: bogus session_id must 401, never 500 -----
class TestGoogleSession:
    def test_bogus_session_id_returns_401(self):
        r = requests.post(f"{API}/auth/session", json={"session_id": "bogus-123"}, timeout=30)
        assert r.status_code != 500, f"endpoint 500ed: {r.text}"
        assert r.status_code == 401, f"expected 401, got {r.status_code} {r.text}"
        body = r.json()
        detail = body.get("detail", "")
        # Greek message expected
        assert any(ch in detail for ch in "αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"), \
            f"detail not Greek: {detail!r}"

    def test_empty_session_id_does_not_500(self):
        r = requests.post(f"{API}/auth/session", json={"session_id": ""}, timeout=30)
        assert r.status_code in (401, 422), f"unexpected status {r.status_code}: {r.text}"


# ----- Regression: email/password login -----
class TestLoginRegression:
    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"

    def test_approved_student_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}, timeout=15)
        if r.status_code != 200:
            pytest.skip(f"approved student creds not available: {r.status_code}")
        data = r.json()
        assert "token" in data
        assert data["user"]["membership_status"] == "approved"


# ----- (D) Legacy practice creation is RETIRED -> 410 -----
class TestLegacyPracticeRetired:
    def _payload(self, receiver_email: str):
        return {
            "session_date": "2026-01-15",
            "duration_minutes": 45,
            "session_type": "Tibetan Bowls",
            "protocol": "Standard sound bath",
            "instruments": ["bowls", "chimes"],
            "intention": "Relaxation",
            "observations": "",
            "technical_reflections": "",
            "what_went_well": "",
            "what_to_improve": "",
            "safety_concerns": "",
            "contraindications_checked": True,
            "notes": "TEST_integration",
            "receiver_name": "TEST Receiver",
            "receiver_email": receiver_email,
        }

    def test_create_with_receiver_email_returns_410(self, student_token):
        r = requests.post(f"{API}/practices", json=self._payload("delivered@resend.dev"),
                          headers=auth(student_token), timeout=30)
        assert r.status_code != 500, f"must not 500: {r.text}"
        assert r.status_code == 410, f"expected 410 (retired), got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "")
        assert any(ch in detail for ch in "αβγδεζηθικλμνξοπρστυφχψω"), f"detail not Greek: {detail!r}"

    def test_create_without_receiver_email_returns_410(self, student_token):
        r = requests.post(f"{API}/practices", json=self._payload(""),
                          headers=auth(student_token), timeout=30)
        assert r.status_code != 500, f"must not 500: {r.text}"
        assert r.status_code == 410, f"expected 410 (retired), got {r.status_code}: {r.text}"


# ----- Legacy read-only history + public receiver feedback via ISOLATED seeded fixtures -----
@pytest.fixture(scope="module")
def student_user_id(student_token):
    r = requests.get(f"{API}/auth/me", headers=auth(student_token), timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["id"]


@pytest.fixture(scope="module")
def seeded_tokens(seed_practice, student_user_id):
    """Seed two historical records for the reusable student directly in the test DB
    (creation is retired). Returns their feedback tokens for read/feedback assertions."""
    with_email = seed_practice(student_user_id, receiver_email="delivered@resend.dev",
                               receiver_name="TEST Receiver")
    no_email = seed_practice(student_user_id, receiver_email="", receiver_name="TEST Receiver")
    return {"with_email": with_email["feedback_token"], "no_email": no_email["feedback_token"]}


class TestLegacyHistoryRead:
    def test_seeded_records_listed(self, student_token, seeded_tokens):
        r = requests.get(f"{API}/practices", headers=auth(student_token), timeout=15)
        assert r.status_code == 200
        tokens = [p["feedback_token"] for p in r.json()]
        assert seeded_tokens["with_email"] in tokens
        assert seeded_tokens["no_email"] in tokens


# ----- Regression: public feedback (no auth) still works on seeded records -----
class TestPublicFeedback:
    def test_get_feedback_form_no_auth(self, seeded_tokens):
        token = seeded_tokens["with_email"]
        r = requests.get(f"{API}/feedback/{token}", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("already_submitted") is False
        assert data.get("session_type") == "Tibetan Bowls"

    def test_submit_feedback_no_auth(self, seeded_tokens):
        token = seeded_tokens["no_email"]
        payload = {
            "receiver_name": "TEST Receiver",
            "relaxation_before": 4,
            "relaxation_after": 9,
            "emotional_experience": "Calm and grounded.",
            "body_sensations": "warm",
            "perceived_safety": 10,
            "clarity_of_instructions": 9,
            "quality_of_holding_space": 10,
            "comments": "TEST integration",
            "consent": True,
            "email": "",
        }
        r = requests.post(f"{API}/feedback/{token}", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True


# ----- (R) Member decision regression — ensure email wiring doesn't break it -----
class TestMemberDecisionRegression:
    """Register a synthetic pending user, record required L1 levels, then approve
    via /api/admin/members/{uid}/decision — must return {ok:true}."""

    @pytest.fixture(scope="class")
    def pending_user(self, admin_token):
        unique = uuid.uuid4().hex[:10]
        email = f"TEST_pending_{unique}@test.gr"
        payload = {
            "application": {
                "first_name": "TestP",
                "last_name": "User",
                "birth_month": 1,
                "birth_year": 1990,
                "phone": "0000000000",
                "address": "Test",
                "declared_level": "L1",
            },
            "email": email,
            "password": "TestPass12345",
            "name": "TestP User",
            "location": "Athens",
        }
        r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        return r.json()["user"]["id"], email

    def test_set_L1_then_approve(self, admin_token, pending_user):
        uid, email = pending_user
        # Record L1 progress (needed before approving)
        level_payload = {
            "revision": 0,
            "credited_practice_ids": [],
            "cohort_id": None,
            "note": "TEST approve-flow",
            "enabled": True,
            "target": 10,
            "historical_completed": 0,
        }
        r = requests.put(f"{API}/admin/members/{uid}/levels/L1",
                         json=level_payload, headers=auth(admin_token), timeout=15)
        assert r.status_code == 200, f"set_level failed: {r.status_code} {r.text}"

        # Approve
        r = requests.post(f"{API}/admin/members/{uid}/decision",
                          json={"decision": "approved", "note": "TEST integration"},
                          headers=auth(admin_token), timeout=30)
        assert r.status_code != 500, f"500 on approve (email wiring?): {r.text}"
        assert r.status_code == 200, f"expected 200, got {r.status_code}: {r.text}"
        assert r.json().get("ok") is True
