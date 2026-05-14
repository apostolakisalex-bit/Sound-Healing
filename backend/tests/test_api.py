"""Backend API tests for Sound Healing Greece — auth, realms, academy, stamps, practices, feedback, ai, community."""
import os
import time
import pytest

BASE = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")


# ============ AUTH ============
class TestAuth:
    def test_root(self, api):
        r = api.get(f"{BASE}/api/")
        assert r.status_code == 200
        assert "Sound Healing Greece" in r.json().get("message", "")

    def test_register_returns_token_and_l1_user(self, fresh_user):
        u = fresh_user["user"]
        assert fresh_user["token"]
        assert u["level"] == "L1"
        assert u["xp"] == 0
        assert "temple-of-breath" in u["unlocked_realms"]
        assert u["title"] == "Listener Initiate"

    def test_register_duplicate_rejected(self, api, fresh_user):
        r = api.post(f"{BASE}/api/auth/register", json={
            "email": fresh_user["email"], "password": "anyvalid123",
            "name": "Dup", "location": ""
        })
        assert r.status_code == 400

    def test_admin_login(self, api):
        r = api.post(f"{BASE}/api/auth/login", json={
            "email": "admin@soundhealing.gr", "password": "temple2026"
        })
        assert r.status_code == 200
        body = r.json()
        assert body["user"]["level"] == "L4"
        assert body["user"]["role"] == "admin"

    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE}/api/auth/login", json={
            "email": "admin@soundhealing.gr", "password": "wrong"
        })
        assert r.status_code == 401

    def test_me_returns_profile(self, api, fresh_user):
        r = api.get(f"{BASE}/api/auth/me", headers=fresh_user["auth"])
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == fresh_user["email"].lower()
        assert body["level"] == "L1"

    def test_me_requires_auth(self, api):
        r = api.get(f"{BASE}/api/auth/me")
        assert r.status_code == 401


# ============ REALMS ============
class TestRealms:
    def test_list_realms_returns_7(self, api, fresh_user):
        r = api.get(f"{BASE}/api/realms", headers=fresh_user["auth"])
        assert r.status_code == 200
        realms = r.json()
        assert len(realms) == 7
        ids = [x["id"] for x in realms]
        assert "temple-of-breath" in ids
        for x in realms:
            assert "is_unlocked" in x
        tob = next(x for x in realms if x["id"] == "temple-of-breath")
        assert tob["is_unlocked"] is True

    def test_get_single_realm(self, api, fresh_user):
        r = api.get(f"{BASE}/api/realms/temple-of-breath", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert r.json()["name"] == "Temple of Breath"


# ============ ACADEMY ============
class TestAcademy:
    def test_list_academy_5_levels(self, api, fresh_user):
        r = api.get(f"{BASE}/api/academy", headers=fresh_user["auth"])
        assert r.status_code == 200
        levels = r.json()
        assert len(levels) == 5
        for lvl in levels:
            assert len(lvl["lessons"]) == 5
        ids = [x["id"] for x in levels]
        assert set(ids) == {"L1", "L2", "L3A", "L3B", "L4"}

    def test_complete_lesson_awards_xp(self, api, fresh_user):
        r = api.post(f"{BASE}/api/academy/L1/lesson/L1-1/complete", headers=fresh_user["auth"])
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is True
        assert body["xp_gained"] == 50
        # Verify persisted
        me = api.get(f"{BASE}/api/auth/me", headers=fresh_user["auth"]).json()
        assert me["xp"] >= 50

    def test_complete_lesson_idempotent(self, api, fresh_user):
        # Complete same lesson again
        r = api.post(f"{BASE}/api/academy/L1/lesson/L1-1/complete", headers=fresh_user["auth"])
        assert r.status_code == 200
        body = r.json()
        assert body.get("already_completed") is True
        assert body["xp_gained"] == 0


# ============ STAMPS ============
class TestStamps:
    def test_list_stamps_returns_10(self, api, fresh_user):
        r = api.get(f"{BASE}/api/stamps", headers=fresh_user["auth"])
        assert r.status_code == 200
        stamps = r.json()
        assert len(stamps) == 10
        for s in stamps:
            assert "owned" in s


# ============ PRACTICES + FEEDBACK ============
class TestPracticesAndFeedback:
    @pytest.fixture(scope="class")
    def practice(self, api, fresh_user):
        payload = {
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
            "notes": "",
            "receiver_name": "Maria",
            "receiver_email": "TEST_maria@example.com",
        }
        r = api.post(f"{BASE}/api/practices", json=payload, headers=fresh_user["auth"])
        assert r.status_code == 200, r.text
        return r.json()

    def test_create_practice(self, practice):
        assert practice["status"] == "Waiting for Receiver Feedback"
        assert practice["feedback_token"]
        assert practice["xp_awarded"] == 0
        assert practice["receiver_name"] == "Maria"

    def test_list_practices(self, api, fresh_user, practice):
        r = api.get(f"{BASE}/api/practices", headers=fresh_user["auth"])
        assert r.status_code == 200
        items = r.json()
        assert any(p["id"] == practice["id"] for p in items)

    def test_get_practice_by_id(self, api, fresh_user, practice):
        r = api.get(f"{BASE}/api/practices/{practice['id']}", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert r.json()["id"] == practice["id"]

    def test_feedback_form_public_no_auth(self, api, practice):
        # No auth header
        r = api.get(f"{BASE}/api/feedback/{practice['feedback_token']}")
        assert r.status_code == 200
        body = r.json()
        assert body["already_submitted"] is False
        assert body["practitioner_name"] == "TEST Student"
        assert body["session_type"] == "Tibetan Bowls"

    def test_feedback_form_invalid_token(self, api):
        r = api.get(f"{BASE}/api/feedback/invalid-token-xyz")
        assert r.status_code == 404

    def test_submit_feedback_awards_xp_and_stamp(self, api, fresh_user, practice):
        # XP before
        me_before = api.get(f"{BASE}/api/auth/me", headers=fresh_user["auth"]).json()
        xp_before = me_before["xp"]

        payload = {
            "receiver_name": "Maria",
            "relaxation_before": 4,
            "relaxation_after": 9,
            "emotional_experience": "Profoundly calm",
            "body_sensations": "Tingling, warmth",
            "perceived_safety": 10,
            "clarity_of_instructions": 9,
            "quality_of_holding_space": 10,
            "comments": "Beautiful experience",
            "consent": True,
            "email": "TEST_maria@example.com",
        }
        r = api.post(f"{BASE}/api/feedback/{practice['feedback_token']}", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["ok"] is True

        # XP after should have grown by 150 and stamp granted
        me_after = api.get(f"{BASE}/api/auth/me", headers=fresh_user["auth"]).json()
        assert me_after["xp"] == xp_before + 150
        assert "stamp-first-practice" in me_after["stamps"]

        # Practice now XP Awarded
        p = api.get(f"{BASE}/api/practices/{practice['id']}", headers=fresh_user["auth"]).json()
        assert p["status"] == "XP Awarded"
        assert p["xp_awarded"] == 150

    def test_submit_feedback_duplicate_blocked(self, api, practice):
        payload = {
            "receiver_name": "Maria", "relaxation_before": 5, "relaxation_after": 8,
            "emotional_experience": "ok", "body_sensations": "", "perceived_safety": 8,
            "clarity_of_instructions": 8, "quality_of_holding_space": 8, "comments": "",
            "consent": True, "email": "",
        }
        r = api.post(f"{BASE}/api/feedback/{practice['feedback_token']}", json=payload)
        assert r.status_code == 400

    def test_submit_feedback_requires_consent(self, api, fresh_user):
        # Create new practice
        new_p = api.post(f"{BASE}/api/practices", json={
            "session_date": "2026-01-16", "duration_minutes": 30,
            "session_type": "Sound Bath", "protocol": "Light",
            "instruments": ["Gong"], "intention": "Rest",
            "receiver_name": "Andreas",
        }, headers=fresh_user["auth"]).json()
        payload = {
            "receiver_name": "Andreas", "relaxation_before": 5, "relaxation_after": 7,
            "emotional_experience": "fine", "body_sensations": "", "perceived_safety": 8,
            "clarity_of_instructions": 8, "quality_of_holding_space": 8,
            "comments": "", "consent": False, "email": "",
        }
        r = api.post(f"{BASE}/api/feedback/{new_p['feedback_token']}", json=payload)
        assert r.status_code == 400


# ============ COMMUNITY ============
class TestCommunity:
    def test_community_feed(self, api, fresh_user):
        r = api.get(f"{BASE}/api/community/feed", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ============ AI CHAT ============
class TestAIChat:
    def test_ai_chat_returns_response(self, api, fresh_user):
        r = api.post(
            f"{BASE}/api/ai/chat",
            json={"message": "Hello Aeon, I'm feeling anxious today."},
            headers=fresh_user["auth"],
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["response"]
        assert len(body["response"]) > 20
        assert body["session_id"]
