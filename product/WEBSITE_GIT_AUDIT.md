# Website content and GitHub transfer audit — 30/09/2026

## GitHub verification
Audited branch shg/premium-renewal at 07f7a72c5ae98471092bf08d040cd00f5224f29f, PR #1. GitHub Actions run 36756001593 completed successfully. main has not been used as the renewal delivery branch.

Compared 89 local files after excluding dependencies, caches, build output, secrets and virtual environments against the complete remote Git tree (not truncated). 65 matched Git blob hashes, 23 differed only in BOM/trailing whitespace/newline representation and were confirmed equal after normalization by reading remote file contents. The sole local-only file is backend/unit_tests/preview_server.py, intentionally excluded: synthetic local test server, not deployment code. No substantive local application/configuration/specification change was missing from this audited branch.

Ten frontend/assets files remain in the remote repository. Original image URLs also refer to externally hosted Emergent assets; repository presence does not make those external files self-contained. The remote tree retains 7,540 legacy Metro cache files: cleanup is advisable in a separate reviewed change, but no bulk deletion was performed. Environment-name inventory found only backend/.env.example and frontend/.env.example; this is not a full secret-history audit.

Git transfers source, manifests, tests, assets tracked in Git and product documents. It does NOT transfer MongoDB content, admin publications, enrollments, user accounts, uploaded runtime files, credentials, environment variables or unsaved Emergent work. Local synthetic test data is not production content. Back up/export real runtime data separately before any migration. Use the branch import handoff, configure a separate preview database and preserve newer Emergent work before comparison.

## Website-to-app mapping
| Source | Existing app | Recommended next content |
|---|---|---|
| https://www.soundhealing.gr/ | Short public introductions and six sections | Clear entry paths for private sessions, groups, training and hospitality collaborations; selected authentic imagery/video links |
| https://www.soundhealing.gr/treatments/ | General services introduction | Separate service cards for Sonic Sound Massage, Sound Bath, Integral Sound Healing, Tuning Fork and Vibroacoustic sessions. Include what happens, format, preparation and contact action; avoid copying outcome claims as verified facts |
| https://www.soundhealing.gr/el/ekpaideftika-seminaria/ | Four-Level overview, school workflows | Detailed learning topics/audience per Level and enquiry links. Public session durations/hours are source content, not automatic practice/certification rules |
| https://www.soundhealing.gr/about/ | Short bio and original founder photo | Curated biography, training background and hospitality collaborations. Claims/counts should remain attributed, editable and date-checked |
| https://www.soundhealing.gr/press-media/ | Not yet a dedicated block | Press/media links within About: TEDxAthens, Flow! Summit, interviews and podcast. Verify linked destination before publishing |
| https://www.soundhealing.gr/soundhealing-events/ | Empty publication state with source link | Real event records with date/time/timezone, venue, image, registration URL, cancellation and past-event status; do not turn events into enrollments automatically |
| https://www.soundhealing.gr/contact/ | Link to existing official contact form | Contact channels and FAQ, controlled by admin. Do not copy the website consent policy as though it covers the app's separate sensitive-data processing |

## Event snapshot, not imported
At 30 September 2026 the source lists Aerial Sound Bath on 4 October; L1 Athens on 31 October–1 November and 28–29 November; L2 Athens on 6–8 November. It also still displays 26–27 September events, which are already past. Any importer must classify dates rather than label every listed item Upcoming. Recheck event details and participation links before publication. No availability or price inferred.

## Access limitations and open decisions
Additional Services returned bot verification; Blog could not be retrieved. Those contents were not fully audited. No bypass attempted. No new website content was automatically published. The English and Greek biography wording/timeline differ in detail; keep only compatible facts or request editorial reconciliation. The commercial Hero's Journey service is not evidence for app XP/Journey mechanics or L2 four-session rules. Testimonials, scientific claims and quotations need separate editorial verification, not blind reuse.

## Proposed implementation order
1. Source-attributed CMS draft pack: services, About/press, contact FAQ and Level descriptions; admin reviews before publication.
2. Structured event records and article detail routes, then seed verified event drafts with provenance/date and expiry handling.
3. Media inventory with original URLs and durable hosting decision; Greek/English editorial versions.
4. Separate runtime-data migration plan and isolated Emergent acceptance. Green GitHub checks confirm build/tests, not production readiness or data migration.
