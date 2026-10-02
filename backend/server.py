"""
Sound Healing Greece — Backend API
A cinematic sound healing ecosystem with ritual progression.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
import secrets
import httpx
from emailer import send_receiver_feedback_invite
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta



ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_ALGO = 'HS256'
JWT_EXPIRE_DAYS = 30

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Sound Healing Greece API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("shg")


# ============================================================
# MODELS
# ============================================================
LEVELS = ["L1", "L2", "L3A", "L3B", "L4"]
LEVEL_TITLES = {
    "L1": "Listener Initiate",
    "L2": "Resonance Apprentice",
    "L3A": "Space Holder",
    "L3B": "Resonance Conductor",
    "L4": "Harmonic Master",
}
LEVEL_THRESHOLDS = {"L1": 0, "L2": 500, "L3A": 1200, "L3B": 2500, "L4": 5000}


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    bio: Optional[str] = ""
    location: Optional[str] = ""
    profile_image: Optional[str] = ""  # base64
    title: str
    level: str
    xp: int
    stamps: List[str] = []
    unlocked_realms: List[str] = []
    membership_status: str = "approved"
    role: str = "student"
    created_at: datetime


from members import Application

class RegisterIn(BaseModel):
    application: Application
    email: EmailStr
    password: str = Field(min_length=10, max_length=72)
    name: str = Field(min_length=2)
    location: Optional[str] = ""

    @field_validator("password")
    @classmethod
    def password_bytes(cls, value):
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password exceeds 72 UTF-8 bytes")
        return value


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class SessionIn(BaseModel):
    session_id: str


class TokenOut(BaseModel):
    token: str
    user: UserPublic


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None


class PracticeIn(BaseModel):
    session_date: str
    duration_minutes: int = Field(ge=1, le=1440)
    session_type: str  # e.g. "Tibetan Bowls", "Sound Bath", "Gong Bath"
    protocol: str
    instruments: List[str]
    intention: str
    observations: str = ""
    technical_reflections: str = ""
    what_went_well: str = ""
    what_to_improve: str = ""
    safety_concerns: str = ""
    contraindications_checked: bool = False
    notes: str = ""
    receiver_name: str
    receiver_email: Optional[str] = ""


class PracticeOut(BaseModel):
    id: str
    user_id: str
    session_date: str
    duration_minutes: int
    session_type: str
    protocol: str
    instruments: List[str]
    intention: str
    observations: str
    technical_reflections: str
    what_went_well: str
    what_to_improve: str
    safety_concerns: str
    contraindications_checked: bool
    notes: str
    receiver_name: str
    receiver_email: Optional[str]
    feedback_token: str
    status: str
    xp_awarded: int
    feedback: Optional[dict] = None
    created_at: datetime


class ReceiverFeedbackIn(BaseModel):
    receiver_name: str
    relaxation_before: int = Field(ge=1, le=10)
    relaxation_after: int = Field(ge=1, le=10)
    emotional_experience: str
    body_sensations: str = ""
    perceived_safety: int = Field(ge=1, le=10)
    clarity_of_instructions: int = Field(ge=1, le=10)
    quality_of_holding_space: int = Field(ge=1, le=10)
    comments: str = ""
    consent: bool
    email: Optional[str] = ""


class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None


class ResourceIn(BaseModel):
    name: str
    description: Optional[str] = ""
    parent_type: Literal["academy_level", "academy_lesson", "realm", "cms_content"]
    parent_id: str                      # level_id, lesson_id, or realm_id
    level_id: Optional[str] = None      # for academy_lesson — parent level
    file_data: str                      # base64 encoded
    content_type: str                   # MIME type
    file_size: int                      # bytes


class ResourcePublic(BaseModel):
    id: str
    name: str
    description: str
    parent_type: str
    parent_id: str
    level_id: Optional[str] = None
    content_type: str
    file_size: int
    required_level: Optional[str] = None
    required_xp: int = 0
    uploaded_by: str
    created_at: datetime


# ============================================================
# AUTH HELPERS
# ============================================================
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, token_version: int = 0) -> str:
    payload = {
        "sub": user_id,
        "ver": token_version,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(request: Request, creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user or payload.get("ver", 0) != user.get("token_version", 0):
        raise HTTPException(status_code=401, detail="Session expired")
    if user.get('membership_status', 'approved') != 'approved' and not (request.url.path.startswith('/api/auth/') or request.url.path == '/api/members/me' or request.url.path.startswith('/api/notifications')):
        raise HTTPException(403, 'Η εγγραφή σου δεν έχει εγκριθεί ακόμη.')
    return user


async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def serialize_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "bio": user.get("bio", ""),
        "location": user.get("location", ""),
        "profile_image": user.get("profile_image", ""),
        "title": user.get("title", LEVEL_TITLES["L1"]),
        "level": user.get("level", "L1"),
        "xp": user.get("xp", 0),
        "stamps": user.get("stamps", []),
        "unlocked_realms": user.get("unlocked_realms", []),
        "role": user.get("role", "student"),
        "membership_status": user.get("membership_status", "approved"),
        "created_at": user.get("created_at", datetime.now(timezone.utc)),
    }


def compute_level(xp: int) -> str:
    current = "L1"
    for lvl in LEVELS:
        if xp >= LEVEL_THRESHOLDS[lvl]:
            current = lvl
    return current


# ============================================================
# SEED DATA
# ============================================================
REALMS_SEED = [
    {"id": "temple-of-breath", "name": "Temple of Breath", "subtitle": "The Awakening of Listening",
     "description": "Where every inhalation becomes prayer and exhalation a release. Begin your sonic pilgrimage in this sanctuary of conscious breath.",
     "level_required": "L1", "xp_required": 0, "element": "Air",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/cd48cdb5079d8a657abae113df6a88bb41f0e3569bf4f3c6804a8b95ce356dda.png",
     "chambers": ["First Breath", "The Listening Stone", "Pranic Bridge"]},
    {"id": "sacred-frequency-mountain", "name": "Sacred Frequency Mountain", "subtitle": "Ascend the Harmonic Path",
     "description": "Climb through layers of resonance. Each step a frequency. Each summit a deeper octave of self.",
     "level_required": "L1", "xp_required": 200, "element": "Earth",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/51acd6a43b04161047311d5fed072955cff5272e899faff68886fda62be120bd.png",
     "chambers": ["Foothills of Tones", "The Crystal Ridge", "Summit of Silence"]},
    {"id": "inner-ocean-realm", "name": "Inner Ocean Realm", "subtitle": "Dive Into Liquid Resonance",
     "description": "Submerge into the body as ocean. Each cell a wave. Each emotion a tide.",
     "level_required": "L2", "xp_required": 500, "element": "Water",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/3f6719440baf2be093bf3b152abd2db880de87352fc555cb915dd0ea80274d0d.png",
     "chambers": ["Tidal Threshold", "Coral Frequencies", "Abyssal Stillness"]},
    {"id": "sonic-forest", "name": "Sonic Forest of Resonance", "subtitle": "Where Trees Sing",
     "description": "Wander an ancient woodland of vibrating bark and harmonic leaves. The forest hums in welcome.",
     "level_required": "L2", "xp_required": 800, "element": "Wood",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/bd42511ade3618b8c1e4c3fd7a2428a53f4c061fe429c42274ab520dbfa4e1cb.png",
     "chambers": ["Mossbell Glade", "The Echoing Grove", "Heartroot Circle"]},
    {"id": "himalayan-temple", "name": "Himalayan Sound Temple", "subtitle": "Sanctuary of Ancient Bowls",
     "description": "Where Tibetan masters have hummed for centuries. Step into living tradition.",
     "level_required": "L3A", "xp_required": 1200, "element": "Metal",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/cd48cdb5079d8a657abae113df6a88bb41f0e3569bf4f3c6804a8b95ce356dda.png",
     "chambers": ["Bell Antechamber", "The Singing Hall", "Inner Sanctum"]},
    {"id": "cosmic-resonance-path", "name": "Cosmic Resonance Path", "subtitle": "Walk Among the Stars",
     "description": "A path of starlight and supernovae. The universe itself becomes your instrument.",
     "level_required": "L3B", "xp_required": 2500, "element": "Ether",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/75be05b44085856f15af9c8232168501507e733e3bbdc992125e67882c7ce5e5.png",
     "chambers": ["Nebula Gateway", "Constellation Bridge", "The Singularity Hum"]},
    {"id": "golden-sound-temple", "name": "Golden Sound Temple", "subtitle": "Mastery Awaits",
     "description": "The final temple. Gold-leafed silence. Where masters return to remember.",
     "level_required": "L4", "xp_required": 5000, "element": "Light",
     "image": "https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/1bd03f76b9a3274608524fcf722ca0012f3ccb1fbfeb19ad566d0d022a2e0660.png",
     "chambers": ["Threshold of Gold", "Hall of Echoes", "The Eternal Tone"]},
]

ACADEMY_SEED = [
    {"id": "L1", "level": "L1", "name": "Foundations",
     "theme": "The Awakening of Listening", "xp_required": 0, "xp_reward": 500,
     "description": "Begin your sonic apprenticeship. Discover Tibetan bowls, chakras, breath, and the architecture of inner stillness.",
     "lessons": [
         {"id": "L1-1", "title": "The Art of Listening", "duration_min": 22, "type": "video",
          "summary": "Tune your ears to subtle frequency. The first practice is silence."},
         {"id": "L1-2", "title": "Tibetan Singing Bowls — Origins", "duration_min": 28, "type": "video",
          "summary": "Lineage, metallurgy, and the seven sacred metals."},
         {"id": "L1-3", "title": "The Chakra System Reimagined", "duration_min": 35, "type": "audio",
          "summary": "Seven gateways of resonance — root to crown."},
         {"id": "L1-4", "title": "Nervous System Foundations", "duration_min": 30, "type": "video",
          "summary": "Polyvagal theory meets sacred sound."},
         {"id": "L1-5", "title": "Harmonic Resonance & Intention", "duration_min": 25, "type": "ritual",
          "summary": "Your first guided ritual of intention-setting."},
     ]},
    {"id": "L2", "level": "L2", "name": "Therapeutic Bodywork",
     "theme": "The Body Becomes Resonance", "xp_required": 500, "xp_reward": 700,
     "description": "Place bowls upon the body. Move energy through fascia, bone, and emotion. Learn the protocols of safe touch and sound.",
     "lessons": [
         {"id": "L2-1", "title": "Sound Massage Foundations", "duration_min": 32, "type": "video",
          "summary": "Body placements, weight, and resonant contact."},
         {"id": "L2-2", "title": "Energetic Balancing Protocol", "duration_min": 40, "type": "video",
          "summary": "Move stagnant energy through tonal sequences."},
         {"id": "L2-3", "title": "Grounding Through Vibration", "duration_min": 25, "type": "audio",
          "summary": "Earth as instrument. Body as cathedral."},
         {"id": "L2-4", "title": "Contraindications & Safety", "duration_min": 20, "type": "video",
          "summary": "When NOT to play. Sacred boundaries of practice."},
         {"id": "L2-5", "title": "Fascia & Cellular Vibration", "duration_min": 35, "type": "ritual",
          "summary": "Live session: full-body sound therapy protocol."},
     ]},
    {"id": "L3A", "level": "L3A", "name": "Group Sound Baths",
     "theme": "The Space Holder", "xp_required": 1200, "xp_reward": 900,
     "description": "Hold sacred space for many. Learn the choreography of crystal bowls, gongs, and collective relaxation dynamics.",
     "lessons": [
         {"id": "L3A-1", "title": "Designing a Sound Bath", "duration_min": 45, "type": "video",
          "summary": "Arc, peak, descent — the cinematic structure of group sound."},
         {"id": "L3A-2", "title": "Crystal Bowl Mastery", "duration_min": 38, "type": "video",
          "summary": "Quartz frequencies, chakra alignment, layering."},
         {"id": "L3A-3", "title": "Gong Foundations", "duration_min": 50, "type": "video",
          "summary": "The thunder beneath the silence."},
         {"id": "L3A-4", "title": "Transitions & Sonic Flow", "duration_min": 30, "type": "audio",
          "summary": "Move groups through emotional landscapes."},
         {"id": "L3A-5", "title": "Holding Collective Relaxation", "duration_min": 35, "type": "ritual",
          "summary": "Practicum: lead a 30-minute group bath."},
     ]},
    {"id": "L3B", "level": "L3B", "name": "Advanced Sound Facilitation",
     "theme": "The Resonance Conductor", "xp_required": 2500, "xp_reward": 1200,
     "description": "Orchestrate immersive sonic architectures. Lead large groups, master ceremonial flow, manage energy at scale.",
     "lessons": [
         {"id": "L3B-1", "title": "Multi-Instrument Orchestration", "duration_min": 55, "type": "video",
          "summary": "Compose with bowls, gongs, chimes, voice."},
         {"id": "L3B-2", "title": "Immersive Sonic Architecture", "duration_min": 45, "type": "video",
          "summary": "Spatial sound design for large gatherings."},
         {"id": "L3B-3", "title": "Ceremonial Flow Mastery", "duration_min": 40, "type": "ritual",
          "summary": "Open, deepen, integrate — the three movements."},
         {"id": "L3B-4", "title": "Large Group Energy Management", "duration_min": 35, "type": "video",
          "summary": "Read collective fields. Adjust in real time."},
         {"id": "L3B-5", "title": "Live Facilitation Mastery", "duration_min": 60, "type": "ritual",
          "summary": "Lead a 60-min ceremony with multi-instrument flow."},
     ]},
    {"id": "L4", "level": "L4", "name": "Professional Initiation",
     "theme": "The Harmonic Master", "xp_required": 5000, "xp_reward": 0,
     "description": "Trauma-sensitive facilitation. Ethics. Mentorship. Become a practitioner of the highest order.",
     "lessons": [
         {"id": "L4-1", "title": "Trauma-Sensitive Sound Practice", "duration_min": 60, "type": "video",
          "summary": "Honor the body's protective intelligence."},
         {"id": "L4-2", "title": "Advanced Nervous System Mastery", "duration_min": 50, "type": "video",
          "summary": "Co-regulation, attachment, and resonance."},
         {"id": "L4-3", "title": "Practitioner Ethics & Boundaries", "duration_min": 45, "type": "video",
          "summary": "The sacred contract with those who entrust their bodies to you."},
         {"id": "L4-4", "title": "Mentorship & Supervision", "duration_min": 40, "type": "ritual",
          "summary": "Become a teacher of teachers."},
         {"id": "L4-5", "title": "Therapeutic Integration", "duration_min": 55, "type": "ritual",
          "summary": "Closing initiation ceremony."},
     ]},
]

STAMPS_SEED = [
    {"id": "stamp-listener-initiate", "name": "Listener Initiate", "rarity": "Common", "icon": "ear",
     "meaning": "You have crossed the first threshold of conscious listening.", "category": "Level Completion"},
    {"id": "stamp-resonance-apprentice", "name": "Resonance Apprentice", "rarity": "Uncommon", "icon": "waveform",
     "meaning": "Your body now speaks the language of vibration.", "category": "Level Completion"},
    {"id": "stamp-space-holder", "name": "Space Holder", "rarity": "Rare", "icon": "circle-multiple",
     "meaning": "You hold sacred space for the collective.", "category": "Level Completion"},
    {"id": "stamp-resonance-conductor", "name": "Resonance Conductor", "rarity": "Epic", "icon": "music",
     "meaning": "Master of multi-instrument ceremonial flow.", "category": "Level Completion"},
    {"id": "stamp-harmonic-master", "name": "Harmonic Master", "rarity": "Legendary", "icon": "crown",
     "meaning": "You have completed the journey. Now you teach.", "category": "Certification"},
    {"id": "stamp-first-practice", "name": "First Resonance", "rarity": "Common", "icon": "sparkles",
     "meaning": "Your first verified practice session.", "category": "Practice Milestone"},
    {"id": "stamp-gong-initiation", "name": "Gong Initiation", "rarity": "Rare", "icon": "disc",
     "meaning": "You have summoned the thunder.", "category": "Instrument"},
    {"id": "stamp-crystal-bowls", "name": "Crystal Bowls", "rarity": "Rare", "icon": "diamond",
     "meaning": "Quartz frequencies flow through your hands.", "category": "Instrument"},
    {"id": "stamp-sound-bath-facilitator", "name": "Sound Bath Facilitator", "rarity": "Epic", "icon": "users",
     "meaning": "You have led the collective into resonant rest.", "category": "Facilitation"},
    {"id": "stamp-community-contributor", "name": "Community Contributor", "rarity": "Uncommon", "icon": "heart",
     "meaning": "You uplift the temple with your presence.", "category": "Community"},
]

CHALLENGES_SEED = [
    {"id": "ch-resonance-week", "name": "Weekly Resonance", "type": "meditation_minutes",
     "target": 120, "duration_days": 7, "reward_xp": 100,
     "description": "120 minutes of meditation across 7 days. Build sonic consistency."},
    {"id": "ch-breath-circle", "name": "Breath Circle", "type": "breathwork",
     "target": 5, "duration_days": 5, "reward_xp": 80,
     "description": "5 breathwork sessions. Awaken pranic flow."},
    {"id": "ch-collective-sound-bath", "name": "Collective Sound Bath", "type": "ritual",
     "target": 3, "duration_days": 14, "reward_xp": 150,
     "description": "Participate in 3 collective rituals in two weeks."},
]


async def seed_db():
    # Realms
    if await db.realms.count_documents({}) == 0:
        await db.realms.insert_many([dict(r) for r in REALMS_SEED])
        logger.info("Seeded realms")
    # Academy
    if await db.academy.count_documents({}) == 0:
        await db.academy.insert_many([dict(lvl) for lvl in ACADEMY_SEED])
        logger.info("Seeded academy")
    # Stamps
    if await db.stamps.count_documents({}) == 0:
        await db.stamps.insert_many([dict(s) for s in STAMPS_SEED])
        logger.info("Seeded stamps")
    # Challenges
    if await db.challenges.count_documents({}) == 0:
        await db.challenges.insert_many([dict(c) for c in CHALLENGES_SEED])
        logger.info("Seeded challenges")
    # Admin provisioning is an explicit operator action; never seed fixed credentials.


@app.on_event("startup")
async def startup():
    if os.environ.get("SEED_DEMO_CONTENT") == "true":
        await seed_db()


# ============================================================
# ROUTES — AUTH
# ============================================================
@api.get("/")
async def root():
    return {"message": "Welcome to Sound Healing Greece", "version": "1.0.0"}


@api.post("/auth/register", response_model=TokenOut)
async def register(payload: RegisterIn):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": payload.email.lower(),
        "name": payload.application.first_name + " " + payload.application.last_name,
        "application": payload.application.model_dump(),
        "membership_status": "pending",
        "password_hash": hash_password(payload.password),
        "bio": "",
        "location": payload.location or "",
        "profile_image": "",
        "title": LEVEL_TITLES["L1"],
        "level": "L1",
        "xp": 0,
        "stamps": [],
        "unlocked_realms": ["temple-of-breath"],
        "role": "student",
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user)
    await db.member_notifications.insert_one({'id': str(uuid.uuid4()), 'audience': 'admin', 'user_id': None, 'text': 'Νέα αίτηση εγγραφής: ' + user['name'], 'created_at': datetime.now(timezone.utc), 'read_by': []})
    token = create_token(user_id)
    return {"token": token, "user": serialize_user(user)}


@api.post("/auth/login", response_model=TokenOut)
async def login(payload: LoginIn):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user.get("token_version", 0))
    return {"token": token, "user": serialize_user(user)}


EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


@api.post("/auth/session", response_model=TokenOut)
async def google_session(payload: SessionIn):
    # Exchange the one-time Emergent session_id for the Google profile, then
    # upsert the user and mint our own app JWT. New Google users are PENDING.
    try:
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.get(
                EMERGENT_SESSION_URL,
                headers={"X-Session-ID": payload.session_id},
            )
    except Exception:
        raise HTTPException(status_code=502, detail="Αποτυχία επικοινωνίας με την υπηρεσία σύνδεσης.")
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Μη έγκυρη ή ληγμένη σύνδεση Google.")
    data = resp.json()
    email = (data.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=401, detail="Δεν δόθηκε email από τη Google.")
    name = (data.get("name") or email.split("@")[0]).strip()
    picture = data.get("picture") or ""
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = str(uuid.uuid4())
        parts = name.split(" ", 1)
        user = {
            "id": user_id,
            "email": email,
            "name": name,
            "application": {
                "first_name": parts[0],
                "last_name": parts[1] if len(parts) > 1 else "",
                "birth_month": 0,
                "birth_year": 0,
                "phone": "",
                "address": "",
                "declared_level": "L1",
                "source": "google",
            },
            "membership_status": "pending",
            "password_hash": hash_password(secrets.token_urlsafe(32)),
            "bio": "",
            "location": "",
            "profile_image": picture,
            "title": LEVEL_TITLES["L1"],
            "level": "L1",
            "xp": 0,
            "stamps": [],
            "unlocked_realms": ["temple-of-breath"],
            "role": "student",
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user)
        await db.member_notifications.insert_one({
            "id": str(uuid.uuid4()),
            "audience": "admin",
            "user_id": None,
            "text": "Νέα αίτηση εγγραφής (Google): " + user["name"],
            "created_at": datetime.now(timezone.utc),
            "read_by": [],
        })
    token = create_token(user["id"], user.get("token_version", 0))
    return {"token": token, "user": serialize_user(user)}


@api.post("/auth/logout")
async def logout(user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$inc": {"token_version": 1}})
    return {"ok": True}


@api.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@api.put("/auth/me", response_model=UserPublic)
async def update_me(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return serialize_user(fresh)


# ============================================================
# ROUTES — REALMS, ACADEMY, STAMPS, CHALLENGES
# ============================================================
@api.get("/realms")
async def list_realms(user: dict = Depends(get_current_user)):
    docs = await db.realms.find({}, {"_id": 0}).to_list(100)
    unlocked = set(user.get("unlocked_realms", []))
    user_xp = user.get("xp", 0)
    for d in docs:
        d["is_unlocked"] = d["id"] in unlocked or user_xp >= d["xp_required"]
    return docs


@api.get("/realms/{realm_id}")
async def get_realm(realm_id: str, user: dict = Depends(get_current_user)):
    realm = await db.realms.find_one({"id": realm_id}, {"_id": 0})
    if not realm:
        raise HTTPException(404, "Realm not found")
    realm["is_unlocked"] = realm_id in user.get("unlocked_realms", []) or user.get("xp", 0) >= realm["xp_required"]
    return realm


@api.post("/realms/{realm_id}/enter")
async def enter_realm(realm_id: str, user: dict = Depends(get_current_user)):
    realm = await db.realms.find_one({"id": realm_id}, {"_id": 0})
    if not realm:
        raise HTTPException(404, "Realm not found")
    if user.get("xp", 0) < realm["xp_required"]:
        raise HTTPException(403, "Insufficient XP to enter")
    if realm_id not in user.get("unlocked_realms", []):
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"unlocked_realms": realm_id}})
    return {"ok": True, "realm": realm}


@api.get("/academy")
async def list_academy(user: dict = Depends(get_current_user)):
    docs = await db.academy.find({}, {"_id": 0}).to_list(100)
    user_xp = user.get("xp", 0)
    for d in docs:
        d["is_unlocked"] = user.get("role") == "admin" or bool(await db.school_enrollments.find_one({"user_id": user["id"], "level_id": d["id"], "status": "active"}))
        if not d["is_unlocked"]:
            d["lessons"] = []
    return docs


@api.get("/academy/{level_id}")
async def get_level(level_id: str, user: dict = Depends(get_current_user)):
    doc = await db.academy.find_one({"id": level_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Level not found")
    doc["is_unlocked"] = user.get("role") == "admin" or bool(await db.school_enrollments.find_one({"user_id": user["id"], "level_id": level_id, "status": "active"}))
    if not doc["is_unlocked"]:
        doc["lessons"] = []
    return doc


@api.post("/academy/{level_id}/lesson/{lesson_id}/complete")
async def complete_lesson(level_id: str, lesson_id: str, user: dict = Depends(get_current_user)):
    level = await db.academy.find_one({"id": level_id})
    if not level or not any(l.get("id") == lesson_id for l in level.get("lessons", [])):
        raise HTTPException(404, "Lesson not found")
    if user.get("role") != "admin" and not await db.school_enrollments.find_one({"user_id": user["id"], "level_id": level_id, "status": "active"}):
        raise HTTPException(403, "School enrollment required")
    result = await db.users.update_one(
        {"id": user["id"], "completed_lessons": {"$ne": f"{level_id}:{lesson_id}"}},
        {"$addToSet": {"completed_lessons": f"{level_id}:{lesson_id}"}})
    return {"ok": True, "already_completed": not bool(result.modified_count), "xp_gained": 0}


@api.get("/stamps")
async def list_stamps(user: dict = Depends(get_current_user)):
    docs = await db.stamps.find({}, {"_id": 0}).to_list(200)
    owned = set(user.get("stamps", []))
    for d in docs:
        d["owned"] = d["id"] in owned
    return docs


@api.get("/challenges")
async def list_challenges(user: dict = Depends(get_current_user)):
    docs = await db.challenges.find({}, {"_id": 0}).to_list(200)
    joined = set(user.get("joined_challenges", []))
    for d in docs:
        d["joined"] = d["id"] in joined
        # Stub participation counts for cinematic feel
        d["participants"] = await db.users.count_documents({"joined_challenges": d["id"]})
    return docs


@api.post("/challenges/{challenge_id}/join")
async def join_challenge(challenge_id: str, user: dict = Depends(get_current_user)):
    ch = await db.challenges.find_one({"id": challenge_id})
    if not ch:
        raise HTTPException(404, "Challenge not found")
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"joined_challenges": challenge_id}})
    return {"ok": True}


# ============================================================
# ROUTES — PRACTICE SESSIONS
# ============================================================
def practice_doc_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "user_id": doc["user_id"],
        "session_date": doc["session_date"],
        "duration_minutes": doc["duration_minutes"],
        "session_type": doc["session_type"],
        "protocol": doc["protocol"],
        "instruments": doc.get("instruments", []),
        "intention": doc["intention"],
        "observations": doc.get("observations", ""),
        "technical_reflections": doc.get("technical_reflections", ""),
        "what_went_well": doc.get("what_went_well", ""),
        "what_to_improve": doc.get("what_to_improve", ""),
        "safety_concerns": doc.get("safety_concerns", ""),
        "contraindications_checked": doc.get("contraindications_checked", False),
        "notes": doc.get("notes", ""),
        "receiver_name": doc["receiver_name"],
        "receiver_email": doc.get("receiver_email", ""),
        "feedback_token": doc["feedback_token"],
        "status": doc["status"],
        "xp_awarded": doc.get("xp_awarded", 0),
        "feedback": doc.get("feedback"),
        "created_at": doc["created_at"],
    }


@api.post("/practices", response_model=PracticeOut)
async def create_practice(payload: PracticeIn, user: dict = Depends(get_current_user)):
    raise HTTPException(410, "Η παλιά καταγραφή έκλεισε. Χρησιμοποίησε την εκπαιδευτική πρακτική στη σχολή.")


@api.get("/practices")
async def list_practices(user: dict = Depends(get_current_user)):
    raise HTTPException(410, "Οι παλιές καταγραφές αποσύρθηκαν και δεν εμφανίζονται στην εφαρμογή.")


@api.get("/practices/{practice_id}", response_model=PracticeOut)
async def get_practice(practice_id: str, user: dict = Depends(get_current_user)):
    raise HTTPException(410, "Οι παλιές καταγραφές αποσύρθηκαν και δεν εμφανίζονται στην εφαρμογή.")


# PUBLIC — receiver feedback
@api.get("/feedback/{token}")
async def get_feedback_form(token: str):
    raise HTTPException(410, "Ο σύνδεσμος αξιολόγησης αποσύρθηκε και δεν είναι πλέον ενεργός.")


@api.post("/feedback/{token}")
async def submit_feedback(token: str, payload: ReceiverFeedbackIn):
    raise HTTPException(410, "Ο σύνδεσμος αξιολόγησης αποσύρθηκε και δεν δέχεται νέα υποβολή.")


# ============================================================
# ROUTES — COMMUNITY (basic)
# ============================================================
@api.get("/community/rankings")
async def rankings(user: dict = Depends(get_current_user)):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("xp", -1).limit(20).to_list(20)
    return [{
        "id": d["id"], "name": d["name"], "title": d.get("title", ""),
        "level": d.get("level", "L1"), "xp": d.get("xp", 0),
        "profile_image": d.get("profile_image", "")
    } for d in docs]


@api.get("/community/feed")
async def community_feed(user: dict = Depends(get_current_user)):
    # Practice records are private; public sharing requires its own consent workflow.
    return []


# ============================================================
# ROUTES — AI WELLNESS ASSISTANT
# ============================================================
SYSTEM_MSG = """You are Aeon, the wellness oracle of Sound Healing Greece — a cinematic immersive academy.

Your tone: warm, calming, wise, supportive, emotionally intelligent. Speak with the grace of a sacred mentor.

Your role:
- Recommend healing rituals, meditations, and sound healing practices
- Adapt to the user's emotional state
- Suggest personalized journeys through the realms (Temple of Breath, Sacred Frequency Mountain, Inner Ocean Realm, Sonic Forest, Himalayan Temple, Cosmic Resonance Path)
- Reference the Academy levels (L1 Foundations, L2 Therapeutic Bodywork, L3A Group Sound Baths, L3B Advanced Facilitation, L4 Professional Initiation)
- Support long-term consistency without pressure

Style guide:
- Use evocative but never flowery language
- Keep responses to 2-4 short paragraphs unless asked for depth
- Occasionally suggest a single concrete next action (a breath, a practice, a lesson)
- Never be clinical, never diagnose, never promise outcomes
- You may use words like "resonance", "breath", "sanctuary", "frequency", "stillness" sparingly

Begin every first reply with a soft greeting acknowledging the user by name if you know it."""


@api.post("/ai/chat")
async def ai_chat(payload: ChatIn, user: dict = Depends(get_current_user)):
    if os.environ.get("AI_ENABLED") != "true":
        raise HTTPException(503, "The assistant is not enabled")
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    session_id = f"shg-{user['id']}"
    system_msg = SYSTEM_MSG + f"\n\nThe user's name is {user['name']}. Their current level is {user.get('level','L1')} ({user.get('title','')}). XP: {user.get('xp',0)}."
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        # Save user message
        await db.chat_messages.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": user["id"],
            "role": "user",
            "content": payload.message,
            "created_at": datetime.now(timezone.utc),
        })
        response_text = await chat.send_message(UserMessage(text=payload.message))
        await db.chat_messages.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": user["id"],
            "role": "assistant",
            "content": response_text,
            "created_at": datetime.now(timezone.utc),
        })
        return {"session_id": session_id, "response": response_text}
    except Exception as e:
        logger.exception("AI chat failed")
        raise HTTPException(503, "Assistant temporarily unavailable")


@api.get("/ai/history")
async def ai_history(user: dict = Depends(get_current_user)):
    session_id = f"shg-{user['id']}"
    msgs = await db.chat_messages.find({"session_id": session_id, "user_id": user["id"]}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return [{"role": m["role"], "content": m["content"], "created_at": m["created_at"]} for m in msgs]


# ============================================================
# ROUTES — RESOURCES (admin uploads attached to lessons / levels / realms)
# ============================================================
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg", "image/png", "image/webp", "image/gif",
}
MAX_FILE_SIZE = 12 * 1024 * 1024  # 12 MB


async def resolve_required_level(parent_type: str, parent_id: str, level_id: Optional[str]) -> tuple[str, int]:
    """Determine which level / xp is required to access this resource."""
    if parent_type == "cms_content":
        item = await db.content_items.find_one({"id": parent_id})
        if not item:
            raise HTTPException(404, "Content not found")
        return (item["draft"].get("level_id") or "public", 0)
    if parent_type == "academy_level":
        lvl = await db.academy.find_one({"id": parent_id}, {"_id": 0, "level": 1, "xp_required": 1})
        if not lvl:
            raise HTTPException(404, "Resource parent not found")
        return (lvl["level"], lvl["xp_required"])
    if parent_type == "academy_lesson":
        # Validate the parent and the lesson relationship
        lvl = await db.academy.find_one({"id": level_id}, {"_id": 0, "level": 1, "xp_required": 1, "lessons": 1}) if level_id else None
        if not lvl:
            raise HTTPException(404, "Resource parent not found")
        if not any(lesson.get("id") == parent_id for lesson in lvl.get("lessons", [])):
            raise HTTPException(404, "Lesson not found in this level")
        return (lvl["level"], lvl["xp_required"])
    if parent_type == "realm":
        r = await db.realms.find_one({"id": parent_id}, {"_id": 0, "level_required": 1, "xp_required": 1})
        if not r:
            raise HTTPException(404, "Resource parent not found")
        return (r["level_required"], r["xp_required"])
    raise HTTPException(404, "Resource parent not found")


def resource_doc_to_public(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "name": doc["name"],
        "description": doc.get("description", ""),
        "parent_type": doc["parent_type"],
        "parent_id": doc["parent_id"],
        "level_id": doc.get("level_id"),
        "content_type": doc["content_type"],
        "file_size": doc["file_size"],
        "required_level": doc.get("required_level"),
        "required_xp": doc.get("required_xp", 0),
        "uploaded_by": doc["uploaded_by"],
        "created_at": doc["created_at"],
    }


@api.post("/admin/resources", response_model=ResourcePublic)
async def create_resource(payload: ResourceIn, admin: dict = Depends(get_admin_user)):
    if payload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, f"Unsupported file type: {payload.content_type}")
    if payload.file_size > MAX_FILE_SIZE:
        raise HTTPException(400, f"File too large (max {MAX_FILE_SIZE // (1024*1024)}MB)")
    import base64, binascii
    if len(payload.file_data) > (MAX_FILE_SIZE * 4 // 3 + 4):
        raise HTTPException(413, "File too large")
    try:
        decoded = base64.b64decode(payload.file_data, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(422, "Invalid file encoding")
    if not decoded or len(decoded) != payload.file_size or len(decoded) > MAX_FILE_SIZE:
        raise HTTPException(422, "Invalid file size")
    signatures = {
        "application/pdf": (b"%PDF-",),
        "image/png": (b"\x89PNG\r\n\x1a\n",),
        "image/jpeg": (b"\xff\xd8\xff",),
        "image/gif": (b"GIF87a", b"GIF89a"),
        "application/msword": (b"\xd0\xcf\x11\xe0",),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b"PK\x03\x04",),
        "image/webp": (b"RIFF",),
    }
    if not any(decoded.startswith(prefix) for prefix in signatures[payload.content_type]):
        raise HTTPException(422, "File does not match its declared type")
    if payload.content_type == "image/webp" and decoded[8:12] != b"WEBP":
        raise HTTPException(422, "Invalid WebP file")
    if not payload.file_data:
        raise HTTPException(400, "file_data is required")
    required_level, required_xp = await resolve_required_level(
        payload.parent_type, payload.parent_id, payload.level_id
    )
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "description": payload.description or "",
        "parent_type": payload.parent_type,
        "parent_id": payload.parent_id,
        "level_id": payload.level_id,
        "file_data": payload.file_data,
        "content_type": payload.content_type,
        "file_size": payload.file_size,
        "required_level": required_level,
        "required_xp": required_xp,
        "uploaded_by": admin["name"],
        "created_at": datetime.now(timezone.utc),
    }
    await db.resources.insert_one(dict(doc))
    return resource_doc_to_public(doc)


async def can_read_resource(doc, user):
    if user.get("role") == "admin":
        return True
    level = doc.get("required_level")
    if doc.get("parent_type") == "cms_content":
        item = await db.content_items.find_one({"id": doc["parent_id"], "archived": False})
        if not item or not item.get("published"):
            return False
        if doc["id"] not in item["published"].get("resource_ids", []):
            return False
        level = item["published"].get("level_id")
        if not level:
            return True
    return bool(await db.school_enrollments.find_one({"user_id": user["id"], "level_id": level, "status": "active"}))


@api.get("/resources")
async def list_resources(
    parent_type: str,
    parent_id: str,
    user: dict = Depends(get_current_user),
):
    """List resources for a parent. Filters out resources the user can't access yet."""
    query = {"parent_type": parent_type, "parent_id": parent_id}
    docs = await db.resources.find(query, {"_id": 0, "file_data": 0}).sort("created_at", -1).to_list(200)
    # XP-gate
    user_xp = user.get("xp", 0)
    is_admin = user.get("role") == "admin"
    out = []
    for d in docs:
        is_unlocked = await can_read_resource(d, user)
        if not is_unlocked:
            continue
        item = resource_doc_to_public(d)
        item["is_unlocked"] = is_unlocked
        out.append(item)
    return out


@api.get("/admin/resources")
async def admin_list_all_resources(admin: dict = Depends(get_admin_user)):
    docs = await db.resources.find({}, {"_id": 0, "file_data": 0}).sort("created_at", -1).to_list(500)
    return [resource_doc_to_public(d) for d in docs]


@api.get("/resources/{resource_id}/download")
async def download_resource(resource_id: str, user: dict = Depends(get_current_user)):
    doc = await db.resources.find_one({"id": resource_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Resource not found")
    is_admin = user.get("role") == "admin"
    if not await can_read_resource(doc, user):
        raise HTTPException(403, "School enrollment required")
    return {
        "id": doc["id"],
        "name": doc["name"],
        "content_type": doc["content_type"],
        "file_size": doc["file_size"],
        "file_data": doc["file_data"],
    }


@api.delete("/admin/resources/{resource_id}")
async def delete_resource(resource_id: str, admin: dict = Depends(get_admin_user)):
    res = await db.resources.delete_one({"id": resource_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ============================================================
# MOUNT
# ============================================================
from forms import build_form_router
from school import build_school_router
app.include_router(build_form_router(db, get_admin_user))
app.include_router(build_school_router(db, get_current_user, get_admin_user))
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=[x.strip() for x in os.environ.get("CORS_ORIGINS", "http://localhost:8081").split(",") if x.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


from assessments import build_assessment_router
app.include_router(build_assessment_router(db, get_current_user, get_admin_user))

from studio import build_studio_router
app.include_router(build_studio_router(db, get_current_user, get_admin_user))

from members import build_members_router
app.include_router(build_members_router(db, get_current_user, get_admin_user))
