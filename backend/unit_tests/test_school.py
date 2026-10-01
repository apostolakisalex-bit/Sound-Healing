import asyncio
import pytest
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
from school import build_school_router
from forms import build_form_router

@pytest.fixture
def env():
    db=AsyncMongoMockClient()['school_test']
    async def user(x_user: str=Header(default='student')):
        return {'id':x_user,'role': {'admin':'admin','teacher':'instructor','other_teacher':'instructor'}.get(x_user,'student')}
    async def admin(u=__import__('fastapi').Depends(user)):
        if u['role']!='admin': raise HTTPException(403)
        return u
    app=FastAPI();app.include_router(build_school_router(db,user,admin));app.include_router(build_form_router(db,admin))
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
    cycle=call(c,'post','/school/cycles','student',json={'enrollment_id':e,'receiver_code':'R01'}).json()['id']
    data={'cycle_id':cycle,'enrollment_id':e,'session_date':'2026-09-29','duration_minutes':60,'mode':'individual','receiver_code':'R01','reflection':'Practice reflection','contraindications_checked':True}
    assert call(c,'post','/school/practices','other_student',json=data).status_code in (403,422)
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


def test_cycle_owner_and_group_validation(env):
    c,_=env;e=enrollment(c)
    cycle=call(c,'post','/school/cycles','student',json={'enrollment_id':e,'receiver_code':'R01','planned_sessions':4}).json()
    assert cycle['planned_sessions']==4
    assert call(c,'get','/school/cycles','other_student').json()==[]
    data={'enrollment_id':e,'session_date':'2026-09-29','duration_minutes':60,'mode':'individual','receiver_code':'R01','cycle_id':cycle['id']}
    assert call(c,'post','/school/practices','student',json={**data,'receiver_code':'wrong'}).status_code==422
    assert call(c,'post','/school/practices','student',json=data).status_code==200
    assert call(c,'get','/school/cycles','student').json()[0]['recorded_sessions']==1
    group={**data,'mode':'group','cycle_id':None,'receiver_code':'G01'}
    assert call(c,'post','/school/practices','student',json=group).status_code==422
    assert call(c,'post','/school/practices','student',json={**group,'participant_count':5}).status_code==200
    assert call(c,'post','/school/practices','student',json={**group,'participant_count':1}).status_code==422


def test_draft_revision_and_review_history(env):
    c,_=env;e=enrollment(c)
    data={'enrollment_id':e,'session_date':'2026-09-29','duration_minutes':60,'mode':'group','receiver_code':'G01','participant_count':3,'reflection':'Reflection','contraindications_checked':True}
    p=call(c,'post','/school/practices','student',json=data).json()['id']
    assert call(c,'put',f'/school/practices/{p}','student',json={**data,'revision':1}).status_code==200
    assert call(c,'put',f'/school/practices/{p}','student',json={**data,'revision':1}).status_code==409
    assert call(c,'post',f'/school/practices/{p}/submit','student').status_code==200
    assert call(c,'post',f'/admin/practices/{p}/review','teacher',json={'decision':'changes_requested','note':'Please expand'}).status_code==200
    record=call(c,'get','/school/me','student').json()['practices'][0]
    assert len(record['review_history'])==1
    assert call(c,'put',f'/school/practices/{p}','student',json={**data,'revision':record['revision'],'reflection':'Expanded reflection'}).status_code==200
    assert call(c,'post',f'/school/practices/{p}/submit','student').status_code==200
    assert call(c,'post',f'/admin/practices/{p}/review','teacher',json={'decision':'reviewed','note':'Reviewed again'}).status_code==200
    assert len(call(c,'get','/school/me','student').json()['practices'][0]['review_history'])==2


def test_form_versions_are_private_immutable_drafts(env):
    c,_=env
    assert call(c,'get','/admin/forms','student').status_code==403
    assert call(c,'get','/admin/forms').json()['active_assignments'] == []
    data={'template_key':'receiver_l2_el','source_note':'F02 excerpt; comfort unresolved','questions':[{'key':'comfort','label':'Comfort question','kind':'unknown','required':None}]}
    one=call(c,'post','/admin/forms',json=data)
    assert one.status_code==200,one.text
    assert one.json()['open_decisions']
    assert one.json()['questions'][0]['required'] is None
    two=call(c,'post','/admin/forms',json={**data,'source_note':'Second source note'})
    assert one.json()['id']!=two.json()['id']
    versions=call(c,'get','/admin/forms').json()['versions']
    assert len(versions)==2 and all(v['status']=='draft' for v in versions)
    assert call(c,'put','/admin/forms/'+one.json()['id'],json=data).status_code in (404,405)


def test_form_schema_rejects_ambiguous_or_invalid_options(env):
    c,_=env
    base={'template_key':'receiver_l1_el','source_note':'F01 verified excerpt'}
    question={'key':'trust','label':'Trust','kind':'single','options':['Yes','Yes']}
    assert call(c,'post','/admin/forms',json={**base,'questions':[question]}).status_code==422
    question['options']=['Yes','No']
    assert call(c,'post','/admin/forms',json={**base,'questions':[question,question]}).status_code==422
    assert call(c,'post','/admin/forms',json={**base,'template_key':'invented','questions':[question]}).status_code==422

def test_restore_is_draft_only_and_conflict_safe(env):
    c,_=env
    data={'title':'First version','kind':'page','body':'Original'}
    item=call(c,'post','/admin/content',json=data).json()['id']
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    call(c,'put',f'/admin/content/{item}',json={**data,'body':'Second','revision':2})
    call(c,'post',f'/admin/content/{item}/publish?revision=3')
    payload={'revision':4,'source_revision':1}
    assert call(c,'post',f'/admin/content/{item}/restore','teacher',json=payload).status_code==403
    assert call(c,'post',f'/admin/content/{item}/restore',json=payload).status_code==200
    assert call(c,'post',f'/admin/content/{item}/restore',json=payload).status_code==409
    assert call(c,'get','/content/public').json()[0]['published']['body']=='Second'
    saved=call(c,'get','/admin/workspace').json()['content'][0]
    assert saved['draft']['body']=='Original' and len(saved['history'])==2


def test_paused_enrollment_preserves_records_and_blocks_practice(env):
    c,_=env;e=enrollment(c)
    data={'enrollment_id':e,'session_date':'2026-09-29','duration_minutes':60,'mode':'group','receiver_code':'G01','participant_count':3,'reflection':'Reflection','contraindications_checked':True}
    p=call(c,'post','/school/practices','student',json=data).json()['id']
    payload={'expected_status':'active','status':'paused'}
    assert call(c,'put',f'/admin/enrollments/{e}/status','teacher',json=payload).status_code==403
    assert call(c,'put',f'/admin/enrollments/{e}/status',json=payload).status_code==200
    assert call(c,'put',f'/admin/enrollments/{e}/status',json=payload).status_code==409
    assert not call(c,'get','/school/catalog','student').json()[0]['is_enrolled']
    assert call(c,'post',f'/school/practices/{p}/submit','student').status_code==403
    assert len(call(c,'get','/school/me','student').json()['practices'])==1
    assert call(c,'put',f'/admin/enrollments/{e}/status',json={'expected_status':'paused','status':'active'}).status_code==200
    assert call(c,'post',f'/school/practices/{p}/submit','student').status_code==200

def test_progress_scope_privacy_and_exact_aggregation(env):
    c,db=env;e=enrollment(c)
    async def seed():
        await db.school_attendance.insert_many([
            {'enrollment_id':e,'user_id':'student','status':'present','minutes':60},
            {'enrollment_id':e,'user_id':'student','status':'absent','minutes':90},
            {'enrollment_id':e,'user_id':'student','status':'excused','minutes':90},
        ])
        await db.school_practices.insert_many([
            {'enrollment_id':e,'user_id':'student','status':'reviewed','duration_minutes':45,'reflection':'private'} for _ in range(501)
        ] + [{'enrollment_id':e,'user_id':'student','status':'draft','duration_minutes':60}])
    asyncio.run(seed())
    own=call(c,'get','/school/progress','student').json()['items'][0]
    assert own['attendance']['present']=={'count':1,'minutes':60}
    assert own['attendance']['absent']['minutes']==0
    assert own['practices']['reviewed']=={'count':501,'minutes':22545}
    assert own['practices']['draft']['count']==1
    staff=call(c,'get','/school/progress?staff_view=true','teacher').json()['items'][0]
    assert 'draft' not in staff['practices'] and 'reflection' not in str(staff)
    assert call(c,'get','/school/progress?staff_view=true','other_teacher').json()['total']==0
    assert call(c,'get','/school/progress','other_student').json()['total']==0
    assert call(c,'get','/school/progress?staff_view=true','student').status_code==403
    assert call(c,'get','/school/progress?offset=1&limit=1','student').json()['items']==[]
    assert call(c,'get','/school/progress?limit=51','student').status_code==422
    assert call(c,'get','/school/progress?offset=-1','student').status_code==422

def test_progress_filters_preserve_scope(env):
    c,_=env;e=enrollment(c)
    assert call(c,'get','/school/progress?level_id=L1','student').json()['total']==1
    assert call(c,'get','/school/progress?level_id=L2','student').json()['total']==0
    assert call(c,'get','/school/progress?enrollment_status=paused','student').json()['total']==0
    call(c,'put',f'/admin/enrollments/{e}/status',json={'expected_status':'active','status':'paused'})
    assert call(c,'get','/school/progress?level_id=L1&enrollment_status=paused','student').json()['total']==1
    assert call(c,'get','/school/progress?staff_view=true&level_id=L1&enrollment_status=paused','other_teacher').json()['total']==0
    assert call(c,'get','/school/progress?level_id=L5','student').status_code==422

def test_activity_admin_only_and_paginated(env):
    c,_=env
    cohort(c)
    assert call(c,'get','/admin/activity','student').status_code==403
    assert call(c,'get','/admin/activity','teacher').status_code==403
    result=call(c,'get','/admin/activity?limit=1').json()
    assert result['total']==1
    assert result['items'][0]['action']=='cohort.create'
    assert result['items'][0]['actor_name']=='admin'
    assert 'email' not in result['items'][0]
    assert call(c,'get','/admin/activity?offset=1').json()['items']==[]
    assert call(c,'get','/admin/activity?limit=51').status_code==422

def test_lesson_completion_persists_and_is_personal(env):
    c,db=env;enrollment(c)
    item=call(c,'post','/admin/content',json={'title':'Shared lesson','kind':'lesson','level_id':None}).json()['id']
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    assert call(c,'get','/content/library','student').json()[0]['completed'] is False
    for _ in range(2):
        assert call(c,'post',f'/school/lessons/{item}/complete','student').status_code==200
    assert call(c,'get','/content/library','student').json()[0]['completed'] is True
    assert call(c,'get','/content/library','other_student').json()[0]['completed'] is False
    assert asyncio.run(db.users.find_one({'id':'student'}))['school_completed_lessons']==[item]

def test_public_hero_requires_publication_and_public_access(env):
    c,_=env
    data={'title':'Public introduction','kind':'hero','summary':'Intro','media_url':'https://example.org/hero.jpg'}
    item=call(c,'post','/admin/content',json=data).json()['id']
    assert call(c,'get','/content/public').json()==[]
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    assert call(c,'get','/content/public').json()[0]['published']['kind']=='hero'
    call(c,'put',f'/admin/content/{item}',json={**data,'level_id':'L1','revision':2})
    call(c,'post',f'/admin/content/{item}/publish?revision=3')
    assert call(c,'get','/content/public').json()==[]

def test_public_sections_keep_published_snapshot(env):
    c,_=env
    data={'title':'Sound experiences','kind':'page','section':'services'}
    item=call(c,'post','/admin/content',json=data).json()['id']
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    call(c,'put',f'/admin/content/{item}',json={**data,'section':'contact','revision':2})
    assert call(c,'get','/content/public').json()[0]['published']['section']=='services'
    call(c,'post',f'/admin/content/{item}/publish?revision=3')
    assert call(c,'get','/content/public').json()[0]['published']['section']=='contact'
    assert call(c,'post','/admin/content',json={**data,'section':'private'}).status_code==422

def test_editorial_images_and_actions_are_validated_and_versioned(env):
    c,_=env
    data={'title':'Public page','kind':'page','section':'about','image_url':'https://example.org/photo.jpg','image_alt':'Portrait','action_label':'Contact','action_url':'https://example.org/contact'}
    for field in ['image_url','action_url']:
        assert call(c,'post','/admin/content',json={**data,field:'javascript:alert(1)'}).status_code==422
    assert call(c,'post','/admin/content',json={**data,'action_label':''}).status_code==422
    item=call(c,'post','/admin/content',json=data).json()['id']
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    call(c,'put',f'/admin/content/{item}',json={**data,'image_url':'https://example.org/new.jpg','revision':2})
    result=call(c,'get','/content/public').json()[0]['published']
    assert result['image_url']==data['image_url']
    assert result['action_url']==data['action_url']

def test_site_settings_are_private_until_published_and_can_be_archived(env):
    c,_=env
    data={'title':'Sound Healing Greece','kind':'site_settings','body':'Athens and Chania','action_label':'Contact','action_url':'https://example.org/contact'}
    assert call(c,'post','/admin/content','student',json=data).status_code==403
    item=call(c,'post','/admin/content',json=data).json()['id']
    assert call(c,'get','/content/public').json()==[]
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    assert call(c,'get','/content/public').json()[0]['published']['body']==data['body']
    call(c,'post',f'/admin/content/{item}/archive')
    assert call(c,'get','/content/public').json()==[]

def test_navigation_rejects_unknown_and_duplicate_destinations(env):
    c,_=env
    data={'title':'Public settings','kind':'site_settings','navigation':[{'section':'about','label':'Our story','visible':True}]}
    for navigation in [[{'section':'admin','label':'Admin'}], data['navigation']*2]:
        assert call(c,'post','/admin/content',json={**data,'navigation':navigation}).status_code==422
    item=call(c,'post','/admin/content',json=data).json()['id']
    call(c,'post',f'/admin/content/{item}/publish?revision=1')
    call(c,'put',f'/admin/content/{item}',json={**data,'navigation':[],'revision':2})
    assert call(c,'get','/content/public').json()[0]['published']['navigation']==data['navigation']

def test_public_training_and_events_keep_distinct_sections(env):
    c,_=env
    for section,title in [('training','Level 1 seminar'),('events','Sound Bath')]:
        payload={'title':title,'kind':'announcement','section':section,'event_date':'31 October 2026','event_time':'10:00 – 18:00','event_location':'Athens','action_url':'https://www.soundhealing.gr/','action_label':'Details'}
        item=call(c,'post','/admin/content',json=payload).json()
        assert call(c,'post',f'/admin/content/{item["id"]}/publish?revision=1').status_code==200
    public=call(c,'get','/content/public').json()
    assert {(i['published']['section'],i['published']['title']) for i in public}=={('training','Level 1 seminar'),('events','Sound Bath')}
    assert all(i['published']['event_location']=='Athens' for i in public)

def test_public_editorial_blocks_and_expiry_validation(env):
    c,_=env
    for kind in ['testimonial','partner','social']:
        item=call(c,'post','/admin/content',json={'title':'Verified public source','kind':kind,'section':'home'}).json()
        assert call(c,'post',f'/admin/content/{item["id"]}/publish?revision=1').status_code==200
    assert len(call(c,'get','/content/public').json())==3
    assert call(c,'post','/admin/content',json={'title':'Invalid expiry','kind':'announcement','event_end_date':'2026-02-30'}).status_code==422
    nav=[{'section':s,'label':s,'visible':True} for s in ['about','soundhealing','training','events','services','contact']]
    assert call(c,'post','/admin/content',json={'title':'Navigation','kind':'site_settings','navigation':nav}).status_code==200

def test_home_visibility_settings_publish_only_when_requested(env):
    c,_=env
    payload={'title':'Public settings','kind':'site_settings','show_testimonials':False,'show_partners':False,'show_socials':False}
    item=call(c,'post','/admin/content',json=payload).json()
    assert call(c,'get','/content/public').json()==[]
    assert call(c,'post',f'/admin/content/{item["id"]}/publish?revision=1').status_code==200
    public=call(c,'get','/content/public').json()[0]['published']
    assert all(public[key] is False for key in ['show_testimonials','show_partners','show_socials'])
    assert call(c,'put',f'/admin/content/{item["id"]}',json={**payload,'show_testimonials':True,'revision':2}).status_code==200
    assert call(c,'get','/content/public').json()[0]['published']['show_testimonials'] is False
