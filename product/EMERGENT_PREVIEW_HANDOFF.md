# Emergent integration and preview candidate — 2026-09-30

Repository: apostolakisalex-bit/Sound-Healing
Branch: shg/premium-renewal
Draft PR: https://github.com/apostolakisalex-bit/Sound-Healing/pull/1
Original baseline: 548eab57b9581110ad61607a78c526723cf91a1b
Use the latest verified branch head from the PR, recording its SHA before starting.

## Visual contract
The existing Emergent application is the visual reference. Reuse frontend/src/theme/index.ts: ivory, charcoal, gold accents, Cormorant Garamond and Raleway. Preserve original logos, photography, decorative assets and intentional layouts. The initial green local redesign is superseded. New shared controls now reference the original tokens, but this alone does NOT establish visual parity: original public hero imagery, navigation and Journey compositions still require comparison in Emergent. Preserve academic/security improvements while adapting their presentation. Do not restore XP-based enrollment, fabricated statistics, private intention snippets or incorrect five-level academic structure for visual similarity.

## Before importing
Save any newer Emergent work to a separate backup branch; record its SHA and capture reference screenshots of public home, Sanctuary, School, Practice, Journey and Profile in desktop/mobile. Compare against this PR and integrate newer legitimate work. Never force-push over it. The local app directory is not a normal clone and must not be pushed wholesale. Use GitHub branch import, not a copy of the extracted local directory.

## Preview setup
Use a separate preview database with synthetic data. Keep production database, domains and published deployment unchanged. Configure MONGO_URL, DB_NAME, JWT_SECRET (new strong secret), CORS_ORIGINS (exact preview origin), and EXPO_PUBLIC_BACKEND_URL (actual preview backend URL, never localhost). Keep SEED_DEMO_CONTENT=false and AI_ENABLED=false unless separately configured. Install backend/requirements-dev.txt for verification and frontend dependencies using pnpm@11.19.0 with the frozen lockfile. Node 24 and Python 3.11 are the proposed CI runtimes; validate them in Emergent. Provision a preview admin using backend/provision_admin.py; never ship local test credentials or backend/unit_tests/preview_server.py.

## Required checks
- python -m pytest backend/unit_tests -q with PYTHONPATH=backend
- frontend: pnpm typecheck; node scripts/test-load-races.cjs; pnpm export:web
- Real MongoDB preview: validate concurrent publication/draft changes, access scoping, persistence and attachment access. Local tests use an in-memory mock.
- Student: login, enrolled lesson access/completion and reload, receiver cycle, draft/save/submit, instructor feedback, edit/resubmit, progress and logout.
- Instructor: assigned cohort only; no private drafts or unrelated students.
- Admin: CMS draft/publish/restore/archive, attachment access, enrollment pause/reactivate, attendance, history, form drafts and progress filters.
- Desktop, 390px web, actual Expo Go/native: verify fonts, assets, keyboard, navigation, uploads/downloads, clean URL /practice and no console errors.
- Compare all reference screenshots. No green-theme replacement or removed original imagery merely to simplify the implementation.

## Known boundaries
Official receiver/group invitations and complete source-approved assessments, certification rules, production retention/consent/account recovery, exhaustive directory pagination and production migration remain incomplete. The app is a preview candidate, not a completed certification system. Legacy records are preserved; no guessed academic equivalence or automatic certificates. Existing attachment history restoration is content-only. Operational history is not a tamper-proof security log.

## Rollback
Keep the previous code SHA and deployment configuration. Preview changes should not touch production data. If verification fails, return to the saved code revision and isolated preview database snapshot. Never assume a code rollback reverses data changes.

## Prompt to paste into Emergent
Continue the existing Sound Healing Greece application from GitHub repository apostolakisalex-bit/Sound-Healing, branch shg/premium-renewal, draft PR #1. This is an integration and preview task, not a new app build. First preserve any unsaved/newer work on a backup branch and record both commit SHAs. Read RELEASE_NOTES.md, product/MASTER_PRODUCT_SPECIFICATION.md and product/EMERGENT_PREVIEW_HANDOFF.md. Integrate the candidate without overwriting newer work or rebuilding the stack. Preserve the original Emergent visual identity, imagery, Cormorant Garamond/Raleway fonts and ivory/charcoal/gold palette; reuse the existing theme. Compare before/after screenshots of every principal screen. Keep the new enrollment permissions, four Levels, private practices, CMS, cycles, review workflow and progress logic. Resolve integration issues and run the documented tests. Use a separate synthetic preview database and correct preview environment URLs. Do not reset or migrate production data, activate unapproved assessment/certification rules, merge to main or publish production. Return the exact imported SHA, test results, screenshots, any remaining blockers and a working web/Expo preview for review.

Official branch import documentation checked 2026-09-30: https://help.emergent.sh/github-integration

## Public CMS acceptance added 2026-09-30
Validated code: 2e8f507eac1b350db3de518e23d86cddfd05a052, successful GitHub run 36750753215 (27 backend tests, 4 controlled lifecycle tests, TypeScript, frozen install and export). Read PUBLIC_ADMIN_GUIDE.md. Public routes: / and /explore/services, training, about, events, journal, contact. Test without login.

In isolated preview, create/edit a page introduction with HTTPS image and action; confirm draft isolation, publish and inspect public page, restore an earlier version into a draft and republish. Test site_settings name/tagline/footer/contact, menu rename/reorder/hide/reset. Confirm the menu closes after selection at 390px and that hidden menu entries remain accessible directly. Verify archive fallback behavior. No synthetic events/dates/test testimonials should become production content.

The original hero is restored, section images/actions and identity/menu settings are editable. Layouts and initial fallback copy remain code-defined. This is not a complete page builder, booking system, article detail engine or server-rendered live CMS. Static exports include fallback copy; live CMS updates load on the client. Search-engine metadata for live content needs a separate production strategy. Do not claim full SEO, native or original-screen parity from export success alone.
