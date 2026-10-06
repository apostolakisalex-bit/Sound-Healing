# Account, practice and admin release handoff — 2026-10-06

Base: shg/premium-renewal at 70720abe5ecf4257a2c46c89dc5ac54a2a681c80. Preserve SDK 57, Google/Resend integration, current visuals and legacy-route retirement.

## Delivered
- Pending Google members complete first/last name, birth month/year, phone, address and declared level in Profile. Admin approval requires complete fields and verified email. Google identity alone does not grant school access or confirm previous practices.
- Profile sends email verification. Login offers password recovery. Tokens are hashed, single-use and expire after 30 minutes. Password reset revokes existing sessions through token_version. Database-backed rate limits cover authentication and recovery; responses include Retry-After.
- Practice cards show Πρόχειρη, Αναμονή αξιολόγησης, Προς έλεγχο, Χρειάζεται διόρθωση, Εγκρίθηκε. Awaiting evaluation is derived from practitioner/receiver submissions without changing stored review states. One group response is not a newly invented completion quota.
- Admin overview lists pending registrations and training applications, with practice-review count and navigation to existing review controls.
- Member statistics separate recorded non-draft minutes, reviewed practices, explicitly credited practices/minutes and historical credits. Review is not automatic level credit or certification.
- Admin imports source seminars as drafts, edits details/photos and publishes or archives. Published CMS fields override source values, including cleared fields. Imported seminar identity survives changes to its external link. Home consumes the combined active/past catalogue. No records are imported automatically by deployment.
- A published CMS sound-healing page overrides the editorial fallback. Existing photo library and publication controls remain.

## Configuration and compatibility
Set PUBLIC_WEB_URL to the deployed HTTPS frontend origin and configure the existing EMERGENT_EMAIL_KEY / verified sender used by emailer.py. Serve /account-action directly. Tokens travel in the URL fragment and are removed from browser history after loading. Do not log token-bearing links. Configure the server's trusted reverse proxies correctly: auth throttling uses request.client.host, not arbitrary forwarded headers.

Existing approved accounts without email_verified retain access; new/pending accounts must verify. New auth_limits TTL index is created on startup. No destructive data migration. Do not enable AI/XP or restore legacy records as part of this update.

## Local verification
- 51 backend unit tests pass (5 deprecation warnings), including account completion, single-use/expired tokens, reset revocation, rate limits, approval gates, practice labels, credit metrics, admin privacy and CMS publication/archive with changed external URL.
- SDK 57 TypeScript check passes.
- Expo web export passes and produces 35 routes. Local source snapshot omitted binary assets, producing a missing-favicon warning; the favicon exists in the remote tree and must be retained.
- No live Google OAuth, actual email delivery, native-device or interactive browser verification is claimed.

## Emergent acceptance before publication
1. Pull this branch without replacing newer changes; report integrated commit. Install using the existing Yarn package manager and updated lockfile.
2. Run backend unit tests, TypeScript and web export. Existing generic CI has dependency/package-manager setup issues; repair environment configuration if encountered rather than skipping tests.
3. With synthetic accounts, test Google -> incomplete Profile -> full application -> email verification -> admin approval -> school access. Test denied/pending members cannot bypass access controls.
4. Test recovery for known/unknown emails, expired/reused links, revoked sessions and repeated attempts returning 429. Confirm actual email delivery and sender configuration.
5. Submit a practice and both assessments, request correction, resubmit, review and credit. Check member and admin agree on statuses and metrics. Do not count drafts or historical credits as newly recorded hours.
6. Import seminars, edit a photo/title/price/date/link, publish and archive. Confirm home/detail update, expired seminars stay ice-grey and archived seminars disappear. Test draft changes are not public.
7. Check mobile web and native Android/iPhone safe areas, keyboard/forms, text sizes, bottom navigation and existing aesthetic. No production deployment until these checks pass; provide preview and remaining issues.
