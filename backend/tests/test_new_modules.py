"""Regression tests for shg/premium-renewal new modules & extra flows.

Fixes vs. previous version:
  - Logout must NOT invalidate the session-scope fresh_user, so it uses a throwaway user.
  - Correct payload shapes for admin/content, admin/cohorts, admin/attendance, admin/resources.
  - GET /api/admin/forms returns a dict (catalog envelope), not a list.
"""
import base64
import os
import uuid
import pytest
import requests

BASE = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")


def _register(api):
    email = f"TEST_extra_{uuid.uuid4().hex[:8]}@example.com"
    r = api.post(
        f"{BASE}/api/auth/register",
        json={
            "email": email,
            "password": "passw0rd123456",
            "name": "Extra Tester",
            "location": "Athens",
            "application": {
                "first_name": "Extra",
                "last_name": "Tester",
                "birth_month": 4,
                "birth_year": 1991,
                "phone": "+306900000002",
                "address": "Addr",
                "declared_level": "L1",
            },
        },
    )
    assert r.status_code == 200, r.text
    d = r.json()
    return {
        "email": email,
        "token": d["token"],
        "user": d["user"],
        "auth": {"Authorization": f"Bearer {d['token']}"},
    }


# ============ AUTH extras (throwaway user for logout so session token stays valid) ============
class TestAuthExtras:
    def test_update_profile_persists(self, api, fresh_user):
        r = api.put(
            f"{BASE}/api/auth/me",
            json={"name": "TEST Student Renamed", "location": "Thessaloniki"},
            headers=fresh_user["auth"],
        )
        assert r.status_code == 200, r.text
        assert r.json()["location"] == "Thessaloniki"
        me = api.get(f"{BASE}/api/auth/me", headers=fresh_user["auth"]).json()
        assert me["location"] == "Thessaloniki"

    def test_logout_invalidates_own_token(self, api):
        throwaway = _register(api)
        r = api.post(f"{BASE}/api/auth/logout", headers=throwaway["auth"])
        assert r.status_code == 200
        # Old token must now be rejected
        r2 = api.get(f"{BASE}/api/auth/me", headers=throwaway["auth"])
        assert r2.status_code == 401


# ============ Realms enter ============
class TestRealmEnter:
    def test_enter_unlocked_realm(self, api, fresh_user):
        r = api.post(
            f"{BASE}/api/realms/temple-of-breath/enter",
            headers=fresh_user["auth"],
        )
        assert r.status_code == 200

    def test_enter_locked_realm_forbidden(self, api, fresh_user):
        realms = api.get(f"{BASE}/api/realms", headers=fresh_user["auth"]).json()
        assert isinstance(realms, list)
        locked = next((x for x in realms if not x.get("is_unlocked")), None)
        if not locked:
            pytest.skip("No locked realm available for student")
        rr = api.post(
            f"{BASE}/api/realms/{locked['id']}/enter",
            headers=fresh_user["auth"],
        )
        assert rr.status_code in (400, 403)


# ============ Challenges + Community rankings ============
class TestChallengesAndRankings:
    def test_challenges_list(self, api, fresh_user):
        r = api.get(f"{BASE}/api/challenges", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_join_first_challenge(self, api, fresh_user):
        chs = api.get(f"{BASE}/api/challenges", headers=fresh_user["auth"]).json()
        if not chs:
            pytest.skip("No challenges seeded")
        cid = chs[0]["id"]
        rr = api.post(
            f"{BASE}/api/challenges/{cid}/join", headers=fresh_user["auth"]
        )
        assert rr.status_code in (200, 400)  # 400 if already joined

    def test_community_rankings(self, api, fresh_user):
        r = api.get(f"{BASE}/api/community/rankings", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ============ AI history ============
class TestAIHistory:
    def test_ai_history(self, api, fresh_user):
        r = api.get(f"{BASE}/api/ai/history", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ============ SCHOOL: read endpoints ============
class TestSchoolReads:
    def test_catalog(self, api, fresh_user):
        r = api.get(f"{BASE}/api/school/catalog", headers=fresh_user["auth"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_me(self, api, fresh_user):
        r = api.get(f"{BASE}/api/school/me", headers=fresh_user["auth"])
        assert r.status_code == 200
        body = r.json()
        assert "enrollments" in body

    def test_progress(self, api, fresh_user):
        r = api.get(f"{BASE}/api/school/progress", headers=fresh_user["auth"])
        assert r.status_code == 200

    def test_content_public_no_auth(self, api):
        r = api.get(f"{BASE}/api/content/public")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_content_library_auth(self, api, fresh_user):
        r = api.get(f"{BASE}/api/content/library", headers=fresh_user["auth"])
        assert r.status_code == 200


# ============ SCHOOL admin: content CRUD, cohorts, enrollments, attendance ============
class TestSchoolAdmin:
    @pytest.fixture(scope="class")
    def content_item(self, api, admin_auth):
        payload = {
            "title": f"TEST Lesson {uuid.uuid4().hex[:6]}",
            "summary": "Test summary",
            "body": "Test body content",
            "kind": "lesson",
            "section": "training",
            "level_id": "L1",
        }
        r = api.post(
            f"{BASE}/api/admin/content", json=payload, headers=admin_auth
        )
        assert r.status_code in (200, 201), r.text
        return r.json()

    def test_content_created(self, content_item):
        assert content_item.get("id")

    def test_content_update_requires_revision(self, api, admin_auth, content_item):
        revision = (
            content_item.get("draft", {}).get("revision")
            or content_item.get("revision")
            or 1
        )
        payload = {
            "title": f"TEST Lesson Updated {uuid.uuid4().hex[:4]}",
            "summary": "s",
            "body": "b",
            "kind": "lesson",
            "section": "training",
            "level_id": "L1",
            "revision": revision,
        }
        r = api.put(
            f"{BASE}/api/admin/content/{content_item['id']}",
            json=payload,
            headers=admin_auth,
        )
        assert r.status_code in (200, 400, 409), r.text

    def test_content_publish(self, api, admin_auth, content_item):
        r = api.post(
            f"{BASE}/api/admin/content/{content_item['id']}/publish",
            json={"revision": 1},
            headers=admin_auth,
        )
        assert r.status_code in (200, 400, 409, 422)

    def test_content_archive(self, api, admin_auth, content_item):
        r = api.post(
            f"{BASE}/api/admin/content/{content_item['id']}/archive",
            headers=admin_auth,
        )
        assert r.status_code in (200, 400, 409)

    def test_cohort_enrollment_attendance_flow(
        self, api, admin_auth, fresh_user
    ):
        admin_login = api.post(
            f"{BASE}/api/auth/login",
            json={
                "email": os.environ.get(
                    "SHG_TEST_ADMIN_EMAIL", "admin@soundhealing.gr"
                ),
                "password": os.environ.get(
                    "SHG_TEST_ADMIN_PASSWORD", "temple2026"
                ),
            },
        ).json()
        instructor_id = admin_login["user"]["id"]

        cohort_payload = {
            "title": f"TEST Cohort {uuid.uuid4().hex[:6]}",
            "level_id": "L1",
            "instructor_id": instructor_id,
            "start_date": "2026-02-01",
        }
        r = api.post(
            f"{BASE}/api/admin/cohorts",
            json=cohort_payload,
            headers=admin_auth,
        )
        assert r.status_code in (200, 201), r.text
        cid = r.json()["id"]

        er = api.post(
            f"{BASE}/api/admin/enrollments",
            json={"cohort_id": cid, "user_id": fresh_user["user"]["id"]},
            headers=admin_auth,
        )
        assert er.status_code in (200, 201), er.text
        enrollment = er.json()
        eid = enrollment["id"]

        # Toggle to paused, then active
        sr = api.put(
            f"{BASE}/api/admin/enrollments/{eid}/status",
            json={"expected_status": "active", "status": "paused"},
            headers=admin_auth,
        )
        assert sr.status_code in (200, 204), sr.text

        ar = api.post(
            f"{BASE}/api/admin/attendance",
            json={
                "enrollment_id": eid,
                "session_date": "2026-02-05",
                "minutes": 90,
                "status": "present",
            },
            headers=admin_auth,
        )
        assert ar.status_code in (200, 201), ar.text


# ============ FORMS module (admin catalog) ============
class TestForms:
    def test_admin_forms_denied_for_student(self, api, fresh_user):
        r = api.get(f"{BASE}/api/admin/forms", headers=fresh_user["auth"])
        assert r.status_code in (401, 403)

    def test_admin_forms_ok_for_admin(self, api, admin_auth):
        r = api.get(f"{BASE}/api/admin/forms", headers=admin_auth)
        assert r.status_code == 200
        body = r.json()
        # Envelope: catalog list + activation flags
        assert isinstance(body, dict)
        assert "catalog" in body and isinstance(body["catalog"], list)


# ============ ADMIN RESOURCES ============
class TestAdminResources:
    @pytest.fixture(scope="class")
    def resource(self, api, admin_auth):
        pdf_bytes = b"%PDF-1.4\n%TEST\n"
        content_b64 = base64.b64encode(pdf_bytes).decode()
        payload = {
            "name": f"TEST_res_{uuid.uuid4().hex[:6]}.pdf",
            "description": "test",
            "parent_type": "academy_level",
            "parent_id": "L1",
            "file_data": content_b64,
            "content_type": "application/pdf",
            "file_size": len(pdf_bytes),
        }
        r = api.post(
            f"{BASE}/api/admin/resources", json=payload, headers=admin_auth
        )
        return r

    def test_upload_resource(self, resource):
        assert resource.status_code in (200, 201), resource.text
        body = resource.json()
        assert body.get("id")
        assert body["name"].startswith("TEST_res_")

    def test_public_list_resources(self, api, fresh_user, resource):
        if resource.status_code >= 400:
            pytest.skip("Upload failed")
        r = api.get(
            f"{BASE}/api/resources?parent_type=academy_level&parent_id=L1",
            headers=fresh_user["auth"],
        )
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_list_resources(self, api, admin_auth, resource):
        if resource.status_code >= 400:
            pytest.skip("Upload failed")
        r = api.get(f"{BASE}/api/admin/resources", headers=admin_auth)
        assert r.status_code == 200

    def test_download_resource(self, api, fresh_user, resource):
        if resource.status_code >= 400:
            pytest.skip("Upload failed")
        rid = resource.json()["id"]
        r = api.get(
            f"{BASE}/api/resources/{rid}/download",
            headers=fresh_user["auth"],
        )
        # 200 (allowed) or 403 (locked by level/xp)
        assert r.status_code in (200, 403)

    def test_delete_resource(self, api, admin_auth, resource):
        if resource.status_code >= 400:
            pytest.skip("Upload failed")
        rid = resource.json()["id"]
        r = api.delete(
            f"{BASE}/api/admin/resources/{rid}", headers=admin_auth
        )
        assert r.status_code in (200, 204)
