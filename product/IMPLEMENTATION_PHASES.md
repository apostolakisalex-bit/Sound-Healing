# Sound Healing Greece Implementation Phases and Emergent Prompts

Version 1.0 · 2026-09-29 · Technical baseline: `apostolakisalex-bit/Sound-Healing`, commit `548eab57b9581110ad61607a78c526723cf91a1b`.

This pack is ready for staged use in the existing Emergent/GitHub project. It is not a request to generate a new app. Product authority: [Master Specification](MASTER_PRODUCT_SPECIFICATION.md). Evidence and gaps: [Source Register](SOURCE_REGISTER.md), [Form Catalog](FORM_CATALOG.md), [Technical Baseline](TECHNICAL_BASELINE.md).

Implementation has now started in the renewal candidate; see ../RELEASE_NOTES.md for exact implemented scope and remaining gates. No PR, deployment, email, notification or production migration has been performed. Each prompt is a concrete bounded implementation request, not a promise that its dependencies are resolved.

## Operating contract

Use one phase branch and reviewable PR at a time. Suggested branch prefix: `shg/`; confirm actual current repository instructions and head first. If a phase is too large, split by vertical capability while preserving dependency order. Attach the Master Specification and the relevant source excerpts to Emergent; never paste health records, credentials or private receiver responses into prompts.

Keep the current Expo/React Native frontend, FastAPI backend and MongoDB. Preserve user IDs, stored evidence, public navigation and shared visual components. Add focused modules as needed; do not replace the framework, reset collections, reseed real users or reset data. The user subsequently authorized a full visual renewal; that authorization supersedes the original visual restraint.

For each PR deliver changed behavior, files, migration impacts, focused test evidence, screenshots of changed screens where applicable, remaining open decisions, feature flag and rollback instructions. Report tests actually run, including failures. Run API tests only against a disposable test environment. New background jobs must be idempotent. Production migrations and site cutover are separate release actions after review of the concrete artifacts.

Never treat OPEN values as defaults. A blocked policy does not block independent scaffolding; it blocks publishing/activating that rule. Feature flags below are proposed flag names to implement, not flags already present in the repo. A flag rollback must not reactivate a known vulnerable handler.

## Phase dependency map

| Phase | Scope | Depends on | Completion gate |
|---|---|---|---|
| P0 | Baseline, inventory, migration plan | None | Pinned audit, test environment, data mapping gaps |
| P1 | Security and integrity corrections | P0 | Negative auth/concurrency tests, no sensitive feed data |
| P2 | Four Levels, enrollment and academic separation | P1 | AC-01/02/04; OD-05 needed for live mapping |
| P3 | Versioned form engine and invitations | P1/P2 | AC-07/08/09; OD-06/07 gate individual templates |
| P4 | Practice cycles and group sessions | P2/P3 | AC-03/05/06/10/12; OD-01–04/08 gate final counting |
| P5 | Cohorts, attendance and instructor review | P2/P4 | AC-11/13, assignment isolation |
| P6 | Explainable progress and certificates | P4/P5 | AC-14, complete policy and issuer evidence |
| P7 | Public content, CMS and SEO | P2; resource policies from P1 | AC-17, route/access/content parity |
| P8 | Journey/Profile separation and analytics | P4–P7 | AC-15, private data excluded |
| P9 | Migration rehearsal and controlled release | Relevant earlier phases | AC-16/18, restore proof and unresolved launch gates |

P7 may be prepared while form policy decisions are pending. P6 certificates and new health-data intake stay disabled if their prerequisite policies remain open.

## Reusable prompt header

Prepend this to each phase prompt, with the phase-specific block immediately below.

```text
Continue the existing private repository apostolakisalex-bit/Sound-Healing.
Read repository instructions and product/MASTER_PRODUCT_SPECIFICATION.md,
product/TECHNICAL_BASELINE.md and this phase's cited sections before editing.
If these documents are supplied as attachments, place their approved copies
under product/ without changing their meaning. Record actual branch and SHA;
the inspected baseline was 548eab57b9581110ad61607a78c526723cf91a1b.
Inspect subsequent changes before applying any baseline-specific edit.

Implement only the requested phase. Keep Expo/React Native, FastAPI, MongoDB,
existing IDs, routes where compatible, and shared design components. Do not
rebuild or reseed the app. Distinguish verified source requirements, product
design decisions and OPEN items. Never invent missing form choices, Level
requirements, deadlines, certificates, payment behavior or production data.

Use a feature branch, additive/versioned changes and synthetic test data.
Do not run write tests against production. No secrets or personal receiver
data in code, logs, prompts or reports. Preserve legacy records and add an
explicit adapter rather than silently relabeling their meaning.

Deliver a reviewable PR/diff, focused tests, migration/dry-run evidence when
applicable, feature flag behavior, rollback procedure, and exact remaining
blockers. Update the Master Specification change log only for approved
decisions or verified implementation status. Do not publish or migrate
production as an incidental part of implementation.
```

## P0 Baseline and migration inventory

**Deliverables:** current route/API/model inventory, actual dependency/lockfile status, synthetic fixtures, baseline test report, legacy mapping matrix, release environment checklist. Owner: technical implementer. No behavioral change.

```text
P0: Audit the existing app against the Master Specification without changing
application behavior. Inspect backend/server.py, frontend/app routes,
src/constants/levels.ts, src/content/public.ts, AuthContext, ResourcesSection,
the package manifests and tests. Confirm which behavior is implemented versus
historical memory/PRD.md claims. Report changes since the pinned baseline.

Create a migration inventory covering users, five legacy level IDs, lessons,
practices, embedded feedback, feedback links, XP, stamps and resource parents.
Use synthetic records and define how real aggregate counts will be obtained
with authorized access later. Do not infer school enrollment from XP.

Set up a disposable test database and mock email/LLM dependencies. Document
the configured test target before running tests. Identify fixed credentials
without reproducing them; establish a remediation plan. Produce route/API
compatibility and data mapping reports with mapped/unmapped/ambiguous states.
List exact unresolved OD dependencies and propose the smallest P1 diff.
Do not install a replacement framework or create production accounts.
```

**Gate:** audit and test limitations explicit, no production records altered. **Rollback:** docs/test scaffolding revert only.

## P1 Security and data integrity

**Deliverables:** targeted fixes for B02–B10/B12–B14, secure negative tests, token/session plan. Owner: backend/security implementer. Health-data expansion remains off.

```text
P1: Correct the concrete integrity/privacy findings in TECHNICAL_BASELINE.
Validate lesson existence, parent relationship and current authorization
before completion. Prevent arbitrary lesson IDs earning XP. Make duplicate
and concurrent lesson/feedback submissions idempotent using database-backed
uniqueness/atomic state changes; account for the deployed MongoDB transaction
capabilities. Test failure between evidence write and reward write.

Validate practice date, positive duration and required safety confirmation
server-side for submitted records. Remove practitioner free-text intention
from community responses. Replace fabricated challenge counts with actual
counts or no displayed count. Bind AI session identifiers to the authenticated
owner and scope every history query by owner; use generic external errors.

Validate resource parents, decoded size and supported content; do not default
missing parents to unlocked access. Restrict CORS to configured origins,
document session revocation strategy, and remove fixed credential assumptions
from tests. If a referenced credential is live, require the release owner to
rotate it through the approved secret mechanism; do not print it.

Add cross-user, unauthorized role, nonexistent lesson, direct-API invalid
input and concurrency tests. Keep routes compatible where safe. Do not add
new School rules or interpret receiver feedback as academic approval.
```

**Gate:** no unauthorized read/write or double award in tested paths; report unresolved infrastructure dependencies. **Rollback:** forward fix or disable affected write endpoint; never restore the vulnerable reward path.

## P2 School foundation and four Levels

**Deliverables:** SchoolLevel, curriculum/ruleset versions, enrollment/grants foundation, compatibility projection. Flag: `school_v2`.

```text
P2: Add the four academic IDs L1/L2/L3/L4 and separate academic enrollment,
progress and entitlement from Journey XP/rank. Implement versioned curriculum
and RequirementSet structures with explicit SOURCE/DESIGN/OPEN provenance and
nullable unresolved thresholds. Attach the applicable versions to enrollment.
Do not activate conflicting numeric rules.

Adapt Academy/public preview to the four-Level model while retaining legacy
L3A/L3B IDs and raw records. Keep Journey XP/history intact. Add legacy mapping
status; do not automatically grant L3 completion or school material access to
old high-XP users. Live entitlement migration waits for OD-05 and a per-record
mapping review. Stage adapters behind school_v2.

Update resource access checks to use explicit school grants/enrollments for
school material, separate from Journey resources. Enforce this server-side,
including direct detail/download calls. Update misleading XP-certification
copy and tests without claiming the rest of CMS is complete. Verify AC-01,
AC-02 and AC-04, including a high-XP user without enrollment and an enrolled
student with low XP. Supply dry-run mapping and rollback reader behavior.
```

**Gate:** four public/School IDs, separate entitlements, preserved legacy history. **Rollback:** disable new academic writers and preserve new records; keep security access fixes.

## P3 Versioned forms and invitation lifecycle

**Deliverables:** template renderer/validator, immutable versions, capability tokens, parity fixtures. Flag: `forms_v2`.

```text
P3: Build a versioned form engine using FORM_CATALOG and original source
excerpts. Support text, numeric, date, single choice, multi-select, Other,
conditional visibility and requiredness without changing source semantics.
Store stable option/question codes plus displayed locale and version.
Unknown type/options/requiredness must block that template's publication.

Create draft definitions for the available L1 receiver, L2 receiver, L2
practitioner and group practitioner sources. Missing L1 practitioner/group
participant forms remain explicitly unavailable. Do not borrow L1 comfort
options for L2 or guess the meaning of Option 6. Separate printable variants.
Retain old 1–10 responses under legacy_receiver_v0, without rescaling.

Implement scoped hashed invitations with independent requested_due_at and
expires_at, revocation, atomic single submission and retry idempotency. A
group session must support multiple invitations/responses. Do not call
receiver-linked feedback anonymous. Display minimum session context only;
never expose intake, email or other submissions through the public token.

Validate schema on both server and client. Start scales unanswered. Test
version changes after invitation, hidden required fields, malformed options,
concurrent/reused/revoked tokens and public data minimization. No live form
publication until its OD-06/07 issues are resolved.
```

**Gate:** AC-07/08/09; missing templates visibly pending. **Rollback:** stop new invitations and retain a compatible reader for already-issued versions.

## P4 Individual cycles and group practice

**Deliverables:** PracticeCycle, SessionRevision, individual/group forms, evidence states. Flag: `practice_v2`.

```text
P4: Extend existing practice routes/screens with enrollment-bound sessions,
receiver-owned cycles, draft saving, submitted revisions and separate evidence
and review status. Reuse the current UI components. Implement the Master
Specification's L1/L2/L3 flows and an explicitly pending-policy L4 workflow.
Do not infer an enrollment for legacy practices from the user's current XP.

Keep preparation, signed intake evidence and optional interview separate.
Do not collect expanded health data in production while OD-11 is open.
For L2, bind first-session assessment to the cycle and recurring reflection
to each session; changes-since-previous is conditional. Never require exactly
four sessions merely because that wording appears in F03.

For groups record participant_count, duration, facilitator reflection and
multiple evaluations without forcing names for every participant. Sharing
notes are not participant feedback. One group session remains one credit
candidate regardless of response count. Preserve actual duration and session
count independently, with pending_policy where a target conflicts.

Late feedback is flagged, not auto-rejected after 48 hours. Submitted edits
produce new revisions and invalidate current review eligibility. Test AC-03,
05,06,10,12 plus draft/network retries and legacy read compatibility. Keep
final counting disabled for unresolved OD-01–04/08 rules.
```

**Gate:** genuine typed workflows, no invented L4 requirement. **Rollback:** stop new writers, keep all revisions readable and exportable to authorized users.

## P5 Cohorts, attendance and instructor review

**Deliverables:** instructor workspace, cohort sessions, attendance, review queue. Flag: `instructor_v2`.

```text
P5: Add scoped instructor/admin workflows for cohorts, enrollments, meetings,
attendance and practice review. Keep public events distinct from cohorts.
Support in-person, online teaching and support meetings with actual attended
minutes and unmarked/present/partial/absent/excused status. Make corrections
auditable. Link makeup records without double-counting time.

Build a review queue filtered by assigned cohort, level, learner and status.
Show exact session revision, rule version, required evidence and separate
practitioner/receiver submissions. Provide approve, needs_revision and reject
with recorded actor/time/reason. Prevent self-approval and cross-cohort access.
Receiver identity remains masked unless separately granted; content editors
must not gain access to practice data.

Do not assume an attendance percentage or that feedback arrival approves a
session. Pending policy/evidence remains visible. Add optimistic concurrency
for two reviewers editing the same decision/attendance record. Test AC-11/13,
assignment revocation, correction history, makeup deduplication and revision
re-review. Only authorized users can export their permitted scope.
```

**Gate:** assignment isolation and exact-revision review. **Rollback:** disable new admin writes, retain audit/read views.

## P6 Progress and certificates

**Deliverables:** explainable requirement evaluator, certificate lifecycle, preview templates. Flag: `certificates_v2`.

```text
P6: Implement server-side progress by requirement, not a fabricated weighted
percentage. Return met/not_met/pending_policy/pending_review with rule IDs,
evidence IDs and missing requirements. Count only eligible approved revisions
and enforce unique session credit within the applicable scope. Keep counts,
minutes, receiver distribution, attendance and feedback separate.

Implement attendance, level-completion and practitioner-completion certificate
types as separate objects. Issuance requires an authorized issuer and an
immutable evidence/rules/template snapshot; add unique serials, idempotency,
revocation and linked reissue. Never use XP or a legacy rank as certification.

Build previews using synthetic data. Do not issue real certificates while
OD-01–04/09/10 or relevant privacy decisions are unresolved. Do not invent
signatures, accreditation or total training hours. Public verification remains
off until its disclosure policy is settled. Test duplicate issuance, revoked
status, changed evidence after approval, policy-version pinning and blocked
L4 completion. Verify AC-14 and explain each failed/pending requirement.
```

**Gate:** issuance only with approved policy and exact evidence. **Rollback:** disable issuance, preserve issued serials/status and verification consistency.

## P7 Public experience, CMS and SEO

**Deliverables:** content revisions, clear visitor journeys, approved content inventory, SEO/redirect plan. Flag: `cms_v2`.

```text
P7: Evolve the existing landing page and public content file rather than
rebuilding the frontend. Provide clear paths for session enquiries, training
interest and existing students. Use verified public source material with
per-field provenance and review dates; remove unsupported existing promises.
Keep four-Level School descriptions consistent with the Master Specification.

Add draft/review/published/archive content revisions for pages, services,
events, FAQ, bio, testimonials and learning resources. Separate public CMS
permissions from confidential practice access. Preserve resource versions and
references when replacing files. Do not import private forms/records into
public assets. Confirm rights for photos/testimonials before publication.

Implement accessible Greek/English content handling and honest empty/loading/
error states. Show only actual event dates, venues, prices and availability.
Keep enquiry CTAs until booking/payment scope is approved under OD-13.

Audit Expo web rendering for indexable content, canonical/hreflang/sitemap,
metadata and redirects before proposing another frontend. Keep private routes
out of indexing and enforce real authorization. Test AC-17, mobile navigation,
keyboard access and draft leakage. Deliver preview plus cutover plan; no
domain switch or live publishing as part of this phase.
```

**Gate:** approved source-linked copy, CMS access tests, public route parity. **Rollback:** point readers at last approved content revision, retaining stable URLs.

## P8 Journey, Profile and analytics

**Deliverables:** independent participation display, privacy settings, defined metrics. Flags: `journey_v2`, `analytics_v2`.

```text
P8: Finish the separation of Journey from School throughout Sanctuary,
Profile, realms and stamps. Preserve XP and existing realm history. Clearly
label participation milestones separately from verified school achievements.
Do not publish a professional title based only on XP. Implement unique reward
events only for the approved OD-14 policy; no rewards for positive ratings or
additional group feedback responses.

Add profile language/privacy/notification preferences and request workflows.
Student directory/community visibility must be opt-in and contain no receiver
data. Keep private journal entries private. Aeon must not receive practice or
health context; expansion waits for its approved processing policy.

Implement analytics with explicit definitions: public conversion, school
operations and form-version-specific experience reports. Use server-derived
authorized data, no fake seed counters. Preserve categorical/multi-select
meaning; do not average L1/L2/legacy guidance together. Record sample size and
missingness, apply approved small-group disclosure rules, and exclude free
text/tokens/health data from external analytics. Test AC-15, opt-out behavior,
scope isolation and accurate group/session denominators.
```

**Gate:** no academic XP dependency, no sensitive analytics leakage. **Rollback:** stop new analytics/reward writers; preserve ledger and source data.

## P9 Rehearsal, release and handover

**Deliverables:** migration dry-run/restore reports, UAT evidence, approved release manifest, rollback rehearsal and operator guide.

```text
P9: Prepare controlled release of approved completed phases. Re-audit current
head against the accepted PRs and list any new changes. Verify all applicable
Master Specification acceptance criteria on disposable/staging data. Exercise
student, receiver, assigned instructor, unassigned instructor and content
editor journeys on responsive web and supported native targets.

Rehearse additive idempotent migrations on a sanitized representative dataset.
Compare IDs, counts, raw legacy answers, XP, resource references and new
evidence before/after. Run migration twice and show no duplicate credit or
certificate. Restore the backup in a separate environment and verify reads.
Rehearse flag rollback without losing post-migration records or reopening
known security weaknesses.

Provide a release manifest of policy/form versions, resolved decision IDs,
enabled flags, environment configuration, operator permissions and monitoring
checks. Explicitly exclude unresolved policies/features from activation.
Sensitive-data launch requires OD-11; live certificate issuance requires its
academic and issuer gates. Stop at a concrete staging release and reviewable
production rollout command/runbook. Deploy only under the separately agreed
release authorization, not by assumption.
```

**Gate:** restore and rollback evidence, no orphaned records, known limitations visible. **Handover:** instructor guide, support path, privacy/incident owner and changelog updated.

## GitHub review template

```text
Problem and resulting behavior:
[Concrete trigger and before/after behavior]

Scope:
Phase P__; requirement IDs __; decisions resolved __; still OPEN __.

Evidence:
Baseline SHA __; changed routes/models __; source/form versions __.

Validation:
[Tests actually run, environment, results, relevant screenshots]

Data and rollout:
[Additive changes, dry-run counts, flags, recovery/rollback]

Remaining release gates:
[Exact unverified or blocked items; no blanket “all done”]
```

## Status at handoff

Specification and prompts complete as version 1.0. P0 source inspection partially performed by this task; deployment/test environment inventory and data rehearsal remain for implementer. P1–P9 are planned, not executed. The [Master Specification decision register](MASTER_PRODUCT_SPECIFICATION.md#14-ανοιχτές-αποφάσεις) governs activation.
