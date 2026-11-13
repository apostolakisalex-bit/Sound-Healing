"""Tests for the public trainings API (seminar feed)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://healing-universe.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestTrainings:
    def test_active_returns_items(self, api):
        r = api.get(f"{BASE_URL}/api/trainings/active", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, dict)
        assert "items" in data
        items = data["items"]
        assert isinstance(items, list)
        assert len(items) >= 3, f"Expected >=3 active seminars, got {len(items)}"
        required = {"slug", "title", "level", "date", "end_date", "image", "price"}
        for it in items:
            missing = required - set(it.keys())
            assert not missing, f"Item missing fields {missing}: {it}"
            assert it["slug"]
            assert it["title"]
            assert it["image"]

    def test_active_slug_detail(self, api):
        r = api.get(f"{BASE_URL}/api/trainings/active", timeout=30)
        assert r.status_code == 200
        slug = r.json()["items"][0]["slug"]
        d = api.get(f"{BASE_URL}/api/trainings/{slug}", timeout=30)
        assert d.status_code == 200, d.text
        obj = d.json()
        assert obj["slug"] == slug
        # Depth fields
        for key in ("program", "audience", "time", "address", "phone", "description", "certification"):
            assert key in obj, f"Missing key: {key}"
        assert isinstance(obj["program"], list) and len(obj["program"]) >= 1
        assert isinstance(obj["audience"], list) and len(obj["audience"]) >= 1
        assert obj["phone"]
        assert obj["description"]

    def test_level2_slug_detail(self, api):
        # Deep-link slug mentioned in review
        slug = "ekpaideftiko-seminario-ixotherapeias-epipedo-2-athina-6-8-noemvriou-2026"
        d = api.get(f"{BASE_URL}/api/trainings/{slug}", timeout=30)
        assert d.status_code == 200, d.text
        obj = d.json()
        assert obj["slug"] == slug
        assert obj.get("level") == 2
        assert isinstance(obj.get("program"), list) and len(obj["program"]) >= 1

    def test_unknown_slug_404(self, api):
        d = api.get(f"{BASE_URL}/api/trainings/this-slug-does-not-exist", timeout=30)
        assert d.status_code == 404

    def test_no_auth_required(self, api):
        # Explicit: no Authorization header
        s = requests.Session()
        r = s.get(f"{BASE_URL}/api/trainings/active", timeout=30)
        assert r.status_code == 200
