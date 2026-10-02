import os,sys,asyncio
os.environ.setdefault('MONGO_URL','mongodb://localhost:27017')
os.environ.setdefault('DB_NAME','unit_only')
os.environ.setdefault('JWT_SECRET','unit-only-key-no-production-credentials')
import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
import server

@pytest.fixture
def secured():
    server.db=AsyncMongoMockClient()['test_security']
    user={'id':'student','role':'student','xp':99999}
    server.app.dependency_overrides[server.get_current_user]=lambda:user
    async def seed():
        await server.db.users.insert_one(dict(user))
        await server.db.academy.insert_one({'id':'L1','level':'L1','xp_required':0,'lessons':[{'id':'real-lesson'}]})
    asyncio.run(seed())
    yield TestClient(server.app),server.db
    server.app.dependency_overrides.clear()

def test_legacy_completion_checks_lesson_and_enrollment(secured):
    c,db=secured
    assert c.post('/api/academy/L1/lesson/fake/complete').status_code==404
    assert c.post('/api/academy/L1/lesson/real-lesson/complete').status_code==403
    asyncio.run(db.school_enrollments.insert_one({'user_id':'student','level_id':'L1','status':'active'}))
    assert c.post('/api/academy/L1/lesson/real-lesson/complete').json()['xp_gained']==0
    assert c.post('/api/academy/L1/lesson/real-lesson/complete').json()['already_completed'] is True
    assert asyncio.run(db.users.find_one({'id':'student'}))['xp']==99999

def test_private_feed_and_ai_disabled(secured):
    c,db=secured
    asyncio.run(db.practices.insert_one({'id':'secret','intention':'private','status':'XP Awarded'}))
    assert c.get('/api/community/feed').json()==[]
    assert c.post('/api/ai/chat',json={'message':'hello','session_id':'another-user'}).status_code==503

def test_feedback_no_auto_certification_or_duplicate_reward(secured):
    c,db=secured
    asyncio.run(db.practices.insert_one({'id':'p','feedback_token':'test-token','feedback':None,'user_id':'student'}))
    data={'receiver_name':'Synthetic','relaxation_before':5,'relaxation_after':6,'emotional_experience':'Calm','perceived_safety':8,'clarity_of_instructions':8,'quality_of_holding_space':8,'consent':True}
    assert c.post('/api/feedback/test-token',json=data).status_code==200
    assert c.post('/api/feedback/test-token',json=data).status_code in (400,409)
    p=asyncio.run(db.practices.find_one({'id':'p'}))
    assert p['status']=='Awaiting Instructor Review' and p['xp_awarded']==0
    assert asyncio.run(db.users.find_one({'id':'student'}))['xp']==99999

def test_resource_xp_never_grants_access(secured):
    c,db=secured
    asyncio.run(db.resources.insert_one({'id':'r','required_level':'L1','parent_type':'academy_level','parent_id':'L1','file_data':'private'}))
    assert c.get('/api/resources/r/download').status_code==403
    assert c.get('/api/resources',params={'parent_type':'academy_level','parent_id':'L1'}).json()==[]

def test_logout_revokes_prior_token(secured):
    c,db=secured
    server.app.dependency_overrides.clear()
    token=server.create_token('student')
    headers={'Authorization':'Bearer '+token}
    assert c.post('/api/auth/logout',headers=headers).status_code==200
    assert c.get('/api/practices',headers=headers).status_code==401


def test_new_attachment_stays_private_until_publish(secured):
    _,db=secured
    asyncio.run(db.content_items.insert_one({'id':'item','archived':False,'published':{'level_id':None,'resource_ids':['old']}}))
    user={'id':'student','role':'student'}
    assert asyncio.run(server.can_read_resource({'id':'new','parent_type':'cms_content','parent_id':'item'},user)) is False
    assert asyncio.run(server.can_read_resource({'id':'old','parent_type':'cms_content','parent_id':'item'},user)) is True


def test_new_registration_stays_pending_without_academic_access(monkeypatch):
    db = AsyncMongoMockClient()['registration_test']
    monkeypatch.setattr(server, 'db', db)
    c = TestClient(server.app)
    payload = {'email': 'pending@example.org', 'password': 'TestOnlyPassword2026!', 'name': 'Test Member', 'application': {'first_name': 'Test', 'last_name': 'Member', 'birth_month': 5, 'birth_year': 1990, 'phone': '0000000000', 'address': 'Synthetic address', 'declared_level': 'L3'}}
    r = c.post('/api/auth/register', json=payload)
    assert r.status_code == 200, r.text
    assert r.json()['user']['membership_status'] == 'pending'
    headers = {'Authorization': 'Bearer ' + r.json()['token']}
    assert c.get('/api/auth/me', headers=headers).status_code == 200
    assert c.get('/api/school/me', headers=headers).status_code == 403
    assert c.get('/api/members/chat', headers=headers).status_code == 403
    assert asyncio.run(db.member_notifications.count_documents({'audience': 'admin'})) == 1
    assert asyncio.run(db.school_enrollments.count_documents({})) == 0
