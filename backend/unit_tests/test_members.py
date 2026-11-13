import asyncio
import pytest
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
from members import build_members_router

@pytest.fixture
def env():
    db = AsyncMongoMockClient()['members_test']
    async def seed():
        await db.users.insert_many([{'id': 'admin', 'role': 'admin', 'name': 'Admin'}, {'id': 'student', 'role': 'student', 'name': 'Student', 'membership_status': 'pending', 'email_verified': True, 'application': {'declared_level': 'L2', 'first_name': 'Test', 'last_name': 'Member', 'birth_month': 1, 'birth_year': 1990, 'phone': '0000000000', 'address': 'Test address'}}, {'id': 'other', 'role': 'student', 'name': 'Other'}])
        await db.school_cohorts.insert_one({'id': 'l3', 'title': 'Level three', 'level_id': 'L3'})
    asyncio.run(seed())
    async def user(x_user: str = Header('student')):
        return await db.users.find_one({'id': x_user})
    async def admin(u=Depends(user)):
        if u['role'] != 'admin': raise HTTPException(403)
        return u
    app = FastAPI(); app.include_router(build_members_router(db, user, admin))
    return TestClient(app), db

def call(c, method, path, user='admin', **kwargs):
    return getattr(c, method)('/api' + path, headers={'x-user': user}, **kwargs)

def test_pending_approval_and_admin_level_confirmation(env):
    c, db = env
    assert call(c, 'get', '/members/chat', 'student').status_code == 403
    assert call(c, 'get', '/admin/members/student', 'other').status_code == 403
    assert call(c, 'get', '/members/me', 'student').json()['membership_status'] == 'pending'
    decision = {'decision': 'approved', 'note': 'Records checked'}
    assert call(c, 'post', '/admin/members/student/decision', json=decision).status_code == 422
    data = {'enabled': True, 'target': 15, 'historical_completed': 10, 'note': 'Historical records checked', 'revision': 0}
    for level in ['L1', 'L2']:
        assert call(c, 'put', f'/admin/members/student/levels/{level}', json=data).status_code == 200
    assert call(c, 'put', '/admin/members/student/levels/L1', json=data).status_code == 409
    assert call(c, 'post', '/admin/members/student/decision', json=decision).status_code == 200
    assert call(c, 'post', '/admin/members/student/decision', json=decision).status_code == 409
    assert call(c, 'get', '/members/chat', 'student').status_code == 200
    assert call(c, 'put', '/members/me/instruments', 'student', json={'instruments': ['Gong', 'Gong', ' Bowls ']}).status_code == 200
    profile = call(c, 'get', '/admin/members/student').json()
    assert profile['instruments'] == ['Gong', 'Bowls']
    assert profile['levels'][0]['completed'] == 10 and not profile['levels'][0]['complete']
    assert call(c, 'get', '/notifications', 'student').json()
    assert call(c, 'get', '/notifications', 'other').json() == []

def test_training_admission_independent_of_practice_completion(env):
    c, db = env
    # Existing approved member, no completed level/practice records.
    assert call(c, 'post', '/members/me/training-requests', 'other', json={'level_id': 'L3'}).status_code == 200
    assert call(c, 'post', '/members/me/training-requests', 'other', json={'level_id': 'L3'}).status_code == 409
    assert call(c, 'post', '/admin/members/other/training/L3/decision', json={'decision': 'approved', 'note': 'Accepted', 'cohort_id': 'missing'}).status_code == 422
    assert call(c, 'post', '/admin/members/other/training/L3/decision', json={'decision': 'approved', 'note': 'Accepted', 'cohort_id': 'l3'}).status_code == 200
    assert asyncio.run(db.school_enrollments.count_documents({'user_id': 'other', 'cohort_id': 'l3', 'status': 'active'})) == 1
    assert not any(l['complete'] for l in call(c, 'get', '/members/me', 'other').json()['levels'])

def test_chat_scoping_rate_and_moderation(env):
    c, db = env
    r = call(c, 'post', '/members/chat', 'other', json={'text': 'Hello members'})
    assert r.status_code == 200
    assert call(c, 'post', '/members/chat', 'other', json={'text': 'Too soon'}).status_code == 429
    mid = r.json()['id']
    assert call(c, 'post', f'/admin/chat/{mid}/hide', 'other').status_code == 403
    assert call(c, 'post', f'/admin/chat/{mid}/hide').status_code == 200
    assert call(c, 'get', '/members/chat', 'other').json() == []

def test_practice_credit_requires_admin_selection_and_correct_owner(env):
    c, db = env
    asyncio.run(db.school_practices.insert_one({'id': 'p1', 'user_id': 'other', 'level_id': 'L1', 'status': 'reviewed', 'mode': 'individual', 'session_date': '2026-10-01', 'duration_minutes': 60, 'receiver_code': 'R1'}))
    data = {'enabled': True, 'target': 1, 'historical_completed': 0, 'note': 'Evidence checked', 'revision': 0, 'credited_practice_ids': ['p1']}
    assert call(c, 'put', '/admin/members/student/levels/L1', json=data).status_code == 422
    assert call(c, 'get', '/members/me', 'other').json()['levels'][0]['completed'] == 0
    assert call(c, 'put', '/admin/members/other/levels/L1', json=data).status_code == 200
    p = call(c, 'get', '/members/me', 'other').json()
    assert p['levels'][0]['complete'] and p['stats']['minutes'] == 60

