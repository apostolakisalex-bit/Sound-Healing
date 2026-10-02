"""Portable editorial image library and unified, administrator-only calendar."""
import base64
import binascii
import io
import warnings
from datetime import date, datetime, timezone
from uuid import uuid4
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import Field, field_validator, model_validator
from PIL import Image, ImageOps
from starlette.concurrency import run_in_threadpool
from school import Strict

PUBLIC_KINDS = ['page', 'announcement', 'hero', 'site_settings', 'testimonial', 'partner', 'social', 'app_photo']
MEDIA_PREFIX = '/api/media/'

class Photo(Strict):
    title: str = Field(min_length=2, max_length=160)
    alt: str = Field(min_length=2, max_length=200)
    data: str = Field(min_length=1, max_length=11200000)

class PhotoEdit(Strict):
    title: str = Field(min_length=2, max_length=160)
    alt: str = Field(min_length=2, max_length=200)
    revision: int = Field(ge=1)

class Revision(Strict):
    revision: int = Field(ge=1)

class CalendarEntry(Strict):
    title: str = Field(min_length=2, max_length=160)
    kind: Literal['class', 'training', 'event', 'other']
    start_date: date
    end_date: date
    start_time: str = Field(default='', pattern=r'^(|([01]\d|2[0-3]):[0-5]\d)$')
    end_time: str = Field(default='', pattern=r'^(|([01]\d|2[0-3]):[0-5]\d)$')
    location: str = Field(default='', max_length=200)
    notes: str = Field(default='', max_length=2000)
    cohort_id: str | None = None
    content_id: str | None = None

    @model_validator(mode='after')
    def valid_range(self):
        if self.end_date < self.start_date or (self.end_date - self.start_date).days > 366:
            raise ValueError('Choose an end date after the start, within one year')
        if bool(self.start_time) != bool(self.end_time):
            raise ValueError('Supply both times or neither for all-day entries')
        if self.start_date == self.end_date and self.start_time and self.end_time <= self.start_time:
            raise ValueError('End time must be after start time')
        return self

class CalendarEdit(CalendarEntry):
    revision: int = Field(ge=1)

def normalize_photo(encoded):
    try:
        raw = base64.b64decode(encoded, validate=True)
        if len(raw) > 8 * 1024 * 1024:
            raise ValueError('Maximum image size is 8 MB')
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(raw)) as source:
                if source.format not in ('JPEG', 'PNG', 'WEBP') or source.width * source.height > 25000000:
                    raise ValueError('Use a JPEG, PNG or WebP up to 25 megapixels')
                source.load()
                normalized = ImageOps.exif_transpose(source).convert('RGBA')
                normalized.thumbnail((2400, 2400))
                output = io.BytesIO()
                # Re-encode pixels only: do not retain EXIF, location or embedded metadata.
                clean = Image.frombytes('RGBA', normalized.size, normalized.tobytes())
                clean.save(output, format='WEBP', quality=86)
                data = output.getvalue()
                if len(data) > 4 * 1024 * 1024:
                    raise ValueError('Image is too large after conversion')
                return data, clean.width, clean.height
    except (ValueError, OSError, binascii.Error, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(422, 'Χρησιμοποίησε έγκυρη εικόνα JPG, PNG ή WebP έως 8 MB και 25 megapixels.')

def build_studio_router(db, current_user, admin_user):
    router = APIRouter(prefix='/api')

    async def audit(user, action, entity):
        await db.audit_events.insert_one({'id': str(uuid4()), 'actor_id': user['id'], 'action': action, 'entity_id': entity, 'created_at': datetime.now(timezone.utc)})

    @router.get('/admin/media')
    async def photos(offset: int = Query(0, ge=0), q: str = Query('', max_length=160), user=Depends(admin_user)):
        import re
        query = {'archived': False}
        if q: query['title'] = {'$regex': re.escape(q), '$options': 'i'}
        return {'items': await db.studio_media.find(query, {'_id': 0, 'data': 0}).sort('created_at', -1).skip(offset).limit(20).to_list(20), 'total': await db.studio_media.count_documents(query)}

    @router.post('/admin/media')
    async def upload(payload: Photo, user=Depends(admin_user)):
        data, width, height = await run_in_threadpool(normalize_photo, payload.data)
        item = {'id': str(uuid4()), 'title': payload.title, 'alt': payload.alt, 'width': width, 'height': height, 'size': len(data), 'revision': 1, 'archived': False, 'created_at': datetime.now(timezone.utc)}
        item['url'] = MEDIA_PREFIX + item['id']
        await db.studio_media.insert_one({**item, 'data': data})
        await audit(user, 'media.upload', item['id'])
        return item

    @router.put('/admin/media/{item_id}')
    async def edit_photo(item_id: str, payload: PhotoEdit, user=Depends(admin_user)):
        r = await db.studio_media.update_one({'id': item_id, 'revision': payload.revision, 'archived': False}, {'$set': payload.model_dump(exclude={'revision'}), '$inc': {'revision': 1}})
        if not r.modified_count: raise HTTPException(409, 'Η εικόνα άλλαξε. Ανανέωσε τη βιβλιοθήκη.')
        await audit(user, 'media.edit', item_id)
        return {'ok': True}

    @router.post('/admin/media/{item_id}/archive')
    async def archive_photo(item_id: str, payload: Revision, user=Depends(admin_user)):
        # Soft archive removes it from the picker; existing references and history stay intact.
        r = await db.studio_media.update_one({'id': item_id, 'revision': payload.revision}, {'$set': {'archived': True}, '$inc': {'revision': 1}})
        if not r.modified_count: raise HTTPException(409, 'Ανανέωσε τη βιβλιοθήκη.')
        await audit(user, 'media.archive', item_id)
        return {'ok': True}

    async def image_access(item_id, user=None):
        query = {'published.image_url': MEDIA_PREFIX + item_id, 'archived': False}
        public = await db.content_items.find_one({**query, 'published.kind': {'$in': PUBLIC_KINDS}, 'published.level_id': None})
        if not public and (not user or user.get('role') != 'admin'):
            if not user: raise HTTPException(404)
            enrollments = await db.school_enrollments.find({'user_id': user['id'], 'status': 'active'}).to_list(1000)
            private = await db.content_items.find_one({**query, 'published.kind': {'$in': ['lesson', 'journey']}, 'published.level_id': {'$in': [None] + [e['level_id'] for e in enrollments]}})
            if not private: raise HTTPException(404)
        item = await db.studio_media.find_one({'id': item_id})
        if not item: raise HTTPException(404)
        return item

    @router.get('/media/{item_id}')
    async def public_photo(item_id: str):
        item = await image_access(item_id)
        return Response(bytes(item['data']), media_type='image/webp', headers={'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'})

    @router.get('/media/{item_id}/preview')
    async def preview_photo(item_id: str, user=Depends(current_user)):
        item = await image_access(item_id, user)
        return Response(content=__import__('json').dumps({'uri': 'data:image/webp;base64,' + base64.b64encode(item['data']).decode()}), media_type='application/json', headers={'Cache-Control': 'no-store'})

    async def validate_links(payload):
        if payload.cohort_id and not await db.school_cohorts.find_one({'id': payload.cohort_id}):
            raise HTTPException(422, 'Το τμήμα δεν υπάρχει.')
        if payload.content_id:
            item = await db.content_items.find_one({'id': payload.content_id, 'archived': False})
            expected = {'event': 'events', 'training': 'training'}.get(payload.kind)
            if not item or not expected or item.get('draft', {}).get('section') != expected:
                raise HTTPException(422, 'Επίλεξε αντίστοιχη εκδήλωση ή εκπαιδευτικό από το περιεχόμενο.')

    @router.get('/admin/calendar')
    async def calendar(start: date, end: date, user=Depends(admin_user)):
        if end < start or (end - start).days > 62: raise HTTPException(422, 'Choose a range up to 62 days')
        lo, hi = start.isoformat(), end.isoformat()
        items = await db.studio_calendar.find({'start_date': {'$lte': hi}, 'end_date': {'$gte': lo}, 'cancelled': False}, {'_id': 0}).to_list(1001)
        for item in items: item['source'] = 'calendar'
        cohorts = await db.school_cohorts.find({'start_date': {'$gte': lo, '$lte': hi}}, {'_id': 0}).to_list(1001)
        for c in cohorts:
            items.append({'id': 'cohort:' + c['id'], 'source': 'cohort', 'kind': 'class', 'title': 'Έναρξη τμήματος · ' + c['title'], 'start_date': c['start_date'], 'end_date': c['start_date']})
        # No receiver identity, private reflection or health information enters the calendar.
        for collection, source, title in [(db.school_practices, 'practice', 'Πρακτικές'), (db.school_attendance, 'attendance', 'Παρουσίες')]:
            query = {'session_date': {'$gte': lo, '$lte': hi}}
            if source == 'practice': query['status'] = {'$ne': 'draft'}
            rows = await collection.aggregate([{'$match': query}, {'$group': {'_id': '$session_date', 'count': {'$sum': 1}}}]).to_list(63)
            for row in rows: items.append({'id': source + ':' + row['_id'], 'source': source, 'kind': source, 'title': f'{title} · {row["count"]} καταγραφές', 'start_date': row['_id'], 'end_date': row['_id']})
        if len(cohorts) > 1000 or sum(i['source'] == 'calendar' for i in items) > 1000:
            raise HTTPException(422, 'Υπάρχουν πολλές εγγραφές. Επίλεξε μικρότερο διάστημα.')
        return sorted(items, key=lambda x: (x['start_date'], x.get('start_time', ''), x['title']))

    @router.post('/admin/calendar')
    async def create_entry(payload: CalendarEntry, user=Depends(admin_user)):
        await validate_links(payload)
        item = {**payload.model_dump(mode='json'), 'id': str(uuid4()), 'revision': 1, 'cancelled': False}
        await db.studio_calendar.insert_one(dict(item))
        await audit(user, 'calendar.create', item['id'])
        return item

    @router.put('/admin/calendar/{item_id}')
    async def edit_entry(item_id: str, payload: CalendarEdit, user=Depends(admin_user)):
        await validate_links(payload)
        r = await db.studio_calendar.update_one({'id': item_id, 'revision': payload.revision, 'cancelled': False}, {'$set': payload.model_dump(mode='json', exclude={'revision'}), '$inc': {'revision': 1}})
        if not r.modified_count: raise HTTPException(409, 'Η εγγραφή άλλαξε. Ανανέωσε το ημερολόγιο.')
        await audit(user, 'calendar.edit', item_id)
        return {'ok': True}

    @router.post('/admin/calendar/{item_id}/cancel')
    async def cancel_entry(item_id: str, payload: Revision, user=Depends(admin_user)):
        r = await db.studio_calendar.update_one({'id': item_id, 'revision': payload.revision, 'cancelled': False}, {'$set': {'cancelled': True}, '$inc': {'revision': 1}})
        if not r.modified_count: raise HTTPException(409, 'Η εγγραφή άλλαξε. Ανανέωσε το ημερολόγιο.')
        await audit(user, 'calendar.cancel', item_id)
        return {'ok': True}

    return router
