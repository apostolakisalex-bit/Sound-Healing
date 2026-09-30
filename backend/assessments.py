"""Versioned post-practice assessments. Tokens are stored only as SHA-256 hashes."""
from datetime import datetime, timezone, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from uuid import uuid4
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid')
class Publication(Strict):
    level_id: Literal['L1','L2','L3','L4']
    mode: Literal['individual','group']
    respondent: Literal['practitioner','receiver']
    resolution_note: str = Field(min_length=10,max_length=3000)
class Answers(Strict):
    answers: dict[str, str | list[str]]
    revision: int = Field(ge=0)
    submit: bool = False
class Access(Strict):
    token: str = Field(min_length=30,max_length=100)
class PublicAnswers(Access):
    answers: dict[str, str | list[str]]

def now(): return datetime.now(timezone.utc)
def digest(token): return sha256(token.encode()).hexdigest()
def validate(form, answers, complete):
    questions = {q['key']:q for q in form['questions']}
    if set(answers)-set(questions): raise HTTPException(422,'Unknown answer key')
    for key,q in questions.items():
        value=answers.get(key)
        if complete and q['required'] and (value is None or value==[] or value=='' or isinstance(value,str) and not value.strip()):
            raise HTTPException(422,f'Required: {q["label"]}')
        if value is None: continue
        if q['kind']=='multi':
            if not isinstance(value,list) or len(value)!=len(set(value)) or any(v not in q['options'] for v in value): raise HTTPException(422,'Invalid selection')
        elif not isinstance(value,str) or len(value)>10000 or (q['kind']!='text' and value and value not in q['options']): raise HTTPException(422,'Invalid answer')

def build_assessment_router(db,current_user,admin_user):
    router=APIRouter(prefix='/api')
    async def practice(pid,user,write=False):
        p=await db.school_practices.find_one({'id':pid})
        if not p: raise HTTPException(404,'Practice not found')
        owner=p['user_id']==user['id']
        staff=user.get('role')=='admin' or user.get('role')=='instructor' and await db.school_cohorts.find_one({'id':p['cohort_id'],'instructor_id':user['id']})
        if not owner and (write or not staff or p['status']=='draft'): raise HTTPException(403,'Access denied')
        if write and not await db.school_enrollments.find_one({'id':p['enrollment_id'],'user_id':user['id'],'status':'active'}): raise HTTPException(403,'Active enrollment required')
        return p
    async def applicable(form,p):
        if not form: return None
        prior = await db.school_practices.find_one({'user_id':p['user_id'],'enrollment_id':p['enrollment_id'],'receiver_code':p.get('receiver_code'), 'id':{'$ne':p['id']}, 'session_date':{'$lt':p['session_date']}})
        phase='repeat' if prior else 'first'
        return {**form,'questions':[q for q in form['questions'] if q.get('applies_to','all') in ('all',phase)]}
    async def bound(p,role):
        await db.school_practices.update_one({'id':p['id']},{'$set':{'assessment_locked':True}})
        p=await db.school_practices.find_one({'id':p['id']})
        key=f'{p["id"]}:{role}'
        existing=await db.assessment_bindings.find_one({'_id':key})
        if existing: return existing['form']
        config=await db.assessment_configuration.find_one({'_id':f'{p["level_id"]}:{p["mode"]}:{role}'})
        if not config: raise HTTPException(409,'Η επίσημη φόρμα δεν έχει ενεργοποιηθεί από τον διαχειριστή.')
        form=await db.assessment_forms.find_one({'id':config['form_id']},{'_id':0})
        form=await applicable(form,p)
        await db.assessment_bindings.update_one({'_id':key},{'$setOnInsert':{'form':form}},upsert=True)
        return (await db.assessment_bindings.find_one({'_id':key}))['form']
    @router.post('/admin/forms/{draft_id}/activate')
    async def activate(draft_id:str,payload:Publication,admin=Depends(admin_user)):
        form=await db.form_drafts.find_one({'id':draft_id},{'_id':0})
        if not form: raise HTTPException(404,'Draft not found')
        if any(q['kind']=='unknown' or q['required'] is None for q in form['questions']): raise HTTPException(422,'Resolve all question types and required flags first')
        key=form['template_key']
        expected='practitioner' if key.startswith('practitioner') else 'receiver'
        if payload.respondent!=expected or ('group' in key)!=(payload.mode=='group') or ('_l1_' in key and payload.level_id!='L1') or ('_l2_' in key and payload.level_id!='L2'): raise HTTPException(422,'Template does not match assignment')
        published={**form,**payload.model_dump(),'id':str(uuid4()),'draft_id':draft_id,'status':'published','published_by':admin['id'],'published_at':now()}
        await db.assessment_forms.insert_one(dict(published))
        await db.assessment_configuration.update_one({'_id':f'{payload.level_id}:{payload.mode}:{payload.respondent}'},{'$set':{'form_id':published['id']}},upsert=True)
        return published
    @router.get('/school/practices/{pid}/assessments')
    async def overview(pid:str,user=Depends(current_user)):
        p=await practice(pid,user)
        result={}
        for role in ['practitioner','receiver']:
            binding=await db.assessment_bindings.find_one({'_id':f'{pid}:{role}'})
            config=await db.assessment_configuration.find_one({'_id':f'{p["level_id"]}:{p["mode"]}:{role}'})
            form=binding['form'] if binding else await db.assessment_forms.find_one({'id':config['form_id']},{'_id':0}) if config else None
            if not binding: form=await applicable(form,p)
            result[role]={'form':form}
        result['practitioner']['response']=await db.assessment_answers.find_one({'_id':pid},{'_id':0})
        if p['user_id'] != user['id'] and result['practitioner']['response'] and result['practitioner']['response']['status'] != 'submitted': result['practitioner']['response'] = None
        # Students see receipt status, not private receiver responses.
        is_staff=user.get('role')=='admin' or user.get('role')=='instructor' and bool(await db.school_cohorts.find_one({'id':p['cohort_id'],'instructor_id':user['id']}))
        projection={'_id':0,'token_hash':0}
        if not is_staff: projection['answers']=0
        result['invitations']=await db.assessment_invitations.find({'practice_id':pid},projection).to_list(500)
        return result
    @router.post('/school/practices/{pid}/assessment')
    async def answer(pid:str,payload:Answers,user=Depends(current_user)):
        p=await practice(pid,user,True)
        form=await bound(p,'practitioner')
        validate(form,payload.answers,payload.submit)
        await db.assessment_answers.update_one({'_id':pid},{'$setOnInsert':{'practice_id':pid,'revision':0,'status':'draft','form_id':form['id']}},upsert=True)
        result=await db.assessment_answers.update_one({'_id':pid,'revision':payload.revision,'status':'draft'},{'$set':{'answers':payload.answers,'status':'submitted' if payload.submit else 'draft','updated_at':now()},'$inc':{'revision':1}})
        if not result.modified_count: raise HTTPException(409,'Assessment changed or already submitted')
        return await db.assessment_answers.find_one({'_id':pid},{'_id':0})
    @router.post('/school/practices/{pid}/invitations')
    async def invite(pid:str,user=Depends(current_user)):
        p=await practice(pid,user,True)
        if p['status']=='draft': raise HTTPException(409,'Submit the practice first')
        form=await bound(p,'receiver')
        token=token_urlsafe(32)
        # One slot per receiver, capped by the recorded group size. Revoked slots can be reused.
        capacity=p.get('participant_count',1) if p['mode']=='group' else 1
        for slot in range(min(capacity or 1,500)):
            key=f'{pid}:{slot}'
            await db.assessment_invitations.update_one({'_id':key},{'$setOnInsert':{'id':key,'practice_id':pid,'status':'revoked'}},upsert=True)
            result=await db.assessment_invitations.update_one({'_id':key,'status':'revoked'},{'$set':{'token_hash':digest(token),'form_id':form['id'],'status':'pending','created_at':now(),'expires_at':now()+timedelta(days=7),'session_date':p['session_date']}})
            if result.modified_count: return {'id':key,'token':token,'expires_in_days':7}
        raise HTTPException(409,'All participant invitation slots are in use')
    @router.post('/school/practices/{pid}/invitations/{slot}/revoke')
    async def revoke(pid:str,slot:int,user=Depends(current_user)):
        await practice(pid,user,True)
        result=await db.assessment_invitations.update_one({'_id':f'{pid}:{slot}','status':'pending'},{'$set':{'status':'revoked'},'$unset':{'token_hash':''}})
        if not result.modified_count: raise HTTPException(409,'Invitation is not pending')
        return {'ok':True}
    async def access(token):
        invitation=await db.assessment_invitations.find_one({'token_hash':digest(token),'status':'pending','expires_at':{'$gt':now()}})
        if not invitation: raise HTTPException(404,'Ο σύνδεσμος έληξε, ανακλήθηκε ή έχει ήδη χρησιμοποιηθεί.')
        binding=await db.assessment_bindings.find_one({'_id':f'{invitation["practice_id"]}:receiver'})
        form=binding['form']
        return invitation,form
    @router.post('/evaluations/access')
    async def public_access(payload:Access):
        inv,form=await access(payload.token)
        return {'questions':form['questions'],'session_date':inv['session_date']}
    @router.post('/evaluations/submit')
    async def public_submit(payload:PublicAnswers):
        inv,form=await access(payload.token)
        validate(form,payload.answers,True)
        result=await db.assessment_invitations.update_one({'_id':inv['_id'],'token_hash':digest(payload.token),'status':'pending','expires_at':{'$gt':now()}},{'$set':{'status':'submitted','answers':payload.answers,'submitted_at':now()},'$unset':{'token_hash':''}})
        if not result.modified_count: raise HTTPException(409,'Already submitted or revoked')
        return {'ok':True}
    return router
