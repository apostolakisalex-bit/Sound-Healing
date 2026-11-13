import asyncio
from datetime import timedelta
import pytest
from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
import account_security as security
from members import build_members_router
from school import build_school_router
from trainings import build_trainings_router
from practice_state import decorate_practices

APPLICATION = {'first_name': 'Test', 'last_name': 'Member', 'birth_month': 2, 'birth_year': 1990, 'phone': '0000000000', 'address': 'Test address', 'declared_level': 'L2'}

@pytest.fixture
def env(monkeypatch):
    monkeypatch.setenv('JWT_SECRET', 'test-only-not-a-real-secret')
    monkeypatch.setenv('PUBLIC_WEB_URL', 'https://example.org')
    db = AsyncMongoMockClient()['readiness']
    async def seed():
        await db.users.insert_many([{'id': 's', 'email': 'student@example.org', 'name': 'Student', 'role': 'student', 'membership_status': 'pending', 'email_verified': False, 'application': {'source': 'google', 'birth_month': 0, 'declared_level': 'L1'}}, {'id': 'a', 'name': 'Admin', 'email': 'admin@example.org', 'role': 'admin'}])
    asyncio.run(seed())
    async def user(x_user: str = Header('s')):
        return await db.users.find_one({'id': x_user})
    async def admin(u=Depends(user)):
        if u['role'] != 'admin': raise HTTPException(403)
        return u
    app = FastAPI()
    app.include_router(security.build_account_router(lambda: db, user, lambda p: 'hashed:' + p))
    app.include_router(build_members_router(db, user, admin))
    app.include_router(build_school_router(db, user, admin))
    app.include_router(build_trainings_router(db, admin))
    sent = []
    async def send(**kwargs): sent.append(kwargs); return 'test-id'
    monkeypatch.setattr(security, 'send_account_link', send)
    return TestClient(app), db, sent

def test_google_completion_validates_and_stays_pending(env):
    c, db, _ = env
    assert not c.get('/api/auth/account').json()['application_complete']
    assert c.put('/api/auth/application', json={**APPLICATION, 'birth_month': 0}).status_code == 422
    assert c.put('/api/auth/application', json=APPLICATION).status_code == 200
    u=asyncio.run(db.users.find_one({'id':'s'}))
    assert u['membership_status']=='pending' and u['application']['declared_level']=='L2'
    assert c.get('/api/auth/account').json()['application_complete']

def test_verification_single_use_and_no_secret_exposure(env):
    c, db, sent = env
    r=c.post('/api/auth/verification-email'); assert r.status_code==200
    token=sent[0]['link'].split('token=')[1]
    assert token not in str(asyncio.run(db.users.find_one({'id':'s'})))
    assert c.post('/api/auth/verify-email',json={'token':token}).status_code==200
    assert c.post('/api/auth/verify-email',json={'token':token}).status_code==400
    assert c.get('/api/auth/account').json()['email_verified']

def test_reset_generic_response_single_use_and_revocation(env):
    c, db, sent=env
    known=c.post('/api/auth/forgot-password',json={'email':'student@example.org'})
    unknown=c.post('/api/auth/forgot-password',json={'email':'absent@example.org'})
    assert known.json()==unknown.json() and len(sent)==1
    token=sent[0]['link'].split('token=')[1]
    assert c.post('/api/auth/reset-password',json={'token':token,'password':'tiny'}).status_code==422
    data={'token':token,'password':'SyntheticOnly123!'}
    assert c.post('/api/auth/reset-password',json=data).status_code==200
    assert c.post('/api/auth/reset-password',json=data).status_code==400
    u=asyncio.run(db.users.find_one({'id':'s'}))
    assert u['token_version']==1 and u['password_hash']=='hashed:SyntheticOnly123!'

def test_expired_reset_and_rate_limit(env):
    c, db, sent=env
    c.post('/api/auth/forgot-password',json={'email':'student@example.org'})
    token=sent[0]['link'].split('token=')[1]
    asyncio.run(db.users.update_one({'id':'s'},{'$set':{'reset_expires_at':security.now()-timedelta(seconds=1)}}))
    assert c.post('/api/auth/reset-password',json={'token':token,'password':'SyntheticOnly123!'}).status_code==400
    for _ in range(2): assert c.post('/api/auth/forgot-password',json={'email':'student@example.org'}).status_code==200
    r=c.post('/api/auth/forgot-password',json={'email':'student@example.org'},headers={'X-Forwarded-For':'new-ip'})
    assert r.status_code==429 and r.headers['retry-after']

def test_approval_requires_complete_application_and_email(env):
    c, db, _=env
    asyncio.run(db.member_levels.insert_one({'user_id':'s','level_id':'L1','revision':1}))
    path='/api/admin/members/s/decision'; kw={'headers':{'x-user':'a'},'json':{'decision':'approved','note':'Test checked'}}
    assert c.post(path,**kw).status_code==422
    asyncio.run(db.users.update_one({'id':'s'},{'$set':{'application':{**APPLICATION,'declared_level':'L1'}}}))
    assert c.post(path,**kw).status_code==422
    asyncio.run(db.users.update_one({'id':'s'},{'$set':{'email_verified':True}}))
    assert c.post(path,**kw).status_code==200

def test_practice_states_and_credited_hours(env):
    c, db, _=env
    async def seed():
        for pid,status in [('draft','draft'),('wait','submitted'),('ready','submitted'),('fix','changes_requested'),('ok','reviewed'),('notcredited','reviewed')]:
            await db.school_practices.insert_one({'id':pid,'user_id':'s','status':status,'duration_minutes':60,'level_id':'L1','session_date':'2026-10-01','mode':'individual','receiver_code':pid})
        await db.assessment_answers.insert_one({'practice_id':'ready','status':'submitted'})
        await db.assessment_invitations.insert_one({'practice_id':'ready','status':'submitted'})
        await db.member_levels.insert_one({'user_id':'s','level_id':'L1','enabled':True,'target':15,'historical_completed':2,'credited_practice_ids':['ok']})
    asyncio.run(seed())
    docs=asyncio.run(db.school_practices.find({}, {'_id':0}).to_list(100))
    states=asyncio.run(decorate_practices(db,docs))
    assert [p['status_label'] for p in states[:5]]==['Πρόχειρη','Αναμονή αξιολόγησης','Προς έλεγχο','Χρειάζεται διόρθωση','Εγκρίθηκε']
    stats=c.get('/api/members/me').json()['stats']
    assert stats['recorded_minutes']==300 and stats['credited_minutes']==60
    assert stats['approved_sessions']==2 and stats['credited_sessions']==1 and stats['historical_credited_sessions']==2

def test_admin_pending_privacy_and_counts(env):
    c,db,_=env
    asyncio.run(db.training_requests.insert_one({'id':'r','user_id':'s','level_id':'L2','status':'pending'}))
    assert c.get('/api/admin/pending').status_code==403
    r=c.get('/api/admin/pending',headers={'x-user':'a'}).json()
    assert r['counts']['registrations']==1 and r['counts']['training_requests']==1
    assert 'application' not in r['registrations'][0]

def test_cms_overrides_site_and_archive_hides(env, monkeypatch):
    import trainings
    c,db,_=env
    async def source(): return [{'slug':'demo','url':'https://www.soundhealing.gr/demo/','title':'Source title','price':'old','end_date':'2099-01-01'}]
    monkeypatch.setattr(trainings,'get_items',source)
    assert c.post('/api/admin/trainings/import').status_code==403
    assert c.post('/api/admin/trainings/import',headers={'x-user':'a'}).status_code==200
    doc=asyncio.run(db.content_items.find_one({'id':'seminar-demo'}))
    # Import stays draft. Publishing reviewed CMS content changes the public endpoint.
    assert c.get('/api/trainings/demo').json()['price']=='old'
    content={**doc['draft'],'event_price':'New price','event_phone':'','title':'Admin title','action_url':'https://www.soundhealing.gr/changed/'}
    assert c.put('/api/admin/content/seminar-demo',headers={'x-user':'a'},json={**content,'revision':1}).status_code==200
    assert c.post('/api/admin/content/seminar-demo/publish?revision=2',headers={'x-user':'a'}).status_code==200
    assert c.get('/api/trainings/demo').json()['price']=='New price'
    assert c.post('/api/admin/trainings/import',headers={'x-user':'a'}).json()['created']==0
    assert c.post('/api/admin/content/seminar-demo/archive',headers={'x-user':'a'}).status_code==200
    assert c.get('/api/trainings/demo').status_code==404
