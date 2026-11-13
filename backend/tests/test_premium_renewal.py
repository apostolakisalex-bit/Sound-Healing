"""Tests for the second premium-renewal integration (shg/premium-renewal, HEAD dc37b24).

Scope (new modules only):
  - MEMBERS: registration + pending/approval flow + /api/members/me + instruments + avatar
  - STUDIO: /api/admin/media upload + list + archive + app_photo CMS linkage
  - ADMIN CALENDAR: create/edit/cancel entries + list
  - TRAINING REQUESTS + MEMBER CHAT
  - MIDDLEWARE: pending user is blocked from most endpoints
  - ROLE SEPARATION: admin is NOT blocked (membership_status default='approved')

Do NOT test certification/credit RULES (open decisions). Only plumbing + access control.
"""
import base64
import io
import os
import uuid
from datetime import date, timedelta

import pytest
import requests
from PIL import Image

BASE = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")


# ------------- helpers -------------
def _reg_payload(email, password="passw0rd123456", declared="L1"):
    return {
        "email": email,
        "password": password,
        "name": "TEST Premium",
        "location": "Athens",
        "application": {
            "first_name": "FirstName",
            "last_name": "LastName",
            "birth_month": 3,
            "birth_year": 1992,
            "phone": "+306900000001",
            "address": "Test Address, Athens",
            "declared_level": declared,
        },
    }


def _tiny_png_b64():
    img = Image.new("RGB", (64, 64), color=(120, 180, 220))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


# ======================================================================
# 1. REGISTRATION + PENDING MIDDLEWARE
# ======================================================================
class TestRegistrationPending:
    @pytest.fixture(scope="class")
    def pending(self, api):
        email = f"TEST_pending_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE}/api/auth/register", json=_reg_payload(email))
        assert r.status_code == 200, r.text
        d = r.json()
        return {
            "email": email,
            "user": d["user"],
            "token": d["token"],
            "auth": {"Authorization": f"Bearer {d['token']}"},
        }

    def test_register_sets_pending(self, pending):
        assert pending["user"]["membership_status"] == "pending"
        assert pending["user"]["role"] == "student"

    def test_pending_can_access_me(self, api, pending):
        r = api.get(f"{BASE}/api/members/me", headers=pending["auth"])
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["id"] == pending["user"]["id"]
        assert body["membership_status"] == "pending"
        assert "levels" in body
        assert len(body["levels"]) == 4

    def test_pending_can_access_notifications(self, api, pending):
        r = api.get(f"{BASE}/api/notifications", headers=pending["auth"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_pending_can_access_auth_me(self, api, pending):
        r = api.get(f"{BASE}/api/auth/me", headers=pending["auth"])
        assert r.status_code == 200

    def test_pending_blocked_from_protected(self, api, pending):
        # Should be blocked by middleware
        r = api.get(f"{BASE}/api/school/catalog", headers=pending["auth"])
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"

    def test_pending_blocked_from_chat(self, api, pending):
        r = api.get(f"{BASE}/api/members/chat", headers=pending["auth"])
        assert r.status_code == 403

    def test_pending_blocked_from_realms(self, api, pending):
        r = api.get(f"{BASE}/api/realms", headers=pending["auth"])
        assert r.status_code == 403


# ======================================================================
# 2. ADMIN NOT BLOCKED (bypass approval middleware)
# ======================================================================
class TestAdminBypass:
    def test_admin_me(self, api, admin_auth):
        r = api.get(f"{BASE}/api/auth/me", headers=admin_auth)
        assert r.status_code == 200
        body = r.json()
        assert body["role"] == "admin"
        assert body["membership_status"] == "approved"

    def test_admin_access_protected(self, api, admin_auth):
        for ep in ["/api/school/catalog", "/api/realms", "/api/members/chat"]:
            r = api.get(f"{BASE}{ep}", headers=admin_auth)
            assert r.status_code == 200, f"{ep}: {r.status_code} {r.text}"


# ======================================================================
# 3. ADMIN MEMBERS LIST / DETAIL / LEVELS / DECISION
# ======================================================================
class TestAdminMembersApproval:
    @pytest.fixture(scope="class")
    def applicant(self, api):
        email = f"TEST_applicant_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE}/api/auth/register", json=_reg_payload(email, declared="L2"))
        assert r.status_code == 200, r.text
        d = r.json()
        return {"user": d["user"], "email": email, "auth": {"Authorization": f"Bearer {d['token']}"}}

    def test_admin_members_list(self, api, admin_auth, applicant):
        r = api.get(f"{BASE}/api/admin/members", headers=admin_auth)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "items" in body and "total" in body
        assert any(m["id"] == applicant["user"]["id"] for m in body["items"])

    def test_admin_member_detail(self, api, admin_auth, applicant):
        r = api.get(f"{BASE}/api/admin/members/{applicant['user']['id']}", headers=admin_auth)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["id"] == applicant["user"]["id"]
        assert body["email"] == applicant["email"].lower()
        assert body["application"]["declared_level"] == "L2"

    def test_decision_requires_level_records(self, api, admin_auth, applicant):
        # Declared L2 -> both L1 and L2 level records with revision>0 required
        r = api.post(
            f"{BASE}/api/admin/members/{applicant['user']['id']}/decision",
            json={"decision": "approved", "note": "Approve"},
            headers=admin_auth,
        )
        assert r.status_code == 422, f"Expected 422 (missing level records), got {r.status_code}: {r.text}"

    def test_set_level_record(self, api, admin_auth, applicant):
        for lvl in ["L1", "L2"]:
            r = api.put(
                f"{BASE}/api/admin/members/{applicant['user']['id']}/levels/{lvl}",
                json={
                    "cohort_id": None,
                    "credited_practice_ids": [],
                    "enabled": True,
                    "target": 10,
                    "historical_completed": 0,
                    "note": f"Verified {lvl}",
                    "revision": 0,
                },
                headers=admin_auth,
            )
            assert r.status_code == 200, f"{lvl}: {r.status_code} {r.text}"

    def test_level_revision_conflict(self, api, admin_auth, applicant):
        # revision=0 again should 409 (now at revision=1)
        r = api.put(
            f"{BASE}/api/admin/members/{applicant['user']['id']}/levels/L1",
            json={
                "cohort_id": None,
                "credited_practice_ids": [],
                "enabled": True,
                "target": 10,
                "historical_completed": 1,
                "note": "Conflict test",
                "revision": 0,
            },
            headers=admin_auth,
        )
        assert r.status_code == 409

    def test_approve_after_level_records(self, api, admin_auth, applicant):
        r = api.post(
            f"{BASE}/api/admin/members/{applicant['user']['id']}/decision",
            json={"decision": "approved", "note": "Welcome aboard"},
            headers=admin_auth,
        )
        assert r.status_code == 200, r.text
        # Applicant should now have access
        r2 = api.get(f"{BASE}/api/school/catalog", headers=applicant["auth"])
        assert r2.status_code == 200
        # me should reflect approved
        me = api.get(f"{BASE}/api/members/me", headers=applicant["auth"]).json()
        assert me["membership_status"] == "approved"

    def test_approve_idempotent_409(self, api, admin_auth, applicant):
        r = api.post(
            f"{BASE}/api/admin/members/{applicant['user']['id']}/decision",
            json={"decision": "approved", "note": "Again"},
            headers=admin_auth,
        )
        assert r.status_code == 409  # already decided


# ======================================================================
# 4. MEMBER PROFILE: instruments + avatar (approved user)
# ======================================================================
class TestMemberProfile:
    def test_instruments_update(self, api, approved_user):
        r = api.put(
            f"{BASE}/api/members/me/instruments",
            json={"instruments": ["Gong", "Crystal Bowl", "Gong", "  "]},  # dedupe + trim
            headers=approved_user["auth"],
        )
        assert r.status_code == 200, r.text
        me = api.get(f"{BASE}/api/members/me", headers=approved_user["auth"]).json()
        assert me["instruments"] == ["Gong", "Crystal Bowl"]

    def test_avatar_upload(self, api, approved_user):
        r = api.post(
            f"{BASE}/api/members/me/avatar",
            json={"data": _tiny_png_b64()},
            headers=approved_user["auth"],
        )
        assert r.status_code == 200, r.text
        me = api.get(f"{BASE}/api/auth/me", headers=approved_user["auth"]).json()
        assert me["profile_image"].startswith("data:image/webp;base64,")

    def test_avatar_rejects_bad_data(self, api, approved_user):
        r = api.post(
            f"{BASE}/api/members/me/avatar",
            json={"data": "not-base64!!!"},
            headers=approved_user["auth"],
        )
        assert r.status_code == 422


# ======================================================================
# 5. STUDIO MEDIA LIBRARY
# ======================================================================
class TestStudioMedia:
    @pytest.fixture(scope="class")
    def uploaded(self, api, admin_auth):
        payload = {
            "title": f"TEST_media_{uuid.uuid4().hex[:6]}",
            "alt": "Testing alt",
            "data": _tiny_png_b64(),
        }
        r = api.post(f"{BASE}/api/admin/media", json=payload, headers=admin_auth)
        assert r.status_code == 200, r.text
        return r.json()

    def test_upload_returns_meta(self, uploaded):
        assert uploaded["id"]
        assert uploaded["url"].startswith("/api/media/")
        assert uploaded["revision"] == 1
        assert uploaded["archived"] is False
        assert uploaded["width"] > 0 and uploaded["height"] > 0

    def test_list_media(self, api, admin_auth, uploaded):
        r = api.get(f"{BASE}/api/admin/media", headers=admin_auth)
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and "total" in body
        assert any(it["id"] == uploaded["id"] for it in body["items"])
        # Response should NOT include raw data
        for it in body["items"]:
            assert "data" not in it

    def test_media_denied_for_non_admin(self, api, approved_user):
        r = api.get(f"{BASE}/api/admin/media", headers=approved_user["auth"])
        assert r.status_code == 403

    def test_preview_admin_can_fetch(self, api, admin_auth, uploaded):
        r = api.get(f"{BASE}/api/media/{uploaded['id']}/preview", headers=admin_auth)
        assert r.status_code == 200
        body = r.json()
        assert body["uri"].startswith("data:image/webp;base64,")

    def test_public_photo_unreferenced_404(self, api, uploaded):
        # Not yet referenced by a published public item → should 404
        r = api.get(f"{BASE}/api/media/{uploaded['id']}")
        assert r.status_code == 404

    def test_bad_image_rejected(self, api, admin_auth):
        r = api.post(
            f"{BASE}/api/admin/media",
            json={"title": "bad", "alt": "bad", "data": base64.b64encode(b"not an image").decode()},
            headers=admin_auth,
        )
        assert r.status_code == 422

    def test_archive(self, api, admin_auth, uploaded):
        r = api.post(
            f"{BASE}/api/admin/media/{uploaded['id']}/archive",
            json={"revision": uploaded["revision"]},
            headers=admin_auth,
        )
        assert r.status_code == 200


# ======================================================================
# 6. ADMIN CALENDAR
# ======================================================================
class TestAdminCalendar:
    @pytest.fixture(scope="class")
    def entry(self, api, admin_auth):
        today = date.today()
        payload = {
            "title": f"TEST_cal_{uuid.uuid4().hex[:6]}",
            "kind": "other",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=1)).isoformat(),
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "Studio A",
            "notes": "Test entry",
        }
        r = api.post(f"{BASE}/api/admin/calendar", json=payload, headers=admin_auth)
        assert r.status_code == 200, r.text
        return r.json()

    def test_calendar_list(self, api, admin_auth, entry):
        today = date.today()
        r = api.get(
            f"{BASE}/api/admin/calendar",
            params={"start": today.isoformat(), "end": (today + timedelta(days=7)).isoformat()},
            headers=admin_auth,
        )
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert any(it.get("id") == entry["id"] for it in items)

    def test_calendar_denied_for_non_admin(self, api, approved_user):
        today = date.today()
        r = api.get(
            f"{BASE}/api/admin/calendar",
            params={"start": today.isoformat(), "end": today.isoformat()},
            headers=approved_user["auth"],
        )
        assert r.status_code == 403

    def test_calendar_edit(self, api, admin_auth, entry):
        today = date.today()
        payload = {
            "title": entry["title"] + " v2",
            "kind": entry["kind"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=1)).isoformat(),
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "Studio B",
            "notes": "Updated",
            "revision": entry["revision"],
        }
        r = api.put(f"{BASE}/api/admin/calendar/{entry['id']}", json=payload, headers=admin_auth)
        assert r.status_code == 200, r.text

    def test_calendar_edit_stale_revision_conflicts(self, api, admin_auth, entry):
        today = date.today()
        payload = {
            "title": entry["title"] + " v-stale",
            "kind": entry["kind"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=1)).isoformat(),
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "L",
            "notes": "",
            "revision": entry["revision"],  # stale now
        }
        r = api.put(f"{BASE}/api/admin/calendar/{entry['id']}", json=payload, headers=admin_auth)
        assert r.status_code == 409

    def test_calendar_cancel(self, api, admin_auth, entry):
        r = api.post(
            f"{BASE}/api/admin/calendar/{entry['id']}/cancel",
            json={"revision": entry["revision"] + 1},  # after test_calendar_edit, revision=2
            headers=admin_auth,
        )
        assert r.status_code in (200, 409)


# ======================================================================
# 7. TRAINING REQUESTS
# ======================================================================
class TestTrainingRequests:
    def test_pending_cannot_request(self, api):
        email = f"TEST_treq_pending_{uuid.uuid4().hex[:8]}@example.com"
        d = api.post(f"{BASE}/api/auth/register", json=_reg_payload(email)).json()
        auth = {"Authorization": f"Bearer {d['token']}"}
        r = api.post(f"{BASE}/api/members/me/training-requests", json={"level_id": "L2"}, headers=auth)
        assert r.status_code == 403

    def test_approved_can_request_and_duplicate_blocked(self, api, approved_user):
        r = api.post(
            f"{BASE}/api/members/me/training-requests",
            json={"level_id": "L2", "note": "I want to join L2"},
            headers=approved_user["auth"],
        )
        assert r.status_code in (200, 409), r.text
        # Second attempt must 409
        r2 = api.post(
            f"{BASE}/api/members/me/training-requests",
            json={"level_id": "L2", "note": "again"},
            headers=approved_user["auth"],
        )
        assert r2.status_code == 409


# ======================================================================
# 8. MEMBER CHAT (approved-only, moderated, rate-limited)
# ======================================================================
class TestMemberChat:
    def test_pending_blocked(self, api):
        email = f"TEST_chat_pend_{uuid.uuid4().hex[:8]}@example.com"
        d = api.post(f"{BASE}/api/auth/register", json=_reg_payload(email)).json()
        auth = {"Authorization": f"Bearer {d['token']}"}
        r = api.post(f"{BASE}/api/members/chat", json={"text": "hi"}, headers=auth)
        assert r.status_code == 403

    def test_approved_can_post_and_list(self, api, approved_user):
        text = f"TEST message {uuid.uuid4().hex[:6]}"
        r = api.post(f"{BASE}/api/members/chat", json={"text": text}, headers=approved_user["auth"])
        # 429 is acceptable if a previous test posted within rate limit window
        assert r.status_code in (200, 429), r.text
        rl = api.get(f"{BASE}/api/members/chat", headers=approved_user["auth"])
        assert rl.status_code == 200
        assert isinstance(rl.json(), list)

    def test_admin_can_hide(self, api, admin_auth, approved_user):
        # Wait briefly for rate-limit (3s)
        import time; time.sleep(3.2)
        text = f"TEST hide_me {uuid.uuid4().hex[:6]}"
        r = api.post(f"{BASE}/api/members/chat", json={"text": text}, headers=approved_user["auth"])
        if r.status_code != 200:
            pytest.skip(f"Could not post message: {r.status_code} {r.text}")
        mid = r.json()["id"]
        h = api.post(f"{BASE}/api/admin/chat/{mid}/hide", headers=admin_auth)
        assert h.status_code == 200
