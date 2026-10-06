"""Account lifecycle and shared, database-backed authentication throttling."""
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field, field_validator
from members import Application
from emailer import send_account_link

def now():
    return datetime.now(timezone.utc)

def application_complete(user):
    try:
        Application.model_validate({k: v for k, v in (user.get('application') or {}).items() if k != 'source'})
        return True
    except (ValueError, TypeError):
        return False

async def throttle(db, request, scope, identity='', limit=10, seconds=900):
    # Do not trust arbitrary X-Forwarded-For. Configure trusted proxy handling at deployment.
    bucket = int(now().timestamp()) // seconds
    secret = os.environ['JWT_SECRET'].encode()
    for kind, value, maximum in [('ip', request.client.host if request.client else 'unknown', limit * 5), ('identity', identity.casefold(), limit)]:
        if not value:
            continue
        key = hmac.new(secret, f'{scope}:{kind}:{value}:{bucket}'.encode(), hashlib.sha256).hexdigest()
        doc = await db.auth_limits.find_one_and_update({'_id': key}, {'$inc': {'count': 1}, '$setOnInsert': {'expires_at': now() + timedelta(seconds=seconds * 2)}}, upsert=True, return_document=True)
        if doc['count'] > maximum:
            raise HTTPException(429, 'Πολλές προσπάθειες. Δοκίμασε ξανά σε λίγα λεπτά.', headers={'Retry-After': str(seconds)})

class EmailRequest(BaseModel):
    email: EmailStr

class TokenRequest(BaseModel):
    token: str = Field(min_length=30, max_length=100)

class PasswordReset(TokenRequest):
    password: str = Field(min_length=10, max_length=72)
    @field_validator('password')
    @classmethod
    def byte_limit(cls, value):
        if len(value.encode()) > 72:
            raise ValueError('Ο κωδικός είναι πολύ μεγάλος.')
        return value

def build_account_router(database, current_user, hash_password):
    router = APIRouter(prefix='/api/auth')

    @router.get('/account')
    async def account(user=Depends(current_user)):
        return {'application': user.get('application') or {}, 'application_complete': application_complete(user), 'email_verified': user.get('email_verified', user.get('membership_status') != 'pending'), 'email': user['email']}

    @router.put('/application')
    async def application(payload: Application, user=Depends(current_user)):
        if user.get('membership_status') != 'pending':
            raise HTTPException(409, 'Η αίτηση δεν είναι σε αναμονή. Επικοινώνησε με τον διαχειριστή.')
        result = await database().users.update_one({'id': user['id'], 'membership_status': 'pending'}, {'$set': {'application': payload.model_dump(), 'name': payload.first_name + ' ' + payload.last_name}})
        if not result.matched_count:
            raise HTTPException(409, 'Η αίτηση έχει ήδη εξεταστεί.')
        return {'ok': True}

    async def issue(email, purpose, request):
        db = database()
        await throttle(db, request, purpose, email, limit=3)
        origin = os.environ.get('PUBLIC_WEB_URL', '').rstrip('/')
        parsed = urlparse(origin)
        if parsed.scheme != 'https' or not parsed.netloc or parsed.query or parsed.fragment or parsed.username:
            raise HTTPException(503, 'Η υπηρεσία email δεν είναι ακόμη διαθέσιμη.')
        user = await db.users.find_one({'email': email.lower()})
        if user and (purpose != 'verify' or not user.get('email_verified', user.get('membership_status') != 'pending')):
            raw = secrets.token_urlsafe(32)
            await db.users.update_one({'id': user['id']}, {'$set': {f'{purpose}_token_hash': hashlib.sha256(raw.encode()).hexdigest(), f'{purpose}_expires_at': now() + timedelta(minutes=30)}})
            await send_account_link(to=user['email'], purpose=purpose, link=f'{origin}/account-action#mode={purpose}&token={raw}')
        return {'ok': True, 'message': 'Αν υπάρχει αντίστοιχος λογαριασμός, θα λάβεις email με τις οδηγίες. Έλεγξε και τα ανεπιθύμητα.'}

    @router.post('/forgot-password')
    async def forgot(payload: EmailRequest, request: Request):
        return await issue(str(payload.email), 'reset', request)

    @router.post('/verification-email')
    async def verification(request: Request, user=Depends(current_user)):
        return await issue(user['email'], 'verify', request)

    @router.post('/reset-password')
    async def reset(payload: PasswordReset, request: Request):
        db = database()
        await throttle(db, request, 'reset-consume', limit=10)
        result = await db.users.update_one({'reset_token_hash': hashlib.sha256(payload.token.encode()).hexdigest(), 'reset_expires_at': {'$gt': now()}}, {'$set': {'password_hash': hash_password(payload.password)}, '$inc': {'token_version': 1}, '$unset': {'reset_token_hash': '', 'reset_expires_at': ''}})
        if not result.modified_count:
            raise HTTPException(400, 'Ο σύνδεσμος έληξε ή χρησιμοποιήθηκε. Ζήτησε νέο email.')
        return {'ok': True}

    @router.post('/verify-email')
    async def verify(payload: TokenRequest, request: Request):
        db = database()
        await throttle(db, request, 'verify-consume', limit=10)
        result = await db.users.update_one({'verify_token_hash': hashlib.sha256(payload.token.encode()).hexdigest(), 'verify_expires_at': {'$gt': now()}}, {'$set': {'email_verified': True}, '$unset': {'verify_token_hash': '', 'verify_expires_at': ''}})
        if not result.modified_count:
            raise HTTPException(400, 'Ο σύνδεσμος έληξε ή χρησιμοποιήθηκε. Ζήτησε νέο email.')
        return {'ok': True}
    return router
