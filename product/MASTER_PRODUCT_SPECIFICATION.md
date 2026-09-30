# Sound Healing Greece Master Product Specification

Έκδοση 1.1 · 29 Σεπτεμβρίου 2026 · Κατάσταση: ενιαία βάση σχεδιασμού με καταγεγραμμένες εκκρεμότητες πηγών.

Το Sound Healing Greece εξελίσσεται πάνω στο υπάρχον app σε ένα σύστημα δημόσιας ενημέρωσης, σχολής και εποπτευόμενης πρακτικής. Το School αποτυπώνει την πραγματική εκπαίδευση. Το Journey υποστηρίζει την προσωπική συμμετοχή. Τα XP δεν αποδεικνύουν εκπαιδευτική επάρκεια και δεν εκδίδουν πιστοποιητικά.

Αυτό είναι το μοναδικό κανονιστικό product specification. Τα [phases και prompts](IMPLEMENTATION_PHASES.md), το [τεχνικό baseline](TECHNICAL_BASELINE.md), το [μητρώο πηγών](SOURCE_REGISTER.md) και ο [κατάλογος φορμών](FORM_CATALOG.md) το υποστηρίζουν. Οι ορισμοί και οι ανοιχτές αποφάσεις αλλάζουν εδώ πρώτα. Η υλοποίηση ξεκίνησε σε απομονωμένο branch· δεν έχουν αλλάξει παραγωγικά δεδομένα.

## 1 Κανόνες τεκμηρίωσης και συντήρησης

Οι ενδείξεις ισχύος είναι:

- **SOURCE**: τι λέει συγκεκριμένη πηγή. Δεν σημαίνει ότι υπερισχύει άλλης πηγής ή ότι ισχύει για κάθε cohort.
- **DESIGN**: αρχιτεκτονική επιλογή αυτού του specification, εντός του ζητούμενου σχεδιασμού. Δεν παρουσιάζεται ως υφιστάμενος κανονισμός του Μανώλη.
- **OPEN OD-xx**: διαφωνία ή κενό που εμποδίζει μόνο την εξαρτώμενη λειτουργία.
- **BASELINE**: συμπεριφορά που διαβάστηκε στον κώδικα, όχι απόδειξη σωστής λειτουργίας σε παραγωγή.

Τα D01–D16 αναφέρονται στα εκπαιδευτικά αρχεία, F01–F04 στα πρωτογενή pasted forms, W01–W06 στις δημόσιες σελίδες και R01 στο repo. Η ακριβής αντιστοίχιση βρίσκεται στο μητρώο πηγών. Η διαθέσιμη ανάκτηση της προηγούμενης συζήτησης επέστρεψε μόνο πέντε πρόσφατα turns χωρίς cursor για παλαιότερα. Δεν δηλώνεται ότι ανακτήθηκε ολόκληρη η συζήτηση. Το L1 practitioner form και το group participant form παραμένουν ελλιπή.

Κάθε αλλαγή απαιτεί requirement ID, source/decision ID, έκδοση, ημερομηνία, υπεύθυνο και affected phases. Οι εκπαιδευτικοί κανόνες και οι φόρμες δημοσιεύονται ως αμετάβλητες εκδόσεις. Κάθε enrollment και submission κρατά τη δική του έκδοση. Νέος κανόνας δεν αλλάζει αναδρομικά ιστορικά αποτελέσματα. Τα synced αρχεία του `sources/` παραμένουν μόνο για ανάγνωση.

## 2 Περιοχές προϊόντος και πρόσβαση

| Περιοχή | Χρήστης και σκοπός | Βασικές οθόνες | Κατάσταση |
|---|---|---|---|
| Public Experience | Επισκέπτης που γνωρίζει υπηρεσίες ή εκπαίδευση | Αρχική, υπηρεσίες, σχολή και Levels, εκδηλώσεις, Μανώλης, άρθρα, επικοινωνία | Ζητούμενο + W01–W06 |
| School | Μαθητής σε συγκεκριμένη εκπαιδευτική εγγραφή | Τα Levels μου, cohort, πρόγραμμα, υλικό, παρουσίες, απαιτήσεις, πιστοποιητικά | DESIGN SCH |
| Practice | Μαθητής που τεκμηριώνει πραγματική συνεδρία | Δέκτες, κύκλοι, ατομική/ομαδική πρακτική, φόρμες, feedback, review | D01–D16 + F01–F04 |
| Journey | Προσωπική εμπειρία και συνέπεια | Realms, δραστηριότητες, XP, προσωπικά milestones | Υπάρχον R01, αποσύνδεση από School |
| Profile | Διαχείριση λογαριασμού και προσωπικών στοιχείων | Προφίλ, privacy, ειδοποιήσεις, εκπαιδευτικές επιτεύξεις | DESIGN PRO |
| Instructor/Admin | Εποπτεία και λειτουργία σχολής | Cohorts, attendance, ουρά review, progress, certificates, CMS, analytics | DESIGN ADM |

**IA-01 DESIGN:** Διατηρούνται τα υπάρχοντα tabs και routes όπου είναι εφικτό. Το Academy μπορεί να εμφανίζεται ως «Σχολή» χωρίς υποχρεωτική μετονομασία του `/academy` API. Το Sanctuary λειτουργεί ως dashboard με επόμενο μάθημα, πρόχειρη πρακτική και εκκρεμές feedback. Instructor/Admin είναι χωριστός χώρος εργασίας, όχι ακόμη ένα tab για όλους.

**IA-02 DESIGN:** Καταστάσεις επισκέπτη, λογαριασμού χωρίς enrollment, ενεργού μαθητή, αποφοίτου και instructor αντιμετωπίζονται ξεχωριστά. Registration δεν ισοδυναμεί με enrollment. Μπορούν να συνυπάρχουν πολλαπλοί ρόλοι και enrollments. Instructor έχει πρόσβαση μόνο σε ανατεθειμένα cohorts και submissions. Content editor δεν αποκτά πρόσβαση σε receiver data.

## 3 Τα τέσσερα εκπαιδευτικά Levels

**LVL-01 SOURCE/LOCKED:** Τα School Level IDs είναι αποκλειστικά `L1`, `L2`, `L3`, `L4`. Ο χρήστης ζητά τέσσερα Levels και το δημόσιο πρόγραμμα τα επιβεβαιώνει. Τα παρακάτω δημοσιευμένα μεγέθη είναι στοιχεία πηγής, όχι ενεργός κανόνας πιστοποίησης μέχρι να λυθούν οι σχετικές αποκλίσεις. [Εκπαιδευτικό πρόγραμμα](https://www.soundhealing.gr/el/ekpaideftika-seminaria/).

| Level | Εκπαιδευτική κατεύθυνση | Δημοσιευμένες ώρες δια ζώσης / online / πρακτικής | Πρακτική που τεκμηριώνουν τα uploads |
|---|---|---|---|
| L1 | Himalayan singing bowls, θεμέλια ατομικής πρακτικής | 16 / — / 15 | D05: τουλάχιστον 15 ατομικές, τουλάχιστον 45 λεπτά, 2–5 ανά δέκτη, για μετάβαση στο L2 |
| L2 | Προχωρημένες τεχνικές bowls και πρόσθετα όργανα | 16 / 2 / 15 | D01: 15 ατομικές μίας ώρας, 3–5 ανά δέκτη, για μετάβαση στο L3 |
| L3 | Ομαδικά Sound Baths | 40 / 5 / 20 | D14: 20 ομαδικές, τουλάχιστον μία ώρα, για μετάβαση στο L4 |
| L4 | Εμβάθυνση πρακτικής και επαγγελματική ανάπτυξη | 32 / 5 / 20 | Δεν υπάρχει οδηγία για την πρακτική μετά το L4· OD-04 |

**LVL-02 DESIGN:** Το όνομα αρχείου «Προαπαιτούμενα για Level 3» περιγράφει τη μετάβαση από το L2, όχι 15 πρακτικές του L3. Αντίστοιχα το D14 ανήκει στο L3 → L4. Δεν βαφτίζεται οδηγία αποφοίτησης L4.

**LVL-03 DESIGN:** `SchoolLevel` ≠ `JourneyRank`. Τα legacy `L3A/L3B` διατηρούνται ως ιστορικές τιμές. Δεν συγχωνεύονται με διαγραφή και δεν μετατρέπονται αυτόματα σε επιτυχή ολοκλήρωση L3. Η πιθανή αντιστοίχιση σε υποενότητες του L3 είναι OD-05. Παρακολούθηση δύο τριημέρων δεν αποδεικνύει ότι αντιστοιχούν στα δύο legacy seeds.

**LVL-04 DESIGN:** Το ruleset κρατά χωριστά `session_count`, `duration_minutes`, `total_practice_minutes`, `sessions_per_receiver`, απαιτούμενα assessments και attendance. Δεκαπέντε συνεδρίες των 45 λεπτών είναι 675 λεπτά, όχι 15 ώρες. Δεν μετατρέπουμε το ένα μέγεθος στο άλλο. Για ασαφείς κανόνες η eligibility είναι `pending_policy`, όχι επιτυχία ούτε αυθαίρετη αποτυχία.

## 4 School, cohorts και attendance

**SCH-01 DESIGN:** Ένα cohort είναι συγκεκριμένη διοργάνωση ενός Level: κωδικός, όνομα, τοποθεσία/online σύνδεσμος, instructors, ημερομηνίες, timezone, χωρητικότητα αν οριστεί, curriculum/ruleset version και lifecycle `draft → open → active → completed → archived`. Η σελίδα public event μπορεί να συνδέεται με cohort, αλλά το event δεν είναι το ίδιο record με το cohort.

**SCH-02 DESIGN:** Enrollment: `pending → active → completed`, με `withdrawn/transferred` και ιστορικό. Μεταφορά σε άλλο cohort δεν σβήνει την προηγούμενη εγγραφή. Η εξουσιοδότηση στα υλικά προκύπτει από enrollment/ρητή ανάθεση, όχι XP. Προηγούμενη εκπαίδευση και εξαιρέσεις καταγράφονται ως τεκμηριωμένες αποφάσεις, όχι αλλαγή αριθμού XP.

**ATT-01 DESIGN:** Κάθε cohort έχει συναντήσεις `in_person`, `online_teaching`, `support`. Καταγράφονται προγραμματισμένα λεπτά, πραγματικά attended minutes και κατάσταση `unmarked/present/partial/absent/excused`, με recorder, timestamp και reason αλλαγής. Ένα attendance record ανά enrollment και meeting. Χωρίς attendance rule δεν εμφανίζεται αυθαίρετο «80% required».

**ATT-02 DESIGN:** Ο μαθητής βλέπει τις δικές του παρουσίες και μπορεί να ζητήσει διόρθωση. Μόνο assigned instructor/authorized admin επικυρώνει. Makeup συνδέεται με το αρχικό έλλειμμα και δεν διπλομετράται. Παρουσία workshop, online support και διάρκεια πρακτικής δεν αθροίζονται ανεξέλεγκτα σε ένα total.

**SCH-03 DESIGN:** Σε κάθε Level προβάλλονται χωριστά υλικό, πρόγραμμα, παρουσίες, πρακτικές, feedback, review και αποτέλεσμα. Lesson completion αποδεικνύει μόνο completion συγκεκριμένου lesson. Τα 25 υπάρχοντα seed lessons δεν θεωρούνται εγκεκριμένη ύλη ή διαθέσιμο audiovisual content.

## 5 Practice workflow

### Κοινός κορμός

**PRA-01 DESIGN:** Κάθε session συνδέεται με practitioner, enrollment, school_level, practice_type και ruleset version. Ο learner επιλέγει από επιτρεπόμενες εγγραφές· δεν μπορεί να δηλώσει οποιοδήποτε Level αλλάζοντας payload. `individual/group/self` είναι διαφορετικές κατηγορίες· η self practice δεν μετρά ως συνεδρία με δέκτη χωρίς ειδικό κανόνα.

**PRA-02 SOURCE:** D05/D01 προβλέπουν ανάγνωση δεοντολογίας, προετοιμασία δέκτη και υπογεγραμμένο ιστορικό/ανάληψη ευθύνης πριν από την πρώτη ατομική συνεδρία. Οι πρόσθετες ερωτήσεις πρώτης συνεδρίας είναι προαιρετικές. D04/D08/D06 αποτελούν υλικό προετοιμασίας και κλεισίματος· δεν μετατρέπουμε κάθε γραμμή τους σε υποχρεωτικό checkbox ολοκλήρωσης.

**PRA-03 DESIGN:** Receiver record ξεχωριστό από τον student account, με κωδικό, περιορισμένα στοιχεία επικοινωνίας και ιδιοκτησία practitioner. Δεν απαιτεί λογαριασμό. Δεν συγχωνεύουμε δέκτες μεταξύ practitioners μέσω ονόματος/email. Signed intake, sensitive answers και educational reflection είναι διαφορετικά records και permissions. Η μεταφορά εντύπου καταγράφει provenance και πραγματική ημερομηνία υπογραφής.

**PRA-04 DESIGN:** Ατομική ροή: enrollment → receiver → preparation/consent evidence → optional interview → practice cycle → session details → practitioner assessment → feedback invitation → receiver submission → instructor review → counting decision. Επιτρέπονται drafts, autosave, επανάληψη μετά από σφάλμα και εισαγωγή πραγματικής παλαιότερης συνεδρίας με provenance. Δεν απαιτείται receiver email όταν το link δίνεται με άλλο τρόπο.

### L1

**PRA-L1 SOURCE:** D05: ελάχιστο πλήθος 15, ελάχιστη διάρκεια 45 λεπτά, κατανομή 2–5 συνεδριών ανά δέκτη, practitioner και receiver forms. Το παράδειγμα 2 × 8 δέκτες δίνει 16 συνεδρίες και είναι συμβατό με «τουλάχιστον 15». Η γενική αναφορά 12 των D07/D09 παραμένει σύγκρουση, όχι δεύτερο ενεργό minimum.

**PRA-L1 DESIGN:** Ακολουθείται ο κοινός κορμός και ξεχωριστό L1 practitioner template όταν ανακτηθεί. Δεν χρησιμοποιούμε τη L2 φόρμα ως δήθεν L1. Το F01 receiver template έχει 15 ερωτήσεις. Ηλεκτρονική/έντυπη διαφοροποίηση ονόματος και guidance βρίσκεται στο OD-07. Η προσωπική ημερολογιακή γραφή είναι προαιρετική κατά D05, ενώ το δομημένο session log είναι λειτουργικό record του app.

### L2

**PRA-L2 SOURCE:** D01: 15 συνεδρίες μίας ώρας, 3–5 ανά δέκτη, 15 practitioner και 15 receiver forms. Το F03 κρατά στην πρώτη συνεδρία γενική κατάσταση, εστίαση και προσδοκίες, και μετά από κάθε συνεδρία reflection. Η αναφορά «τέσσερις συνεδρίες» στο F03 δεν υπερισχύει της κατανομής 3–5.

**PRA-L2 DESIGN:** `PracticeCycle` ομαδοποιεί δέκτη + practitioner + enrollment. Η πρώτη αξιολόγηση ανήκει στον κύκλο, οι συνεδρίες έχουν σειρά και δική τους έκδοση. Προβάλλονται προηγούμενες σημειώσεις χωρίς αυτόματη αντιγραφή σε νέα απάντηση. Η ερώτηση αλλαγών από προηγούμενη συνεδρία εμφανίζεται μόνο από τη δεύτερη συνεδρία του ίδιου κύκλου. Ο ακριβής ορισμός νέου κύκλου με παλιό δέκτη είναι OD-03.

### L3

**PRA-L3 SOURCE:** D14: 20 group sessions τουλάχιστον μίας ώρας, practitioner form ανά session και πρόσκληση σε έναν ή περισσότερους συμμετέχοντες για feedback εντός 48 ωρών. Δεν απαιτεί να απαντήσει όλη η ομάδα. Το πρωτογενές F04 δεν κατονομάζει Level· η σύνδεσή του με L3 χρειάζεται επιβεβαίωση επειδή το D14 παραπέμπει σε διαφορετικό form ID.

**PRA-L3 DESIGN:** GroupSession κρατά participant count και πολλά evaluation invitations/submissions. Δεν δημιουργεί υποχρεωτικά ονομαστικό receiver για όλους. Group sharing notes του facilitator δεν αντικαθιστούν participant feedback. Οι 20 συνεδρίες μετρούν ως 20 sessions, όχι ως άθροισμα των συμμετεχόντων. Περισσότερα responses δεν δίνουν περισσότερη εκπαιδευτική πίστωση ή XP ανά session. Το ελάχιστο group size και η υποχρεωτική λήψη έναντι αποστολής feedback είναι OD-08.

### L4

**PRA-L4 OPEN:** Καταγράφεται εκπαιδευτικό πλαίσιο και draft activity evidence. Δεν επινοείται πρακτική 20 ατομικών, 20 ομαδικών, exam ή case study. Η δημόσια αναφορά 20 ωρών δεν προσδιορίζει κατανομή, έντυπα ή αξιολόγηση. Η τελική αυτόματη eligibility παραμένει `pending_policy` μέχρι το OD-04.

### Καταστάσεις και ακεραιότητα

**PRA-05 DESIGN:** Τρία ανεξάρτητα πεδία αποφεύγουν το σημερινό ασαφές «XP Awarded»:

| Άξονας | Καταστάσεις |
|---|---|
| Session lifecycle | draft, recorded, submitted, archived, voided |
| Evidence | incomplete, awaiting_feedback, ready, exception_requested |
| Review | not_submitted, pending, needs_revision, approved, rejected |

Ο learner υποβάλλει μόνο δική του πρακτική. Instructor επιστρέφει revision με σχόλιο ή εγκρίνει συγκεκριμένο immutable revision. Αλλαγή εγκεκριμένης ουσιαστικής απάντησης δημιουργεί νέο revision και επανεξέταση. Rejection/void δεν διαγράφει ιστορικό. Review μπορεί να ξεκινήσει με ελλείψεις, αλλά `counts_toward_requirement` χρειάζεται πλήρη κανόνα και αποδεκτά evidence ή τεκμηριωμένη εξαίρεση. Instructor δεν εγκρίνει τη δική του πρακτική.

**PRA-06 DESIGN:** Οι 48 ώρες είναι χρόνος που ζητά η πηγή για feedback. Δεν είναι τεκμηριωμένη λήξη link ούτε λόγος διαγραφής/απόρριψης. `requested_due_at`, `submitted_at`, `late` και `token_expires_at` είναι διαφορετικά πεδία. Χωρίς ακριβή ώρα τέλους δεν κατασκευάζεται ψευδής ακρίβεια deadline. Οι υπενθυμίσεις έχουν ξεχωριστή αποδοχή και πολιτική συχνότητας.

## 6 Forms και evaluations

**FRM-01 DESIGN:** Versioned templates ανά audience, level, practice type και locale. `Question` έχει stable key, prompt, help, answer type, επιλογές με stable codes, required state, conditional rule, source locator, sensitivity και comparison key. Unknown required/type/scale παραμένει unknown και μπλοκάρει publication του συγκεκριμένου template. Published versions δεν επεξεργάζονται επιτόπου.

**FRM-02 SOURCE:** Διατηρούνται οι πολλαπλές επιλογές before/after και disturbances. Guidance L1 είναι 1–5, Guidance L2 είναι Yes/No/Other. Η satisfaction του group practitioner έχει τέσσερις λεκτικές επιλογές. Το υπάρχον repo feedback 1–10 καταγράφεται ως `legacy_receiver_v0`, δεν μετονομάζεται σε L1/L2 και δεν μετατρέπεται αριθμητικά σε άλλες κλίμακες. Βλ. πλήρη [κατάλογο](FORM_CATALOG.md).

**FRM-03 DESIGN:** Το token δεσμεύει server-side session, audience και form version. Η σελίδα δείχνει μόνο ελάχιστο context συνεδρίας, ποτέ intake ή προηγούμενες απαντήσεις. Απαντήσεις ξεκινούν κενές, όχι με προεπιλεγμένη βαθμολογία 5. Ο server ελέγχει τύπους, επιλογές, required και conditional branches ανεξάρτητα από το UI.

**FRM-04 DESIGN:** Individual invitation: μία τελική υποβολή με atomic token consumption και idempotency. Group: μία πρόσκληση ανά αναμενόμενο respondent ή πρόσβαση μέσω QR που εκδίδει χωριστή submission capability· όχι κοινό single-use token για όλη την ομάδα. Η anonymous επιλογή χρειάζεται μη αναγνωρίσιμο linkage· το «χωρίς όνομα» με receiver-specific token είναι ψευδωνυμοποιημένο, όχι ανώνυμο.

**FRM-05 DESIGN:** Υποβολή offline/έντυπης φόρμας από εξουσιοδοτημένο χρήστη σημειώνει `transcribed`, ποιος μετέγραψε, source version και original date. Δεν φαίνεται ως ηλεκτρονική απάντηση του receiver. Επιβεβαίωση ταυτότητας/μεταγραφής είναι διαφορετική από συγκατάθεση. Τυχόν έντυπο attachment έχει περιορισμένη πρόσβαση.

## 7 Progress και certificates

**PRG-01 DESIGN:** Η πρόοδος παρουσιάζεται ανά διάσταση: ολοκληρωμένα μαθήματα, παρουσίες, καταγεγραμμένα/εγκεκριμένα sessions, qualifying minutes, κατανομή ανά receiver, practitioner assessments, receiver feedback και ανοικτά reviews. Δεν επινοείται ένα συνολικό ποσοστό με αυθαίρετα βάρη. Unknown target εμφανίζεται «εκκρεμεί ορισμός».

**PRG-02 DESIGN:** Η eligibility υπολογίζεται server-side με `met/not_met/pending_policy/pending_review`, rule IDs και explainable missing requirements. Δεν αρκεί `count(all practices)`. Μόνο το εγκεκριμένο revision μπορεί να καταμετρηθεί. Ένα group session δεν μετρά πολλαπλά και μία πρακτική δεν πιστώνεται σε δύο enrollments χωρίς εγκεκριμένη πολιτική μεταφοράς. Οι ακριβείς συνθήκες χρησιμοποίησης subset 15 συνεδριών και άνω ορίου ανά receiver είναι OD-02.

**CER-01 SOURCE:** Η δημόσια περιγραφή διακρίνει βεβαίωση παρακολούθησης, ολοκλήρωση ανά Level μετά την απαιτούμενη πρακτική, και συνολική ολοκλήρωση τεσσάρων Levels. [Πηγή πιστοποίησης](https://www.soundhealing.gr/el/ekpaideftika-seminaria/).

**CER-02 DESIGN:** Τρεις τύποι: `attendance`, `level_completion`, `practitioner_completion`. Eligibility δεν εκδίδει μόνη της certificate· authorized issuer επιβεβαιώνει την έκδοση. Αποθηκεύονται serial, type, learner identity snapshot, level/cohort, rule version, approved evidence IDs, breakdown ωρών, issued_by/at, template version, status `issued/revoked/superseded` και λόγος ανάκλησης. Reissue συνδέεται με προηγούμενο serial. Μοναδικός ενεργός τίτλος ανά scope, με προστασία από διπλό κλικ.

**CER-03 OPEN:** Attendance threshold, εξέταση, rubric, signature, σφραγίδες, δημόσια verification και ακριβής αναγραφή ωρών/διαπίστευσης χρειάζονται OD-09/OD-10. Δεν παρουσιάζεται η ιδιότητα μέλους ISTA ως αυτόματη διαπίστευση του πιστοποιητικού και δεν υπόσχεται το app άδεια άσκησης επαγγέλματος.

## 8 Public Experience και conversion

**PUB-01 DESIGN:** Διατηρείται η υπάρχουσα landing page ως βάση. Τρεις καθαρές διαδρομές: «Θέλω συνεδρία», «Θέλω να εκπαιδευτώ», «Είμαι μαθητής». Το πρώτο οδηγεί σε υπηρεσίες/εκδήλωση/επικοινωνία, το δεύτερο σε σύγκριση τεσσάρων Levels και διαθέσιμο cohort, το τρίτο σε login/School. Δεν επιβάλλεται registration για απλή ενημέρωση.

**PUB-02 SOURCE:** Η δημόσια παρουσία περιλαμβάνει ατομικές συνεδρίες, group sound baths, trainings και συνεργασίες με χώρους. Ο Μανώλης παρουσιάζεται ως sound therapist με βάση/δραστηριότητα σε Κρήτη και Αθήνα. Χρησιμοποιούμε πιστοποιημένο περιεχόμενο ανά πεδίο και όχι συλλογικό ισχυρισμό ότι όλο το υπάρχον copy είναι ακριβές. [Αρχική](https://www.soundhealing.gr/) · [Μανώλης](https://www.soundhealing.gr/about/).

**PUB-03 DESIGN:** Service page: τι περιλαμβάνει, σε ποιον απευθύνεται, τι να περιμένει, πρακτικές πληροφορίες, προετοιμασία και CTA επικοινωνίας. Το public catalogue διακρίνει modality από individual/group format· ένα Sound Bath δεν είναι υποχρεωτικά group. Οι διάρκειες υπηρεσιών δεν αποτελούν κανόνες εκπαιδευτικής πρακτικής. [Πηγή υπηρεσιών](https://www.soundhealing.gr/treatments/).

**PUB-04 DESIGN:** Training landing: σύγκριση Levels, προσέγγιση, υλικό/παρουσίες/πρακτική, πραγματικά cohorts, διαδικασία αίτησης και ξεκάθαρη έννοια πιστοποιητικών. Event detail: ημερομηνία, timezone, venue, πραγματική διαθεσιμότητα, τιμή και CTA μόνο εφόσον υπάρχουν εγκεκριμένα δεδομένα. Το [δημόσιο ημερολόγιο](https://www.soundhealing.gr/soundhealing-events/) είναι πηγή καταλόγου, όχι live booking API. Δεν κατασκευάζονται θέσεις, τιμές ή sold-out states.

**PUB-05 DESIGN:** Greek και English περιεχόμενο με χωριστή επιμέλεια· καμία αυτόματη μετάφραση που αλλάζει φόρμα ή disclaimer. SEO: σταθερά slugs, title/description/canonical, hreflang μόνο για διαθέσιμες μεταφράσεις, sitemap δημοσιευμένων public routes, redirects από υφιστάμενα URLs, structured data μόνο για πραγματικές οντότητες. App, feedback, previews και private files δεν ευρετηριάζονται· το noindex δεν αντικαθιστά authentication. Εξετάζεται static rendering του υπάρχοντος Expo web πριν από οποιαδήποτε πρόταση νέου frontend.

**PUB-06 DESIGN:** Δεν μεταφέρονται μη επαληθευμένοι ισχυρισμοί του repo για θεραπευτικά αποτελέσματα, online lessons, membership, XP certification ή αναγνώριση. Testimonials απαιτούν provenance και επιτρεπόμενη χρήση. Το CMS δεν δημοσιεύει αυτόματα ό,τι βρίσκει στο site.

## 9 Journey και Profile

**JRN-01 DESIGN:** Διατηρούνται τα επτά υφιστάμενα realms, UI components και ιστορικά XP ως εμπειρία συμμετοχής. Τα thresholds δεν επιβάλλουν School enrollment/πρακτική/πιστοποίηση. `journey_xp`, `journey_rank`, `school_enrollments` και `certificates` έχουν διακριτή σημασία. Legacy stamps με τίτλο Certification επαναχαρακτηρίζονται οπτικά ως μη επαληθευμένες ιστορικές διακρίσεις, χωρίς διαγραφή.

**JRN-02 DESIGN:** XP events είναι idempotent ledger entries. Δεν αυξάνονται με καλύτερη βαθμολογία receiver ούτε με αριθμό group responses. Η τελική πολιτική rewards είναι OD-14. Δεν προβάλλονται φανταστικοί αριθμοί συμμετεχόντων challenges. Προσωπικό journal δεν αποτελεί κατ’ ανάγκη εκπαιδευτικό submission και δεν ανοίγει στον instructor εξ ορισμού.

**PRO-01 DESIGN:** Προφίλ: στοιχεία επικοινωνίας/προτίμηση γλώσσας, ασφαλής αλλαγή avatar, School status, certificates και χωριστή Journey καρτέλα. Προτιμήσεις ειδοποιήσεων ανά σκοπό, αιτήματα πρόσβασης/διόρθωσης/διαγραφής και εμφανής έξοδος. Δεν υπάρχει δημόσιο receiver profile. Directory μαθητών για ανταλλαγές, που αναφέρεται στο D01/D05, παραμένει προαιρετικό opt-in με επιλογή πεδίων, όχι import όλου του spreadsheet.

**JRN-03 DESIGN:** Ο υπάρχων Aeon παραμένει υπό feature flag και εκτός κριτηρίων σχολής. Δεν λαμβάνει αυτόματα ιστορικά υγείας, receiver feedback ή notes. Δεν αποφαίνεται για contraindications, competence ή certificates. Χρειάζεται owner-scoped session ID, έλεγχος data destinations και εγκεκριμένη λειτουργική πολιτική πριν επεκταθεί.

## 10 Instructor, admin και CMS

**ADM-01 DESIGN:** Dashboard με εκκρεμή reviews, πρακτικές που χρειάζονται διόρθωση, προβλήματα evidence, attendance προς συμπλήρωση και αιτήματα certificates. Φίλτρα cohort/level/student/status. Instructor βλέπει εκπαιδευτικό φάκελο μόνο εντός ανάθεσης και masked receiver code όπου αρκεί.

**ADM-02 DESIGN:** Στο review εμφανίζονται ακριβές revision, κανόνες cohort, practitioner response και receiver evaluation ως διαφορετικές πηγές. Actions: approve, needs_revision, reject, request_exception. Κάθε απόφαση έχει actor/time/reason. Sensitive incident μπαίνει σε περιορισμένη ουρά, δεν δημοσιεύεται σε feed και δεν απαντάται αυτόματα με AI.

**CMS-01 DESIGN:** Content types: pages, service, event, training overview, level description, lesson, resource, FAQ, testimonial, instructor bio, form template και rule version. Public editorial content, course material και confidential practice data είναι διαφορετικοί χώροι. Το υπάρχον resource upload επεκτείνεται σταδιακά.

**CMS-02 DESIGN:** `draft → in_review → published → archived`, preview, revision history, locale, source URL/file ID, source date, editor/reviewer και scheduled dates όταν χρειάζονται. Διαγραφή published resource δημιουργεί tombstone ώστε να διατηρούνται evidence references. Αντικατάσταση αρχείου δημιουργεί νέα έκδοση/hash. Academic rules/forms χρειάζονται school-owner publication permission, όχι απλή editor πρόσβαση.

## 11 Privacy και security

Τα παρακάτω είναι απαιτήσεις σχεδιασμού και launch gates, όχι δήλωση ότι το υφιστάμενο app συμμορφώνεται ήδη. Τα intake δεδομένα υγείας απαιτούν ειδική προστασία και η ψευδωνυμοποίηση δεν τα μετατρέπει σε ανώνυμα δεδομένα. [Ευρωπαϊκή Επιτροπή](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en). Η ελαχιστοποίηση και η πρόσβαση ανά σκοπό ενσωματώνονται εξαρχής. [EDPB](https://www.edpb.europa.eu/sme/be-compliant/be-compliant_en).

| Δεδομένα | Practitioner owner | Assigned instructor | Operations/content admin | Public/token |
|---|---|---|---|---|
| Προσωπική εκπαιδευτική πρόοδος | Ίδια | Ανατεθειμένων μαθητών | Μόνο με εκπαιδευτικό permission | Όχι |
| Receiver identity/contact | Ελάχιστο αναγκαίο | Masked εξ ορισμού | Όχι εξ ορισμού | Όχι |
| Health intake/signature | Με ειδική άδεια και σκοπό | Μόνο explicit scoped grant | Όχι εξ ορισμού | Μόνο εξουσιοδοτημένη intake διαδικασία |
| Practice assessment | Ίδια | Assigned review | Όχι με απλό CMS role | Όχι |
| Evaluation answers | Σύμφωνα με approved visibility policy | Assigned review | Aggregate μόνο | Submit μέσω capability, όχι γενικό read |
| Journal/Journey private notes | Ίδια | Όχι εξ ορισμού | Όχι | Όχι |
| Public content | Read | Read | Edit/publish ανά permission | Published μόνο |

**SEC-01 DESIGN:** Server-side ownership και cohort authorization σε κάθε read/write/export/download. Αποτυχία ελέγχου πρόσβασης δεν επιστρέφει sensitive metadata. Δύο test students και δύο cohorts πρέπει να αποδεικνύουν isolation. Instructor/admin grants καταγράφονται και ανακαλούνται.

**SEC-02 DESIGN:** TLS, encrypted storage/backups, secrets εκτός repo, admin MFA, revocable sessions, rate limits σε auth/token endpoints, μεγέθη payload, αυστηρή MIME/actual bytes επαλήθευση και private attachment storage. Το upload δεν εμπιστεύεται client `file_size`. Access links είναι scoped, expiring και ανακλητά. Οι ακριβείς διάρκειες TTL και retention είναι OD-11, όχι αυθαίρετοι σχολικοί κανόνες.

**SEC-03 DESIGN:** Feedback tokens αποθηκεύονται hashed, δεν γράφονται σε analytics/referrers/logs. Ατομικό submission καταναλώνει token ατομικά. Sensitive pages δεν περιλαμβάνουν third-party tracking. CORS με συγκεκριμένα origins και έλεγχος sessions ανά πλατφόρμα. Error responses δεν επιστρέφουν upstream exception strings.

**SEC-04 DESIGN:** Purpose-specific privacy notice και separate consent records με version/time/withdrawal. Υπογραφή ανάληψης ευθύνης δεν ισοδυναμεί αυτόματα με GDPR consent, marketing consent ή άδεια δημοσίευσης. Πριν από health intake σε παραγωγή ορίζονται controller/processor roles, νόμιμη βάση και συνθήκη ευαίσθητων δεδομένων, αποδέκτες, retention/deletion, subprocessors, διαβιβάσεις και ανάγκη DPIA. Αυτά είναι OD-11, χωρίς αυθαίρετη επίκληση ιατρικής εξαίρεσης.

**SEC-05 DESIGN:** Το D10 παραμένει εκπαιδευτικό reference με συγκεκριμένη έκδοση. Δεν γίνεται automatic medical eligibility algorithm. Η διαφορά με τη δημόσια διατύπωση contraindications εξετάζεται στο OD-12. Intake flag οδηγεί σε ανθρώπινη επανεξέταση, όχι αυτόματη δήλωση ότι μια συνεδρία είναι ασφαλής. Διαδικασία περιστατικού/διακοπής ορίζεται από τη σχολή.

**SEC-06 DESIGN:** Audit trail για reviews, attendance, πρόσβαση σε health data, exports, policy publication και certificate changes, χωρίς αποθήκευση πλήρων sensitive answers στα logs. Αίτημα διαγραφής εξετάζει συνδεδεμένα records, νόμιμη διατήρηση και backup lifecycle· δεν υπόσχεται αυθαίρετη άμεση διαγραφή όλων ούτε διατηρεί επ’ αόριστον δεδομένα. Development/staging χρησιμοποιούν συνθετικά πρόσωπα.

## 12 Analytics

**ANA-01 DESIGN:** Τρία ανεξάρτητα datasets: public conversion, school operations, practice experience. Public events: view offering, view training, open cohort, submit enquiry. School: active enrollments, attendance gaps, review turnaround, pending evidence, eligibility outcomes. Practice: session totals/minutes, response rate, lateness και κατανομές ανά ακριβές form version.

**ANA-02 DESIGN:** Κάθε metric δηλώνει numerator, denominator, time window, cohort και template version. `feedback_response_rate = completed invitations / eligible issued invitations`, εφόσον υπάρχουν διακριτά invitations. Για open QR αναφέρεται response count, όχι ανακριβές ποσοστό προσκλήσεων. Group participant count δεν είναι feedback count. `approved_session_count` μετρά μοναδικά sessions με ενεργό approved revision.

**ANA-03 DESIGN:** Multi-select ποσοστά μπορεί να υπερβαίνουν συνολικά το 100%. «Δεν απάντησε», `not_applicable` και `unknown` δεν γίνονται μηδέν. Before/after είναι υποκειμενική καταγραφή με διαφορετικά διαθέσιμα options, όχι κλινικό αποτέλεσμα. L1 guidance 1–5, L2 Yes/No και legacy 1–10 δεν συγχωνεύονται σε μέσο όρο. Μικρά υποσύνολα αποκρύπτονται με configurable disclosure threshold πριν από γενικά reports· η τιμή είναι OD-11.

**ANA-04 DESIGN:** Δεν υπάρχει ranking θεραπευτών βάσει θετικού feedback. Free-text/health data δεν αποστέλλονται σε εξωτερικά analytics ή AI summarization. Η χρήση σχολίων ως testimonials είναι νέα, ξεχωριστή διαδικασία άδειας. Metrics δημοσιεύονται μόνο μετά από έλεγχο πραγματικών records· κανένας seeded counter δεν παρουσιάζεται ως κοινότητα.

## 13 Data model και όρια συστήματος

Το παρακάτω είναι λογικό μοντέλο για επέκταση του υπάρχοντος MongoDB. Δεν προϋποθέτει αλλαγή database ή framework. Κοινά πεδία όπου χρειάζονται: `id`, `created_at`, `updated_at`, `schema_version`, `created_by`, `revision`, `source_refs`. Timestamps UTC με διατήρηση timezone πραγματικής συνεδρίας· ημερομηνία χωρίς ώρα αποθηκεύεται ως date, όχι επινοημένο timestamp.

| Οντότητα | Κύρια πεδία και σχέσεις | Ακεραιότητα |
|---|---|---|
| User / RoleGrant | υπάρχον id/auth, locale, scoped role grants | Unique normalized email· grant scope και audit |
| SchoolLevel / CurriculumVersion | L1–L4, περιγραφή, εγκεκριμένα units/resources | Stable Level ID· immutable published version |
| RequirementSet | level, version, metric/unit/threshold, applicability, source_refs, policy_status | Unknown threshold = null, όχι 0 |
| Cohort / CohortMeeting | level, curriculum/ruleset, instructors, timezone, start/end | Meeting ανήκει σε ένα cohort |
| Enrollment | user, cohort, rule_version, status, exception refs | Unique ενεργή εγγραφή στο ίδιο cohort |
| Attendance / MakeupLink | enrollment, meeting, attended_minutes, status, verified_by | Unique enrollment+meeting· όχι διπλή πίστωση |
| Receiver / RestrictedIntake | practitioner owner, receiver code, protected identity, intake version | Χωριστά permissions· καμία global name deduplication |
| ConsentRecord | subject, purpose, notice version, evidence, signed/withdrawn timestamps | Immutable evidence· withdrawal ξεχωριστό event |
| PracticeCycle | practitioner, enrollment, receiver, plan, initial assessment, planned_count | Numbering μέσα στον κύκλο |
| PracticeSession / SessionRevision | enrollment, cycle nullable, type, date, minutes, participant_count, status | individual απαιτεί receiver/cycle· group δεν απαιτεί όνομα όλων |
| FormTemplateVersion / Question | audience, applicability, locale, stable question codes, constraints | Publication blocked σε unresolved question definition |
| FormSubmission / Answer | session/cycle, form version, respondent scope, answers, submitted_at, provenance | Απαντήσεις δένονται στο ακριβές schema· revision history |
| EvaluationInvitation | session, template version, token_hash, due/expiry, consumed/revoked | Unique token hash· atomic consumption |
| ReviewDecision / RequirementEvaluation | target revision, reviewer, reason, rules/results, evidence IDs | Active result ακυρώνεται αν αλλάξει target revision |
| Certificate | learner, type/scope, serial, template/rules snapshot, evidence, status | Unique serial· idempotent issuance |
| Resource / ContentRevision | parent, access scope, file hash/version, locale, provenance, publish state | Downloads εξουσιοδοτούνται κάθε φορά |
| JourneyActivity / XPLedger | user, activity type, source event, delta, legacy provenance | Unique user+source_event+reward_type |
| NotificationJob / AuditEvent | purpose, recipient, minimal payload, delivery key; actor/action/target | Idempotent delivery· redacted logs |

**DAT-01 DESIGN:** Session count και credited minutes παράγονται από evidence, δεν γράφονται απευθείας από τον client. New curriculum/rulesets δεν εφαρμόζονται αναδρομικά χωρίς explicit migration decision. Unknown legacy school status διατηρείται ως `unverified_legacy`.

**DAT-02 DESIGN:** Οι υπάρχοντες clients διατηρούν τα API contracts όπου είναι ασφαλή. Προστίθενται versioned School APIs και adapters. Ενδεικτικές λειτουργίες: list enrollments, view rules/progress, record attendance, save/submit session revision, invite feedback, review revision, publish template, issue/revoke certificate. Η οριστική διαδρομή/HTTP schema ορίζεται στο implementation PR μετά το audit· κανένας client δεν γράφει κατευθείαν database.

**DAT-03 DESIGN:** Migration χωρίς απώλεια: backup/restore proof → inventory/dry run → νέα πεδία/collections → legacy adapters → compare counts → feature flag rollout. Διατηρούνται user IDs, practice IDs, raw legacy feedback, timestamps, XP και resource references. Legacy session δεν αποκτά υποθετικό enrollment/Level από το τωρινό XP. Mapping εξετάζεται ανά record και καταγράφεται. Rollback απενεργοποιεί νέες writers χωρίς να διαγράφει νέα evidence.

## 14 Ανοιχτές αποφάσεις

Όλες είναι ανοικτές στις 29/09/2026. Owner εκπαιδευτικών αποφάσεων: Μανώλης/υπεύθυνος σχολής. Product/technical owner επιβεβαιώνει migrations και πλατφόρμες. Privacy owner και κατάλληλος σύμβουλος επιβεβαιώνουν processing policy. Οι αποφάσεις δεν έχουν ληφθεί από προηγούμενες assistant απαντήσεις.

| ID | Τι χρειάζεται να αποφασιστεί με πηγή | Ασφαλής προσωρινή συμπεριφορά | Μπλοκάρει |
|---|---|---|---|
| OD-01 | D07/D09: 12 ανά Level· D05/D01: 15· D14:20· public hours. Ποια έκδοση ισχύει ανά cohort; | Όλες οι τιμές με provenance, καμία καθολική ενεργοποίηση | Final rules/eligibility |
| OD-02 | L1 45 λεπτά έναντι 15 ωρών· L2 μία ώρα minimum ή ακριβής διάρκεια; 2–5/3–5 ανά receiver, subset/excess/aborted counts | Καταγραφή counts και minutes χωριστά | Αυτόματη πίστωση και totals certificate |
| OD-03 | L2 wording 4 sessions έναντι 3–5· πότε νέο cycle· diary progress required έναντι optional journal | Flexible cycle, όχι hard-coded 4· χωριστό log/journal | Τελικοί L2 validators |
| OD-04 | Πρακτική, κατανομή, forms, rubric και τελική αξιολόγηση μετά το L4 | Draft evidence, pending_policy | Practitioner completion |
| OD-05 | Αντιστοίχιση legacy L3A/L3B, lesson/resources/users και παλιών entitlements | Legacy IDs αμετάβλητα, κανένα αυτόματο credit | Migration ενεργών δικαιωμάτων |
| OD-06 | Πλήρης L1 practitioner φόρμα· group participant φόρμα· F04 mapping στο D14 διαφορετικό form ID | Template slots χωρίς invented questions | Δημοσίευση αντίστοιχων forms |
| OD-07 | L2 comfort options λείπουν· F03 notes λέει optional αλλά έχει *· D15 optional name/διαφορετικό guidance από F01· F01 Option 6 | Διατήρηση raw source, unresolved template fields | Form parity/publication |
| OD-08 | Group minimum size, co-facilitation, ένα feedback απαιτείται να ληφθεί ή μόνο να ζητηθεί; late/missing feedback exceptions | Καταγραφή ξεχωριστών evidence states | Group counting |
| OD-09 | Attendance thresholds, partial/makeup/support attendance, admission rules/recognition προηγούμενων σπουδών | Πραγματικά λεπτά και manual review | Automated enrollment/completion |
| OD-10 | Certificate issuer, wording, hours, signatures, accreditation evidence, revocation/public verification | Αποθήκευση μοντέλου χωρίς μη εγκεκριμένη έκδοση | Certificates release |
| OD-11 | Identity visibility, health fields minimization, controller/grounds, retention, anonymity, TTL, processors, minors, aggregate threshold | Restricted access· όχι νέα live health collection | Sensitive-data production launch |
| OD-12 | Ποια έκδοση ethics D02/D03 και safety D10/public page είναι εγκεκριμένη; incident procedure | Versioned references, human safety review | Δημοσίευση safety automation/content |
| OD-13 | Public enquiry vs booking/payment, source-of-truth CMS, domain/SEO, γλώσσες, media rights | Επαληθευμένα CTAs επικοινωνίας· όχι checkout υπόσχεση | Commerce και site cutover |
| OD-14 | XP/rewards, community opt-in και Aeon scope/data processing | Journey ιστορικό διατηρείται, κανένα academic entitlement | Νέοι rewards/AI/community |

Οι εκκρεμότητες δεν εμποδίζουν audit, security fixes, additive data model, UI με αληθινές pending states και προετοιμασία templates. Εμποδίζουν μόνο τον κανόνα/feature που θα απαιτούσε εικασία.

## 15 Κριτήρια αποδοχής

| ID | Σενάριο | Αναμενόμενο αποτέλεσμα |
|---|---|---|
| AC-01 | Όλες οι public/School οθόνες | Τέσσερα Levels· legacy Journey χωριστό |
| AC-02 | Μαθητής με υψηλό XP χωρίς enrollment | Καμία πρόσβαση σε restricted School content ή certificate |
| AC-03 | 15 συνεδρίες × 45 λεπτά | 15 sessions, 675 minutes, ξεχωριστή hours eligibility |
| AC-04 | Legacy L3B χρήστης μετά migration | Ίδιο ID/XP/history, school status μη επινοημένο |
| AC-05 | L2 πρώτη και δεύτερη συνεδρία | Initial assessment στον cycle· changes question μόνο στη δεύτερη |
| AC-06 | Ομάδα με 12 άτομα και 3 feedback submissions | Μία session credit, participant=12, responses=3 |
| AC-07 | Δύο ταυτόχρονα submits/retries | Μία υποβολή ανά invitation, μία πίστωση ανά event |
| AC-08 | Φόρμα αλλάζει αφού έχει σταλεί/απαντηθεί | Το παλιό invitation/submission κρατά την αρχική έκδοση |
| AC-09 | L2 comfort scale άγνωστη | Δεν δημοσιεύεται αυθαίρετη κλίμακα |
| AC-10 | Feedback μετά 48 ώρες | late flag· καμία αυτόματη ακύρωση εκπαιδευτικής πρακτικής |
| AC-11 | Άλλος μαθητής/instructor άλλου cohort | Άρνηση πρόσβασης σε session/intake/export/resource |
| AC-12 | Εγκεκριμένη πρακτική τροποποιείται | Νέο revision/review· προηγούμενη απόφαση παραμένει ιστορική |
| AC-13 | Attendance correction/makeup | Audit reason, σωστό total χωρίς διπλό count |
| AC-14 | Certificate διπλό request/revocation | Μία έκδοση, σωστό status και αμετάβλητο snapshot |
| AC-15 | Aggregate διαφορετικών scales | Καμία κοινή αριθμητική βαθμολογία guidance |
| AC-16 | Restore/rollback migration | Καμία απώλεια ID, raw evidence, XP ή νέων records |
| AC-17 | Public event draft ή expired | Δεν εμφανίζεται ως διαθέσιμο τρέχον event |
| AC-18 | Mobile/web form error ή διακοπή δικτύου | Σαφές error, ασφαλές draft/retry, χωρίς ψευδή success |

## 16 Παράδοση και επόμενη έκδοση

Η πρώτη έκδοση ολοκληρώνει το σχέδιο προϊόντος, την αντιπαραβολή πηγών και τον ελεγχόμενο δρόμο υλοποίησης. Δεν πιστοποιεί production readiness. Η επόμενη εκτελέσιμη εργασία είναι το P0 του phase pack: pinned repo audit και migration inventory. Οι αποφάσεις OD-01 έως OD-14 ενημερώνονται εδώ όταν δοθούν, με νέο changelog entry. Δεν δημιουργείται δεύτερο ανεξάρτητο PRD σε νέο chat.


## 21 Ανανέωση που εγκρίθηκε από τον χρήστη — 2026-09-29

**DESIGN UX-NEW-01:** Ο χρήστης εξουσιοδότησε ριζική ανανέωση της εμπειρίας,
με premium, νεανικό wellness ύφος, απλούστερη χρήση και αφαίρεση λειτουργιών
που υποβαθμίζουν τη χρηστικότητα. Η προηγούμενη απαίτηση αποφυγής συνολικού
visual redesign παύει να ισχύει. Παραμένει το υπάρχον Expo/FastAPI/MongoDB stack.

**DESIGN ADM-NEW-01:** Ο admin διαχειρίζεται περιεχόμενο μέσα στην εφαρμογή,
με draft/publish/archive και αρχεία, και λειτουργίες σχολής. Η φιλοξενία και
η λειτουργία της σχολής δεν πρέπει να απαιτούν Emergent AI ή LLM key.

**IMPLEMENTED CANDIDATE:** Νέο shell, βασικό CMS, 4-level catalog, explicit
enrollments, cohorts, attendance, private practice drafts και αρχικός review.
Δεν είναι πλήρης υλοποίηση P0–P9. Η τρέχουσα πρακτική είναι preliminary evidence,
όχι το επίσημο form workflow. Απαιτείται staging review πριν από ενεργοποίηση.
Πλήρης κατάσταση και περιορισμοί: ../app/RELEASE_NOTES.md.

Οι ανοιχτές αποφάσεις OD-01–14 δεν κλείνουν από την έγκριση του redesign.
Δεν ενεργοποιούνται αυθαίρετοι κανόνες πιστοποίησης ή μη επαληθευμένες φόρμες.


### Συνέχεια υλοποίησης — κύκλοι και προετοιμασία φορμών

Υλοποιήθηκαν κύκλοι ατομικής πρακτικής ανά enrollment/receiver code, προαιρετικός
προγραμματισμός συνεδριών χωρίς επίσημο προεπιλεγμένο όριο, και ξεχωριστός αριθμός
συμμετεχόντων ομάδας. Οι νέες ατομικές καταγραφές συνδέονται με κύκλο· τα παλιά
records παραμένουν αναγνώσιμα και χρειάζονται σύνδεση όταν επεξεργάζονται.
Προστέθηκαν revision conflicts και ιστορικό αρχικού instructor review.

Ο admin μπορεί να συντάσσει αμετάβλητες draft εκδόσεις ερωτηματολογίων,
με source reference, τύπο ερώτησης, επιλογές και required=true/false/unknown.
Οι έξι καταχωρίσεις πηγών δεν είναι ολοκληρωμένες επίσημες φόρμες. Δεν υπάρχει
endpoint ενεργοποίησης ή συλλογής απαντήσεων αυτών των drafts. OD-03/06/07 και
τα ελλείποντα πρωτογενή κείμενα εξακολουθούν να εμποδίζουν την επίσημη δημοσίευση.

## Design constraint update — 2026-09-30
The original Emergent app is the visual baseline. Preserve its typography, ivory/charcoal/gold theme, imagery and intended visual compositions while integrating functional renewal. Earlier local green wellness styling is superseded. New features must reuse the established theme. Visual parity is a preview acceptance criterion; token alignment alone is insufficient. See EMERGENT_PREVIEW_HANDOFF.md.

## Public experience — 2026-09-30
PUB-01 DESIGN (owner: product implementation; phase: public preview): Added unauthenticated /explore/services, training, about, events, journal and contact routes and a landing discovery grid. Original hero/theme retained. Content.section defaults to home for legacy records; the first ordered published page controls the section introduction and subsequent items render below. Draft section changes do not move published content until publication. Admin controls section assignment, text and publication. Layout/navigation and initial fallback copy remain code-defined; global settings are not yet a CMS feature.
Sources rechecked: https://www.soundhealing.gr/el/ , /el/about-me/ , /el/ekpaideftika-seminaria/ , /el/epikoinwnia/ (2026-09-30). Copy is concise paraphrase, with no medical outcome promises or inferred practice requirements. Events/articles use honest empty states and official-site links until editorial content is published. Contact currently opens the official contact page; no new personal-data collection or booking/payment system introduced. Rich event dates/capacity, article detail routes and global contact settings remain follow-up work.

## Public editorial controls — 2026-09-30
PUB-02 DESIGN (owner: product implementation; public preview): Section introduction pages support HTTPS image_url, image_alt, action_label and action_url. Editors see the same responsive introduction component as visitors, with non-clickable draft actions. Changes retain existing revision/publish isolation. Empty summary/body values now remain intentionally empty instead of unexpectedly restoring fallback copy. Landing discovery titles/summaries reflect published section introductions. URLs are validated server-side and unsafe schemes rejected. Existing records default to empty new fields. Global navigation/footer/contact settings and a full page preview are still separate follow-up work.
Validation: 25 backend tests, TypeScript and web export pass locally. Public about layout inspected in browser. No production changes.
