# Legacy practice retirement

New legacy POST /api/practices returns 410. /practice/new redirects to the school practice page. Existing records and receiver links are preserved; no academic credit migration. History list/details use Greek shared Shell, no XP or create/share controls. History link is visible only after successful nonempty legacy list load.

Validation: new shared component typechecked against local SDK54 checkout. Latest remote SDK57 build and full integration tests must be rerun by Emergent. Update legacy API tests expecting 200 for creation to expect 410; seed historical fixtures directly in an isolated test DB for read/feedback tests. Do not remove school-practice tests. Verify zero-history student, student with history, cross-user access rejection, direct legacy route redirect and enrolled student's new school flow.
