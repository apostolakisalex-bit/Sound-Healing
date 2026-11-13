import asyncio
from datetime import timedelta
import pytest
from assessments import build_assessment_router, now
from test_school import env, call, enrollment

@pytest.fixture
def assessment_env(env):
    c,db=env
    from fastapi import Header, HTTPException, Depends
    async def user(x_user:str=Header(default='student')):
        return {'id':x_user,'role':{'admin':'admin','teacher':'instructor','other_teacher':'instructor'}.get(x_user,'student')}
    async def admin(u=Depends(user)):
        if u['role']!='admin':raise HTTPException(403)
        return u
    c.app.include_router(build_assessment_router(db,user,admin))
    eid=enrollment(c)
    async def seed():
        e=await db.school_enrollments.find_one({'id':eid})
        await db.school_practices.insert_one({'id':'p','user_id':'student','enrollment_id':eid,'cohort_id':e['cohort_id'],'level_id':'L1','mode':'individual','status':'submitted','session_date':'2026-09-30'})
    asyncio.run(seed())
    for key,role in [('practitioner_l1_el','practitioner'),('receiver_l1_el','receiver')]:
        d=call(c,'post','/admin/forms',json={'template_key':key,'source_note':'Synthetic test only','questions':[{'key':'experience','label':'Experience','kind':'text','required':True}]}).json()
        r=call(c,'post',f'/admin/forms/{d["id"]}/activate',json={'level_id':'L1','mode':'individual','respondent':role,'resolution_note':'Synthetic test source approved'})
        assert r.status_code==200,r.text
    return c,db

def test_assessment_private_drafts_and_submission(assessment_env):
    c,db=assessment_env
    path='/school/practices/p/assessment'
    assert call(c,'post',path,'other',json={'answers':{'experience':'private'},'revision':0}).status_code==403
    assert call(c,'post',path,'student',json={'answers':{},'revision':0,'submit':True}).status_code==422
    assert call(c,'post',path,'student',json={'answers':{'experience':'draft'},'revision':0}).status_code==200
    assert call(c,'get','/school/practices/p/assessments','teacher').json()['practitioner']['response'] is None
    assert call(c,'post',path,'student',json={'answers':{'experience':'final'},'revision':0,'submit':True}).status_code==409
    assert call(c,'post',path,'student',json={'answers':{'experience':'final'},'revision':1,'submit':True}).status_code==200
    assert call(c,'post',path,'student',json={'answers':{'experience':'overwrite'},'revision':2}).status_code==409
    assert call(c,'get','/school/practices/p/assessments','other_teacher').status_code==403
    assert call(c,'get','/school/practices/p/assessments','teacher').json()['practitioner']['response']['answers']['experience']=='final'

def test_receiver_single_use_revocation_expiry_and_visibility(assessment_env):
    c,db=assessment_env
    base='/school/practices/p/invitations'
    token=call(c,'post',base,'student').json()['token']
    assert call(c,'post',base,'student').status_code==409
    inv=asyncio.run(db.assessment_invitations.find_one({'practice_id':'p'}))
    assert token not in str(inv)
    assert call(c,'post','/evaluations/access',json={'token':token}).status_code==200
    assert call(c,'post',base+'/0/revoke','student').status_code==200
    assert call(c,'post','/evaluations/submit',json={'token':token,'answers':{'experience':'x'}}).status_code==404
    token=call(c,'post',base,'student').json()['token']
    asyncio.run(db.assessment_invitations.update_one({'practice_id':'p'},{'$set':{'expires_at':now()-timedelta(seconds=1)}}))
    assert call(c,'post','/evaluations/access',json={'token':token}).status_code==404
    call(c,'post',base+'/0/revoke','student')
    token=call(c,'post',base,'student').json()['token']
    payload={'token':token,'answers':{'experience':'private receiver feedback'}}
    assert call(c,'post','/evaluations/submit',json=payload).status_code==200
    assert call(c,'post','/evaluations/submit',json=payload).status_code==404
    student=call(c,'get','/school/practices/p/assessments','student').json()
    assert 'answers' not in student['invitations'][0]
    for role in ['admin','teacher']:
        inv=call(c,'get','/school/practices/p/assessments',role).json()['invitations'][0]
        assert inv['answers']['experience']=='private receiver feedback'
        assert 'token_hash' not in inv

def test_bound_version_does_not_change(assessment_env):
    c,db=assessment_env
    call(c,'post','/school/practices/p/assessment','student',json={'answers':{},'revision':0})
    before=call(c,'get','/school/practices/p/assessments','student').json()['practitioner']['form']['id']
    asyncio.run(db.assessment_configuration.delete_many({}))
    after=call(c,'get','/school/practices/p/assessments','student').json()['practitioner']['form']['id']
    assert before==after

def test_source_drafts_and_confirmed_l2_comfort(assessment_env):
    c,_=assessment_env
    templates=call(c,'get','/admin/forms').json()['source_templates']
    from forms import FormDraft
    for draft in templates: FormDraft.model_validate(draft)
    l2=next(d for d in templates if d['template_key']=='receiver_l2_el')
    comfort=next(q for q in l2['questions'] if q['key']=='q_4')
    assert comfort['options']==['Πολύ άβολα','Λίγο άβολα','Ουδέτερα','Άνετα','Πολύ άνετα']
    d=call(c,'post','/admin/forms',json=l2).json()
    assert call(c,'post',f'/admin/forms/{d["id"]}/activate',json={'level_id':'L2','mode':'individual','respondent':'receiver','resolution_note':'Still unresolved choices'}).status_code==422
