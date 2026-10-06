import { PendingInbox } from "@/src/components/PendingInbox";
import { MembersAdmin } from "@/src/components/MemberProfile";
import { AdminCalendar } from "@/src/components/AdminCalendar";
import { MediaLibrary } from "@/src/components/MediaLibrary";
import { PracticeAssessments } from "@/src/components/Assessments";
import {
  NavigationEditor,
  NavigationItem,
} from "@/src/components/NavigationEditor";
import { EditorialIntro } from "@/src/components/EditorialIntro";
import { FormWorkspace } from "@/src/components/FormWorkspace";
import { Progress } from "@/src/components/Progress";
import { Activity } from "@/src/components/Activity";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { wellness } from "@/src/theme";
import { AdminHome } from "@/src/components/AdminHome";
import { ResourcesSection } from "@/src/components/ResourcesSection";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/auth/AuthContext";
import {
  Shell,
  ui,
  Button,
  Field,
  Choices,
  useLoad,
  Status,
} from "@/src/components/Wellness";
type Draft = {
  title: string;
  summary: string;
  body: string;
  kind: string;
  section?: string;
  show_testimonials?: boolean;
  show_partners?: boolean;
  show_socials?: boolean;
  navigation?: NavigationItem[] | null;
  image_url?: string;
  photo_slot?: string;
  event_end_date?: string;
  event_date?: string;
  event_start_date?: string;
  event_price?: string;
  event_phone?: string;
  event_program?: string;
  event_audience?: string;
  event_certification?: string;
  training_level?: number | null;
  event_time?: string;
  event_location?: string;
  image_alt?: string;
  action_label?: string;
  action_url?: string;
  level_id: string | null;
  media_url: string;
  order: number;
};
type Item = {
  id: string;
  draft: Draft;
  revision: number;
  published: Draft | null;
  archived: boolean;
  history?: (Draft & { revision: number; published_at: string })[];
};
type Workspace = {
  content: Item[];
  cycles: {
    id: string;
    intended_focus: string;
    receiver_expectations: string;
  }[];
  users: { id: string; name: string; email: string; role: string }[];
  cohorts: { id: string; title: string; level_id: string }[];
  enrollments: {
    id: string;
    user_id: string;
    cohort_id: string;
    cohort_title: string;
    status: string;
    status_label?: string;
  }[];
  practices: {
    id: string;
    level_id: string;
    session_date: string;
    reflection: string;
    mode: string;
    participant_count?: number;
    receiver_code: string;
    cycle_id?: string;
    status: string;
    status_label?: string;
  }[];
};
const attendanceLabels: Record<string, string> = {
  present: "Παρουσία",
  absent: "Απουσία",
  excused: "Δικαιολογημένη απουσία",
};
const practiceLabels: Record<string, string> = {
  submitted: "Για έλεγχο",
  changes_requested: "Για διόρθωση",
  reviewed: "Ελεγμένη",
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("el-GR");
const fresh: Draft = {
  title: "",
  summary: "",
  body: "",
  kind: "page",
  section: "home",
  level_id: null,
  media_url: "",
  order: 0,
};
export default function Admin() {
  const { user } = useAuth();
  if (!user || !["admin", "instructor"].includes(user.role))
    return (
      <Shell eyebrow="ΧΩΡΟΣ ΕΡΓΑΣΙΑΣ" title="Περιορισμένη πρόσβαση">
        <Text style={ui.body}>
          Αυτός ο χώρος είναι διαθέσιμος στην ομάδα της σχολής.
        </Text>
      </Shell>
    );
  return <WorkspaceScreen />;
}
function WorkspaceScreen() {
  const { user } = useAuth();
  const state = useLoad<Workspace>("/admin/workspace", {
    content: [],
    cycles: [],
    users: [],
    cohorts: [],
    enrollments: [],
    practices: [],
  });
  const [picker, setPicker] = useState(false);
  const [section, setSection] = useState("Επισκόπηση"),
    [draft, setDraft] = useState<Draft>({ ...fresh }),
    [edit, setEdit] = useState<Item | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [contentScope, setContentScope] = useState("Όλα"),
    [cohortTitle, setCohortTitle] = useState(""),
    [level, setLevel] = useState("L1"),
    [instructor, setInstructor] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [student, setStudent] = useState(""),
    [cohort, setCohort] = useState(""),
    [enrollment, setEnrollment] = useState(""),
    [minutes, setMinutes] = useState("60"),
    [attendance, setAttendance] = useState("present"),
    [notes, setNotes] = useState<Record<string, string>>({});
  const run = async (
    task: () => Promise<unknown>,
    success = "Αποθηκεύτηκε.",
  ) => {
    setBusy(true);
    setMessage("");
    try {
      await task();
      await state.reload();
      setMessage(success);
    } catch (e: any) {
      setMessage(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Δεν αποθηκεύτηκε. Έλεγξε τα πεδία και δοκίμασε ξανά.",
      );
    } finally {
      setBusy(false);
    }
  };
  const set = (key: keyof Draft, value: any) =>
    setDraft({ ...draft, [key]: value });
  return (
    <Shell
      eyebrow="ΧΩΡΟΣ ΤΗΣ ΣΧΟΛΗΣ"
      title="Η σχολή στα χέρια σου."
      notifications
    >
      <Text style={ui.body}>
        Διαχείριση περιεχομένου, εκπαίδευσης και πρακτικής από έναν χώρο.
      </Text>
      {user?.role === "admin" && (
        <AdminHome
          stats={[
            {
              label: "Μαθητές",
              value: state.data.users.filter((u: any) => u.role === "student")
                .length,
            },
            {
              label: "Ενεργές εγγραφές",
              value: state.data.enrollments.filter(
                (e: any) => e.status === "active",
              ).length,
            },
            { label: "Τμήματα", value: state.data.cohorts.length },
            {
              label: "Για έλεγχο",
              value: state.data.practices.filter(
                (p: any) => p.status === "submitted",
              ).length,
            },
          ]}
        />
      )}
      <Choices
        label="Ενότητα"
        values={
          user?.role === "admin"
            ? [
                "Επισκόπηση",
                "Μέλη",
                "Ημερολόγιο",
                "Φωτογραφίες",
                "Περιεχόμενο",
                "Φόρμες",
                "Τμήματα",
                "Εγγραφές",
                "Παρουσίες",
                "Πρόοδος",
                "Ιστορικό",
                "Αξιολογήσεις",
              ]
            : ["Επισκόπηση", "Παρουσίες", "Πρόοδος", "Αξιολογήσεις"]
        }
        value={section}
        onChange={(value) => {
          setSection(value);
          setSearch("");
          setMessage("");
        }}
      />
      <Status state={state} />
      {section === "Μέλη" && user?.role === "admin" && (
        <MembersAdmin cohorts={state.data.cohorts} />
      )}
      {section === "Ημερολόγιο" && user?.role === "admin" && (
        <AdminCalendar
          cohorts={state.data.cohorts}
          content={state.data.content}
          onOpen={setSection}
        />
      )}
      {section === "Περιεχόμενο" && user?.role === "admin" && (
        <View style={ui.card}>
          <Text style={ui.body}>
            Εισήγαγε τα σεμινάρια ως πρόχειρα. Έλεγξε κείμενα, ημερομηνίες,
            τιμές και φωτογραφίες και δημοσίευσε όσα θέλεις. Οι δικές σου
            αλλαγές υπερισχύουν του site.
          </Text>
          <Button
            secondary
            disabled={busy}
            label="Εισαγωγή σεμιναρίων για επεξεργασία"
            onPress={() =>
              void run(
                () => api.post("/admin/trainings/import"),
                "Τα νέα σεμινάρια προστέθηκαν ως πρόχειρα. Οι υπάρχουσες αλλαγές διατηρήθηκαν.",
              )
            }
          />
        </View>
      )}
      {section === "Φωτογραφίες" && user?.role === "admin" && <MediaLibrary />}
      {section === "Επισκόπηση" && (
        <View style={{ gap: 16 }}>
          <Text style={ui.heading}>Κέντρο διαχείρισης</Text>
          {user?.role === "admin" && (
            <PendingInbox
              cohorts={state.data.cohorts}
              onPractices={() => setSection("Αξιολογήσεις")}
            />
          )}
          <View style={ui.row}>
            {(user?.role === "admin"
              ? [
                  [
                    "Μέλη",
                    "Αιτήσεις εγγραφής, προφίλ, όργανα και επιβεβαίωση πορείας ανά Level.",
                  ],
                  [
                    "Ημερολόγιο",
                    "Πρόγραμμα, ενάρξεις τμημάτων, παρουσίες και πρακτικές.",
                  ],
                  [
                    "Φωτογραφίες",
                    "Μεταφόρτωση και επιλογή εικόνων για το περιεχόμενο.",
                  ],
                  ["Εγγραφές", "Μαθητές και εγγραφές στα τμήματα."],
                  [
                    "Περιεχόμενο",
                    "Κείμενα, εικόνες, εκπαιδευτικά, εκδηλώσεις, υπηρεσίες και δημόσιο μενού.",
                  ],
                  ["Τμήματα", "Levels, ημερομηνίες έναρξης και εκπαιδευτές."],
                  ["Φόρμες", "Φόρμες αξιολόγησης μαθητών και δεκτών."],
                  ["Ιστορικό", "Ιστορικό ενεργειών διαχείρισης."],
                ]
              : []
            )
              .concat([
                [
                  "Αξιολογήσεις",
                  "Έλεγχος πρακτικών, απαντήσεις αξιολογήσεων και διορθώσεις.",
                ],
                [
                  "Πρόοδος",
                  "Ώρες πρακτικής και παρακολούθησης ανά μαθητή και Level.",
                ],
                [
                  "Παρουσίες",
                  "Καταγραφή ημερομηνίας, παρουσίας και λεπτών παρακολούθησης.",
                ],
              ])
              .map(([target, description]) => (
                <Pressable
                  key={target}
                  accessibilityRole="button"
                  accessibilityLabel={`Άνοιγμα: ${target}`}
                  onPress={() => setSection(target)}
                  style={({ pressed }) => [
                    ui.card,
                    {
                      flexGrow: 1,
                      flexBasis: "46%",
                      padding: 0,
                      overflow: "hidden",
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View
                    style={{
                      height: 56,
                      backgroundColor: wellness.lavender,
                      borderBottomWidth: 1,
                      borderColor: wellness.lavenderInk,
                      justifyContent: "center",
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text style={[ui.label, { color: wellness.lavenderInk }]}>
                      {target === "Εγγραφές"
                        ? "ΜΑΘΗΤΕΣ & ΕΓΓΡΑΦΕΣ"
                        : target.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ padding: 14 }}>
                    <Text style={[ui.body, { fontSize: 12 }]} numberOfLines={3}>
                      {description}
                    </Text>
                  </View>
                </Pressable>
              ))}
          </View>
        </View>
      )}
      {section === "Ιστορικό" && user?.role === "admin" && <Activity />}
      {["Εγγραφές", "Παρουσίες"].includes(section) && (
        <Field
          label="Αναζήτηση στην τρέχουσα λίστα: όνομα, email ή τμήμα"
          value={search}
          onChange={setSearch}
        />
      )}
      {section === "Πρόοδος" && <Progress staff />}
      {!!message && (
        <View style={ui.card}>
          <Text accessibilityLiveRegion="polite" style={ui.body}>
            {message}
          </Text>
        </View>
      )}
      {section === "Φόρμες" && user?.role === "admin" && <FormWorkspace />}
      {section === "Περιεχόμενο" && (
        <>
          <View style={ui.card}>
            <Text style={ui.heading}>
              {edit ? "Επεξεργασία προχείρου" : "Νέο περιεχόμενο"}
            </Text>
            {!edit && (
              <View style={ui.card}>
                <Text style={ui.heading}>Τι θέλεις να προσθέσεις;</Text>
                <Text style={ui.body}>
                  Διάλεξε αφετηρία πριν γράψεις. Αλλάζει μόνο τον τύπο, την
                  ενότητα και την πρόσβαση· κρατά τα κείμενά σου.
                </Text>
                <View style={ui.row}>
                  {[
                    ["Υπηρεσία", "announcement", "services"],
                    ["Άρθρο", "announcement", "journal"],
                    ["Μαρτυρία μαθητή", "testimonial", "home"],
                    ["Λογότυπο συνεργάτη", "partner", "home"],
                    ["Κοινωνικό δίκτυο", "social", "home"],
                    ["Event Μανώλη", "announcement", "events"],
                    ["Εκπαιδευτικό σεμινάριο", "announcement", "training"],
                    ["Press / Media", "announcement", "about"],
                    ["Συχνή ερώτηση", "announcement", "contact"],
                    ["Μάθημα", "lesson", "home"],
                    ["Προσωπική πρακτική", "journey", "home"],
                    ["Ρυθμίσεις ιστοτόπου", "site_settings", "home"],
                    ["Φωτογραφίες εφαρμογής", "app_photo", "home"],
                  ].map(([label, kind, target]) => (
                    <Button
                      key={label}
                      secondary
                      label={label}
                      onPress={() =>
                        setDraft({
                          ...draft,
                          kind,
                          section: target,
                          action_label:
                            target === "training"
                              ? "Πληροφορίες & εγγραφή"
                              : target === "events"
                                ? "Πληροφορίες & συμμετοχή"
                                : draft.action_label,
                          level_id: null,
                        })
                      }
                    />
                  ))}
                </View>
                <Text style={ui.body}>
                  Για εκπαιδευτικό υλικό όρισε το Level πριν τη δημοσίευση. Οι
                  εκδηλώσεις υποστηρίζουν περιγραφή και σύνδεσμο συμμετοχής·
                  ημερολόγιο, θέσεις και κρατήσεις δεν είναι ακόμη ενεργά.
                </Text>
              </View>
            )}
            {["testimonial", "partner", "social"].includes(draft.kind) && (
              <Text style={ui.body}>
                {draft.kind === "testimonial"
                  ? "Τίτλος: όνομα μαθητή. Περιγραφή: σύντομη επαληθευμένη μαρτυρία. Σύνδεσμος: πηγή."
                  : draft.kind === "partner"
                    ? "Τίτλος: όνομα συνεργάτη. Εικόνα: επίσημο λογότυπο. Σύνδεσμος: ιστοσελίδα συνεργάτη."
                    : "Τίτλος: κοινωνικό δίκτυο. Σύνδεσμος: επίσημο προφίλ."}
              </Text>
            )}
            <Choices
              label="Τύπος"
              values={[
                "page",
                "lesson",
                "journey",
                "announcement",
                "hero",
                "site_settings",
                "testimonial",
                "partner",
                "social",
                "app_photo",
              ]}
              value={draft.kind}
              onChange={(v) => set("kind", v)}
            />
            {draft.kind === "app_photo" && (
              <View style={ui.card}>
                <Text style={ui.heading}>Φωτογραφίες εφαρμογής</Text>
                <Text style={ui.body}>
                  Επίλεξε θέση, διάλεξε ή ανέβασε φωτογραφία στη βιβλιοθήκη,
                  αποθήκευσε και δημοσίευσε. Για αντικατάσταση, επεξεργάσου την
                  υπάρχουσα καταχώριση της ίδιας θέσης.
                </Text>
                {[
                  ["banner", "Banner αρχικής"],
                  ["about", "Μανώλης"],
                  ["soundhealing", "Ηχοθεραπεία"],
                  ["L1", "Level 1"],
                  ["L2", "Level 2"],
                  ["L3", "Level 3"],
                  ["L4", "Level 4"],
                  ["past_L1", "Παλαιότερο εκπαιδευτικό Level 1"],
                  ["past_L2", "Παλαιότερο εκπαιδευτικό Level 2"],
                ].map(([slot, label]) => (
                  <Button
                    key={slot}
                    secondary={draft.photo_slot !== slot}
                    label={label}
                    onPress={() =>
                      setDraft((d) => ({
                        ...d,
                        photo_slot: slot,
                        section: "home",
                        level_id: null,
                        title: label,
                      }))
                    }
                  />
                ))}
              </View>
            )}
            <Choices
              label="Δημόσια ενότητα"
              values={[
                "home",
                "services",
                "training",
                "about",
                "soundhealing",
                "events",
                "journal",
                "contact",
              ]}
              value={draft.section || "home"}
              onChange={(v) => set("section", v)}
            />
            <Text style={ui.body}>
              home: Αρχική · services: Υπηρεσίες · training: Εκπαιδεύσεις /
              εγγραφές · about: Σχετικά · soundhealing: Ηχοθεραπεία · events:
              Αυτοτελή events Μανώλη · journal: Άρθρα · contact: Επικοινωνία.
              Για δημόσια εμφάνιση χρησιμοποίησε τύπο page ή announcement και
              πρόσβαση Όλοι.
            </Text>
            <Choices
              label="Εκπαιδευτική πρόσβαση"
              values={["Όλοι", "L1", "L2", "L3", "L4"]}
              value={draft.level_id || "Όλοι"}
              onChange={(v) => set("level_id", v === "Όλοι" ? null : v)}
            />
            {draft.kind === "site_settings" && (
              <View style={ui.card}>
                <Text style={ui.heading}>
                  Ταυτότητα και επικοινωνία δημόσιου χώρου
                </Text>
                <Text style={ui.body}>
                  Τίτλος: όνομα στην κεφαλίδα. Σύντομη περιγραφή: υπότιτλος.
                  Περιεχόμενο: footer. Ο σύνδεσμος παρακάτω ορίζει την κεντρική
                  επικοινωνία. Επίλεξε πρόσβαση Όλοι. Ισχύει η πρώτη
                  δημοσιευμένη ρύθμιση στη σειρά· επεξεργάσου την ίδια εγγραφή
                  για μελλοντικές αλλαγές.
                </Text>
              </View>
            )}
            <Field
              label="Τίτλος"
              value={draft.title}
              onChange={(v) => set("title", v)}
            />
            {draft.kind === "hero" && (
              <Text style={ui.body}>
                Δημόσια εισαγωγή: επίλεξε πρόσβαση «Όλοι». Χρησιμοποιούνται ο
                τίτλος, η σύντομη περιγραφή και η εικόνα. Αν υπάρχουν πολλές
                δημοσιευμένες εισαγωγές, εμφανίζεται η πρώτη στη σειρά.
              </Text>
            )}
            <Field
              label="Σειρά εμφάνισης (0–10000)"
              value={String(draft.order)}
              onChange={(value) => set("order", Number(value))}
            />
            <Field
              label="Σύντομη περιγραφή"
              value={draft.summary}
              onChange={(v) => set("summary", v)}
            />
            <Field
              label="Περιεχόμενο"
              value={draft.body}
              onChange={(v) => set("body", v)}
              multiline
            />
            <Field
              label={
                draft.kind === "hero"
                  ? "Εικόνα εισαγωγής HTTPS (προαιρετικό)"
                  : "Σύνδεσμος υλικού HTTPS (προαιρετικό)"
              }
              value={draft.media_url}
              onChange={(v) => set("media_url", v)}
            />
            {draft.kind === "site_settings" && (
              <View style={ui.card}>
                <Text style={ui.heading}>Ενότητες δημόσιας αρχικής</Text>
                {(
                  [
                    ["show_testimonials", "Μαρτυρίες μαθητών"],
                    ["show_partners", "Λογότυπα συνεργατών"],
                    ["show_socials", "Κοινωνικά δίκτυα"],
                  ] as const
                ).map(([key, label]) => (
                  <Choices
                    key={key}
                    label={label}
                    values={["Εμφάνιση", "Απόκρυψη"]}
                    value={draft[key] === false ? "Απόκρυψη" : "Εμφάνιση"}
                    onChange={(v) => set(key, v === "Εμφάνιση")}
                  />
                ))}
                <Text style={ui.body}>
                  Οι αλλαγές εμφανίζονται δημόσια μετά τη δημοσίευση των
                  ρυθμίσεων.
                </Text>
              </View>
            )}
            {draft.kind === "site_settings" && (
              <NavigationEditor
                value={draft.navigation}
                onChange={(v) => set("navigation", v)}
              />
            )}
            {[
              "page",
              "announcement",
              "site_settings",
              "testimonial",
              "partner",
              "social",
              "app_photo",
            ].includes(draft.kind) && (
              <>
                {[
                  "page",
                  "announcement",
                  "testimonial",
                  "partner",
                  "social",
                  "app_photo",
                ].includes(draft.kind) && (
                  <>
                    {" "}
                    <Field
                      label="Εικόνα ενότητας (σύνδεσμος ή επιλογή από τη βιβλιοθήκη)"
                      value={draft.image_url || ""}
                      onChange={(v) => set("image_url", v)}
                    />
                    <Button
                      secondary
                      label={
                        picker
                          ? "Κλείσιμο βιβλιοθήκης"
                          : "Επιλογή από βιβλιοθήκη φωτογραφιών"
                      }
                      onPress={() => setPicker(!picker)}
                    />
                    {picker && (
                      <MediaLibrary
                        onSelect={(photo) => {
                          setDraft((d) => ({
                            ...d,
                            image_url: photo.url,
                            image_alt: photo.alt,
                          }));
                          setPicker(false);
                        }}
                      />
                    )}
                    <Field
                      label="Περιγραφή εικόνας"
                      value={draft.image_alt || ""}
                      onChange={(v) => set("image_alt", v)}
                    />
                  </>
                )}
                {["events", "training"].includes(draft.section || "") &&
                  draft.kind !== "page" && (
                    <View style={{ gap: 12 }}>
                      <Text style={ui.heading}>Ημερομηνία, ώρα και χώρος</Text>
                      <Field
                        label="Τελευταία ημέρα εμφάνισης (YYYY-MM-DD, κενό = έως αρχειοθέτηση)"
                        value={draft.event_end_date || ""}
                        onChange={(v) => set("event_end_date", v)}
                      />
                      <Field
                        label="Ημερομηνία ή εύρος ημερομηνιών"
                        value={draft.event_date || ""}
                        onChange={(v) => set("event_date", v)}
                      />
                      {draft.section === "training" && (
                        <>
                          <Field
                            label="Ημερομηνία έναρξης (YYYY-MM-DD)"
                            value={draft.event_start_date || ""}
                            onChange={(v) => set("event_start_date", v)}
                          />
                          <Choices
                            label="Εκπαιδευτικό Level"
                            values={["1", "2", "3", "4"]}
                            value={String(draft.training_level || 1)}
                            onChange={(v) => set("training_level", Number(v))}
                          />
                          <Field
                            label="Κόστος / προσφορά"
                            value={draft.event_price || ""}
                            onChange={(v) => set("event_price", v)}
                          />
                          <Field
                            label="Τηλέφωνο κρατήσεων"
                            value={draft.event_phone || ""}
                            onChange={(v) => set("event_phone", v)}
                          />
                          <Field
                            label="Πρόγραμμα — μία ενότητα ανά γραμμή"
                            multiline
                            value={draft.event_program || ""}
                            onChange={(v) => set("event_program", v)}
                          />
                          <Field
                            label="Σε ποιους απευθύνεται — μία γραμμή ανά ομάδα"
                            multiline
                            value={draft.event_audience || ""}
                            onChange={(v) => set("event_audience", v)}
                          />
                          <Field
                            label="Πληροφορίες βεβαίωσης / πιστοποίησης"
                            multiline
                            value={draft.event_certification || ""}
                            onChange={(v) => set("event_certification", v)}
                          />
                        </>
                      )}
                      <Field
                        label="Ώρα (π.χ. 17:30 – 19:00)"
                        value={draft.event_time || ""}
                        onChange={(v) => set("event_time", v)}
                      />
                      <Field
                        label="Χώρος / πόλη"
                        value={draft.event_location || ""}
                        onChange={(v) => set("event_location", v)}
                      />
                    </View>
                  )}
                <Field
                  label="Κείμενο συνδέσμου επικοινωνίας ή συμμετοχής"
                  value={draft.action_label || ""}
                  onChange={(v) => set("action_label", v)}
                />
                <Field
                  label="Προορισμός συνδέσμου (HTTPS)"
                  value={draft.action_url || ""}
                  onChange={(v) => set("action_url", v)}
                />
                <Text style={ui.label}>ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΠΡΟΧΕΙΡΟΥ</Text>
                <Text style={ui.body}>
                  Οι αλλαγές εμφανίζονται στους επισκέπτες μόνο μετά τη
                  δημοσίευση. Η πρώτη σελίδα στη σειρά της ενότητας ορίζει την
                  εισαγωγή της.
                </Text>
                {draft.kind === "site_settings" ? (
                  <View style={ui.card}>
                    <Text style={ui.label}>{draft.title}</Text>
                    <Text style={ui.body}>{draft.summary}</Text>
                    <Text style={ui.body}>{draft.body}</Text>
                    <Text style={ui.label}>{draft.action_label}</Text>
                  </View>
                ) : (
                  <EditorialIntro
                    title={draft.title || "Τίτλος σελίδας"}
                    summary={draft.summary}
                    body={draft.body}
                    imageUrl={draft.image_url}
                    imageAlt={draft.image_alt}
                    actionLabel={draft.action_label}
                    actionUrl={draft.action_url}
                    preview
                  />
                )}
              </>
            )}
            <View style={ui.row}>
              <Button
                disabled={busy}
                label="Αποθήκευση προχείρου"
                onPress={() =>
                  void run(async () => {
                    if (edit)
                      await api.put(`/admin/content/${edit.id}`, {
                        ...draft,
                        revision: edit.revision,
                      });
                    else await api.post("/admin/content", draft);
                    setEdit(null);
                    setDraft({ ...fresh });
                  }, "Το πρόχειρο αποθηκεύτηκε. Δημοσίευσέ το όταν είναι έτοιμο.")
                }
              />
              {edit && (
                <Button
                  secondary
                  label="Ακύρωση επεξεργασίας"
                  onPress={() => {
                    setEdit(null);
                    setDraft({ ...fresh });
                  }}
                />
              )}
            </View>
          </View>
          <Text style={ui.heading}>Κατάλογος περιεχομένου</Text>
          <Choices
            label="Περιοχή"
            values={["Όλα", "Δημόσιο", "Μαθήματα", "Ταξίδι", "Ρυθμίσεις"]}
            value={contentScope}
            onChange={setContentScope}
          />
          <Field
            label="Αναζήτηση τίτλου ή ενότητας στην τρέχουσα λίστα"
            value={search}
            onChange={setSearch}
          />
          {state.data.content
            .filter(
              (item) =>
                (contentScope === "Όλα" ||
                  (contentScope === "Μαθήματα"
                    ? item.draft.kind === "lesson"
                    : contentScope === "Ταξίδι"
                      ? item.draft.kind === "journey"
                      : contentScope === "Ρυθμίσεις"
                        ? item.draft.kind === "site_settings"
                        : [
                            "page",
                            "announcement",
                            "hero",
                            "testimonial",
                            "partner",
                            "social",
                            "app_photo",
                          ].includes(item.draft.kind))) &&
                normalize(
                  item.draft.title + " " + (item.draft.section || "home"),
                ).includes(normalize(search)),
            )
            .map((item) => (
              <View key={item.id} style={ui.card}>
                <Text style={ui.label}>
                  {item.draft.kind} ·{" "}
                  {item.archived
                    ? "ΑΡΧΕΙΟ"
                    : item.published
                      ? "ΔΗΜΟΣΙΕΥΜΕΝΟ"
                      : "ΠΡΟΧΕΙΡΟ"}{" "}
                  · v{item.revision}
                </Text>
                <Text style={ui.heading}>{item.draft.title}</Text>
                <Text style={ui.body}>{item.draft.summary}</Text>
                {!!item.history?.length && (
                  <View style={ui.card}>
                    <Text style={ui.heading}>Ιστορικό δημοσιεύσεων</Text>
                    <Text style={ui.body}>
                      Η επαναφορά δημιουργεί πρόχειρο. Τα συνημμένα παραμένουν
                      όπως είναι και ελέγχονται πριν από τη νέα δημοσίευση.
                    </Text>
                    {[...item.history].reverse().map((version) => (
                      <Button
                        key={version.revision}
                        secondary
                        disabled={busy}
                        label={`Επαναφορά v${version.revision} · ${version.title}`}
                        onPress={() =>
                          void run(async () => {
                            await api.post(
                              `/admin/content/${item.id}/restore`,
                              {
                                revision: item.revision,
                                source_revision: version.revision,
                              },
                            );
                            setEdit(null);
                            setDraft({ ...fresh });
                          }, "Η έκδοση επανήλθε σε πρόχειρο. Έλεγξε το περιεχόμενο πριν τη δημοσίευση.")
                        }
                      />
                    ))}
                  </View>
                )}
                <ResourcesSection
                  parentType="cms_content"
                  parentId={item.id}
                  title="Συνημμένο υλικό"
                />
                <View style={ui.row}>
                  <Button
                    secondary
                    disabled={busy}
                    label="Επεξεργασία"
                    onPress={() => {
                      setEdit(item);
                      setDraft({ ...item.draft });
                    }}
                  />
                  <Button
                    disabled={busy}
                    label={
                      item.archived ? "Επαναδημοσίευση" : "Δημοσίευση προχείρου"
                    }
                    onPress={() =>
                      void run(
                        () =>
                          api.post(
                            `/admin/content/${item.id}/publish?revision=${item.revision}`,
                          ),
                        "Δημοσιεύτηκε.",
                      )
                    }
                  />
                  {!item.archived && (
                    <Button
                      secondary
                      disabled={busy}
                      label="Αρχειοθέτηση"
                      onPress={() =>
                        void run(
                          () => api.post(`/admin/content/${item.id}/archive`),
                          "Αρχειοθετήθηκε. Μπορεί να επαναδημοσιευτεί.",
                        )
                      }
                    />
                  )}
                </View>
              </View>
            ))}
        </>
      )}
      {section === "Τμήματα" && (
        <>
          <View style={ui.card}>
            <Field
              label="Όνομα τμήματος"
              value={cohortTitle}
              onChange={setCohortTitle}
            />
            <Choices
              label="Level"
              values={["L1", "L2", "L3", "L4"]}
              value={level}
              onChange={setLevel}
            />
            <Field
              label="Ημερομηνία έναρξης (YYYY-MM-DD)"
              value={date}
              onChange={setDate}
            />
            <Text style={ui.body}>Υπεύθυνος εκπαιδευτής</Text>
            <View style={ui.row}>
              {state.data.users
                .filter((u) => ["admin", "instructor"].includes(u.role))
                .map((u) => (
                  <Button
                    secondary={instructor !== u.id}
                    key={u.id}
                    label={u.name}
                    onPress={() => setInstructor(u.id)}
                  />
                ))}
            </View>
            <Button
              disabled={busy || !instructor}
              label="Δημιουργία τμήματος"
              onPress={() =>
                void run(() =>
                  api.post("/admin/cohorts", {
                    title: cohortTitle,
                    level_id: level,
                    instructor_id: instructor,
                    start_date: date,
                  }),
                )
              }
            />
          </View>
          {state.data.cohorts.map((c) => (
            <View style={ui.card} key={c.id}>
              <Text style={ui.heading}>
                {c.level_id} · {c.title}
              </Text>
            </View>
          ))}
        </>
      )}
      {section === "Εγγραφές" && (
        <View style={ui.card}>
          <Text style={ui.heading}>Εγγραφή μαθητή</Text>
          <Text style={ui.body}>Λογαριασμός</Text>
          <View style={ui.row}>
            {state.data.users
              .filter((u) =>
                normalize(`${u.name} ${u.email}`).includes(normalize(search)),
              )
              .map((u) => (
                <Button
                  secondary={student !== u.id}
                  key={u.id}
                  label={`${u.name} · ${u.email}`}
                  onPress={() => setStudent(u.id)}
                />
              ))}
          </View>
          <Text style={ui.body}>Τμήμα</Text>
          <View style={ui.row}>
            {state.data.cohorts.map((c) => (
              <Button
                secondary={cohort !== c.id}
                key={c.id}
                label={`${c.level_id} · ${c.title}`}
                onPress={() => setCohort(c.id)}
              />
            ))}
          </View>
          <Button
            disabled={busy || !student || !cohort}
            label="Καταχώριση εγγραφής"
            onPress={() =>
              void run(() =>
                api.post("/admin/enrollments", {
                  user_id: student,
                  cohort_id: cohort,
                }),
              )
            }
          />
          <Text style={ui.body}>
            {state.data.enrollments.length} εγγραφές στη λίστα
          </Text>
          {state.data.enrollments
            .filter((entry) =>
              normalize(
                `${entry.cohort_title} ${state.data.users.find((u) => u.id === entry.user_id)?.name || ""} ${state.data.users.find((u) => u.id === entry.user_id)?.email || ""}`,
              ).includes(normalize(search)),
            )
            .map((entry) => (
              <View key={entry.id} style={ui.card}>
                <Text style={ui.heading}>
                  {state.data.users.find((u) => u.id === entry.user_id)?.name ||
                    "Μαθητής"}{" "}
                  · {entry.cohort_title}
                </Text>
                <Text style={ui.body}>
                  {entry.status === "active" ? "Ενεργή εγγραφή" : "Σε παύση"}
                </Text>
                <Button
                  secondary
                  disabled={busy}
                  label={
                    entry.status === "active"
                      ? "Παύση πρόσβασης"
                      : "Επανενεργοποίηση"
                  }
                  onPress={() =>
                    void run(
                      () =>
                        api.put(`/admin/enrollments/${entry.id}/status`, {
                          expected_status: entry.status,
                          status:
                            entry.status === "active" ? "paused" : "active",
                        }),
                      "Η πρόσβαση ενημερώθηκε. Οι καταγραφές διατηρήθηκαν.",
                    )
                  }
                />
              </View>
            ))}
        </View>
      )}
      {section === "Παρουσίες" && (
        <View style={ui.card}>
          <Text style={ui.heading}>Καταγραφή παρουσίας</Text>
          <View style={ui.row}>
            {state.data.enrollments
              .filter((e) =>
                normalize(
                  `${e.cohort_title} ${state.data.users.find((u) => u.id === e.user_id)?.name || ""} ${state.data.users.find((u) => u.id === e.user_id)?.email || ""}`,
                ).includes(normalize(search)),
              )
              .map((e) => (
                <Button
                  secondary={enrollment !== e.id}
                  key={e.id}
                  label={`${state.data.users.find((u) => u.id === e.user_id)?.name || "Μαθητής"} · ${e.cohort_title}`}
                  onPress={() => setEnrollment(e.id)}
                />
              ))}
          </View>
          <Field
            label="Ημερομηνία (YYYY-MM-DD)"
            value={date}
            onChange={setDate}
          />
          <Field
            label="Λεπτά παρακολούθησης"
            value={minutes}
            onChange={setMinutes}
          />
          <Choices
            label="Παρουσία"
            values={Object.values(attendanceLabels)}
            value={attendanceLabels[attendance]}
            onChange={(label) =>
              setAttendance(
                Object.keys(attendanceLabels).find(
                  (key) => attendanceLabels[key] === label,
                )!,
              )
            }
          />
          <Button
            disabled={busy || !enrollment}
            label="Αποθήκευση παρουσίας"
            onPress={() =>
              void run(() =>
                api.post("/admin/attendance", {
                  enrollment_id: enrollment,
                  session_date: date,
                  minutes: Number(minutes),
                  status: attendance,
                }),
              )
            }
          />
        </View>
      )}
      {section === "Αξιολογήσεις" && (
        <>
          <Text style={ui.body}>
            Ο αρχικός έλεγχος δεν πιστοποιεί εκπαιδευτική επάρκεια. Οι επίσημοι
            κανόνες και οι φόρμες ανά Level παραμένουν ξεχωριστή διαδικασία.
          </Text>
          {!state.data.practices.length && (
            <View style={ui.card}>
              <Text style={ui.body}>
                Δεν υπάρχουν υποβλημένες πρακτικές στα τμήματά σου.
              </Text>
            </View>
          )}
          {state.data.practices.map((p) => (
            <View key={p.id} style={ui.card}>
              <Text style={ui.label}>
                {p.level_id} · {p.session_date} ·{" "}
                {p.status_label || practiceLabels[p.status] || p.status}
              </Text>
              <Text style={ui.body}>
                {p.receiver_code} ·{" "}
                {p.mode === "group"
                  ? `Ομάδα ${p.participant_count ?? "—"} ατόμων`
                  : "Ατομική συνεδρία"}
              </Text>
              <PracticeAssessments practiceId={p.id} staff />
              {p.cycle_id && (
                <Text style={ui.body}>
                  Εστίαση κύκλου:{" "}
                  {state.data.cycles.find((c) => c.id === p.cycle_id)
                    ?.intended_focus || "Δεν έχει καταγραφεί"}
                </Text>
              )}
              <Text style={ui.body}>{p.reflection}</Text>
              {p.status === "submitted" && (
                <>
                  <Field
                    label="Σχόλιο εκπαιδευτή"
                    value={notes[p.id] || ""}
                    onChange={(v) => setNotes({ ...notes, [p.id]: v })}
                    multiline
                  />
                  <View style={ui.row}>
                    <Button
                      disabled={busy}
                      label="Ολοκλήρωση αρχικού ελέγχου"
                      onPress={() =>
                        void run(() =>
                          api.post(`/admin/practices/${p.id}/review`, {
                            decision: "reviewed",
                            note: notes[p.id],
                          }),
                        )
                      }
                    />
                    <Button
                      disabled={busy}
                      secondary
                      label="Αίτημα διορθώσεων"
                      onPress={() =>
                        void run(() =>
                          api.post(`/admin/practices/${p.id}/review`, {
                            decision: "changes_requested",
                            note: notes[p.id],
                          }),
                        )
                      }
                    />
                  </View>
                </>
              )}
            </View>
          ))}
        </>
      )}
    </Shell>
  );
}
