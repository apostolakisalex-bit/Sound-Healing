#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: >
  Sound Healing Greece — premium wellness app (Expo + FastAPI + MongoDB). Post-GitHub-sync
  regression verification. Synced branch `shg/premium-renewal` via fast-forward merge (no conflicts).
  Environment adaptation: packageManager set to yarn for Emergent preview (pnpm-lock/pnpm-workspace
  preserved). Verify the synced app has no regressions across auth, journey realms, academy,
  practice logging + public receiver feedback, community, AI oracle, admin resources, and the new
  school/forms/assessments modules.

backend:
  - task: "Auth (register, login, me, update profile, logout)"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: true
        -agent: "main"
        -comment: "Verified admin login via curl returns 200 with JWT. Needs full flow testing."
  - task: "Realms (list, detail, enter/unlock)"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Synced from GitHub. Needs testing."
  - task: "Academy (list levels, level detail, complete lesson -> XP)"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Synced from GitHub. Needs testing."
  - task: "Practice logging + public receiver feedback flow (no-auth feedback link)"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Create practice -> get feedback token -> submit feedback unauthenticated -> practitioner XP awarded."
  - task: "Stamps, challenges, community rankings/feed"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Synced from GitHub. Needs testing."
  - task: "AI Oracle chat (/api/ai/chat via EMERGENT_LLM_KEY)"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Requires auth + EMERGENT_LLM_KEY. Needs testing."
  - task: "Admin resources upload/list/download/delete"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Pre-existing Emergent feature carried into synced branch. Needs testing."
  - task: "School module (catalog, progress, content CRUD/publish, cohorts, enrollments, attendance, cycles, practices)"
    implemented: true
    working: "NA"
    file: "backend/school.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW module from GitHub sync. Needs testing."
  - task: "Forms module (list/create)"
    implemented: true
    working: "NA"
    file: "backend/forms.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW module from GitHub sync. Needs testing."
  - task: "Assessments module (practice assessments, invitations, admin forms activate)"
    implemented: true
    working: "NA"
    file: "backend/assessments.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW module from GitHub sync. Needs testing."

frontend:
  - task: "Public landing (unauthenticated) renders premium SHG experience"
    implemented: true
    working: true
    file: "frontend/app/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: true
        -agent: "main"
        -comment: "Smoke screenshot shows full public landing with Greek content rendering correctly."
  - task: "Auth screens (login/register) + session persistence"
    implemented: true
    working: "NA"
    file: "frontend/app/login.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Synced from GitHub. Needs testing."
  - task: "Authenticated tabs (sanctuary, journey, academy, practice, profile) + top-bar nav"
    implemented: true
    working: "NA"
    file: "frontend/app/(tabs)"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Synced from GitHub. Needs testing."
  - task: "Admin dashboard (admin.tsx) content/cohort/enrollment management"
    implemented: true
    working: "NA"
    file: "frontend/app/admin.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW 900-line admin UI from GitHub sync. Needs testing."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Members: registration (pending) + admin approval/rejection flow"
    - "Members: member profile (avatar, instruments, L1-L4 progress, practice stars)"
    - "Studio: photo library upload (Pillow re-encode) + app_photo CMS + publish"
    - "Admin calendar: create/edit/cancel internal appointments"
    - "Practice + assessments (practitioner + receiver) + admin/instructor read access"
    - "Role separation: admin -> /admin workspace, student -> tabs"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: >
      SECOND GitHub integration: merged 10 new commits from branch shg/premium-renewal (tip dc37b24) via a clean
      git merge (HEAD now 5881c95). New backend modules mounted: studio.py (media library + admin calendar,
      Pillow 12.3.0 installed), members.py (member profile, registration-pending + admin approval, member levels,
      training requests, member chat). New app_photo CMS type and homepage redesign (Greek-only, fixed bottom bar,
      sound-wave banner, 4 level cards, trainings grid with completed past cards). Backend starts cleanly (200 on
      /api/), admin login OK (admin@soundhealing.gr / temple2026), public home renders with new design (verified by
      screenshot). MongoDB data preserved. IMPORTANT: new registrations create a PENDING membership_status and must
      be approved by admin before full access (middleware in server.py line ~232 blocks non-approved users from most
      endpoints except /api/auth/*, /api/members/me, /api/notifications). Please run BACKEND regression first across
      NEW modules (members, studio, calendar, training requests, chat, app_photo CMS) PLUS prior tasks, then key
      FRONTEND flows (role separation admin->/admin vs student tabs, registration->pending, admin approval, member
      profile progress bars/stars, practice+assessments). Do NOT test certification/XP-credit rules — those are
      intentional OPEN DECISIONS (pending_policy) per product/MASTER_PRODUCT_SPECIFICATION.md.
    -agent: "main"
    -message: >
      THIRD integration + mobile/aesthetic pass (HEAD 9d2661d after merging GitHub a315535: mobile safe-areas,
      text scaling, MOBILE_QA doc). Then applied AESTHETIC changes requested by owner:
      (1) removed the small decorative wave line under the "Sound Healing Greece" wordmark on the banner (kept
      photo + wordmark + bottom sound-wave edge); (2) slimmer/more elegant bottom-nav icons (size 21, removed
      heavy shadow/bulky frame, soft lavender active pill, touch target >=44); (3) replaced the Ηχοθεραπεία
      music-note icon with a minimal custom SVG "sound spiral" (src/components/icons/SoundSpiral.tsx);
      (4) NOTIFICATIONS relocation: removed the bell from the public home banner and the shared AppHeader by
      default; the bell now shows ONLY on the student Profile (/profile) and the admin workspace (/admin) via a
      new `notifications` prop on Shell/AppHeader. Unread-dot badge + dropdown behavior preserved.
      Browser (react-native-web) checks done by main agent: home @320x568, @844x390 landscape, login @320x568 —
      no horizontal overflow (scrollWidth==innerWidth), bell absent on home+login, spiral icon renders, nav labels
      not clipped. NOTE: these are BROWSER checks only; native iOS/Android device/emulator NOT available.
      Please FRONTEND-test: (a) bell visible on /profile (student) and /admin, absent on home + public sections
      (/explore/*) + login/register; notifications dropdown still opens and marks read; (b) bottom nav navigates to
      all 5 tabs incl. spiral Ηχοθεραπεία; (c) regression on login (admin + an approved student), member profile,
      practice logging form (keyboard: active field + submit reachable), admin workspace sections, receiver feedback
      form; (d) spot responsive check of /profile, practice form and /admin at 390x844 and 320x568 for horizontal
      overflow or clipped labels. Admin: admin@soundhealing.gr / temple2026. Student: register new -> PENDING ->
      approve via admin. Do NOT test certification/XP rules (open decisions).
  run_ui: true
    -agent: "main"
    -message: >
      Added TWO integrations after the aesthetic pass:
      (C) EMERGENT GOOGLE SIGN-IN: backend POST /api/auth/session exchanges the one-time Emergent session_id with
      https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data, upserts the user by email, and mints the
      app's OWN JWT (same TokenOut as /auth/login). NEW Google users are created with membership_status='pending'
      (require admin approval) + an admin notification; existing emails are reused. Frontend: "Σύνδεση με Google"
      button on /login and /register (AuthScreen.tsx); AuthContext.loginWithSession + session_id handling on web mount
      (hash/search) and native deep links (expo-linking). Verified: /auth/session returns 401 on invalid session_id;
      Google button renders on /login (screenshot). NOTE: a full Google OAuth round-trip needs a real Google account
      and (on native) a dev build — cannot be fully automated; web preview works with a real Google login.
      (D) EMERGENT-MANAGED RESEND EMAIL: backend/emailer.py (guardrail gate + send_email, never raises). Two triggers:
      (1) member approval/rejection -> email the member (members.py decide()); (2) practice creation with a
      receiver_email -> email the receiver the feedback link {PUBLIC_WEB_URL}/feedback/{token} (server.py
      create_practice()). Env added: EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME='Sound Healing Greece',
      PUBLIC_WEB_URL. Verified: email proxy send to delivered@resend.dev returned a provider id.
      PLEASE TEST (frontend+backend, focused — do NOT re-run full suites):
      (a) Google button visible on /login AND /register; POST /api/auth/session with a bogus session_id -> 401.
      (b) Email/password login still works (admin@soundhealing.gr/temple2026) — regression.
      (c) POST /api/practices WITH a receiver_email and WITHOUT one both succeed (200) and return a feedback_token;
      the email wiring must not break practice creation (email send is fire-and-safe, never 500s the request).
      (d) Member approval/rejection decision endpoint still returns ok (regression) — email send must not break it.
      Reusable approved student from iteration_4: uitest_167043@test.gr / TestPass12345. Admin: admin@soundhealing.gr /
      temple2026. Do NOT assert certification/XP rules (open decisions). Email delivery itself cannot be asserted
      (no inbox) — only that endpoints succeed and no 500s occur.
  run_ui: true
    -agent: "main"
    -message: >
      EXPO SDK 54 -> 57 UPGRADE (frontend only; backend untouched). Bumped via `expo install expo@^57.0.0` + `expo install --fix`:
      expo@57.0.26, react/react-dom 19.2.3, react-native 0.86.3, react-native-reanimated 4.5.1, react-native-worklets 0.10.1,
      react-native-gesture-handler 2.32.0, react-native-screens 4.26, react-native-safe-area-context 5.7, react-native-svg 15.15.4,
      expo-router 57.0.24, typescript 6.0.3. app.json: removed `newArchEnabled` and `edgeToEdgeEnabled` (defaults in SDK55+),
      fixed android adaptiveIcon backgroundColor #000 -> #000000. expo-doctor: 19/21 pass (remaining 2 are non-blocking: multiple
      lock files [pnpm preserved intentionally] + non-square icon png warnings). Web bundle builds clean (1473 modules). Main-agent
      smoke screenshots verified: public home renders, student login (uitest_167043@test.gr/TestPass12345) -> profile renders with
      SVG LevelRing/stars/progress + bottom nav icons. Please run a FRONTEND regression on SDK 57 across: (a) public landing +
      explore sections; (b) login (admin + approved student) + session persistence; (c) all 5 bottom tabs navigate (Home, Ηχοθεραπεία
      spiral, Εκπαιδευτικά, Εκδηλώσεις, Profile); (d) practice logging form (keyboard: active field + submit reachable) + receiver
      feedback form; (e) admin workspace sections; (f) notifications bell visible on /profile + /admin only. Known non-fatal web-only
      dev warnings (NOT regressions, pre-existing): "shadow* deprecated use boxShadow" and "Received false for non-boolean attribute
      accessible". Do NOT assert certification/XP rules (open decisions). Admin: admin@soundhealing.gr/temple2026.
  run_ui: true
