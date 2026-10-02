"""Membership approval, private progress, instruments and moderated members chat."""
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import Field, model_validator
from school import Strict, Level
from emailer import send_membership_decision

class Application(Strict):
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=80)
    birth_month: int = Field(ge=1, le=12)
    birth_year: int = Field(ge=1900, le=2100)
    phone: str = Field(min_length=6, max_length=40)
    address: str = Field(min_length=3, max_length=300)
    declared_level: Level

    @model_validator(mode='after')
    def birth(self):
        now = datetime.now(timezone.utc)
        if (self.birth_year, self.birth_month) > (now.year, now.month):
            raise ValueError('Birth month must be in the past')
        return self

class Instruments(Strict):
    instruments: list[str] = Field(max_length=30)
    @model_validator(mode='after')
    def clean(self):
        self.instruments = list(dict.fromkeys(s.strip() for s in self.instruments if s.strip()))
        if any(len(s) > 80 for s in self.instruments): raise ValueError('Instrument name too long')
        return self

class LevelRecord(Strict):
    cohort_id: str | None = None
    credited_practice_ids: list[str] = Field(default_factory=list, max_length=1000)
    enabled: bool = False
    target: int | None = Field(default=None, ge=1, le=200)
    historical_completed: int = Field(default=0, ge=0, le=200)
    note: str = Field(min_length=2, max_length=2000)
    revision: int = Field(default=0, ge=0)
    @model_validator(mode='after')
    def count(self):
        if self.target is not None and self.historical_completed > self.target: raise ValueError('Historical count exceeds target')
        return self

class Decision(Strict):
    decision: Literal['approved', 'rejected']
    note: str = Field(min_length=2, max_length=2000)

class TrainingRequest(Strict):
    level_id: Level
    note: str = Field(default='', max_length=2000)

class TrainingDecision(Decision):
    cohort_id: str | None = None

class Message(Strict):
    text: str = Field(min_length=1, max_length=2000)

class Avatar(Strict):
    data: str = Field(min_length=1, max_length=11200000)

def build_members_router(db, current_user, admin_user):
    router = APIRouter(prefix='/api')
    async def approved(user=Depends(current_user)):
        if user.get('membership_status', 'approved') != 'approved': raise HTTPException(403, 'Η εγγραφή σου περιμένει έγκριση.')
        return user

    async def notify(text, user_id=None):
        await db.member_notifications.insert_one({'id': str(uuid4()), 'user_id': user_id, 'audience': 'member' if user_id else 'admin', 'text': text, 'created_at': datetime.now(timezone.utc), 'read_by': []})

    async def audit(user, action, entity):
        await db.audit_events.insert_one({'id': str(uuid4()), 'actor_id': user['id'], 'action': action, 'entity_id': entity, 'created_at': datetime.now(timezone.utc)})

    async def profile(uid):
        u = await db.users.find_one({'id': uid})
        if not u: raise HTTPException(404)
        practices = await db.school_practices.find({'user_id': uid, 'status': {'$ne': 'draft'}}, {'_id': 0}).to_list(10000)
        ids = [p['id'] for p in practices]
        answers = await db.assessment_answers.find({'_id': {'$in': ids}, 'status': 'submitted'}).to_list(10000)
        completed_answers = {a['_id'] for a in answers}
        receiver_answers = await db.assessment_invitations.find({'practice_id': {'$in': ids}, 'status': 'submitted'}, {'practice_id': 1}).to_list(10000)
        counts = {}
        for a in receiver_answers: counts[a['practice_id']] = counts.get(a['practice_id'], 0) + 1
        enrolled = await db.school_enrollments.find({'user_id': uid, 'status': 'active'}, {'level_id': 1}).to_list(1000)
        enrolled_levels = {e['level_id'] for e in enrolled}
        levels = []
        for level in ['L1', 'L2', 'L3', 'L4']:
            record = await db.member_levels.find_one({'user_id': uid, 'level_id': level}, {'_id': 0}) or {'enabled': level in enrolled_levels, 'target': None, 'historical_completed': 0, 'revision': 0, 'note': ''}
            verified = sum(p.get('level_id') == level and p['status'] == 'reviewed' and p['id'] in record.get('credited_practice_ids', []) for p in practices)
            total = record['historical_completed'] + verified
            levels.append({**record, 'level_id': level, 'verified_in_app': verified, 'completed': total, 'complete': bool(record['enabled'] and record['target'] and total >= record['target'])})
        return {'id': uid, 'name': u['name'], 'bio': u.get('bio', ''), 'profile_image': u.get('profile_image', ''), 'membership_status': u.get('membership_status', 'approved'), 'instruments': u.get('instruments', []), 'levels': levels,
                'reviewed_practices': [{'id': p['id'], 'level_id': p['level_id'], 'session_date': p['session_date'], 'practitioner_submitted': p['id'] in completed_answers, 'receiver_responses': counts.get(p['id'], 0)} for p in practices if p['status'] == 'reviewed'],
                'stats': {'minutes': sum(p.get('duration_minutes', 0) for p in practices), 'sessions': len(practices), 'receivers': len({p.get('receiver_code') for p in practices if p.get('mode') == 'individual' and p.get('receiver_code')}), 'evaluations': len(answers)},
                'requests': await db.training_requests.find({'user_id': uid}, {'_id': 0}).sort('created_at', -1).to_list(100)}

    @router.get('/members/me')
    async def me(user=Depends(current_user)):
        return await profile(user['id'])

    @router.put('/members/me/instruments')
    async def instruments(payload: Instruments, user=Depends(approved)):
        await db.users.update_one({'id': user['id']}, {'$set': payload.model_dump()})
        return {'ok': True}

    @router.post('/members/me/avatar')
    async def avatar(payload: Avatar, user=Depends(approved)):
        import base64, io
        from PIL import Image
        from studio import normalize_photo
        from starlette.concurrency import run_in_threadpool
        raw, _, _ = await run_in_threadpool(normalize_photo, payload.data)
        with Image.open(io.BytesIO(raw)) as image:
            image.thumbnail((256, 256))
            out = io.BytesIO(); image.save(out, format='WEBP', quality=82)
        uri = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
        await db.users.update_one({'id': user['id']}, {'$set': {'profile_image': uri}})
        return {'ok': True}

    @router.get('/admin/members')
    async def members(q: str = Query('', max_length=160), offset: int = Query(0, ge=0), user=Depends(admin_user)):
        import re
        query = {'role': 'student'}
        if q: query['name'] = {'$regex': re.escape(q), '$options': 'i'}
        return {'items': await db.users.find(query, {'_id': 0, 'id': 1, 'name': 1, 'email': 1, 'membership_status': 1}).sort('created_at', -1).skip(offset).limit(30).to_list(30), 'total': await db.users.count_documents(query)}

    @router.get('/admin/members/{uid}')
    async def member(uid: str, user=Depends(admin_user)):
        result = await profile(uid)
        u = await db.users.find_one({'id': uid})
        return {**result, 'application': u.get('application'), 'email': u.get('email'), 'membership_note': u.get('membership_note', '')}

    @router.put('/admin/members/{uid}/levels/{level}')
    async def set_level(uid: str, level: Level, payload: LevelRecord, user=Depends(admin_user)):
        if not await db.users.find_one({'id': uid, 'role': 'student'}): raise HTTPException(404)
        cohort = None
        if payload.cohort_id:
            cohort = await db.school_cohorts.find_one({'id': payload.cohort_id, 'level_id': level})
            if not cohort: raise HTTPException(422, 'Επίλεξε τμήμα του ίδιου Level.')
        for pid in set(payload.credited_practice_ids):
            if not await db.school_practices.find_one({'id': pid, 'user_id': uid, 'level_id': level, 'status': 'reviewed'}):
                raise HTTPException(422, 'Μπορούν να προσμετρηθούν μόνο ελεγμένες πρακτικές του ίδιου μέλους και Level.')
        payload.credited_practice_ids = list(dict.fromkeys(payload.credited_practice_ids))
        key = uid + ':' + level
        await db.member_levels.update_one({'_id': key}, {'$setOnInsert': {'user_id': uid, 'level_id': level, 'revision': 0}}, upsert=True)
        r = await db.member_levels.update_one({'_id': key, 'revision': payload.revision}, {'$set': payload.model_dump(exclude={'revision'}), '$inc': {'revision': 1}})
        if not r.modified_count: raise HTTPException(409, 'Η πορεία άλλαξε. Ανανέωσε το προφίλ.')
        if cohort:
            await db.school_enrollments.update_one({'user_id': uid, 'cohort_id': cohort['id']}, {'$set': {'status': 'active'}, '$setOnInsert': {'id': str(uuid4()), 'cohort_title': cohort['title'], 'level_id': level, 'created_at': datetime.now(timezone.utc)}}, upsert=True)
        await audit(user, 'member.level_verify', key)
        await notify(f'Η πορεία σου στο {level} ενημερώθηκε.', uid)
        return {'ok': True}

    @router.post('/admin/members/{uid}/decision')
    async def decide(uid: str, payload: Decision, user=Depends(admin_user)):
        member = await db.users.find_one({'id': uid, 'role': 'student', 'membership_status': 'pending'})
        if not member: raise HTTPException(409, 'Η αίτηση έχει ήδη εξεταστεί.')
        if payload.decision == 'approved':
            app = member.get('application')
            if not app: raise HTTPException(422, 'Λείπουν τα στοιχεία αίτησης.')
            for i in range(1, int(app['declared_level'][1]) + 1):
                record = await db.member_levels.find_one({'user_id': uid, 'level_id': f'L{i}'})
                if not record or record.get('revision', 0) == 0: raise HTTPException(422, 'Επιβεβαίωσε πρώτα την πορεία κάθε δηλωμένου Level.')
        r = await db.users.update_one({'id': uid, 'membership_status': 'pending'}, {'$set': {'membership_status': payload.decision, 'membership_note': payload.note}})
        if not r.modified_count: raise HTTPException(409)
        await notify(('Η εγγραφή σου εγκρίθηκε. ' if payload.decision == 'approved' else 'Η αίτηση εγγραφής δεν εγκρίθηκε. ') + payload.note, uid)
        await audit(user, 'member.' + payload.decision, uid)
        await send_membership_decision(to=member.get('email', ''), name=member.get('name', ''), approved=payload.decision == 'approved', note=payload.note)
        return {'ok': True}

    @router.post('/members/me/training-requests')
    async def request_training(payload: TrainingRequest, user=Depends(approved)):
        key = user['id'] + ':' + payload.level_id
        # One durable request per member/level avoids duplicate concurrent requests.
        r = await db.training_requests.update_one({'_id': key}, {'$setOnInsert': {'id': key, 'user_id': user['id'], **payload.model_dump(), 'status': 'pending', 'created_at': datetime.now(timezone.utc)}}, upsert=True)
        if not r.upserted_id: raise HTTPException(409, 'Υπάρχει ήδη αίτηση για αυτό το Level. Επικοινώνησε με τον διαχειριστή για επανεξέταση.')
        await notify(f'Νέα αίτηση εκπαιδευτικού {payload.level_id} από {user["name"]}.')
        return {'ok': True}

    @router.post('/admin/members/{uid}/training/{level}/decision')
    async def training_decision(uid: str, level: Level, payload: TrainingDecision, user=Depends(admin_user)):
        key = uid + ':' + level
        if payload.decision == 'approved':
            member = await db.users.find_one({'id': uid, 'membership_status': {'$in': ['approved', None]}})
            if not member: raise HTTPException(422, 'Απαιτείται εγκεκριμένο μέλος.')
            cohort = await db.school_cohorts.find_one({'id': payload.cohort_id, 'level_id': level})
            if not cohort: raise HTTPException(422, 'Επίλεξε τμήμα του αντίστοιχου Level.')
        r = await db.training_requests.update_one({'_id': key, 'status': 'pending'}, {'$set': {'status': payload.decision, 'decision_note': payload.note, 'cohort_id': payload.cohort_id}})
        if not r.modified_count: raise HTTPException(409, 'Η αίτηση έχει ήδη εξεταστεί.')
        if payload.decision == 'approved':
            await db.school_enrollments.update_one({'user_id': uid, 'cohort_id': cohort['id']}, {'$set': {'status': 'active'}, '$setOnInsert': {'id': str(uuid4()), 'user_id': uid, 'cohort_id': cohort['id'], 'cohort_title': cohort['title'], 'level_id': level, 'created_at': datetime.now(timezone.utc)}}, upsert=True)
        await audit(user, 'training.' + payload.decision, key)
        await notify(f'Αίτηση {level}: ' + ('εγκρίθηκε. ' if payload.decision == 'approved' else 'δεν εγκρίθηκε. ') + payload.note, uid)
        return {'ok': True}

    @router.get('/notifications')
    async def notifications(user=Depends(current_user)):
        query = {'audience': 'admin'} if user.get('role') == 'admin' else {'user_id': user['id']}
        rows = await db.member_notifications.find(query, {'_id': 0}).sort('created_at', -1).limit(50).to_list(50)
        return [{k: v for k, v in {**r, 'read': user['id'] in r.get('read_by', [])}.items() if k != 'read_by'} for r in rows]

    @router.post('/notifications/{nid}/read')
    async def mark_read(nid: str, user=Depends(current_user)):
        query = {'audience': 'admin'} if user.get('role') == 'admin' else {'user_id': user['id']}
        await db.member_notifications.update_one({**query, 'id': nid}, {'$addToSet': {'read_by': user['id']}})
        return {'ok': True}

    @router.get('/members/chat')
    async def chat(before: str | None = None, user=Depends(approved)):
        query = {'hidden': False}
        if before: query['id'] = {'$lt': before}
        return await db.member_chat.find(query, {'_id': 0}).sort('id', -1).limit(50).to_list(50)

    @router.post('/members/chat')
    async def post(payload: Message, user=Depends(approved)):
        now = datetime.now(timezone.utc)
        r = await db.users.update_one({'id': user['id'], '$or': [{'last_chat_at': {'$exists': False}}, {'last_chat_at': {'$lte': now - timedelta(seconds=3)}}]}, {'$set': {'last_chat_at': now}})
        if not r.modified_count: raise HTTPException(429, 'Περίμενε λίγο πριν στείλεις νέο μήνυμα.')
        item = {'id': now.isoformat() + ':' + str(uuid4()), 'user_id': user['id'], 'name': user['name'], 'text': payload.text, 'created_at': now, 'hidden': False}
        await db.member_chat.insert_one(dict(item))
        return item

    @router.post('/admin/chat/{mid}/hide')
    async def hide(mid: str, user=Depends(admin_user)):
        await db.member_chat.update_one({'id': mid}, {'$set': {'hidden': True}})
        await audit(user, 'chat.hide', mid)
        return {'ok': True}
    return router
