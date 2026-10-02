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
