import { PracticeAssessments } from "@/src/components/Assessments";
import { CyclePicker } from "./CyclePicker";
import { Progress } from "./Progress";
import { useLanguage } from "./AppNavigation";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";
import {
  Shell,
  useUi,
  usePalette,
  Button,
  Field,
  Choices,
  useLoad,
  Status,
  ContentCard,
  ContentItem,
} from "@/src/components/Wellness";

type Enrollment = {
  id: string;
  level_id: string;
  cohort_title: string;
  status: string;
  status_label?: string;
  practitioner_submitted?: boolean;
  receiver_submitted?: boolean;
};
type Practice = {
  id: string;
  level_id: string;
  session_date: string;
  duration_minutes: number;
  status: string;
  status_label?: string;
  practitioner_submitted?: boolean;
  receiver_submitted?: boolean;
  review_note?: string;
  enrollment_id: string;
  mode: string;
  receiver_code: string;
  reflection: string;
  contraindications_checked: boolean;
  cycle_id?: string;
  participant_count?: number;
  revision?: number;
};
type School = {
  enrollments: Enrollment[];
  practices: Practice[];
  attendance: { status: string; minutes: number }[];
  certification_status?: string;
};
const empty: School = { enrollments: [], practices: [], attendance: [] };
export function Home() {
  const { user } = useAuth();
  const ui = useUi();
  const palette = usePalette();
  const router = useRouter();
  const { t } = useLanguage();
  const state = useLoad<School>("/school/me", empty);
  return (
    <Shell
      eyebrow={t("Ο ΧΩΡΟΣ ΣΟΥ", "YOUR SPACE")}
      title={t(
        `Καλώς ήρθες, ${user?.name?.split(" ")[0] || "φίλε μας"}.`,
        `Welcome, ${user?.name?.split(" ")[0] || "friend"}.`,
      )}
    >
      <View style={[ui.card, { backgroundColor: palette.sage, padding: 32 }]}>
        <Text style={ui.label}>{t("ΕΝΑΣ ΧΩΡΟΣ ΓΙΑ ΝΑ ΑΝΘΙΣΕΙΣ", "A SPACE TO FLOURISH")}</Text>
        <Text style={ui.title}>{t("Άκου. Μάθε. Εξελίξου.", "Listen. Learn. Grow.")}</Text>
        <Text style={ui.body}>
          {t(
            "Η εκπαίδευσή σου και η προσωπική σου πρακτική, σε έναν ήρεμο χώρο.",
            "Your training and your personal practice, in one calm space.",
          )}
        </Text>
        <View style={ui.row}>
          <Button
            label={t("Συνέχεια στη σχολή", "Continue to the school")}
            onPress={() => router.push("/(tabs)/academy")}
          />
          <Button
            secondary
            label={t("Καταγραφή πρακτικής", "Log a practice")}
            onPress={() => router.push("/(tabs)/practice")}
          />
        </View>
      </View>
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          <View style={ui.row}>
            {[
              [t("Εγγραφές", "Enrolments"), state.data.enrollments.length],
              [t("Πρακτικές", "Practices"), state.data.practices.length],
              [
                t("Για αξιολόγηση", "For review"),
                state.data.practices.filter((p) => p.status === "submitted")
                  .length,
              ],
            ].map(([label, value]) => (
              <View
                key={String(label)}
                style={[ui.card, { flexGrow: 1, minWidth: 180 }]}
              >
                <Text style={ui.title}>{value}</Text>
                <Text style={ui.body}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={ui.card}>
            <Text style={ui.heading}>{t("Το επόμενο βήμα σου", "Your next step")}</Text>
            {state.data.practices.some(
              (p) => p.status === "changes_requested",
            ) && (
              <Text style={ui.body}>
                {t(
                  `${state.data.practices.filter((p) => p.status === "changes_requested").length} πρακτικές έχουν σχόλια και χρειάζονται διόρθωση.`,
                  `${state.data.practices.filter((p) => p.status === "changes_requested").length} practice(s) have feedback and need revisions.`,
                )}
              </Text>
            )}
            {state.data.practices.some((p) => p.status === "draft") && (
              <Text style={ui.body}>
                {t(
                  `${state.data.practices.filter((p) => p.status === "draft").length} πρόχειρες πρακτικές περιμένουν να τις ολοκληρώσεις.`,
                  `${state.data.practices.filter((p) => p.status === "draft").length} draft practice(s) are waiting for you to complete.`,
                )}
              </Text>
            )}
            {state.data.practices.some((p) =>
              ["draft", "changes_requested"].includes(p.status),
            ) && (
              <Button
                label={t("Άνοιγμα των πρακτικών μου", "Open my practices")}
                onPress={() => router.push("/(tabs)/practice")}
              />
            )}
            {!state.data.enrollments.some((e) => e.status === "active") && (
              <Text style={ui.body}>
                {t(
                  "Δεν υπάρχει ενεργή εκπαιδευτική εγγραφή. Επικοινώνησε με τη σχολή για το τμήμα σου.",
                  "There is no active training enrolment. Contact the school about your cohort.",
                )}
              </Text>
            )}
            {state.data.enrollments.some((e) => e.status === "active") &&
              !state.data.practices.some((p) =>
                ["draft", "changes_requested"].includes(p.status),
              ) && (
                <Text style={ui.body}>
                  {t(
                    "Δεν υπάρχουν πρόχειρες πρακτικές ή διορθώσεις σε αναμονή. Μπορείς να συνεχίσεις με το υλικό της σχολής.",
                    "No draft practices or pending revisions. You can carry on with the school material.",
                  )}
                </Text>
              )}
          </View>
        </>
      )}
      <View style={ui.card}>
        <Text style={ui.heading}>{t("Ένα βήμα τη φορά", "One step at a time")}</Text>
        <Text style={ui.body}>
          {t(
            "Η εκπαιδευτική σου πρόοδος βασίζεται στην εγγραφή, την παρουσία και την αξιολόγηση της πρακτικής.",
            "Your training progress is built on enrolment, attendance and practice review.",
          )}
        </Text>
      </View>
    </Shell>
  );
}
export function SchoolScreen() {
  const ui = useUi();
  const palette = usePalette();
  const { t } = useLanguage();
  const catalog = useLoad<
    { id: string; title: string; description: string; is_enrolled: boolean }[]
  >("/school/catalog", []);
  const library = useLoad<ContentItem[]>("/content/library", []);
  return (
    <Shell eyebrow={t("ΣΧΟΛΗ", "SCHOOL")} title={t("Η διαδρομή της μάθησης.", "The learning path.")}>
      <Text style={ui.body}>
        {t(
          "Τέσσερα εκπαιδευτικά Levels. Το υλικό σου ακολουθεί την εγγραφή σου στη σχολή.",
          "Four training Levels. Your material follows your enrolment in the school.",
        )}
      </Text>
      <Text style={ui.heading}>{t("Το εκπαιδευτικό σου υλικό", "Your training material")}</Text>
      <Status state={library} />
      {library.data
        .filter((i) => i.published.kind === "lesson")
        .map((i) => (
          <ContentCard key={i.id} item={i} complete />
        ))}
      {!library.loading &&
        !library.error &&
        !library.data.some((i) => i.published.kind === "lesson") && (
          <View style={ui.card}>
            <Text style={ui.body}>
              {t(
                "Δεν υπάρχει ακόμη δημοσιευμένο υλικό για τις εγγραφές σου. Η σχολή θα το προσθέσει εδώ.",
                "There is no published material for your enrolments yet. The school will add it here.",
              )}
            </Text>
          </View>
        )}
      <Progress />
      <Text style={ui.heading}>{t("Τα Levels της σχολής", "The school Levels")}</Text>
      <Status state={catalog} />
      {catalog.data.map((l) => (
        <View
          key={l.id}
          style={[
            ui.card,
            { backgroundColor: l.is_enrolled ? palette.sage : palette.white },
          ]}
        >
          <Text style={ui.label}>
            {l.id} ·{" "}
            {l.is_enrolled
              ? t("ΕΝΕΡΓΗ ΕΓΓΡΑΦΗ", "ACTIVE ENROLMENT")
              : t("ΓΝΩΡΙΣΕ ΤΟ LEVEL", "EXPLORE THE LEVEL")}
          </Text>
          <Text style={ui.heading}>{l.title}</Text>
          <Text style={ui.body}>{l.description}</Text>
        </View>
      ))}
    </Shell>
  );
}
export function JourneyScreen() {
  const ui = useUi();
  const palette = usePalette();
  const { t } = useLanguage();
  const state = useLoad<ContentItem[]>("/content/library", []);
  return (
    <Shell eyebrow={t("ΤΑΞΙΔΙ", "JOURNEY")} title={t("Λίγος χρόνος για εσένα.", "A little time for you.")}>
      <Text style={ui.body}>
        {t(
          "Μικρές πρακτικές ακρόασης και προσωπικής φροντίδας, στον δικό σου ρυθμό.",
          "Short listening and self-care practices, at your own pace.",
        )}
      </Text>
      <Status state={state} />
      {state.data
        .filter((i) => i.published.kind === "journey")
        .map((i) => (
          <ContentCard key={i.id} item={i} />
        ))}
      {!state.loading &&
        !state.error &&
        !state.data.some((i) => i.published.kind === "journey") && (
          <View style={[ui.card, { backgroundColor: palette.peach }]}>
            <Text style={ui.heading}>{t("Ο χώρος σου ετοιμάζεται.", "Your space is being prepared.")}</Text>
            <Text style={ui.body}>
              {t(
                "Οι δημοσιευμένες πρακτικές της ομάδας θα εμφανίζονται εδώ.",
                "The group's published practices will appear here.",
              )}
            </Text>
          </View>
        )}
    </Shell>
  );
}
export function PracticeScreen() {
  const ui = useUi();
  const { t } = useLanguage();
  const state = useLoad<School>("/school/me", empty);
  const [enrollment, setEnrollment] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [duration, setDuration] = useState("60"),
    [mode, setMode] = useState("individual"),
    [code, setCode] = useState(""),
    [reflection, setReflection] = useState(""),
    [safetyChecked, setSafetyChecked] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(""),
    [cycleId, setCycleId] = useState(""),
    [participantCount, setParticipantCount] = useState(""),
    [revision, setRevision] = useState(1);
  const save = async () => {
    const parsedDate = new Date(`${date}T12:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      setMessage(
        t(
          "Συμπλήρωσε έγκυρη ημερομηνία με μορφή YYYY-MM-DD.",
          "Enter a valid date in YYYY-MM-DD format.",
        ),
      );
      return;
    }
    if (
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1 ||
      Number(duration) > 1440
    ) {
      setMessage(
        t(
          "Η διάρκεια πρέπει να είναι ακέραιος αριθμός από 1 έως 1440 λεπτά.",
          "Duration must be a whole number from 1 to 1440 minutes.",
        ),
      );
      return;
    }
    if (!code.trim() || (mode === "individual" && !cycleId)) {
      setMessage(
        t(
          "Επίλεξε κύκλο δέκτη ή συμπλήρωσε κωδικό ομάδας.",
          "Choose a receiver cycle or enter a group code.",
        ),
      );
      return;
    }
    if (
      mode === "group" &&
      (!Number.isInteger(Number(participantCount)) ||
        Number(participantCount) < 2 ||
        Number(participantCount) > 10000)
    ) {
      setMessage(
        t(
          "Συμπλήρωσε ακέραιο αριθμό συμμετεχόντων από 2 έως 10000.",
          "Enter a whole number of participants from 2 to 10000.",
        ),
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await api.request({
        method: editing ? "PUT" : "POST",
        url: editing ? `/school/practices/${editing}` : "/school/practices",
        data: {
          ...(editing ? { revision } : {}),
          cycle_id: mode === "individual" ? cycleId || null : null,
          participant_count: mode === "group" ? Number(participantCount) : null,
          enrollment_id: enrollment,
          session_date: date,
          duration_minutes: Number(duration),
          mode,
          receiver_code: code,
          reflection,
          contraindications_checked: safetyChecked,
        },
      });
      setEditing("");
      setMessage(
        t(
          "Το πρόχειρο αποθηκεύτηκε. Μπορείς να το στείλεις για αρχικό έλεγχο.",
          "The draft was saved. You can send it for an initial review.",
        ),
      );
      setCode("");
      setCycleId("");
      setReflection("");
      setSafetyChecked(false);
      setParticipantCount("");
      await state.reload();
    } catch (error: any) {
      if (error?.response?.status === 409) await state.reload();
      setMessage(
        error?.response?.status === 409
          ? t(
              "Η καταγραφή άλλαξε. Άνοιξέ την ξανά για επεξεργασία πριν αποθηκεύσεις.",
              "The record changed. Reopen it for editing before you save.",
            )
          : error?.response?.status === 403
            ? t(
                "Χρειάζεται ενεργή εγγραφή για να αποθηκευτεί η πρακτική.",
                "An active enrolment is required to save the practice.",
              )
            : t(
                "Δεν αποθηκεύτηκε. Τα στοιχεία σου παραμένουν στη φόρμα· δοκίμασε ξανά.",
                "Not saved. Your details remain in the form — please try again.",
              ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell eyebrow={t("ΠΡΑΚΤΙΚΗ", "PRACTICE")} title={t("Η εμπειρία γίνεται μάθηση.", "Experience becomes learning.")}>
      <Text style={ui.body}>
        {t(
          "Κατάγραψε την πρακτική σου με κωδικό δέκτη ή ομάδας, χωρίς αναγνωριστικά υγείας. Ο αρχικός έλεγχος δεν ισοδυναμεί με πιστοποίηση.",
          "Log your practice with a receiver or group code, without any health identifiers. The initial review does not amount to certification.",
        )}
      </Text>
      <Status state={state} />
      {state.data.enrollments.some((e) => e.status === "active") ? (
        <View style={ui.card}>
          <Text style={ui.heading}>
            {editing
              ? t("Επεξεργασία πρακτικής", "Edit practice")
              : t("Νέο πρόχειρο πρακτικής", "New practice draft")}
          </Text>
          <Text style={ui.body}>{t("Εκπαιδευτική εγγραφή", "Training enrolment")}</Text>
          <View style={ui.row}>
            {state.data.enrollments
              .filter((e) => e.status === "active")
              .map((e) => (
                <Button
                  key={e.id}
                  secondary={enrollment !== e.id}
                  label={`${e.level_id} · ${e.cohort_title}`}
                  onPress={() => {
                    setEnrollment(e.id);
                    setCycleId("");
                    setCode("");
                  }}
                />
              ))}
          </View>
          <Choices
            label={t("Μορφή", "Format")}
            values={[t("Ατομική", "Individual"), t("Ομαδική", "Group")]}
            value={mode === "individual" ? t("Ατομική", "Individual") : t("Ομαδική", "Group")}
            onChange={(v) => {
              setMode(v === t("Ατομική", "Individual") ? "individual" : "group");
              setCycleId("");
              setCode("");
              setParticipantCount("");
            }}
          />
          {mode === "individual" && (
            <CyclePicker
              key={`${enrollment}:${state.data.practices.length}`}
              enrollment={enrollment}
              value={cycleId}
              onSelect={(id, code) => {
                setCycleId(id);
                setCode(code);
              }}
            />
          )}
          {mode === "group" && (
            <Field
              label={t("Αριθμός συμμετεχόντων", "Number of participants")}
              value={participantCount}
              onChange={setParticipantCount}
            />
          )}
          <Field
            label={t("Ημερομηνία (YYYY-MM-DD)", "Date (YYYY-MM-DD)")}
            value={date}
            onChange={setDate}
          />
          <Field
            label={t("Διάρκεια σε λεπτά", "Duration in minutes")}
            value={duration}
            onChange={setDuration}
          />
          {mode === "individual" ? (
            <Text style={ui.body}>
              {t("Κωδικός δέκτη:", "Receiver code:")}{" "}
              {code || t("Επίλεξε κύκλο παραπάνω", "Select a cycle above")}
            </Text>
          ) : (
            <Field
              label={t("Κωδικός δέκτη / ομάδας", "Receiver / group code")}
              value={code}
              onChange={setCode}
            />
          )}
          <Field
            label={t("Αναστοχασμός", "Reflection")}
            value={reflection}
            onChange={setReflection}
            multiline
          />
          <Choices
            label={t("Έγινε έλεγχος αντενδείξεων;", "Were contraindications checked?")}
            values={[t("Όχι", "No"), t("Ναι", "Yes")]}
            value={safetyChecked ? t("Ναι", "Yes") : t("Όχι", "No")}
            onChange={(v) => setSafetyChecked(v === t("Ναι", "Yes"))}
          />
          <Button
            label={busy ? t("Αποθήκευση…", "Saving…") : t("Αποθήκευση προχείρου", "Save draft")}
            disabled={
              busy ||
              !enrollment ||
              (mode === "individual" && !cycleId && !editing)
            }
            onPress={() => void save()}
          />
          {editing && (
            <Button
              secondary
              disabled={busy}
              label={t("Κλείσιμο επεξεργασίας", "Close editing")}
              onPress={() => {
                setEditing("");
                setCycleId("");
                setCode("");
                setReflection("");
                setSafetyChecked(false);
                setParticipantCount("");
                setMessage("");
              }}
            />
          )}
        </View>
      ) : !state.loading && !state.error ? (
        <View style={ui.card}>
          <Text style={ui.body}>
            {t(
              "Χρειάζεται ενεργή εγγραφή από τη σχολή για νέα εκπαιδευτική πρακτική.",
              "An active enrolment from the school is required for a new training practice.",
            )}
          </Text>
        </View>
      ) : null}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
      {state.data.practices.map((p) => (
        <View key={p.id} style={ui.card}>
          <Text style={ui.label}>
            {p.level_id} ·{" "}
            {p.status_label ||
              (
                {
                  draft: t("Πρόχειρη", "Draft"),
                  submitted: t("Προς έλεγχο", "Under review"),
                  changes_requested: t("Χρειάζεται διόρθωση", "Needs revision"),
                  reviewed: t("Εγκρίθηκε", "Approved"),
                } as Record<string, string>
              )[p.status] ||
              p.status}
          </Text>
          <Text style={ui.heading}>
            {p.session_date} · {p.duration_minutes} {t("λεπτά", "min")}
          </Text>
          {p.status === "submitted" && (
            <Text style={ui.body}>
              {t("Αξιολόγηση μαθητή:", "Student review:")}{" "}
              {p.practitioner_submitted
                ? t("Υποβλήθηκε", "Submitted")
                : t("Εκκρεμεί", "Pending")}{" "}
              · {t("Απάντηση δέκτη:", "Receiver response:")}{" "}
              {p.receiver_submitted
                ? t("Παραλήφθηκε", "Received")
                : t("Εκκρεμεί", "Pending")}
            </Text>
          )}
          <PracticeAssessments practiceId={p.id} onChanged={state.reload} />
          {p.review_note && <Text style={ui.body}>{p.review_note}</Text>}
          {["draft", "changes_requested"].includes(p.status) && (
            <Button
              secondary
              label={t("Επεξεργασία", "Edit")}
              onPress={() => {
                setEditing(p.id);
                setCycleId(p.cycle_id || "");
                setParticipantCount(
                  p.participant_count ? String(p.participant_count) : "",
                );
                setRevision(p.revision || 1);
                setEnrollment(p.enrollment_id);
                setDate(p.session_date);
                setDuration(String(p.duration_minutes));
                setMode(p.mode);
                setCode(p.receiver_code);
                setReflection(p.reflection);
                setSafetyChecked(!!p.contraindications_checked);
                setMessage(
                  t(
                    "Η πρακτική άνοιξε στη φόρμα παραπάνω.",
                    "The practice is open in the form above.",
                  ),
                );
              }}
            />
          )}
          {["draft", "changes_requested"].includes(p.status) && (
            <Button
              label={t("Υποβολή για αρχικό έλεγχο", "Submit for initial review")}
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await api.post(`/school/practices/${p.id}/submit`);
                  await state.reload();
                  setMessage(t("Η πρακτική υποβλήθηκε.", "The practice was submitted."));
                } catch (error: any) {
                  setMessage(
                    error?.response?.status === 422
                      ? t(
                          "Χρειάζονται αναστοχασμός και επιβεβαίωση ασφάλειας.",
                          "A reflection and a safety confirmation are required.",
                        )
                      : error?.response?.status === 403
                        ? t(
                            "Η εγγραφή δεν είναι ενεργή. Επικοινώνησε με τη σχολή.",
                            "The enrolment is not active. Contact the school.",
                          )
                        : t(
                            "Η υποβολή δεν επιβεβαιώθηκε. Ανανέωσε τη σελίδα για να ελέγξεις την κατάστασή της.",
                            "The submission was not confirmed. Refresh the page to check its status.",
                          ),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
        </View>
      ))}
    </Shell>
  );
}
export { PublicExperience as PublicScreen } from "./PublicExperience";
