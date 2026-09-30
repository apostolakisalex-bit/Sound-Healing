"""School and editorial workspace, independent of the deployment provider.
Legacy collections are never relabelled or counted as academic evidence.
"""
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, ConfigDict

Level = Literal['L1', 'L2', 'L3', 'L4']
LEVELS = [
    {'id': 'L1', 'title': 'Τα θεμέλια της πρακτικής', 'description': 'Θιβετανικές ηχογαβάθες και ατομική πρακτική.'},
    {'id': 'L2', 'title': 'Εμβάθυνση στην ατομική πρακτική', 'description': 'Εμβάθυνση στις τεχνικές με ηχογαβάθες και πρόσθετα όργανα.'},
    {'id': 'L3', 'title': 'Ομαδικά Sound Baths', 'description': 'Συντονισμός ομαδικών εμπειριών ήχου.'},
    {'id': 'L4', 'title': 'Επαγγελματική εκπαίδευση', 'description': 'Συνέχεια της επαγγελματικής σου εκπαίδευσης.'},
]

class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)

class Content(Strict):
    title: str = Field(min_length=2, max_length=160)
    summary: str = Field(default='', max_length=500)
    body: str = Field(default='', max_length=30000)
    kind: Literal['page', 'lesson', 'journey', 'announcement', 'hero']
    level_id: Level | None = None
    media_url: str = Field(default='', max_length=2000)
    order: int = Field(default=0, ge=0, le=10000)

class ContentEdit(Content):
    revision: int = Field(ge=1)

class RestoreContent(Strict):
    revision: int = Field(ge=1)
    source_revision: int = Field(ge=1)

class EnrollmentStatus(Strict):
    expected_status: Literal['active', 'paused']
    status: Literal['active', 'paused']

class Cohort(Strict):
    title: str = Field(min_length=2, max_length=160)
    level_id: Level
    instructor_id: str = Field(min_length=1, max_length=100)
    start_date: str = Field(pattern=r'^\d{4}-\d{2}-\d{2}$')

class Enrollment(Strict):
    user_id: str = Field(min_length=1, max_length=100)
    cohort_id: str = Field(min_length=1, max_length=100)

class Attendance(Strict):
    enrollment_id: str
    session_date: str = Field(pattern=r'^\d{4}-\d{2}-\d{2}$')
    minutes: int = Field(ge=0, le=1440)
    status: Literal['present', 'absent', 'excused']

class Cycle(Strict):
    enrollment_id: str
    receiver_code: str = Field(min_length=1, max_length=100)
    intended_focus: str = Field(default='', max_length=3000)
    receiver_expectations: str = Field(default='', max_length=3000)
    planned_sessions: int | None = Field(default=None, ge=1, le=1000)

class Draft(Strict):
    enrollment_id: str
    session_date: str = Field(pattern=r'^\d{4}-\d{2}-\d{2}$')
    duration_minutes: int = Field(ge=1, le=1440)
    mode: Literal['individual', 'group']
    receiver_code: str = Field(min_length=1, max_length=100)
    reflection: str = Field(default='', max_length=10000)
    contraindications_checked: bool = False
    cycle_id: str | None = None
    participant_count: int | None = Field(default=None, ge=2, le=10000)

class DraftEdit(Draft):
    revision: int = Field(ge=1)

class Review(Strict):
    decision: Literal['changes_requested', 'reviewed']
    note: str = Field(min_length=2, max_length=3000)


def now():
    return datetime.now(timezone.utc)


def validate_media(url):
    from urllib.parse import urlparse
    if url and (urlparse(url).scheme != 'https' or not urlparse(url).hostname or urlparse(url).username):
        raise HTTPException(422, 'Media must use a public HTTPS URL without credentials')


def build_school_router(db, current_user, admin_user):
    router = APIRouter(prefix='/api')

    async def staff(user=Depends(current_user)):
        if user.get('role') not in ('admin', 'instructor'):
            raise HTTPException(403, 'Staff access required')
        return user

    async def owns_cohort(cohort_id, user):
        query = {'id': cohort_id}
        if user.get('role') != 'admin':
            query['instructor_id'] = user['id']
        cohort = await db.school_cohorts.find_one(query, {'_id': 0})
        if not cohort:
            raise HTTPException(404, 'Assigned cohort not found')
        return cohort

    async def audit(user, action, entity_id):
        await db.audit_events.insert_one({'id': str(uuid4()), 'actor_id': user['id'], 'action': action, 'entity_id': entity_id, 'created_at': now()})

    @router.get('/school/catalog')
    async def catalog(user=Depends(current_user)):
        enrollments = await db.school_enrollments.find({'user_id': user['id'], 'status': 'active'}, {'_id': 0}).to_list(100)
        return [{**level, 'is_enrolled': any(e['level_id'] == level['id'] for e in enrollments)} for level in LEVELS]

    @router.get('/school/me')
    async def school_me(user=Depends(current_user)):
        enrollments = await db.school_enrollments.find({'user_id': user['id']}, {'_id': 0}).to_list(100)
        attendance = await db.school_attendance.find({'user_id': user['id']}, {'_id': 0}).to_list(1000)
        practices = await db.school_practices.find({'user_id': user['id']}, {'_id': 0}).sort('created_at', -1).to_list(500)
        return {'enrollments': enrollments, 'attendance': attendance, 'practices': practices, 'certification_status': 'Requirements awaiting approval; no automatic certification.'}

    @router.get('/school/progress')
    async def progress(offset: int = Query(default=0, ge=0), limit: int = Query(default=20, ge=1, le=50), staff_view: bool = False, level_id: Level | None = None, enrollment_status: Literal['active', 'paused'] | None = None, user=Depends(current_user)):
        scope = {'user_id': user['id']}
        if staff_view:
            if user.get('role') not in ('admin', 'instructor'):
                raise HTTPException(403, 'Staff access required')
            scope = {}
            if user['role'] == 'instructor':
                cohort_ids = [c['id'] async for c in db.school_cohorts.find({'instructor_id': user['id']}, {'id': 1})]
                scope = {'cohort_id': {'$in': cohort_ids}}
        if level_id:
            scope['level_id'] = level_id
        if enrollment_status:
            scope['status'] = enrollment_status
        total = await db.school_enrollments.count_documents(scope)
        entries = await db.school_enrollments.find(scope, {'_id': 0}).sort('id', 1).skip(offset).limit(limit).to_list(limit)
        rows = []
        for entry in entries:
            match = {'enrollment_id': entry['id'], 'user_id': entry['user_id']}
            attendance = {s: {'count': 0, 'minutes': 0} for s in ('present', 'absent', 'excused')}
            async for group in db.school_attendance.aggregate([{'$match': match}, {'$group': {'_id': '$status', 'count': {'$sum': 1}, 'minutes': {'$sum': '$minutes'}}}]):
                if group['_id'] in attendance:
                    attendance[group['_id']] = {'count': group['count'], 'minutes': group['minutes'] if group['_id'] == 'present' else 0}
            practice_scope = {**match, 'status': {'$in': ['submitted', 'changes_requested', 'reviewed'] if staff_view else ['draft', 'submitted', 'changes_requested', 'reviewed']}}
            practices = {}
            async for group in db.school_practices.aggregate([{'$match': practice_scope}, {'$group': {'_id': '$status', 'count': {'$sum': 1}, 'minutes': {'$sum': '$duration_minutes'}}}]):
                practices[group['_id']] = {'count': group['count'], 'minutes': group['minutes']}
            learner = await db.users.find_one({'id': entry['user_id']}, {'name': 1})
            rows.append({'enrollment_id': entry['id'], 'cohort_title': entry.get('cohort_title', ''), 'level_id': entry['level_id'], 'status': entry['status'], 'learner_name': (learner or {}).get('name', 'Μαθητής'), 'attendance': attendance, 'practices': practices})
        return {'items': rows, 'total': total, 'offset': offset, 'limit': limit}

    @router.get('/content/public')
    async def public_content():
        return await db.content_items.find({'published.kind': {'$in': ['page', 'announcement', 'hero']}, 'published.level_id': None, 'archived': False}, {'_id': 0, 'id': 1, 'published': 1}).sort([('published.order', 1), ('id', 1)]).to_list(200)

    @router.get('/content/library')
    async def library(user=Depends(current_user)):
        enrollments = await db.school_enrollments.find({'user_id': user['id'], 'status': 'active'}, {'_id': 0}).to_list(100)
        levels = [e['level_id'] for e in enrollments]
        query = {'archived': False, 'published.kind': {'$in': ['lesson', 'journey']}}
        if user.get('role') != 'admin':
            query['$or'] = [{'published.level_id': None}, {'published.level_id': {'$in': levels}}]
        items = await db.content_items.find(query, {'_id': 0, 'id': 1, 'published': 1}).sort('published.order', 1).to_list(500)
        learner = await db.users.find_one({'id': user['id']}, {'school_completed_lessons': 1})
        completed = set((learner or {}).get('school_completed_lessons', []))
        return [{**item, 'completed': item['published']['kind'] == 'lesson' and item['id'] in completed} for item in items]

    @router.post('/school/lessons/{item_id}/complete')
    async def complete(item_id: str, user=Depends(current_user)):
        item = await db.content_items.find_one({'id': item_id, 'archived': False, 'published.kind': 'lesson'})
        if not item:
            raise HTTPException(404, 'Published lesson not found')
        level = item['published'].get('level_id')
        if level and user.get('role') != 'admin' and not await db.school_enrollments.find_one({'user_id': user['id'], 'level_id': level, 'status': 'active'}):
            raise HTTPException(403, 'Enrollment required')
        await db.users.update_one({'id': user['id']}, {'$addToSet': {'school_completed_lessons': item_id}})
        return {'ok': True}

    @router.get('/admin/workspace')
    async def workspace(user=Depends(staff)):
        cq = {} if user['role'] == 'admin' else {'instructor_id': user['id']}
        cohorts = await db.school_cohorts.find(cq, {'_id': 0}).to_list(500)
        ids = [c['id'] for c in cohorts]
        scope = {'cohort_id': {'$in': ids}}
        enrollments = await db.school_enrollments.find(scope, {'_id': 0}).to_list(1000)
        practices = await db.school_practices.find({**scope, 'status': {'$ne': 'draft'}}, {'_id': 0}).to_list(1000)
        cycles = await db.practice_cycles.find({'id': {'$in': [p['cycle_id'] for p in practices if p.get('cycle_id')]}, 'cohort_id': {'$in': ids}}, {'_id': 0}).to_list(500)
        users = await db.users.find({} if user['role'] == 'admin' else {'id': {'$in': [e['user_id'] for e in enrollments]}}, {'_id': 0, 'id': 1, 'name': 1, 'email': 1, 'role': 1}).to_list(1000)
        contents = await db.content_items.find({}, {'_id': 0}).sort('updated_at', -1).to_list(500) if user['role'] == 'admin' else []
        return {'cohorts': cohorts, 'enrollments': enrollments, 'practices': practices, 'users': users, 'content': contents, 'cycles': cycles}

    @router.post('/admin/content')
    async def create_content(payload: Content, user=Depends(admin_user)):
        validate_media(payload.media_url)
        item = {'id': str(uuid4()), 'draft': payload.model_dump(), 'revision': 1, 'published': None, 'archived': False, 'updated_at': now()}
        await db.content_items.insert_one(dict(item))
        await audit(user, 'content.create', item['id'])
        return item

    @router.put('/admin/content/{item_id}')
    async def edit_content(item_id: str, payload: ContentEdit, user=Depends(admin_user)):
        validate_media(payload.media_url)
        result = await db.content_items.update_one({'id': item_id, 'revision': payload.revision}, {'$set': {'draft': payload.model_dump(exclude={'revision'}), 'updated_at': now()}, '$inc': {'revision': 1}})
        if not result.modified_count:
            raise HTTPException(409, 'Content changed elsewhere. Reload before saving.')
        await audit(user, 'content.edit', item_id)
        return {'ok': True}

    @router.post('/admin/content/{item_id}/publish')
    async def publish(item_id: str, revision: int, user=Depends(admin_user)):
        item = await db.content_items.find_one({'id': item_id, 'revision': revision})
        if not item:
            raise HTTPException(409, 'Reload the latest draft before publishing')
        attachments = await db.resources.find({'parent_type': 'cms_content', 'parent_id': item_id}, {'id': 1}).to_list(200)
        published = {**item['draft'], 'revision': revision, 'published_at': now(), 'resource_ids': [r['id'] for r in attachments]}
        result = await db.content_items.update_one({'id': item_id, 'revision': revision}, {'$set': {'published': published, 'archived': False, 'updated_at': now()}, '$inc': {'revision': 1}, '$push': {'history': published}})
        if not result.modified_count:
            raise HTTPException(409, 'Draft changed while publishing')
        await audit(user, 'content.publish', item_id)
        return {'ok': True}

    @router.post('/admin/content/{item_id}/restore')
    async def restore_content(item_id: str, payload: RestoreContent, user=Depends(admin_user)):
        item = await db.content_items.find_one({'id': item_id, 'revision': payload.revision})
        if not item:
            raise HTTPException(409, 'Reload before restoring')
        source = next((h for h in item.get('history', []) if h['revision'] == payload.source_revision), None)
        if not source:
            raise HTTPException(404, 'Publication not found')
        draft = {k: source[k] for k in Content.model_fields if k in source}
        result = await db.content_items.update_one({'id': item_id, 'revision': payload.revision}, {'$set': {'draft': Content(**draft).model_dump(), 'updated_at': now()}, '$inc': {'revision': 1}})
        if not result.modified_count:
            raise HTTPException(409, 'Content changed while restoring')
        await audit(user, 'content.restore_draft', item_id)
        return {'ok': True}

    @router.post('/admin/content/{item_id}/archive')
    async def archive(item_id: str, user=Depends(admin_user)):
        result = await db.content_items.update_one({'id': item_id}, {'$set': {'archived': True, 'updated_at': now()}, '$inc': {'revision': 1}})
        if not result.matched_count:
            raise HTTPException(404, 'Content not found')
        await audit(user, 'content.archive', item_id)
        return {'ok': True}

    @router.post('/admin/cohorts')
    async def add_cohort(payload: Cohort, user=Depends(admin_user)):
        try:
            datetime.strptime(payload.start_date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(422, 'Invalid date')
        instructor = await db.users.find_one({'id': payload.instructor_id, 'role': {'$in': ['instructor', 'admin']}})
        if not instructor:
            raise HTTPException(422, 'Select an instructor or administrator')
        doc = {'id': str(uuid4()), **payload.model_dump(), 'created_at': now()}
        await db.school_cohorts.insert_one(dict(doc))
        await audit(user, 'cohort.create', doc['id'])
        return doc

    @router.post('/admin/enrollments')
    async def enroll(payload: Enrollment, user=Depends(admin_user)):
        cohort = await owns_cohort(payload.cohort_id, user)
        if not await db.users.find_one({'id': payload.user_id}):
            raise HTTPException(404, 'User not found')
        key = f'{payload.cohort_id}:{payload.user_id}'
        doc = {'id': key, **payload.model_dump(), 'level_id': cohort['level_id'], 'cohort_title': cohort['title'], 'status': 'active', 'created_at': now()}
        await db.school_enrollments.update_one({'_id': key}, {'$setOnInsert': doc}, upsert=True)
        await audit(user, 'enrollment.create', key)
        return await db.school_enrollments.find_one({'_id': key}, {'_id': 0})

    @router.put('/admin/enrollments/{enrollment_id}/status')
    async def enrollment_status(enrollment_id: str, payload: EnrollmentStatus, user=Depends(admin_user)):
        result = await db.school_enrollments.update_one({'id': enrollment_id, 'status': payload.expected_status}, {'$set': {'status': payload.status, 'updated_at': now()}})
        if not result.matched_count:
            raise HTTPException(409, 'Enrollment changed. Reload before saving.')
        await audit(user, 'enrollment.' + payload.status, enrollment_id)
        return {'ok': True}

    @router.post('/admin/attendance')
    async def attendance(payload: Attendance, user=Depends(staff)):
        entry = await db.school_enrollments.find_one({'id': payload.enrollment_id})
        if not entry:
            raise HTTPException(404, 'Enrollment not found')
        await owns_cohort(entry['cohort_id'], user)
        try:
            datetime.strptime(payload.session_date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(422, 'Invalid date')
        key = f'{entry["id"]}:{payload.session_date}'
        await db.school_attendance.update_one({'_id': key}, {'$set': {**payload.model_dump(), 'id': key, 'cohort_id': entry['cohort_id'], 'user_id': entry['user_id'], 'updated_at': now()}}, upsert=True)
        await audit(user, 'attendance.record', key)
        return {'ok': True}

    @router.get('/school/cycles')
    async def list_cycles(user=Depends(current_user)):
        cycles = await db.practice_cycles.find({'user_id': user['id']}, {'_id': 0}).sort('created_at', -1).to_list(500)
        for cycle in cycles:
            cycle['recorded_sessions'] = await db.school_practices.count_documents({'user_id': user['id'], 'cycle_id': cycle['id']})
            cycle['reviewed_sessions'] = await db.school_practices.count_documents({'user_id': user['id'], 'cycle_id': cycle['id'], 'status': 'reviewed'})
        return cycles

    @router.post('/school/cycles')
    async def create_cycle(payload: Cycle, user=Depends(current_user)):
        entry = await db.school_enrollments.find_one({'id': payload.enrollment_id, 'user_id': user['id'], 'status': 'active'})
        if not entry:
            raise HTTPException(403, 'Active enrollment required')
        doc = {'id': str(uuid4()), **payload.model_dump(), 'user_id': user['id'], 'cohort_id': entry['cohort_id'], 'level_id': entry['level_id'], 'created_at': now()}
        await db.practice_cycles.insert_one(dict(doc))
        return doc

    async def validate_practice_context(payload, user, require_cycle=False):
        if payload.mode == 'group':
            if payload.cycle_id is not None or payload.participant_count is None:
                raise HTTPException(422, 'Group sessions require a participant count and no individual cycle')
        else:
            if payload.participant_count is not None:
                raise HTTPException(422, 'Individual sessions do not have a group participant count')
            if require_cycle and not payload.cycle_id:
                raise HTTPException(422, 'Choose a receiver practice cycle')
            if payload.cycle_id:
                cycle = await db.practice_cycles.find_one({'id': payload.cycle_id, 'user_id': user['id'], 'enrollment_id': payload.enrollment_id, 'receiver_code': payload.receiver_code})
                if not cycle:
                    raise HTTPException(422, 'Cycle must belong to this receiver and enrollment')

    @router.post('/school/practices')
    async def save_draft(payload: Draft, user=Depends(current_user)):
        await validate_practice_context(payload, user, require_cycle=True)
        entry = await db.school_enrollments.find_one({'id': payload.enrollment_id, 'user_id': user['id'], 'status': 'active'})
        if not entry:
            raise HTTPException(403, 'Active enrollment required')
        try:
            datetime.strptime(payload.session_date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(422, 'Invalid date')
        doc = {'id': str(uuid4()), **payload.model_dump(), 'user_id': user['id'], 'cohort_id': entry['cohort_id'], 'level_id': entry['level_id'], 'status': 'draft', 'revision': 1, 'created_at': now()}
        await db.school_practices.insert_one(dict(doc))
        return doc

    @router.put('/school/practices/{practice_id}')
    async def edit_draft(practice_id: str, payload: DraftEdit, user=Depends(current_user)):
        await validate_practice_context(payload, user, require_cycle=True)
        entry = await db.school_enrollments.find_one({'id': payload.enrollment_id, 'user_id': user['id'], 'status': 'active'})
        if not entry:
            raise HTTPException(403, 'Active enrollment required')
        try:
            datetime.strptime(payload.session_date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(422, 'Invalid date')
        result = await db.school_practices.update_one({'id': practice_id, 'user_id': user['id'], 'status': {'$in': ['draft', 'changes_requested']}, '$or': [{'revision': payload.revision}, {'revision': {'$exists': False}}] if payload.revision == 1 else [{'revision': payload.revision}]}, {'$set': {**payload.model_dump(exclude={'revision'}), 'cohort_id': entry['cohort_id'], 'level_id': entry['level_id'], 'updated_at': now(), 'revision': payload.revision + 1}})
        if not result.matched_count:
            raise HTTPException(409, 'The draft changed or is no longer editable. Reload before saving.')
        return {'ok': True}

    @router.post('/school/practices/{practice_id}/submit')
    async def submit(practice_id: str, user=Depends(current_user)):
        doc = await db.school_practices.find_one({'id': practice_id, 'user_id': user['id']})
        if not doc:
            raise HTTPException(404, 'Practice not found')
        if not await db.school_enrollments.find_one({'id': doc['enrollment_id'], 'user_id': user['id'], 'status': 'active'}):
            raise HTTPException(403, 'Active enrollment required')
        if not doc['contraindications_checked'] or not doc['reflection'].strip():
            raise HTTPException(422, 'Safety confirmation and reflection are required')
        result = await db.school_practices.update_one({'id': practice_id, 'user_id': user['id'], 'revision': doc.get('revision'), 'status': {'$in': ['draft', 'changes_requested']}}, {'$set': {'status': 'submitted', 'submitted_at': now()}, '$inc': {'revision': 1}})
        if not result.modified_count:
            raise HTTPException(409, 'Practice already submitted')
        return {'ok': True}

    @router.post('/admin/practices/{practice_id}/review')
    async def review(practice_id: str, payload: Review, user=Depends(staff)):
        doc = await db.school_practices.find_one({'id': practice_id})
        if not doc:
            raise HTTPException(404, 'Practice not found')
        await owns_cohort(doc['cohort_id'], user)
        result = await db.school_practices.update_one({'id': practice_id, 'status': 'submitted', 'revision': doc.get('revision')}, {'$set': {'status': payload.decision, 'review_note': payload.note, 'reviewed_by': user['id'], 'reviewed_at': now()}, '$push': {'review_history': {'decision': payload.decision, 'note': payload.note, 'reviewed_by': user['id'], 'reviewed_at': now()}}, '$inc': {'revision': 1}})
        if not result.modified_count:
            raise HTTPException(409, 'Practice is not awaiting review')
        await audit(user, 'practice.review', practice_id)
        return {'ok': True, 'counts_for_certification': False}

    @router.get('/admin/activity')
    async def activity(offset: int = Query(default=0, ge=0), limit: int = Query(default=20, ge=1, le=50), user=Depends(admin_user)):
        total = await db.audit_events.count_documents({})
        events = await db.audit_events.find({}, {'_id': 0, 'id': 1, 'actor_id': 1, 'action': 1, 'entity_id': 1, 'created_at': 1}).sort([('created_at', -1), ('id', -1)]).skip(offset).limit(limit).to_list(limit)
        for event in events:
            if event['created_at'].tzinfo is None:
                event['created_at'] = event['created_at'].replace(tzinfo=timezone.utc)
            actor = await db.users.find_one({'id': event['actor_id']}, {'name': 1})
            event['actor_name'] = (actor or {}).get('name', 'Μη διαθέσιμος λογαριασμός')
        return {'items': events, 'total': total}

    @router.get('/admin/export')
    async def export(user=Depends(admin_user)):
        # Deliberately excludes credentials, health records and receiver responses.
        output = {'schema_version': 1, 'exported_at': now()}
        for name in ('content_items', 'school_cohorts', 'school_enrollments', 'school_attendance'):
            output[name] = await db[name].find({}, {'_id': 0}).to_list(10000)
        await audit(user, 'workspace.export', 'workspace')
        return output

    return router
