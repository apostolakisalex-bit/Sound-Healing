import asyncio
import pytest
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
from school import build_school_router

@pytest.fixture
def env():
    db=AsyncMongoMockClient()['school_test']
    async def user(x_user: str=Header(default='student')):
        return {'id':x_user,'role': {'admin':'admin','teacher':'instructor','other_teacher':'instructor'}.get(x_user,'student')}
    async def admin(u=__import__('fastapi').Depends(user)):
        if u['role']!='admin': raise HTTPException(403)
        return u
    app=FastAPI();app.include_router(build_school_router(db,user,admin))
    client=TestClient(app)
    async def seed():
        await db.users.insert_many([{'id':i,'name':i,'email':i+'@example.org','role':r} for i,r in [('student','student'),('admin','admin'),('teacher','instructor'),('other_teacher','instructor')]])
    asyncio.run(seed())
    return client,db

def call(c,method,path,user='admin',**kwargs):
    return getattr(c,method)('/api'+path,headers={'x-user':user},**kwargs)

def cohort(c):
    r=call(c,'post','/admin/cohorts',json={'title':'Autumn','level_id':'L1','instructor_id':'teacher','start_date':'2026-09-29'})
    assert r.status_code==200,r.text
    return r.json()['id']

def enrollment(c):
    return call(c,'post','/admin/enrollments',json={'cohort_id':cohort(c),'user_id':'student'}).json()['id']

def test_four_levels_without_xp_entitlement(env):
    c,db=env
    asyncio.run(db.users.update_one({'id':'student'},{'$set':{'xp':99999}}))
    r=call(c,'get','/school/catalog','student').json()
    assert [x['id'] for x in r]==['L1','L2','L3','L4']
    assert not any(x['is_enrolled'] for x in r)

def test_content_draft_publish_conflict_and_archive(env):
    c,_=env
    data={'title':'Welcome','kind':'page','body':'Original'}
    assert call(c,'post','/admin/content','student',json=data).status_code==403
    item=call(c,'post','/admin/content',json=data).json()
    assert call(c,'get','/content/public').json()==[]
    assert call(c,'post',f'/admin/content/{item["id"]}/publish?revision=1').status_code==200
    assert call(c,'put',f'/admin/content/{item["id"]}',json={**data,'body':'Draft only','revision':2}).status_code==200
    assert call(c,'get','/content/public').json()[0]['published']['body']=='Original'
    assert call(c,'put',f'/admin/content/{item["id"]}',json={**data,'revision':2}).status_code==409
    assert call(c,'post',f'/admin/content/{item["id"]}/archive').status_code==200
    assert call(c,'get','/content/public').json()==[]

def test_lesson_enrollment_and_media_validation(env):
    c,_=env
    data={'title':'Lesson','kind':'lesson','level_id':'L1','media_url':'javascript:alert(1)'}
    assert call(c,'post','/admin/content',json=data).status_code==422
    data['media_url']='https://example.org/lesson'
    item=call(c,'post','/admin/content',json=data).json()
    call(c,'post',f'/admin/content/{item["id"]}/publish?revision=1')
    assert call(c,'get','/content/library','student').json()==[]
    assert call(c,'post',f'/school/lessons/{item["id"]}/complete','student').status_code==403
    enrollment(c)
    assert len(call(c,'get','/content/library','student').json())==1
    assert call(c,'post',f'/school/lessons/{item["id"]}/complete','student').status_code==200

def test_practice_isolation_and_review(env):
    c,_=env;e=enrollment(c)
    data={'enrollment_id':e,'session_date':'2026-09-29','duration_minutes':60,'mode':'individual','receiver_code':'R01','reflection':'Practice reflection','contraindications_checked':True}
    assert call(c,'post','/school/practices','other_student',json=data).status_code==403
    p=call(c,'post','/school/practices','student',json=data).json()['id']
    assert call(c,'post',f'/school/practices/{p}/submit','other_student').status_code==404
    assert call(c,'post',f'/school/practices/{p}/submit','student').status_code==200
    assert call(c,'post',f'/school/practices/{p}/submit','student').status_code==409
    review={'decision':'reviewed','note':'Read and discussed'}
    assert call(c,'post',f'/admin/practices/{p}/review','other_teacher',json=review).status_code==404
    assert call(c,'get','/admin/workspace','other_teacher').json()['practices']==[]
    assert call(c,'post',f'/admin/practices/{p}/review','teacher',json=review).json()['counts_for_certification'] is False
    assert call(c,'post',f'/admin/practices/{p}/review','teacher',json=review).status_code==409

def test_attendance_scope_and_upsert(env):
    c,db=env;e=enrollment(c)
    data={'enrollment_id':e,'session_date':'2026-09-29','minutes':60,'status':'present'}
    assert call(c,'post','/admin/attendance','other_teacher',json=data).status_code==404
    assert call(c,'post','/admin/attendance','teacher',json=data).status_code==200
    assert call(c,'post','/admin/attendance','teacher',json=data).status_code==200
    assert asyncio.run(db.school_attendance.count_documents({}))==1
    assert len(call(c,'get','/school/me','student').json()['attendance'])==1
    assert call(c,'get','/school/me','other_student').json()['attendance']==[]

def test_validation_and_safe_export(env):
    c,_=env;e=enrollment(c)
    data={'enrollment_id':e,'session_date':'2026-02-31','duration_minutes':60,'mode':'individual','receiver_code':'R01'}
    assert call(c,'post','/school/practices','student',json=data).status_code==422
    assert call(c,'get','/admin/export','teacher').status_code==403
    data=call(c,'get','/admin/export').json()
    assert 'users' not in data and 'school_practices' not in data
