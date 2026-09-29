"""Shared fixtures for backend tests."""
import os
import time
import uuid
import requests
import pytest
from dotenv import load_dotenv
from pathlib import Path

# Load frontend .env (public backend URL is here)
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ.get("SHG_TEST_BASE_URL", "")
ADMIN_EMAIL = os.environ.get("SHG_TEST_ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("SHG_TEST_ADMIN_PASSWORD", "")


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
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def fresh_user(api):
    """Register a fresh student user once per session."""
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    password = "passw0rd123"
    r = api.post(f"{BASE_URL}/api/auth/register", json={
        "email": email, "password": password, "name": "TEST Student",
        "location": "Athens"
    })
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {
        "email": email,
        "password": password,
        "token": data["token"],
        "user": data["user"],
        "auth": {"Authorization": f"Bearer {data['token']}"},
    }



def pytest_collection_modifyitems(config, items):
    if os.environ.get("SHG_RUN_LEGACY_INTEGRATION") != "true":
        for item in items:
            if "/tests/" in str(item.path).replace("\\", "/"):
                item.add_marker(pytest.mark.skip(reason="External integration tests require explicit staging configuration"))
