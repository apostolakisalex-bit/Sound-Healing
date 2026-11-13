# Sound Healing Greece Technical Baseline

Read-only source audit · 2026-09-29 · [repository](https://github.com/apostolakisalex-bit/Sound-Healing) · pinned commit `548eab57b9581110ad61607a78c526723cf91a1b`.

This report describes inspected source, not a running deployment or a penetration test. No backend was started, no production data was queried, and no historical test report was treated as a fresh passing run. The source tree was inventoried; generated Metro cache files were excluded from product analysis. The complete filtered inventory is in `work/evidence/repository_inventory.json`.

## Preserve and extend

| Surface | Verified implementation | Evolution |
|---|---|---|
| Frontend | Expo ~54, React 19.1, React Native 0.81.5, Expo Router ~6, TypeScript | Keep app, routing, theme and shared components |
| Backend | FastAPI, Motor/MongoDB, Pydantic, JWT/bcrypt in `backend/server.py` | Add scoped services/models incrementally; no database rewrite |
| Authentication | register/login/me/profile; auth context and route gate | Retain user IDs; add session revocation and scoped grants |
| Public | substantial `frontend/app/index.tsx`; static `src/content/public.ts` | Correct sourced content, then introduce CMS adapters |
| School | academy list/detail, seeded lessons, completion endpoint | Add enrollment/rules/attendance, separate from XP |
| Practice | create/list/detail, single receiver fields | Add draft/revision/cycle/group model with legacy adapter |
| Feedback | no-login `/feedback/[token]`, one embedded feedback object | Preserve legacy answers, add versioned templates/invitations |
| Journey | seven realms, stamps, challenges, XP UI | Keep as separate participation system |
| Resources | admin upload/delete and protected download, shared ResourcesSection | Retain UX; fix validation and entitlement policy |
| Profile | avatar, bio, location, stamps/progress | Add school achievements and privacy controls |
| Aeon | external LLM integration and stored chat messages | Restrict scope/ownership; do not add receiver data |

`memory/PRD.md` is historical. It says resources are deferred, but resource handlers and `ResourcesSection.tsx` exist in the inspected commit. Its “implemented” declarations are not proof of deployment status. The inspected route tree has no dedicated attendance/cohort/certificate/instructor dashboard. The existing admin resource capability is not a complete school administration system.

## Concrete findings and implementation order

Line numbers below refer to the pinned `backend/server.py`, available [here](https://github.com/apostolakisalex-bit/Sound-Healing/blob/548eab57b9581110ad61607a78c526723cf91a1b/backend/server.py).

| ID | Evidence | Consequence | Required phase |
|---|---|---|---|
| B01 | L47: five IDs L1/L2/L3A/L3B/L4; compute_level uses XP; frontend constants repeat this | Academic and game progress conflated | P2 |
| B02 | L566 complete_lesson uses supplied level/lesson keys without looking up lesson or checking access | Arbitrary distinct lesson IDs can trigger XP awards | P1 |
| B03 | L693 submit_feedback checks then writes in separate operations; awards XP and recalculates user level | Concurrent requests can race; feedback is treated as approval | P1, P2, P4 |
| B04 | L643 create_practice lacks level/enrollment/cycle/review; duration int has no positive constraint and safety flag defaults false | UI checks do not protect direct API calls | P1, P4 |
| B05 | L141 and feedback UI use generic 1–10 scales, default UI answers 5 | Does not match supplied L1/L2 forms; defaults can become unintended responses | P3 |
| B06 | L739 community_feed returns practice intention to authenticated community | Sensitive free text can become visible beyond its intended audience | P1: remove practice free-text from feed |
| B07 | L784 client can supply session_id; L818 history filters by derived session_id, not user_id | Ownership boundary is not explicit; cross-session behavior requires targeted validation | P1 |
| B08 | L836 missing resource parent falls back to L1/0; L875 trusts declared size/type and stores base64 | Invalid references and oversized payloads need rejection; access model is XP based | P1 validation, P2 entitlement, P7 storage |
| B09 | L963 wildcard CORS with credentials; L31 long-lived JWT; logout context removes client token only | Review origins and server-side session controls | P1 |
| B10 | L599 challenge participants are fabricated from hash | Placeholder counts presented as actual engagement | P1 |
| B11 | `frontend/src/content/public.ts` FAQ says five levels and XP unlock; certification/accreditation copy exceeds established evidence | Incorrect public promise | P2/P7 |
| B12 | `backend/tests/test_api.py` contains fixed admin credentials | Establish whether credential is ever live; replace test fixture and rotate if applicable without reproducing secret | P0/P1 |
| B13 | Current sequential duplicate tests do not cover concurrent submissions | Existing tests are insufficient for new integrity contract | P1/P3/P4 |
| B14 | Legacy feedback link has no explicit expiry/revocation fields in inspected handlers | “Expired link” copy does not prove expiry is enforced | P3 |

The owner filter on individual practice reads is a useful existing control and should remain. Do not describe the whole backend as unauthenticated. Admin resources already use a role check. Extend those checks to scoped instructor access rather than discarding them.

## Migration contract

1. Record actual branch/head and deployment version before editing. If different from pinned SHA, inspect the diff first.
2. Inventory synthetic/staging data before touching production. Classify users, legacy levels, completed lessons, practices, feedback tokens/answers, resources, XP and chat references. Do not place real data or credentials in reports.
3. Create new versioned collections/fields alongside old data. Preserve raw feedback with `legacy_receiver_v0`, old IDs and XP; do not infer SchoolLevel from journey rank.
4. Produce a mapping report with `mapped/unmapped/ambiguous` states and rule/decision references. L3A/L3B mapping and real educational entitlements require OD-05.
5. Use idempotent migration keys and compare before/after counts, hashes where suitable, reference integrity and a sample of authorized record views. Never seed fake academic completion.
6. Take and test a recoverable backup before data writes. Roll back using feature flags and compatible readers; retain newly written evidence for forward recovery. No blanket collection drops.
7. Update test expectations deliberately: five-level/auto-XP tests describe legacy behavior and must not become the target school contract.

## Test boundaries

Use a disposable test database and mocked external LLM/email in normal suites. The current tests use a configured backend URL and include writes plus external AI interaction; do not run them blindly against the user's deployment. Confirm target host before running.

For each change: focused backend tests, frontend type/lint checks applicable to changed files, and a smoke walkthrough of affected web/mobile routes. Add authorization, concurrency, idempotency, migration parity and negative tests for new state transitions. Do not claim live end-to-end verification from static source inspection.

## Scope boundaries

No conversion to Next.js, Supabase, a new auth provider, a new UI kit or a fresh app scaffold is justified by this specification. SEO rendering, database transactions, file storage and platform-specific secure token storage require focused validation, not a speculative rewrite. Native runtime compatibility and production configuration remain unverified.
