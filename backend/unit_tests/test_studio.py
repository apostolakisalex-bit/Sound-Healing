import asyncio
import base64
import io
import pytest
from PIL import Image
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
from studio import build_studio_router
from school import build_school_router

@pytest.fixture
def env():
    db = AsyncMongoMockClient()['studio_test']
    async def user(x_user: str = Header('student')):
        return {'id': x_user, 'role': x_user}
    async def admin(u=Depends(user)):
        if u['role'] != 'admin': raise HTTPException(403)
        return u
    app = FastAPI()
    app.include_router(build_studio_router(db, user, admin))
    app.include_router(build_school_router(db, user, admin))
    return TestClient(app), db

def call(c, method, path, user='admin', **kwargs):
    return getattr(c, method)('/api' + path, headers={'x-user': user}, **kwargs)

def photo():
    b = io.BytesIO()
    Image.new('RGB', (40, 30), 'gold').save(b, 'PNG')
    return {'title': 'Test photo', 'alt': 'Golden square', 'data': base64.b64encode(b.getvalue()).decode()}

def test_media_security_and_publication(env):
    c, db = env
    assert call(c, 'post', '/admin/media', 'student', json=photo()).status_code == 403
    assert call(c, 'post', '/admin/media', json={**photo(), 'data': base64.b64encode(b'<svg/>').decode()}).status_code == 422
    image = call(c, 'post', '/admin/media', json=photo()).json()
    assert 'data' not in image
    assert c.get(image['url']).status_code == 404
    assert call(c, 'get', f'/media/{image["id"]}/preview', 'student').status_code == 404
    assert call(c, 'get', f'/media/{image["id"]}/preview').status_code == 200
    item = call(c, 'post', '/admin/content', json={'title': 'Public page', 'kind': 'page', 'image_url': image['url']}).json()
    assert c.get(image['url']).status_code == 404
    call(c, 'post', f'/admin/content/{item["id"]}/publish?revision=1')
    result = c.get(image['url'])
    assert result.status_code == 200 and result.headers['content-type'] == 'image/webp'
    assert result.headers['cache-control'] == 'no-store'
    assert call(c, 'put', f'/admin/media/{image["id"]}', json={'title': 'New title', 'alt': 'New description', 'revision': 1}).status_code == 200
    assert call(c, 'put', f'/admin/media/{image["id"]}', json={'title': 'Stale edit', 'alt': 'Description', 'revision': 1}).status_code == 409
    call(c, 'post', f'/admin/media/{image["id"]}/archive', json={'revision': 2})
    assert call(c, 'get', '/admin/media').json()['total'] == 0
    assert c.get(image['url']).status_code == 200
    call(c, 'post', f'/admin/content/{item["id"]}/archive')
    assert c.get(image['url']).status_code == 404

def test_private_image_requires_enrollment(env):
    c, db = env
    image = call(c, 'post', '/admin/media', json=photo()).json()
    item = call(c, 'post', '/admin/content', json={'title': 'Private lesson', 'kind': 'lesson', 'level_id': 'L2', 'image_url': image['url']}).json()
    call(c, 'post', f'/admin/content/{item["id"]}/publish?revision=1')
    assert c.get(image['url']).status_code == 404
    assert call(c, 'get', f'/media/{image["id"]}/preview', 'student').status_code == 404
    asyncio.run(db.school_enrollments.insert_one({'user_id': 'student', 'level_id': 'L2', 'status': 'active'}))
    assert call(c, 'get', f'/media/{image["id"]}/preview', 'student').status_code == 200

def test_calendar_crud_conflicts_and_read_only_sources(env):
    c, db = env
    data = {'title': 'Evening class', 'kind': 'class', 'start_date': '2026-10-02', 'end_date': '2026-10-02', 'start_time': '18:00', 'end_time': '19:00'}
    assert call(c, 'post', '/admin/calendar', 'student', json=data).status_code == 403
    assert call(c, 'post', '/admin/calendar', json={**data, 'end_time': '17:00'}).status_code == 422
    assert call(c, 'post', '/admin/calendar', json={**data, 'cohort_id': 'missing'}).status_code == 422
    item = call(c, 'post', '/admin/calendar', json=data).json()
    asyncio.run(db.school_practices.insert_many([{'session_date': '2026-10-02', 'status': 'submitted', 'reflection': 'private'}, {'session_date': '2026-10-02', 'status': 'draft'}]))
    entries = call(c, 'get', '/admin/calendar?start=2026-10-01&end=2026-10-31').json()
    assert len(entries) == 2 and 'reflection' not in str(entries)
    assert next(e for e in entries if e['source'] == 'practice')['title'].endswith('1 καταγραφές')
    assert call(c, 'put', f'/admin/calendar/{item["id"]}', json={**data, 'title': 'Changed class', 'revision': 1}).status_code == 200
    assert call(c, 'put', f'/admin/calendar/{item["id"]}', json={**data, 'revision': 1}).status_code == 409
    assert call(c, 'post', f'/admin/calendar/{item["id"]}/cancel', json={'revision': 2}).status_code == 200
    assert len(call(c, 'get', '/admin/calendar?start=2026-10-01&end=2026-10-31').json()) == 1
