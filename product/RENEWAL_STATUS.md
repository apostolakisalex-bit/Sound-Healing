# Renewal status — 2026-09-29

Draft PR: https://github.com/apostolakisalex-bit/Sound-Healing/pull/1
Branch: shg/premium-renewal (see PR for current head)

19 API tests pass. TypeScript and web export pass. Local favicon warning persists because upstream binary assets were not extracted; upstream assets remain preserved in the remote tree.
Browser smoke: admin CMS, forms catalog, responsive layout and synthetic attendance-to-progress flow.
Implemented: admin content draft/publication/history restoration, enrollment pause/reactivate, practice cycles, immutable assessment drafts, and per-enrollment attendance/practice metrics with instructor scoping and private-draft protection.
No merge, production migration or Emergent deploy. Sources remain read-only.

The local app folder has an independent extracted-baseline Git history. Do not push that history to main. Remote changes use the GitHub connector against the current branch parent.

Official form activation, invitations, confirmed school/certification policies and production privacy/account recovery remain release gates. See app/RELEASE_NOTES.md.
