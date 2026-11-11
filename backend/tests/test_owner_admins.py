# Owner admin accounts (seed_admins.py) — login + admin endpoint reachability
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL").rstrip("/")
PWD = "matestzografakis_11.11"
ADMINS = ["manoliszografakis@gmail.com", "apostolakisalex@gmail.com"]


def _login(email, password):
    return requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=20)


@pytest.mark.parametrize("email", ADMINS)
def test_owner_admin_login_and_admin_access(email):
    r = _login(email, PWD)
    assert r.status_code == 200, r.text
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token
    user = data.get("user") or {}
    assert user.get("role") == "admin"
    assert user.get("email") == email
    assert "_id" not in user
    h = {"Authorization": f"Bearer {token}"}
    me = requests.get(f"{BASE_URL}/api/members/me", headers=h, timeout=20)
    assert me.status_code == 200
    ws = requests.get(f"{BASE_URL}/api/admin/workspace", headers=h, timeout=20)
    assert ws.status_code == 200, ws.text
    assert "content" in ws.json()
    pend = requests.get(f"{BASE_URL}/api/admin/pending", headers=h, timeout=20)
    assert pend.status_code == 200, pend.text


def test_owner_admin_uppercase_email_login():
    r = _login("ManolisZografakis@Gmail.com", PWD)
    assert r.status_code == 200, r.text


@pytest.mark.parametrize("email", ADMINS)
def test_owner_admin_wrong_password_401(email):
    r = _login(email, "wrong_password_123")
    assert r.status_code == 401, r.text
