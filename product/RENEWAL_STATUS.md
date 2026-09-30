# Renewal status — 2026-09-30

Draft PR: https://github.com/apostolakisalex-bit/Sound-Healing/pull/1
Branch: shg/premium-renewal
Validated code revision: 65962c7eadc57677aa1c905081937bf11046a55f
GitHub Actions: https://github.com/apostolakisalex-bit/Sound-Healing/actions/runs/36702934150

23 backend tests, 4 controlled request lifecycle tests, TypeScript and web export pass. Clean Linux dependency installation now records an explicit skip for the unrs-resolver install script in frontend/pnpm-workspace.yaml; default dependency build protections remain enabled.

Implemented: enrollment-based access, four Levels, CMS draft/publication/history restoration, cohorts, attendance, enrollment pause/reactivate, practice cycles/review, immutable assessment drafts, scoped progress, lesson completion and admin activity. The original ivory/charcoal/gold palette, fonts and public hero image are reused. Admin can publish hero title, summary and image changes.

Browser evidence includes synthetic student draft/submission/return/resubmission, admin CMS and attendance-to-progress, and a 390px layout. Full original-screen parity, real MongoDB concurrency and native Expo checks remain preview gates.

No merge, production migration or Emergent deployment. Sources remain read-only. Official assessment activation/invitations, confirmed certification policies, production privacy/retention/account recovery and exhaustive directory pagination remain incomplete. See RELEASE_NOTES.md and product/EMERGENT_PREVIEW_HANDOFF.md.

The local app directory has an independent extracted-baseline Git history. Do not push it wholesale. Remote updates use the current GitHub branch parent and preserve existing assets.
