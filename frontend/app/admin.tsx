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
import { Text, View } from "react-native";
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
  event_end_date?: string;
  event_date?: string;
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
      <Shell eyebrow="WORKSPACE" title="Περιορισμένη πρόσβαση">
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
  const [section, setSection] = useState(
      user?.role === "admin" ? "Περιεχόμενο" : "Αξιολογήσεις",
    ),
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
    <Shell eyebrow="SCHOOL WORKSPACE" title="Η σχολή στα χέρια σου.">
      <Text style={ui.body}>
        Διαχείριση περιεχομένου, εκπαίδευσης και πρακτικής από έναν χώρο.
      </Text>
      <Choices
        label="Ενότητα"
        values={
          user?.role === "admin"
            ? [
                "Περιεχόμενο",
                "Φόρμες",
                "Τμήματα",
                "Εγγραφές",
                "Παρουσίες",
                "Πρόοδος",
                "Ιστορικό",
                "Αξιολογήσεις",
              ]
            : ["Παρουσίες", "Πρόοδος", "Αξιολογήσεις"]
        }
        value={section}
        onChange={(value) => {
          setSection(value);
          setSearch("");
          setMessage("");
        }}
      />
      <Status state={state} />
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
              ]}
              value={draft.kind}
              onChange={(v) => set("kind", v)}
            />
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
            ].includes(draft.kind) && (
              <>
                {[
                  "page",
                  "announcement",
                  "testimonial",
                  "partner",
                  "social",
                ].includes(draft.kind) && (
                  <>
                    {" "}
                    <Field
                      label="Εικόνα ενότητας (HTTPS)"
                      value={draft.image_url || ""}
                      onChange={(v) => set("image_url", v)}
                    />
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
            values={["Όλα", "Δημόσιο", "Μαθήματα", "Journey", "Ρυθμίσεις"]}
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
                    : contentScope === "Journey"
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
                {practiceLabels[p.status] || p.status}
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
