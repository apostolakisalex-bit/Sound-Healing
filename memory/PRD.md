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

---

## v1.4 — Legacy practice retirement (GitHub commit 3aa4d71, June 2026, preview)
Integrated GitHub `shg/premium-renewal` commit **3aa4d71** ("Retire legacy practice creation and present prior records as read-only Greek history") via a clean **fast-forward** onto the SDK-57 HEAD — all Emergent changes (SDK 57, Google auth, Resend, aesthetics) preserved; package.json/app.json/yarn.lock untouched by the merge.

### Behavior
- **Backend**: `POST /api/practices` now returns **410** with a Greek message ("Η παλιά καταγραφή έκλεισε…"). `GET /api/practices`, `GET /api/practices/{id}`, and public `GET/POST /api/feedback/{token}` are unchanged — read-only history + already-sent receiver links keep working. **No XP/credit migration**; feedback still routes to `Awaiting Instructor Review` with `xp_awarded=0`.
- **Frontend**: `/practice/new` → `<Redirect href="/practice" />` (school practice screen). `/legacy-practices` and `/practice/[id]` are read-only Greek history screens via new `src/components/LegacyHistory.tsx` (`LegacyHistory` list + `LegacyDetail`), using the shared `Shell`. The "Ιστορικό παλαιότερων καταγραφών" button on the school `PracticeScreen` (`Experience.tsx`) renders **only** when the student has ≥1 legacy record. A Greek "read-only / not counted toward Levels" notice is shown; no create/log/share controls.

### Emergent-side fixes on top of the merge
- `LevelRing.tsx`: `StyleSheet.absoluteFillObject` → `absoluteFill` (SDK 57 `tsc` type error). `tsc --noEmit` now clean.
- Tests updated per handoff: legacy creation tests now assert **410**; read/feedback tests use **isolated seeded fixtures** in Mongo (`conftest.py` `mongo_db` + `seed_practice`, ids prefixed `TEST_legacy_`, cleaned at session end) — legacy creation is never re-enabled. (`tests/test_api.py`, `tests/test_google_resend_integration.py`.)

### Verification
- Backend pytest: **34 passed / 1 skipped** (AI gated) in the API suite + **104 passed** in the rest (new_modules, premium_renewal, unit_tests). Live `POST /api/practices` → 410 confirmed.
- testing_agent iteration_7 (frontend, SDK 57 web preview): **PASS** on all 6 checklist items — (1) no-history → button hidden, (2) with-history → read-only own records, no create/share, (3) `/practice/new` redirects, (4) enrolled student creates+submits a new school practice (group mode), (5) old feedback links render without login, (6) SDK-57 regression fine.

### Fixtures created (approved students)
- `legacy_empty@test.gr` / `EmptyPass12345` (0 legacy, not enrolled)
- `legacy_history@test.gr` / `HistoryPass12345` (2 seeded legacy records)
- `legacy_enrolled@test.gr` / `EnrolledPass12345` (active enrollment "TEST Cohort a72b52")

### Known non-blocking observations (out of scope for this commit)
- Console-only (non-fatal) on /practice: `Unexpected text node … cannot be a child of a <View>` — pre-existing in shared components; does not affect functionality.
- Public receiver feedback form (`app/feedback/[token].tsx`) renders in **English** (pre-existing Emergent screen, not touched by this commit). Localization to Greek pending owner decision.

---

## v1.5 — Full legacy-environment retirement (owner change of direction, June 2026)
Owner decision: ONE unified experience, exclusively the new educational flow (active enrollment → practice → student assessment → receiver/group assessment via `/evaluation` → Admin review). No path to the old environment from any menu or direct URL; stored legacy data is kept **isolated in Mongo (not deleted)**, never shown, never credited.

### Retired (frontend)
- Removed the "Ιστορικό παλαιότερων καταγραφών" button and its `/practices` fetch from the school `PracticeScreen` (`Experience.tsx`).
- Old routes replaced with thin stubs (new `src/components/RetiredNotice.tsx` — Greek "αποσύρθηκε" notice):
  - `/legacy-practices` → RetiredNotice (+ link to `/(tabs)/practice`).
  - `/practice/[id]` → `Redirect` to `/(tabs)/practice`.  `/practice/new` → `Redirect` to `/(tabs)/practice`.
  - `/level/[id]` → `Redirect` to `/(tabs)/academy`.
  - `/realm/[id]` → RetiredNotice.  `/ai-chat` → RetiredNotice.
  - `/feedback/[token]` → PUBLIC RetiredNotice ("Ο σύνδεσμος αποσύρθηκε"), NO form, NO submission.
- Removed old XP from the active environment: deleted the dead `ProfileScreen` in `Experience.tsx` (showed "παλαιότερα XP") and removed the "παλαιότερα XP" sentence from `Home`.
- Deleted dead files: `src/components/LevelRing.tsx`, `LegacyHistory.tsx`, `TabsTopBar.tsx` (+ unused `BrandHero` import).

### Retired (backend — `server.py`, data untouched in DB)
- `GET /api/practices`, `GET /api/practices/{id}`, `GET /api/feedback/{token}`, `POST /api/feedback/{token}` → **410** with Greek messages (`POST /api/practices` was already 410). `/ai/chat` stays 503-gated; `community/feed` stays `[]`.

### Kept (unchanged)
- MemberProfile (L1–L4 progress bars, practice stars, new stats — no "XP" wording), admin workspace, public home + past seminars marked "Ολοκληρώθηκε", the NEW assessment flow (`/evaluation` + `/evaluations/*`, disjoint from the retired `/feedback`).

### Verification
- `tsc --noEmit` clean; backend pytest **134 passed / 1 skipped** (AI gated); all 4 old endpoints return 410 live.
- Runtime (web preview) confirmed by main agent: no history button on `/practice` (even for a student WITH legacy records); direct URLs `/legacy-practices`, `/ai-chat`, `/realm/x` → Greek retirement notice; `/practice/xyz` → new PracticeScreen; `/level/x` → `/academy`; public `/feedback/<token>` → retirement notice with 0 form inputs. Tests updated: all legacy practice/feedback endpoints asserted as 410 (`test_api.py`, `test_google_resend_integration.py`, `unit_tests/test_security.py`); isolated seed fixtures removed.

---

## v1.6 — Admin aesthetic parity + global visual polish (June 2026)
- **Admin roster (collage)**: `/admin/members` now returns `level` + `profile_image`, sorted by name; `MembersAdmin` renders students as a wrap **collage of small cards** (circle avatar / initial, name, Level badge). Higher Level → slightly larger card (`LEVEL_SCALE`). Alphabetical (localeCompare "el").
- **Admin home header** (`AdminHome.tsx`): mirrors the student profile header — avatar circle (with photo upload) + **"ΔΑΣΚΑΛΟΣ"** badge instead of Level bars + **school stats in circles** (Μαθητές, Ενεργές εγγραφές, Τμήματα, Για έλεγχο — computed from `/admin/workspace`). Avatar upload now allowed for staff: `/members/me/avatar` uses `current_user` (admin had `membership_status:null` and was blocked by `approved`).
- **Admin "Επισκόπηση"**: section tiles restyled as an **Instagram-style collage** (two-up pressable cards with lavender accent header).
- **Public home "Εκπαιδευτικά"**: active trainings now use an accent color (lavender + accent border + "● ΕΝΕΡΓΟ"); completed stay ice-grey ("Ολοκληρώθηκε").
- **3D cards app-wide**: `ui.card` + roster cards get a soft `boxShadow` (depth).
- **Golden dust**: new `GoldenDust.tsx` (reanimated) — 16 faint gold grains drift/fade in waves on the white background, mounted behind content in the shared `Shell` (all screens). Non-interactive.
- **TrainingLevels**: top back-arrow changed from "← Εκπαιδευτικά" (`/explore/training`) to **"← Αρχική"** (`/`).
- Verified: `tsc --noEmit` clean; lint clean; admin home renders avatar + ΔΑΣΚΑΛΟΣ + stat circles (54/4/7/1); roster collage shows avatars + Level-scaled cards.

---

## v1.7 — Uniform golden "sound dust" aesthetic across all screens (June 2026)
Owner request: the main page's look (white background + golden ηχοσκόνη/sound dust) should be identical on every screen in the app. The `GoldenDust.tsx` effect already mounts globally via the shared `Shell` (Wellness.tsx), but its grains were too faint (barely visible) on inner screens, so they felt bare vs the main page.
- Enhanced `GoldenDust.tsx`: grain `COUNT` 16 → 36; two warm gold tones (`#D9B45E` / `#E7C479`); size range widened (1.5–6.5px); peak opacity raised (0.24 + 0.64·sin → ~0.88); added a soft `boxShadow` glow per grain for a luminous, shimmering feel — "moderate/visible, like the main page" per owner.
- Scope: applies to ALL screens automatically (student tabs, profile, login/register, admin, retirement notices) because they all render through `Shell`, which mounts `<GoldenDust />` behind content over the white (`wellness.white`) page.
- Verified: `tsc --noEmit` clean; web preview — golden dust now clearly visible/shimmering on login (and thus all Shell screens) over white background.

---

## v1.8 — Hero logotype + real active seminars + site symbols (June 2026)
Three owner-requested polish items, sourced from soundhealing.gr.
1. **Hero wordmark** (`PublicHome.tsx`): "Sound Healing Greece" moved to the TOP of the hero banner (`justifyContent: flex-start` + `paddingTop: insets.top + 20/34`) so it no longer overlaps the golden sound-wave graphic; restyled with an elegant wellness logotype font — **Cormorant Garamond** (`CormorantGaramond_600SemiBold`, already loaded in `_layout.tsx`), larger size + wider letter-spacing (2.5). Same wordmark font applied to the shared `AppHeader` brand (`AppNavigation.tsx`, size 21, letterSpacing 1.2) for a consistent logo across all inner screens. `fonts` import dropped from AppNavigation (was only used there).
2. **Active trainings** (`schoolGallery.ts` new `ACTIVE_TRAININGS` + `PublicHome.tsx`): the home "Εκπαιδευτικά" section now surfaces the real upcoming seminars scraped from https://www.soundhealing.gr/el/ekpaideftika-seminaria/ — Level 1 · Αθήνα 31 Οκτ–1 Νοε 2026, Level 2 · Αθήνα 6–8 Νοε 2026, Level 1 · Αθήνα 28–29 Νοε 2026 (each with its real poster image + permalink). Injected client-side as synthesized `announcement` ContentItems (future `event_end_date` → shown as active/"● ΕΝΕΡΓΟ" lavender cards, before past archive cards). Active/archive synthesized cards now open their external seminar URL on press.
3. **Sacred-geometry symbols** (`PublicHome.tsx` "Υπηρεσίες"): replaced the placeholder Ionicons (mic/leaf/people) with the site's own sacred-geometry PNGs (`rsz_7sacred_shape_5`, `flower-of-life-2`, `rsz_sacred_shape_2`), tinted `wellness.slate`; `Ionicons` import removed from PublicHome.
- Verified: `tsc --noEmit` clean; web preview — hero wordmark sits high in Cormorant serif; three active seminar cards render with posters + ● ΕΝΕΡΓΟ; services show sacred symbols.

---

## v1.9 — Live seminars + in-app detail, Ηχοθεραπεία guide, Greek labels (June 2026)
Four items (3 user-selected next-actions + 1 new request).
1. **Auto-pull active trainings** — new `backend/trainings.py` (mounted in `server.py`) scrapes
   soundhealing.gr/el/ekpaideftika-seminaria with a 6h in-memory cache. The live site sits behind a JS
   browser-challenge ("hcdn") that intermittently 403s server requests, so a RICH curated snapshot
   (`CURATED`/`FALLBACK`, 3 seminars with program/price/location/phone verified via crawl) is the base and live
   data is MERGED over it for freshness/discovery. `GET /api/trainings/active` (summaries) + `GET
   /api/trainings/{slug}` (full detail); unknown slug → 404; always ≥3 items. Image URLs percent-encoded for RN.
   `PublicHome` now fetches `/trainings/active` (fallback to the static `ACTIVE_TRAININGS`) and cards show price.
2. **In-app seminar detail** — new `src/components/SeminarDetail.tsx` + route `app/seminar/[slug].tsx` (added to the
   AuthGate public allowlist in `app/_layout.tsx`). Hero + LEVEL/ΕΝΕΡΓΟ badges, infographic fact chips, "Κράτηση
   θέσης" card with tel: + WhatsApp buttons, description, program ("Τι θα δούμε") and audience. Home cards now
   open this in-app screen instead of the external site.
3. **Ηχοθεραπεία in-app guide** — new `src/components/SoundHealingGuide.tsx` rendered at `/explore/soundhealing`
   (replaced the external link). Content sourced from soundhealing.gr/el/hxotherapeia + /therapeies: intro, stat
   infographic cards (60% / 4–8Hz / 2.400+ / 7), benefit chips, instrument pills, EXPANDABLE therapy cards (5),
   "Τι να περιμένεις" steps, in-app CTA to /explore/contact. Student never leaves the app.
4. **Greek labels** — bottom nav "Αρχική"/"Προφίλ"; eyebrows ΣΧΟΛΗ/ΤΑΞΙΔΙ/ΠΡΑΚΤΙΚΗ/ΕΥΕΞΙΑ/"Ο ΧΩΡΟΣ ΕΥΕΞΙΑΣ ΣΟΥ"/
   "ΧΩΡΟΣ ΕΡΓΑΣΙΑΣ"/"ΧΩΡΟΣ ΤΗΣ ΣΧΟΛΗΣ"; tab titles + admin filter "Journey"→"Ταξίδι" (value + comparison).
- Deps: added `beautifulsoup4` to backend requirements.
- Verified: `tsc --noEmit` + eslint clean; testing_agent iteration_9 — backend 5/5 (active/detail/404, no auth),
  frontend flows all pass (home live cards, card-tap + direct /seminar nav, soundhealing guide + expand, Greek nav).

---

## v1.10 — "Πρόσθεσε στο ημερολόγιο" on each seminar (June 2026)
Owner request: a calendar-reminder button on every seminar.
- Backend `trainings.py`: `_parse_greek_date` → `_parse_greek_range` now returns (start_iso, end_iso); added
  `start_date` to the detail dict, `_merge` fresh fields, `SUMMARY_FIELDS`, and all 3 FALLBACK items.
- Frontend `SeminarDetail.tsx`: new "Πρόσθεσε στο ημερολόγιο" button (above the booking card).
  - Web → opens a Google Calendar event template URL (all-day, title/dates/location/notes).
  - Native (iOS/Android) → `expo-calendar`: permission flow (request → denied/blocked → Open Settings),
    picks the default/writable calendar, creates the event (start 09:00 / end 18:00, Europe/Athens) with a
    1-day-before alarm; success/denial Alerts in Greek.
- `expo-calendar@57.0.5` added; `app.json` gets iOS `NSCalendarsUsageDescription` +
  `NSCalendarsWriteOnlyAccessUsageDescription`, Android WRITE/READ_CALENDAR, and the expo-calendar plugin.
- Note: the native add-to-device-calendar path works in Expo Go / a real build; the web preview uses the Google
  Calendar fallback. Verified: `tsc` + lint clean; button renders; backend serves `start_date` live.

---

## v1.11 — Calendar on home cards + Share on every seminar (June 2026)
- New shared util `src/utils/seminarActions.ts`: `addToDeviceCalendar()` (moved out of SeminarDetail; expo-calendar
  loaded lazily via dynamic `import()` so the web/landing bundle never touches it) and `shareSeminar()` (native
  `Share.share`; web → Web Share API, else clipboard copy, else open URL).
- `PublicHome.tsx`: each ACTIVE seminar card on the landing now has a compact action row — "Ημερολόγιο" button +
  a share icon button (nested Pressables with stopPropagation so they don't trigger card navigation). Completed/
  archive cards don't show it. Calendar pulls `start_date`/`location` by looking up the live training by slug.
  `LiveTraining` type extended with `start_date`/`location`; `Ionicons` re-imported.
- `SeminarDetail.tsx`: the single calendar button became a two-button row "Ημερολόγιο" + "Μοιράσου"; now delegates
  to the shared util (removed inline expo-calendar/Alert/Platform imports).
- Verified: `tsc` + eslint clean; web preview — active cards show both actions, completed card hidden, detail shows
  both buttons. Native calendar/share validated only on real device (Expo Go/build).

---

## v1.12 — Security audit remediation (June 2026)
Ran the read-only Security Audit (verdict: CONDITIONAL PASS, no Critical/High). Fixed all findings:
- **SEC-001 (Medium)** `server.py` `ProfileUpdate` now has `max_length` on name/bio/location/profile_image; `PUT
  /api/auth/me` routes `profile_image` through `studio.normalize_photo` + 256px WEBP re-encode (same guard as the
  avatar endpoint). Verified: oversized bio → 422, valid → 200.
- **SEC-002 (Medium)** `ChatIn.message` capped (1–4000 chars); `POST /api/ai/chat` adds a per-user rate limit
  (20/min). Verified: oversized → 422.
- **SEC-003 (Low)** New `backend/ratelimit.py` sliding-window limiter (IP + hashed-email buckets) applied to
  `/api/auth/login` (60/min IP, 6/10min email) and `/api/auth/register` (20/h IP, 4/h email); returns 429 +
  `Retry-After`; `Retry-After` added to CORS `expose_headers`. Verified: 429 after 6 bad logins, header present.
- **SEC-004 (Low)** FastAPI `docs_url/redoc_url/openapi_url` disabled unless `ENABLE_DOCS=true`. Verified: /docs &
  /openapi.json → 404.
- **Hardening** `trainings.py` scraper pinned to `ALLOWED_HOSTS` (rejects off-site redirects) with `max_redirects=3`.
- Audit confirmed already-solid controls: JWT HS256 + revocation, admin guards, no secret leakage, SSRF/ReDoS safe,
  CORS non-wildcard with credentials off.

---

## v2.0 — Integrated GitHub commit f77a7b8 (account onboarding, practice review, admin CMS) — June 2026
Pulled `apostolakisalex-bit/Sound-Healing @ f77a7b8` (branch shg/premium-renewal) via **clean fast-forward** onto
main (its merge-base was my own tip `70720ab`, so all prior session work is preserved as the base). Followed
`product/RELEASE_READINESS_HANDOFF.md`. SDK 57, Google/Resend, photos and aesthetic retained.
- New: Google/email onboarding → complete Profile application → email verification → admin approval gate;
  password recovery (hashed single-use 30-min tokens, reset bumps `token_version` to revoke sessions);
  DB-backed rate limiting (`auth_limits`, 429 + Retry-After); practice-review labels (Πρόχειρη / Αναμονή
  αξιολόγησης / Προς έλεγχο / Χρειάζεται διόρθωση / Εγκρίθηκε); admin pending inbox; admin seminar
  import-as-draft → edit/photo → publish/archive with CMS override; CMS sound-healing page override.
  New files: `backend/account_security.py`, `backend/practice_state.py`, `frontend/app/account-action.tsx`,
  `frontend/src/components/AccountAccess.tsx`, `frontend/src/components/PendingInbox.tsx`.
- Config: `PUBLIC_WEB_URL` (preview origin) + `EMERGENT_EMAIL_KEY`/`EMAIL_FROM_NAME` already set in backend/.env.
- Fix applied this session: AuthGate (`app/_layout.tsx`) now whitelists `account-action` (both the early-return and
  `publicRoute`) so logged-out users opening emailed verify/reset links are no longer redirected to `/`.
- Verification results: backend **51/51** unit tests + **29/29** release tests (new `backend/tests/test_release_v2.py`)
  pass; `tsc --noEmit` clean; `expo export --platform web` = **35 routes**; frontend flows (login, pending onboarding
  states, admin CMS/pending, student 4-way stats, account-action reset card, 320px small-screen + fixed bottom bar)
  verified. No production deploy performed (per request).
- KNOWN pre-deploy note: `backend/requirements.txt` (foreign pip-freeze) has a `google-genai 2.2.0` vs `httpx 0.27.2`
  conflict (google-genai is unused by the app; running env works). A fresh `pip install -r` would fail — must be
  repaired before deploying (remove/relax google-genai), but does not affect preview or tests.

## Events/Trainings Calendar (new)
- `frontend/src/components/EventsCalendar.tsx`: month calendar shown in BOTH «Εκδηλώσεις» and «Εκπαιδευτικά»
  sections (wired in `PublicExperience.tsx` above the EventGrid). Pulls ALL items itself: `/api/trainings/catalog`
  (seminars) + `/api/content/public` events. Pins past days GREY (`wellness.muted`), upcoming days PURPLE
  (`wellness.lavenderInk`). Greek month/weekday labels (Monday-first). Tapping a pinned day opens its details
  (`/seminar/{slug}` for trainings, `action_url` for CMS events). Initializes to the month of the nearest upcoming item.

## Service detail screens with photo carousel (new)
- `frontend/src/content/services.ts`: curated per-topic content + photo URLs sourced from soundhealing.gr for the 3
  service cards (ergastiria-omilies, xenodocheia-spa, etairikes-ekdiloseis).
- `frontend/src/components/PhotoCarousel.tsx`: swipeable paging carousel (dots + web chevrons).
- `frontend/src/components/ServiceDetail.tsx` + route `app/service/[slug].tsx`: topic-specific screen (symbol, intro,
  carousel, body, highlight chips, optional testimonial, contact CTA). Back link = «← Αρχική» (goes to `/`, no
  intermediate Services page). `PublicHome` service cards now route to `/service/{slug}` via `serviceSlugByTitle`.
- `service` added to AuthGate public-route whitelist in `app/_layout.tsx`.

## Treatments (new)
- Source/content adapted to Greek from https://www.soundhealing.gr/treatments/.
- `frontend/src/content/treatments.ts`: 6 treatments (slug/title/tagline/icon/hero/intro/stats/body/benefits/expect).
- `frontend/src/components/TreatmentDetail.tsx` + route `app/treatment/[slug].tsx`: infographic-style detail
  (symbol header, hero image, stat chips, "Τι είναι", benefits checklist, numbered "Τι να περιμένεις", contact CTA).
  Back link = «← Treatments» → `/treatments`.
- `frontend/src/components/TreatmentsOverview.tsx` + route `app/treatments/index.tsx`: list of all 6 treatments
  (icon + title + tagline + chevron); tapping a row opens `/treatment/{slug}`. Back link = «← Αρχική».
- Entry point: a 4th card titled "Treatments" (flower-of-life sacred symbol) inside the Home «Υπηρεσίες» section
  in `PublicHome.tsx`, matching the 3 service cards; tap → `/treatments` overview.
- `treatment` and `treatments` added to AuthGate public-route whitelist in `app/_layout.tsx`.

## Expo SDK 58 (verified)
- Project confirmed on Expo SDK 58 (expo 58.0.23, react-native 0.88.1, react 19.3.0). `expo install --fix`
  reports deps up to date; `@expo/vector-icons@15` is the SDK-58 bundled version (kept, not migrated).
- `expo-doctor` → 20/20 after: removing stray `pnpm-lock.yaml` (yarn is the package manager) and cropping
  `assets/images/icon.png` + `adaptive-icon.png` from 512x513 to square 512x512.
- `app/+html.tsx` SDK 58 web-document fix preserved.

## Events/Training — active list + archive (new)
- `EventGrid.tsx`: below the calendar now shows only ACTIVE items (event_end_date >= today / no end date);
  past items collapse under an «Αρχείο (n)» toggle rendering the same cards. Applies to both «Εκπαιδευτικά»
  and «Εκδηλώσεις». `PublicExperience.tsx` visibleItems now also retains past `events` items (not only
  `training`) so the events archive has data. NOTE: CMS `content/public` currently has 0 training/events
  items — live seminars surface via the trainings catalog (calendar + TrainingLevelCards); the EventGrid
  archive populates only when CMS training/events entries exist.




## v2.2 — Events archive, universal seminar share, clickable admin stat circles
- **Events archive (BlogList.tsx)**: In «Εκδηλώσεις»/«Εκπαιδευτικά», section-specific blog posts
  (category === section) are split by publish date vs Europe/Athens "today". Past ones collapse into a
  tappable «Αρχείο εκδηλώσεων» / «Αρχείο εκπαιδευτικών»; general sound-healing articles stay visible.
  Source: GET /api/blog?section=events|training (WordPress-backed, classified in backend/blog.py).
- **Seminar share (SeminarDetail.tsx)**: The «Μοιράσου» button now renders for EVERY seminar (active and
  archived). «Ημερολόγιο» stays active-only. Uses existing shareSeminar() helper (src/utils/seminarActions.ts).
- **Admin stat circles (AdminHome.tsx + new AdminOverview.tsx)**: The 4 overview circles (Μαθητές,
  Ενεργές εγγραφές, Τμήματα, Για έλεγχο) are now tappable CTAs with chevron + active (filled) state.
  Tapping one expands a detail list below. «Εκκρεμότητες» (PendingInbox) now lives INSIDE the «Για έλεγχο»
  circle; its value = total pending (registrations + training_requests + practices from /admin/pending).
  PendingInbox refactored to receive its useLoad state as a prop (fetched once in AdminOverview). The old
  always-visible PendingInbox panel in «Κέντρο διαχείρισης» was removed.


## Dark mode + Language (EL/EN) — COMPLETED (public surfaces)
- Theme: `src/theme/ThemeContext.tsx` (system-aware + persisted "themePreference" + toggle). ALL components
  migrated from static light-only `ui`/`palette` (Wellness) to runtime hooks `useUi()`/`usePalette()`.
  ~19 files migrated this pass (MediaLibrary, AuthScreen, Progress, RetiredNotice, Activity, MembersChat,
  AccountAccess, FormWorkspace, NavigationEditor, PendingInbox, Assessments, CyclePicker, app/evaluation,
  Experience, AdminCalendar, PublicExperience + earlier batch). No static ui/palette importers remain.
- Language: Language context (in AppNavigation.tsx) now persists "languagePreference" (AsyncStorage) and
  exposes `t(el,en)`. ROOT CAUSE of user complaint "δεν βλέπω το σύμβολο αγγλικών": the EL/EN button was
  never rendered. Fixed via new `HeaderControls` (🌐 EN/ΕΛ + ☀️/🌙) shown in AppHeader on every screen and
  FLOATING top-right in Shell when hideHeader (the landing). Verified in preview: EN switches landing + nav
  tabs to English; theme toggle flips light/dark app-wide.
- EN coverage so far: public landing (PublicHome) + public section pages (PublicExperience nav/CTAs) + bottom
  nav tabs. REMAINING: member/admin internal screens still Greek; CMS/blog content stored Greek in DB (no EN
  source — soundhealing.gr has no /en mirror). Extend on request.

## NEXT (user-chosen order): after dark mode & language -> large SECURITY/RELIABILITY package
  (exposed admin credential cleanup, restricted-seminar public access in trainings.py, Google sign-in
  account-claim in server.py, CI fix emergentintegrations optional + yarn, assessment draft-lock + invite
  link, duplicate-enrollment unification). Not started. GitHub Actions link/commit SHA need user push;
  prod credential rotation + duplicate-enrollment migration need user action on live data.

## Update (June 2026) — Owner admin accounts + static-content bilingual
- Two fixed owner admin accounts auto-seeded on backend startup (idempotent, `seed_admins.py`):
  - `manoliszografakis@gmail.com` and `apostolakisalex@gmail.com`, shared password `matestzografakis_11.11`.
  - Both are role=admin, membership approved, email verified. Role/approval re-asserted each start; password set only on first insert. Both verified logging in (200) → admin.
- Static frontend app-copy made bilingual: `content/treatments.ts`, `content/services.ts` (+ consumers TreatmentsOverview/TreatmentDetail/ServiceDetail/PublicHome). Slugs unchanged.
- Admin stays Greek under global EN via ForceGreekLanguage; ResourcesSection admin strings now bilingual (Greek in forced-Greek admin).
- Open decision: Academy level titles/descriptions come from backend `school.py` (authored curriculum) and remain in authored Greek — consistent with earlier CMS-content boundary.

- Academy level titles/descriptions now bilingual: backend `school.py` LEVELS carry `title_en`/`description_en`, `/school/catalog` returns both, `Experience.tsx` renders by language. CMS lessons remain authored.

## Update (June 2026) — Student data cleanup + sample profiles (v2.2)
- Requested: admin profile had test-mode records; wanted clean state with only 4 sample student profiles.
- One-off script `backend/clean_and_seed_students.py`: deleted ALL role=student users (56) and purged per-student collections (enrollments, practices, attendance, member_levels, training_requests, assessment_answers/invitations, member_notifications, member_chat, chat_messages, audit_events, practice_cycles, form_drafts). Admin-authored content (cohorts, CMS content, assessment templates, studio media) kept.
- Also removed stray demo admin `admin@soundhealing.gr` (Temple Keeper). Only the 2 owner admins remain. SEED_DEMO_CONTENT not set → demo admin won't re-seed.
- Seeded 4 sample students (approved + email_verified), shared password `demo-student-2026`, each with member_levels progress: Μαρία Παπαδάκη (L1), Γιώργος Νικολάου (L2), Ελένη Κωνσταντίνου (L3), Δημήτρης Αντωνίου (L4).
- Verified via live preview API: both owner admins log in (200); `/admin/members` returns exactly the 4; profile detail shows level bars; `/admin/pending` all zeros.

## Update — Card aesthetics & content (June 2026)
- Added "Όργανο Βροχής" / "Rain Instrument" to the ΤΑ ΟΡΓΑΝΑ list (`SoundHealingGuide.tsx`).
- Unified card look + slightly stronger 3D elevation via shared `cardShadow(isDark)` in `src/theme/index.ts`, applied to the base `ui.card` (`Wellness.tsx`), icon-surface tiles (`useIconSurface` in `AppNavigation.tsx`) and the education Level cards (`TrainingLevels.tsx`).
- Light/day Services tiles and education Level cards now use the Training card colour (`wellness.lavender` / `lavenderInk` border).
- Treatments service tile now uses a distinct sacred-geometry symbol (`src/components/icons/SacredMandala.tsx`, slate two-ring lotus/mandala with petals and dotted outer ring) matching the other three service symbols' aesthetic. (User rejected earlier gong logo and hexagram/Merkaba variants; mandala with petals chosen by user.)


## v2.4 — Warm "Bliss"-inspired Events + Student Profile redesign
Goal: apply a soft, warm beige/sand, tactile pill aesthetic ONLY to the Events + Student Profile surfaces, while keeping the app-wide palette + dark mode everywhere else. Events must pull REAL dates so upcoming sessions stay current.
- New warm surface palette (light + dark variants) in `src/theme/warm.ts` (`useWarm()`), mapped onto the existing theme so dark mode stays readable.
- New shared schedule hook `src/content/schedule.ts` (`useSchedule('training'|'events'|'all')`, `openSchedule`, `eachISO`, `longDate`, `monthLabel`): normalises `GET /api/trainings/catalog` (ISO start/end dates, active flag) + `GET /api/content/public` events into dated `ScheduleEvent`s, sorted, with past/upcoming derived from real dates (Athens tz). No hardcoded dates.
- `src/components/EventsCalendar.tsx` fully redesigned (warm card, month nav, "Όλα"/"Επερχόμενα" filter pills, rounded day cells with dark-fill selection, multi-day pins via `eachISO`, legend). Below it a large featured next-event card (defaults to nearest upcoming/ongoing; updates on day select). `PublicExperience.tsx` now calls it with `mode="all"` on `/explore/events` (CMS events currently have no dates, so trainings populate the calendar) and `mode="training"` on `/explore/training`.
- `src/components/UpcomingSessions.tsx`: reusable `FeaturedEvent` (photo + big time + date + title + location + Join pill), `UpcomingRow`, `ProfileGreeting`, and `UpcomingSessions` (profile list).
- `src/components/JoinPill.tsx`: split-pill "Join now" CTA (arrow chip + label); renders non-interactive when no `onPress` (used decoratively inside already-pressable cards).
- Student profile (`MemberProfile.tsx`, `!staff` only): warm greeting card (time-of-day greeting + name + tagline) + "Επερχόμενα" upcoming sessions on top; the old duplicate avatar+name header is hidden for students (kept for staff), level bars relabelled "Πρόοδος ανά επίπεδο"; level-bar label/value colours + track now theme-aware (fixed black-on-navy dark-mode bug).
- Home hero (`PublicHome.tsx`): added "Ξεκίνα τώρα" / "Join now" split-pill CTA → `/explore/training`.
- Verified (screenshots + testing_agent iteration_14 + follow-up fixes): calendar real dates/month nav/filters, featured card → `/seminar/<slug>`, multi-day pins (28 & 29 Nov), profile greeting+upcoming+progress, light & dark readability.


## v2.5 — Articles rename/grid, blog date detection, Treatments polish (Nov 2026)
User asks (verbatim intent): rename "From the blog" → "Articles" everywhere; Articles go AFTER the Events/Training archives, each a small card (photo + title + date only), side-by-side as many as fit; the Goa training was missing — the app must detect from blog posts which are upcoming trainings vs events and place them correctly; the Treatments home tile symbol was too bold/misaligned vs the other 3; translate "Treatments" → Greek.
- Backend `blog.py`: added `_event_dates(title, pub_iso)` — parses the real session date from EN/GR titles ("8-14 February 2027", "December 5 & 6", "28 & 29 Νοεμβρίου", "31 Οκτ"). Day-range & month-before/after handled; year inferred from publish date when absent (event clearly before publish ⇒ next year). `_process` now returns `event_start`/`event_end`; exposed via `/api/blog`. Fixes Goa (publish 2026-10-16 but event 8-14 Feb 2027) showing as upcoming instead of archived.
- `BlogList.tsx`: live-vs-archive split now uses the parsed `event_start` (fallback publish date), so a seminar announced months ahead stays "upcoming". Layout reordered: upcoming announcement cards → collapsible archive (Events/Training) → **"Άρθρα"/"Articles"** heading + small card grid LAST (photo + title + date only, 2–4 cols auto-fit). Announcement cards show the parsed event date range. Old "Από το blog"/"From the blog" heading removed.
- New in-app reader `src/components/ArticleReader.tsx` + route `app/article/[id].tsx` (renders `/api/blog/{id}` blocks). `app/_layout.tsx` `AuthGate`: added `article` to the public-route allowlist + `publicRoute` + a `Stack.Screen` (previously `/article/*` was redirected to "/" for guests — article taps were dead).
- `PublicHome.tsx`: Treatments tile mandala wrapped in a fixed 42×42 box and lightened (`SacredMandala size={40} strokeWidth={1}`) to align/match the other 3 service symbols; label + a11y now `t("Θεραπείες","Treatments")`.
- `TreatmentsOverview.tsx` (title + Head) and `TreatmentDetail.tsx` (back link + a11y) now show "Θεραπείες" in Greek.
- Verified via live preview: `/api/blog` event dates correct for all 30 posts; training section shows Goa as "Εκπαιδευτικό · 8 Φεβρουαρίου 2027 – 14 Φεβρουαρίου 2027"; Articles grid renders after archive on both /explore/training and /explore/events; article reader opens (back/hero/date/title/body); home tile reads "Θεραπείες".


## v2.6 — Warm "wellness" palette (no purple), Services alignment, Level cards (Nov 2026)
User asks: remove the app-wide purple/lavender look and make it a warm brown "wellness" theme like the Bliss reference photo (taupe page, cream cards, espresso/caramel accents); align the Services tile symbols AND their texts at the same height inside the cards; make the education Level cards identical to the home "Εκπαιδευτικά" section cards; also removed the hero "Ξεκίνα τώρα"/"Join now" CTA.
- `src/theme/index.ts`: rewrote `lightWellness`/`darkWellness` tokens from lavender/blue to warm browns — light: page `ice #ECE3D8`, card `white #FBF7F1`, accent `lavenderInk #6B5540` (coffee), `slate #7C6650`, ink `#2F2823`, soft surfaces `lavender/blueMist/sage` → warm sand/greige; dark: espresso page `#1A1511`, card `#262019`, warm-sand accents. Warmed the derived `accent.cyan/turquoise/indigo`, `border.glow`, and `cardShadow` tint. All components read these tokens via `useTheme()`, so the whole app shifts. (`warm.ts` for Events/Profile was already warm — unchanged.)
- Hardcoded dark-mode purple button `#7A68A0` → warm `#7A6450` in `Wellness.tsx` + `AdminHome.tsx`.
- `PublicHome.tsx` Services tiles: `justifyContent` center → `flex-start` and labels `numberOfLines={2}` + `minHeight:32`, so every symbol sits at the same top position and all texts align regardless of 1- vs 2-line titles. Removed hero `JoinPill` CTA + unused import.
- `TrainingLevels.tsx` `TrainingLevelCards`: restructured to match the home "Εκπαιδευτικά" cards — `ui.card`, 48%/100% width, `wellness.lavender` bg + `lavenderInk` border, padding 0, overflow hidden, photo-top (from `/api/trainings/gallery`, per-level with `LevelSymbol` fallback, height 100/170) then padded block (LEVEL n / title / subtitle / "Γνώρισε το επίπεδο →").
- Verified via screenshots (light + dark): warm palette everywhere, no purple/blue; Services symbols + texts aligned; education Level cards now photo-top like the home training cards; dark mode is warm espresso and readable.

