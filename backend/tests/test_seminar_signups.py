# Seminar signup ("Δήλωση συμμετοχής") + blog event dates + Goa image tests (iteration 15)
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', os.environ.get('EXPO_BACKEND_URL', '')).rstrip('/')
if not BASE_URL:
    for line in open('/app/frontend/.env'):
        if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
            BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
API = BASE_URL + '/api'
REF = 'TEST_ref_' + uuid.uuid4().hex[:8]


@pytest.fixture(scope='module')
def session():
    r = requests.post(f'{API}/auth/login', json={'email': 'maria.papadaki@example.com', 'password': 'demo-student-2026'})
    if r.status_code != 200:
        pytest.skip(f'login failed {r.status_code}')
    s = requests.Session()
    s.headers['Authorization'] = 'Bearer ' + (r.json().get('token') or r.json().get('access_token'))
    yield s
    s.delete(f'{API}/members/me/seminars/{REF}')


# --- auth gating
def test_list_requires_auth():
    assert requests.get(f'{API}/members/me/seminars').status_code == 401


def test_post_requires_auth():
    assert requests.post(f'{API}/members/me/seminars', json={'ref': REF, 'title': 'x'}).status_code == 401


# --- CRUD + idempotency
def test_join_list_idempotent_delete(session):
    payload = {'ref': REF, 'title': 'TEST_Seminar', 'start_date': '2027-02-08', 'end_date': '2027-02-14',
               'date_text': '8-14 Feb 2027', 'location': 'Goa', 'url': '/article/x'}
    assert session.post(f'{API}/members/me/seminars', json=payload).status_code == 200
    assert session.post(f'{API}/members/me/seminars', json=payload).status_code == 200
    rows = session.get(f'{API}/members/me/seminars').json()
    mine = [r for r in rows if r['ref'] == REF]
    assert len(mine) == 1
    assert mine[0]['title'] == 'TEST_Seminar' and mine[0]['start_date'] == '2027-02-08'
    assert '_id' not in mine[0] and 'user_id' not in mine[0]
    assert session.delete(f'{API}/members/me/seminars/{REF}').status_code == 200
    rows = session.get(f'{API}/members/me/seminars').json()
    assert not [r for r in rows if r['ref'] == REF]


def test_join_validation(session):
    assert session.post(f'{API}/members/me/seminars', json={'ref': '', 'title': 'x'}).status_code == 422
    assert session.post(f'{API}/members/me/seminars', json={'ref': REF, 'title': 'x', 'extra': 1}).status_code == 422


def test_ref_with_slash_and_unicode(session):
    ref = REF + '-ελ'
    assert session.post(f'{API}/members/me/seminars', json={'ref': ref, 'title': 'TEST_u'}).status_code == 200
    assert session.delete(f'{API}/members/me/seminars/{requests.utils.quote(ref)}').status_code == 200
    assert not [r for r in session.get(f'{API}/members/me/seminars').json() if r['ref'] == ref]


# --- blog: event dates + Goa image fallback
def test_blog_goa_has_image_and_dates():
    r = requests.get(f'{API}/blog', params={'limit': 100})
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get('items', data.get('posts', []))
    goa = [p for p in items if 'Goa' in (p.get('title') or '')]
    assert goa, 'Goa post missing from /blog'
    g = goa[0]
    assert g.get('image') or g.get('cover') or g.get('image_url'), f'Goa has no image: {list(g.keys())}'
    assert (g.get('event_start') or '').startswith('2027-02-08'), g.get('event_start')
    d = requests.get(f"{API}/blog/{g['id']}")
    assert d.status_code == 200
    assert (d.json().get('event_start') or '').startswith('2027-02-08')
