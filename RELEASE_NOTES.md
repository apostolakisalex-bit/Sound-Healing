# Sound Healing Greece · renewal release candidate

This branch builds on upstream 548eab57b9581110ad61607a78c526723cf91a1b.
It has not been deployed. The new shell replaces the main experience; legacy
practice records and detail routes remain available. No database reset is used.

## Run independently of Emergent

Backend: Python 3.12, install backend/requirements.txt, configure the variables
in backend/.env.example, then run `uvicorn server:app --host 0.0.0.0 --port 8000`
from backend/. Use your own MongoDB and secret manager. Never commit .env.
Frontend: Node 22+, `corepack pnpm install --frozen-lockfile`, configure
EXPO_PUBLIC_BACKEND_URL, then `pnpm exec expo start --web` or
`pnpm exec expo export --platform web`. Serve dist with clean-URL support and
SPA fallback for dynamic practice/feedback links. CORS_ORIGINS must include
exactly the browser origins that need access. Native app IDs are preserved.

The AI integration is optional and disabled by default. It is not required
for authentication, School, Practice, content or administration. To enable the
legacy assistant, install requirements-ai.txt and configure its provider key.

Provision a first admin only with the explicit interactive provision_admin.py
command, against the approved target database. Existing admins are preserved.
The application no longer creates an administrator with fixed credentials.
Operators must rotate any previously seeded credentials before a live release.

## What works in this candidate

- Greek wellness shell for public, home, School, Journey, Practice, Profile,
  sign-in and registration; four academic Levels separated from historical XP.
- Admin draft/edit/publish/archive content, revision conflict detection and
  publication history; lesson and Journey consumption; document uploads.
- Cohort creation, explicit enrollment, instructor-scoped attendance and
  practice review; private drafts, correction and resubmission.
- Legacy lesson/resource authorization, feedback atomic submission without
  automatic academic reward, private practice feed removal, disabled optional
  AI and owner-bound chat history, explicit CORS configuration.
- Export API for content, cohorts, enrollments and attendance, excluding
  passwords, receiver feedback and practice reflections.

## Release gates — not implemented or certified

Official form activation is blocked by OD-06/07; no substitute questionnaire
is presented as official. Per-person group invitations and activated
official evaluation templates and end-to-end certificate policy are
not delivered by this candidate. Instructor review here is preliminary and
explicitly does not count for certification. Legacy feedback still uses its
historical schema. Policy approvals, retention/deletion workflows, token
expiry/rotation, account recovery, audit-history UI, full content rollback UI,
media streaming and pagination need further work before broad production use.

No legacy L3A/L3B records or XP were silently mapped to enrollment. Students
need explicit enrollment before accessing protected educational material.
This is an intentional access change that must be rehearsed with real account
roles in staging. Official certificates remain disabled. No production health
records were loaded or migrated. Content and old collections are preserved.

## Verification

Run `PYTHONPATH=backend python -m pytest backend/unit_tests -q` with the dev
requirements. Unit tests use in-memory Mongo-compatible fixtures, not a live
Mongo server; they do not establish real distributed concurrency guarantees.
Run `pnpm exec tsc --noEmit` and the web export from frontend/.
The isolated preview_server.py is a loopback-only test helper; never deploy it.
Existing backend/tests are historical external API tests and must not run
against production or use the old seeded admin account.

## Emergent integration and rollback

Review this branch/PR, then pull the chosen branch into a staging Emergent job.
Preserve the existing database and environment secrets. Confirm API base URL,
CORS origins and admin access. Create a test cohort, enroll synthetic users,
publish a lesson, record attendance and review a practice across different
roles. Check public pages, mobile widths and native Expo Go separately.
Do not Re-publish production until the remaining release gates are resolved.
Reverting the new UI does not require dropping new collections, but never
restore old insecure handlers as a rollback. Take and rehearse a database
backup before any later migration; no destructive migration is included here.


## Practice continuation

Individual cycles now bind receiver codes to active enrollments. Planned session
counts are optional personal planning, not school policy. New individual drafts
and edits require a matching cycle. Group sessions carry a separate participant
count (at least two by the meaning of group, not a certification threshold).
Draft edits use revision checks; submission/review check the read revision;
review history is retained. Staff only see cycle plans referenced by submitted
practices in their assigned cohorts.

Admin assessment authoring now saves immutable draft snapshots with typed
questions, verified-option fields and explicit unknown required states. Source
catalog blockers cannot be removed by draft input. No activation, recipient
invitations or answer collection is exposed by this new module.

Validation: 16 isolated API tests and TypeScript pass. Web export passes with
the same missing local favicon warning. Browser keyboard smoke checks created
a synthetic cycle and linked draft and opened the forms catalog. No live data
or Emergent deployment was changed.

## Admin controls continuation — 2026-09-29
- Publication history can restore content fields into a new draft with revision conflict protection. Published content stays unchanged until explicit publication. Attachments are not rolled back; the UI explains this.
- Administrators can pause/reactivate enrollments without removing practice or attendance records. Paused enrollment blocks academic entitlement and practice submission.
- Duplicate enrollment creation returns the existing status instead of falsely reporting active access.
- Validation: 18 backend tests pass; frontend TypeScript passes. Progress dashboard remains pending, as do official assessment activation and certification rules.

## Progress dashboard — 2026-09-29
Students now see per-enrollment attendance and practice counts/minutes in School; administrators and assigned instructors have a Progress workspace section. Paginated enrollment lists use full database aggregation for each enrollment, rather than truncated UI lists. Staff totals exclude private drafts and expose no reflection bodies. Present minutes alone count toward attendance hours; no certification percentage or eligibility is inferred.
Validation: 19 backend tests pass, including 501-record aggregation, ownership, instructor scope, draft privacy and pagination validation. TypeScript and web export pass. Local browser smoke test: synthetic 60-minute attendance appears as one hour in the admin dashboard. Official form activation, receiver invitations, approved certification rules and production privacy/account recovery remain release gates.
