"""Catalog API tests backing the /explore/levels page (scheduled seminar per level + past-seminar gallery)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL").rstrip("/")
REQUIRED = {"slug", "title", "level", "active", "date", "location", "price", "image"}


@pytest.fixture(scope="module")
def items():
    r = requests.get(f"{BASE_URL}/api/trainings/catalog", timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data.get("items"), list)
    return data["items"]


# Catalog shape
def test_catalog_item_fields(items):
    assert len(items) > 0
    for it in items:
        missing = REQUIRED - set(it.keys())
        assert not missing, f"{it.get('slug')} missing {missing}"
        assert isinstance(it["active"], bool)
        assert it["level"] is None or it["level"] in (1, 2, 3, 4)


# Scheduled level 1 seminar exists and is resolvable via detail
def test_active_level1_exists_and_detail(items):
    l1 = [i for i in items if i["active"] and i["level"] == 1]
    assert l1, "no active level-1 seminar"
    d = requests.get(f"{BASE_URL}/api/trainings/{l1[0]['slug']}", timeout=60)
    assert d.status_code == 200
    assert d.json()["slug"] == l1[0]["slug"]


# Level 3 has no active seminar (frontend shows message card)
def test_level3_active_state(items):
    l3 = [i for i in items if i["active"] and i["level"] == 3]
    print(f"active level-3 count: {len(l3)}")


# Past seminars with images feed the carousel
def test_past_items_with_images(items):
    past = [i for i in items if not i["active"] and i.get("image")]
    assert past, "no past seminars with images"
    for p in past:
        assert p["image"].startswith("http")
    per_level = {lv: len([p for p in past if p["level"] == lv]) for lv in (1, 2, 3, 4)}
    print(f"past images per level: {per_level}, total {len(past)}")


# Past images are reachable
def test_past_images_reachable(items):
    past = [i for i in items if not i["active"] and i.get("image")][:5]
    for p in past:
        r = requests.get(p["image"], timeout=30, stream=True)
        assert r.status_code == 200, f"{p['image']} -> {r.status_code}"
        assert r.headers.get("content-type", "").startswith("image"), p["image"]


# Public access, no auth
def test_catalog_public():
    r = requests.get(f"{BASE_URL}/api/trainings/catalog", timeout=60)
    assert r.status_code == 200
