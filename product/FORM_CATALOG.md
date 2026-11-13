# Sound Healing Greece Form Catalog

Version 1.0 · 2026-09-29 · Supports FRM-01–05 of the Master Specification.

The verbatim available user-pasted forms are retained in `work/evidence/conversation_forms.json`, with turn IDs. D01–D16 extracted text and hashes are in `work/evidence/`. They are reference material, not executable form definitions. Account-switching headers and Google account email are not form fields and must not enter native templates.

## Template inventory

| Template key | Source | Coverage | Publication |
|---|---|---|---|
| receiver_l1_el | F01, turn bfb9b839-053e-4b91-93a4-2938f732f250 | 15 questions, options and visible required marks | Resolve Option 6 and type ambiguities, OD-07 |
| receiver_l2_el | F02, turn f1f4d954-1e47-4860-b9cb-424d44302330 | 13 questions; comfort choices confirmed by owner 2026-09-30 | Other type ambiguities remain, OD-07 |
| practitioner_l2_el | F03, turn acfe1b82-9688-4504-8855-d21f0c089295 | 3 first-session + 11 recurring questions | Required-mark conflict and cycle applicability, OD-03/07 |
| practitioner_group_el | F04, turn 2cc49c15-8fc6-4eea-b9bd-c01027e4c8e5 | 11 questions, 4-option satisfaction | Confirm Level/form-ID mapping, OD-06 |
| practitioner_l1_el | D05 link | Full questions not returned in accessible conversation | Missing; no L2 clone |
| participant_group_el | D14 link | Intended participant feedback exists; full questions unavailable | Missing; no L1/L2 clone |
| receiver_print_el | D15 | 13-question printable variant | Separate source version; applicability unresolved |
| intake_l1_el / intake_l2_el | D16 / D13 | Identity/contact, sensitive checkboxes/details, statement/signature/date | Source complete; processing/field requirements need OD-11 |
| first_interview_variant_a / b | D11 / D12 | Optional interview prompts; b has additional questions | Preserve variants pending level assignment |
| receiver_l1_en | D05 link | Link only, no verified English content | No guessed translation as official version |
| legacy_receiver_v0 | R01 | Generic 1–10 feedback already in code | Historical compatibility only |

The D14 form IDs are different from the pasted group assessment URL. Similar purpose is not proof of identical version. Links were tried read-only via web; missing form pages were inaccessible. No form was submitted, edited or published.

## Receiver field mapping

“R” means an explicit required marker in the pasted source. “O” means the source explicitly says optional. “—” means no visible required marker; preserve this uncertainty when the question type itself is unclear. Do not turn all fields into required inputs.

| Stable dimension | F01 L1 | F02 L2 | Type/scale |
|---|---|---|---|
| practitioner_name | R | R | Text in source; bound display context is proposed native UX |
| receiver_name | R | O | Text; source disagreement with printed D15 |
| session_date | R | R | Date; native context may be server-bound |
| overall_experience | Q1 R | Q1 R | 5 named options; descriptive instruction also present; confirm single-select vs accompanying narrative |
| state_before | Q2 R | Q2 R | Multi-select + Other |
| state_after | Q3 — | Q3 — | Multi-select + Other; does not include “Πολύ ήρεμος/η” |
| comfort | Q4 R | Q4 R | L1 five options; L2 options/type not visible |
| trust | Q5 R | Q5 R | Five ordered options + Other |
| space | Q6 R | Q6 R | Five ordered options |
| disturbances | Q7 R | Q7 R | Multi-select + explanation; F01 includes unexplained “Option 6” |
| information | Q8 R | Q8 R | L1 Yes/No; L2 Yes/No/Other |
| guidance | Q9 R | Q9 R | L1 1–5; L2 Yes/No/Other; follow-up text requirement unspecified |
| improvement | Q10 — | Q10 R | Open text |
| recommendation | Q11 R | Q11 R | Yes definitely / Maybe / No |
| liked_most | Q12 R | Absent | Open text |
| perceived_benefit | Q13 R | Absent | Open text; subjective report, not measured clinical efficacy |
| additional_comments | Q14 — | Q12 R | Open text |
| previous_experience | Q15 R | Q13 R | Three named options; selection cardinality not established by paste |

### Exact shared options from supplied forms

- Overall: Τέλεια · Ήταν όμορφη · Άσχημη · Ήταν μια δύσκολη εμπειρία · Δεν έχω ακόμα κατασταλάξει. Preserve as categories, not a 1–5 numeric average.
- Before: Πολύ αγχωμένος/η · Ελαφρώς αγχωμένος/η · Ουδέτερα · Ήρεμος/η · Πολύ ήρεμος/η · Χαρούμενος/η · Στεναχωρημένος/η · Άλλο.
- After: Πολύ αγχωμένος/η · Ελαφρώς αγχωμένος/η · Ουδέτερα · Ήρεμος/η · Χαρούμενος/η · Στεναχωρημένος/η · Άλλο.
- L1 comfort: Πολύ άβολα · Λίγο άβολα · Ουδέτερα · Άνετα · Πολύ άνετα.
- Trust: Καθόλου · Λίγο · Μέτρια · Πολύ · Απόλυτα · Άλλο.
- Space: Καθόλου ευχάριστος · Λίγο ευχάριστος · Ουδέτερος · Ευχάριστος · Πολύ ευχάριστος.
- Disturbances: no disturbance, space conditions, sound/intensity, external noise, other explanation. Retain raw F01 “Option 6” as unresolved source content; suppress publication until disposition is documented. Do not silently remove historical answers.
- Previous experience: Έχω συμμετάσχει σε ατομική συνεδρία · Έχω συμμετάσχει σε ομαδικές συνεδρίες · Πρώτη φορά είχα προσωπική συνεδρία.

Design proposal requiring a new template version: make “no disturbance” exclusive with positive disturbance options. The source does not specify this validation, so parity tests must distinguish native improvement from source transcription.

## L2 practitioner mapping

| Source section | Stable key | Applicability | Required evidence |
|---|---|---|---|
| First 1 general physical/mental/emotional state | initial_state | First session of cycle | Explicit * |
| First 2 planned focus across four sessions | planned_focus | First session of cycle | Explicit *; “four” unresolved with D01 |
| First 3 expectations/intention | receiver_expectations | First session of cycle | Required mark not clearly present; verify |
| Recurring 1 changes and home-practice feedback | changes_since_previous | Only if previous session with same receiver | * with conditional wording |
| Recurring 2 overall experience, worked/did not | session_reflection | Each session | * |
| Recurring 3 energy-field observations/response | practitioner_observations | Each session | *; practitioner account, not objective diagnosis |
| Recurring 4 difficulties | difficulties | Each session | * |
| Recurring 5 protocols | protocols_used | Each session | *; source free response |
| Recurring 6 future improvements | future_improvements | Each session | * |
| Recurring 7 time management | time_management | Each session | *; answer type not specified as yes/no |
| Recurring 8 proposed home practice/reception | home_practice | Each session | * |
| Recurring 9 personal learning | practitioner_learning | Each session | * |
| Recurring 10 instruments | instruments_used | Each session | *; structured chips are a proposed enhancement |
| Recurring 11 additional observations | additional_notes | Each session | Says optional but has *; unresolved |

The schema can represent multi-part text without changing the original question. Structured protocol/instrument codes may supplement original text but must not replace it or introduce mandatory options unsupported by the source.

## Group practitioner mapping

| Q | Stable key | Source type/requirement |
|---|---|---|
| 1 | participant_count | Required; numeric validation is native design |
| 2 | duration | Required; normalize entered units without guessing |
| 3 | pre_session_difficulties | Required text |
| 4 | difficulties_and_response | Required text |
| 5 | instruments_and_rationale | Required text |
| 6 | sharing_feedback | Required text, distinct from participant submission |
| 7 | future_improvements | Required text |
| 8 | time_management | Required response; do not assume boolean |
| 9 | practitioner_insights | Required text |
| 10 | overall_satisfaction | Required: Καθόλου / Κάπως / Πολύ / Πάρα πολύ |
| 11 | additional_notes | Explicitly optional |

## Intake and support material

D13/D16 ask name, birth date, address, telephone, email and sensitive health questions, followed by a statement and signature/date. Their broad historical scope is recorded, not automatically approved as the minimum digital dataset. Requiredness is not established by checkboxes alone. A digital collection review must decide which fields are necessary and who may see them.

D11/D12 include lifestyle, diet/exercise/sleep, stress, smoking/alcohol, intentions, subjective pain and complementary treatments. D12 additionally asks other relevant information and prior sound-healing experience. D05/D01 identify the interview as optional. D02/D03 differ because D03 includes additional community/professional relationship clauses. D07/D09 are byte-identical despite different filenames and both contain the 12-session requirement. These facts matter when assigning versions; a filename alone is not a policy date.

D04 additionally includes switching phones/smartwatches off or to airplane mode; that item is absent from the extracted D08 PDF checklist. Preserve checklist versions rather than assuming the two formats are identical.

## Publication and parity checklist

Each draft must retain original prompt/options, source ID/question number, required-state confidence, condition, intended respondent, locale and sensitivity. Compare a rendered draft with its source before publication. Test unanswered vs not-applicable, Other text, multi-select, keyboard/screen-reader behavior, expired/revoked/reused tokens and simultaneous submission. New native copy, translations and validation changes require documented version changes. Published submissions always remain readable with their original schema.


## Confirmed decision — 2026-09-30
The owner explicitly selected the L1 comfort scale for L2: Πολύ άβολα / Λίγο άβολα / Ουδέτερα / Άνετα / Πολύ άνετα. This resolves only the L2 comfort options; other source ambiguities remain open.
