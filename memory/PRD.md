# Sound Healing Greece — Product Requirements Document

## Vision
An immersive, cinematic sound healing ecosystem and gamified ritual academy for sound healers — from initiate to master practitioner. Built mobile-first (iPhone/Android) on Expo React Native with full responsive web support.

## MVP Implemented (v1.0)

### Authentication
- JWT-based custom auth (email/password, bcrypt)
- Register, Login, Logout
- Token persisted in expo-secure-store
- Protected routes via AuthGate

### Home Sanctuary (Tab 1)
- Personalized welcome
- Animated Level Ring (SVG progress arc with gold/cyan/purple gradient)
- XP progress bar
- Quick actions: Log Practice / Aeon Oracle / Realms / Academy
- Recent practices feed
- Community resonance feed
- Pull-to-refresh

### Journey Universe (Tab 2)
- 7 cinematic realms with backgrounds: Temple of Breath, Sacred Frequency Mountain, Inner Ocean Realm, Sonic Forest, Himalayan Sound Temple, Cosmic Resonance Path, Golden Sound Temple
- Each realm: element, XP requirement, chambers, lock/unlock state based on XP
- Realm detail screen with cinematic hero image, chambers, "Enter the Realm" CTA

### Sound Healing Academy (Tab 3)
- 5 Levels: L1 Foundations, L2 Therapeutic Bodywork, L3A Group Sound Baths, L3B Advanced Facilitation, L4 Professional Initiation
- Each level has theme, description, 5 lessons (video/audio/ritual types)
- Lesson completion awards +50 XP
- Level-up alert when threshold crossed

### Practice Realm (Tab 4)
- Comprehensive Log Practice form: date, duration, type, protocol, instruments (chips), intention, observations, reflections, what went well/to improve, safety concerns, contraindications toggle, notes, receiver name & email
- Practice list with status badges (Draft, Waiting for Receiver Feedback, Feedback Received, XP Awarded, etc.)
- Practice detail page with receiver feedback link (Share button)
- Stats: Sessions / Awarded / Awaiting / Total XP

### Receiver Feedback (Public, no login)
- Public URL: `/feedback/<token>`
- Scales 1-10 for: relaxation before/after, perceived safety, clarity, quality of holding
- Text fields: emotional experience, body sensations, comments
- Consent required
- Submission auto-awards +150 XP to practitioner + "First Resonance" stamp

### Profile Evolution (Tab 5)
- Avatar with image-picker (base64 stored)
- Name, title, location, bio
- Animated Level Ring (large)
- Stats: Stamps owned/total, Realms unlocked/total, Total XP
- Initiation Path roadmap (L1→L4)
- Stamps gallery (owned + locked)
- Logout

### AI Wellness Oracle "Aeon"
- Claude Sonnet 4.5 via emergentintegrations
- Warm, calming tone with persona prompt referencing user's level, name, XP
- Conversation history persisted in MongoDB
- Suggested prompts on first visit
- Multi-turn chat with breathing orb animation

## Sound XP System
- L1: 0 XP
- L2: 500 XP
- L3A: 1200 XP
- L3B: 2500 XP
- L4: 5000 XP

## Visual Design
- Color palette: Obsidian Black (#05050A), Deep Indigo, Burnt Bronze, Antique Gold (#CCA352), Aura Cyan (#4DD0E1), Ether Purple, Sunset Coral
- Fonts: Cormorant Garamond (editorial serif) + Inter (modern sans)
- Animations: Breathing glow, fade-in cascades, SVG-animated level ring, gradient backgrounds
- Tab bar: glassmorphic dark with gold active state

## Backend Endpoints (FastAPI, MongoDB)
- `POST /api/auth/register` `POST /api/auth/login` `GET /api/auth/me` `PUT /api/auth/me`
- `GET /api/realms` `GET /api/realms/{id}` `POST /api/realms/{id}/enter`
- `GET /api/academy` `GET /api/academy/{level_id}` `POST /api/academy/{level_id}/lesson/{id}/complete`
- `GET /api/stamps` `GET /api/challenges` `POST /api/challenges/{id}/join`
- `POST /api/practices` `GET /api/practices` `GET /api/practices/{id}`
- `GET /api/feedback/{token}` (public) `POST /api/feedback/{token}` (public)
- `GET /api/community/rankings` `GET /api/community/feed`
- `POST /api/ai/chat` `GET /api/ai/history`

## Deferred (Roadmap)
- Community Temple chats per level
- Events & Retreats with Stripe payment
- Resource Library file unlocks
- Admin dashboard
- Global rankings UI
- Dynamic aura evolution visuals


---

## v1.1 — GitHub Sync (branch `shg/premium-renewal` @ faa863e) — June 2026
Synced the user's GitHub repo `apostolakisalex-bit/Sound-Healing` (branch `shg/premium-renewal`) into the Emergent workspace via a clean **fast-forward merge** (no conflicts, no lost work; the branch already contained all prior Emergent work). GitHub branch is the source of truth.

### Environment adaptation (Emergent preview only)
- `frontend/package.json` `packageManager` set to `yarn@1.22.22` (was `pnpm@11.19.0`) — strictly required because Emergent's supervisor runs `yarn expo start` and classic yarn rejects a non-yarn `packageManager` field via corepack. **`pnpm-lock.yaml` and `pnpm-workspace.yaml` are preserved** per user instruction.
- `.env` files (frontend + backend) preserved and intact; MongoDB data preserved (existing admin + seed data). Backups at `/app/memory/env_backup_pre_github_sync/`.

### New in synced code
- **Backend is now modular**: `server.py` mounts routers from `forms.py`, `school.py`, `assessments.py`. New `provision_admin.py` (interactive admin provisioning; no hardcoded creds). Unit tests under `backend/unit_tests/`.
- **School module** (`/api/school/*`, `/api/content/*`, `/api/admin/cohorts|content|enrollments|attendance`): catalog, enrollments, cohorts, content CRUD + publish/restore/archive, attendance, practice cycles.
- **Forms module** (`/api/forms`) + **Assessments module** (practice assessments, invitations, admin form activation; 256-bit tokens).
- **Frontend**: full Admin dashboard (`app/admin.tsx`), many new components (Experience, Wellness, PublicHome, Assessments, evaluation, EventGrid, Progress, etc.), reworked tabs + public landing (now Greek-first).
- **Docs**: `product/` folder with full product spec & implementation phases.

### Design-behavior changes vs v1.0 (intentional in the branch — NOT bugs)
1. `POST /api/feedback/{token}` no longer auto-awards +150 XP / "First Resonance" stamp. Practice status → `Awaiting Instructor Review`, `xp_awarded=0`. XP now flows through an instructor-review pipeline.
2. `POST /api/academy/{level}/lesson/{id}/complete` now requires an active **school enrollment** (403 otherwise); lesson content (`lessons[]`) hidden unless admin/enrolled.
3. `POST /api/ai/chat` gated behind `AI_ENABLED=true` (currently not set → returns 503). `EMERGENT_LLM_KEY` is present.

### Verification (testing_agent, iteration_2)
- Backend: **48/48 pytest PASSED** (1 skipped: AI gated). Frontend: all key flows green (landing, login, register, top-bar nav, admin dashboard, public feedback expired-token). No regressions.

### Security audit (read-only) — CONDITIONAL PASS, no Critical/High
- Strong auth/authz: admin/instructor role gating verified, object-ownership (BOLA) checks verified, secrets env-only, password hashes never returned, uploads validate MIME+size+signature, feedback/eval tokens 256-bit, CORS `allow_credentials=False` with env allowlist.
- Follow-ups (backlog, defense-in-depth):
  - SEC-001 (MEDIUM, gated by AI_ENABLED): cap `/api/ai/chat` message length + per-user rate limit/quota.
  - SEC-002 (LOW): bound profile fields / base64 avatar size (broadcast in rankings).
  - Hardening: rate-limit auth/feedback/eval endpoints; disable `/docs` & `/openapi.json` in prod; shorten 30-day JWT / add refresh.

## Backlog (awaiting user approval before implementation)
- Decide XP/instructor-review pipeline wiring for feedback completion.
- Decide whether to enable AI Oracle in preview (`AI_ENABLED=true`).
- Security follow-ups SEC-001, SEC-002, and hardening items above.
- Add `testID`s to login/register inputs for automation; migrate `shadow*`→`boxShadow`, `props.pointerEvents`→`style.pointerEvents` (deprecation warnings).

---

## v1.2 — Mobile QA + Aesthetic + Google Auth + Email (June 2026, preview)
Integrated GitHub branch `shg/premium-renewal` up to **a315535** (mobile safe-areas, text scaling, MOBILE_QA doc) via clean merge (HEAD 9d2661d). Then, per owner request, applied the following on top (preview only — not pushed to production):

### Mobile responsive QA (browser/react-native-web only — NOT native-device confirmed)
- Verified no horizontal overflow (scrollWidth==innerWidth) on home @320×568, @844×390 landscape, and login @320×568; bottom nav + forms reachable. The a315535 commit already added shared safe-area insets, iOS keyboard avoidance, training-card stacking <350px, large-font handling, 2-col service cards.

### Aesthetic changes (owner-requested)
1. Removed the small decorative wave line under the "Sound Healing Greece" wordmark (kept the photo banner, wordmark, and bottom sound-wave edge). — `PublicHome.tsx`
2. Slimmer, more elegant bottom-nav icons (size 21, no heavy shadow/bulky frame, soft lavender active pill, touch target ≥44). — `AppNavigation.tsx`
3. Replaced the Ηχοθεραπεία music-note icon with a minimal custom SVG "sound spiral". — `src/components/icons/SoundSpiral.tsx`
4. Notifications bell removed from the public home + shared header; now shown ONLY on the student Profile (/profile) and admin workspace (/admin) via a `notifications` prop on `Shell`/`AppHeader`. Unread dot + dropdown preserved. — `Wellness.tsx`, `AppNavigation.tsx`, `MemberProfile.tsx`, `admin.tsx`

### 🅲 Emergent Google sign-in
- Backend `POST /api/auth/session`: exchanges the one-time Emergent `session_id` (via `demobackend.emergentagent.com/.../session-data`), upserts the user by email, mints the app's own JWT. NEW Google users → `membership_status='pending'` (admin approval required) + admin notification; existing emails reused.
- Frontend: "Σύνδεση με Google" on /login & /register; `AuthContext.loginWithSession` + session handling on web mount (hash/query) and native deep links.
- Works on web preview with a real Google account; native needs a dev build. Verified: 401 on bogus session_id, button renders.

### 🅳 Emergent-managed Resend email
- `backend/emailer.py` (guardrail gate + non-raising `send_email`). Triggers: (1) member approval/rejection → emails the member (`members.py`); (2) practice creation with a `receiver_email` → emails the receiver the feedback link `{PUBLIC_WEB_URL}/feedback/{token}` (`server.py`).
- Env added: `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME='Sound Healing Greece'`, `PUBLIC_WEB_URL`. Verified: proxy send returned a provider id.

### Deferred
- 🅴 Emergent push notifications — deferred by owner (needs Publish+build + google-services.json; not testable in Expo Go/preview).

### Verification
- testing_agent iteration_4 (aesthetic + regression) PASS; iteration_5 (Google + Resend + regression) PASS (10/10 backend). All browser-level; native device/emulator NOT available.

---

## v1.3 — Expo SDK 54 → 57 upgrade (June 2026, preview, frontend only)
Upgraded the Expo app two major SDKs (54 → 57) per owner request. Backend unchanged.

### What changed
- `yarn expo install expo@^57.0.0` then `yarn expo install --fix`. Resulting key versions: `expo@57.0.26`, `react`/`react-dom` 19.2.3, `react-native` 0.86.3, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react-native-gesture-handler` 2.32.0, `react-native-screens` 4.26, `react-native-safe-area-context` 5.7, `react-native-svg` 15.15.4, `expo-router` 57.0.24, `typescript` 6.0.3.
- `app.json`: removed `newArchEnabled` and `edgeToEdgeEnabled` (both are defaults from SDK 55+); fixed `android.adaptiveIcon.backgroundColor` `#000` → `#000000` (SDK 57 stricter schema).
- `@expo/vector-icons` (^15.0.3) kept — renders fine on SDK 57, not flagged by expo-doctor.
- `packageManager: yarn@1.22.22` kept; `pnpm-lock.yaml`/`pnpm-workspace.yaml` preserved (intentional; expo-doctor's "multiple lock files" is an accepted non-blocker).
- Backups of pre-upgrade `package.json`/`yarn.lock`/`app.json` at `/app/memory/sdk54_backup/`.

### Verification
- expo-doctor: 19/21 pass (2 non-blocking: multiple lock files [intentional] + non-square icon png warnings). Web bundle builds clean (1473 modules).
- testing_agent iteration_6: frontend regression CLEAN PASS (9/9) on web preview — public landing, student + admin login, all 5 tabs, practice (enrollment-gated), public feedback expired-token, admin workspace sections, notifications bell placement, session persistence.
- Node runtime v24.19.0 satisfies SDK 57's ≥22.13 requirement.

### Known non-fatal web-only dev warnings (NOT regressions; backlog cleanup)
- `shadow*`/`textShadow*` style-prop deprecation → migrate to `boxShadow`/`textShadow`.
- `Received false for a non-boolean attribute accessible` (SoundSpiral.tsx).
- NEW in SDK 57: `Image: style.resizeMode is deprecated. Use props.resizeMode.` — minor, non-blocking.

### Note
- Native iOS/Android require a fresh dev/production build (RN 0.86 runtime) — Publish + build to test on real devices; cannot be validated in Expo Go/web preview.

