import { BrandHero } from "./BrandHero";
import { CyclePicker } from "./CyclePicker";
import { Progress } from "./Progress";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";
import {
  Shell,
  ui,
  palette,
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
};
type Practice = {
  id: string;
  level_id: string;
  session_date: string;
  duration_minutes: number;
  status: string;
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
  const router = useRouter();
  const state = useLoad<School>("/school/me", empty);
  return (
    <Shell
      eyebrow="Ο ΧΩΡΟΣ ΣΟΥ"
      title={`Καλώς ήρθες, ${user?.name?.split(" ")[0] || "φίλε μας"}.`}
    >
      <View style={[ui.card, { backgroundColor: palette.sage, padding: 32 }]}>
        <Text style={ui.label}>A LITTLE SPACE TO GROW</Text>
        <Text style={ui.title}>Άκου. Μάθε. Εξελίξου.</Text>
        <Text style={ui.body}>
          Η εκπαίδευσή σου και η προσωπική σου πρακτική, σε έναν ήρεμο χώρο.
        </Text>
        <View style={ui.row}>
          <Button
            label="Συνέχεια στη σχολή"
            onPress={() => router.push("/(tabs)/academy")}
          />
          <Button
            secondary
            label="Καταγραφή πρακτικής"
            onPress={() => router.push("/(tabs)/practice")}
          />
        </View>
      </View>
      <Status state={state} />
      <View style={ui.row}>
        {[
          ["Εγγραφές", state.data.enrollments.length],
          ["Πρακτικές", state.data.practices.length],
          [
            "Για αξιολόγηση",
            state.data.practices.filter((p) => p.status === "submitted").length,
          ],
        ].map(([label, value]) => (
          <View key={label} style={[ui.card, { flexGrow: 1, minWidth: 180 }]}>
            <Text style={ui.title}>{value}</Text>
            <Text style={ui.body}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Ένα βήμα τη φορά</Text>
        <Text style={ui.body}>
          Η εκπαιδευτική σου πρόοδος βασίζεται στην εγγραφή, την παρουσία και
          την αξιολόγηση της πρακτικής. Τα παλαιότερα XP διατηρούνται στο προφίλ
          σου ως ιστορικό συμμετοχής.
        </Text>
      </View>
    </Shell>
  );
}
export function SchoolScreen() {
  const catalog = useLoad<
    { id: string; title: string; description: string; is_enrolled: boolean }[]
  >("/school/catalog", []);
  const library = useLoad<ContentItem[]>("/content/library", []);
  return (
    <Shell eyebrow="SCHOOL" title="Η διαδρομή της μάθησης.">
      <Text style={ui.body}>
        Τέσσερα εκπαιδευτικά Levels. Το υλικό σου ακολουθεί την εγγραφή σου στη
        σχολή.
      </Text>
      <Text style={ui.heading}>Το εκπαιδευτικό σου υλικό</Text>
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
              Δεν υπάρχει ακόμη δημοσιευμένο υλικό για τις εγγραφές σου. Η σχολή
              θα το προσθέσει εδώ.
            </Text>
          </View>
        )}
      <Progress />
      <Text style={ui.heading}>Τα Levels της σχολής</Text>
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
            {l.id} · {l.is_enrolled ? "ΕΝΕΡΓΗ ΕΓΓΡΑΦΗ" : "ΓΝΩΡΙΣΕ ΤΟ LEVEL"}
          </Text>
          <Text style={ui.heading}>{l.title}</Text>
          <Text style={ui.body}>{l.description}</Text>
        </View>
      ))}
    </Shell>
  );
}
export function JourneyScreen() {
  const state = useLoad<ContentItem[]>("/content/library", []);
  return (
    <Shell eyebrow="JOURNEY" title="Λίγος χρόνος για εσένα.">
      <Text style={ui.body}>
        Μικρές πρακτικές ακρόασης και προσωπικής φροντίδας, στον δικό σου ρυθμό.
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
            <Text style={ui.heading}>Ο χώρος σου ετοιμάζεται.</Text>
            <Text style={ui.body}>
              Οι δημοσιευμένες πρακτικές της ομάδας θα εμφανίζονται εδώ.
            </Text>
          </View>
        )}
    </Shell>
  );
}
export function PracticeScreen() {
  const state = useLoad<School>("/school/me", empty);
  const [enrollment, setEnrollment] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [duration, setDuration] = useState("60"),
    [mode, setMode] = useState("individual"),
    [code, setCode] = useState(""),
    [reflection, setReflection] = useState(""),
    [safety, setSafety] = useState("Όχι"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(""),
    [cycleId, setCycleId] = useState(""),
    [participantCount, setParticipantCount] = useState(""),
    [revision, setRevision] = useState(1);
  const router = useRouter();
  const save = async () => {
    const parsedDate = new Date(`${date}T12:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      setMessage("Συμπλήρωσε έγκυρη ημερομηνία με μορφή YYYY-MM-DD.");
      return;
    }
    if (
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1 ||
      Number(duration) > 1440
    ) {
      setMessage(
        "Η διάρκεια πρέπει να είναι ακέραιος αριθμός από 1 έως 1440 λεπτά.",
      );
      return;
    }
    if (!code.trim() || (mode === "individual" && !cycleId)) {
      setMessage("Επίλεξε κύκλο δέκτη ή συμπλήρωσε κωδικό ομάδας.");
      return;
    }
    if (
      mode === "group" &&
      (!Number.isInteger(Number(participantCount)) ||
        Number(participantCount) < 2 ||
        Number(participantCount) > 10000)
    ) {
      setMessage("Συμπλήρωσε ακέραιο αριθμό συμμετεχόντων από 2 έως 10000.");
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
          contraindications_checked: safety === "Ναι",
        },
      });
      setEditing("");
      setMessage(
        "Το πρόχειρο αποθηκεύτηκε. Μπορείς να το στείλεις για αρχικό έλεγχο.",
      );
      setCode("");
      setCycleId("");
      setReflection("");
      setSafety("Όχι");
      setParticipantCount("");
      await state.reload();
    } catch (error: any) {
      if (error?.response?.status === 409) await state.reload();
      setMessage(
        error?.response?.status === 409
          ? "Η καταγραφή άλλαξε. Άνοιξέ την ξανά για επεξεργασία πριν αποθηκεύσεις."
          : error?.response?.status === 403
            ? "Χρειάζεται ενεργή εγγραφή για να αποθηκευτεί η πρακτική."
            : "Δεν αποθηκεύτηκε. Τα στοιχεία σου παραμένουν στη φόρμα· δοκίμασε ξανά.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell eyebrow="PRACTICE" title="Η εμπειρία γίνεται μάθηση.">
      <Text style={ui.body}>
        Κατάγραψε την πρακτική σου με κωδικό δέκτη ή ομάδας, χωρίς αναγνωριστικά
        υγείας. Ο αρχικός έλεγχος δεν ισοδυναμεί με πιστοποίηση.
      </Text>
      <Status state={state} />
      {state.data.enrollments.some((e) => e.status === "active") ? (
        <View style={ui.card}>
          <Text style={ui.heading}>
            {editing ? "Επεξεργασία πρακτικής" : "Νέο πρόχειρο πρακτικής"}
          </Text>
          <Text style={ui.body}>Εκπαιδευτική εγγραφή</Text>
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
            label="Μορφή"
            values={["Ατομική", "Ομαδική"]}
            value={mode === "individual" ? "Ατομική" : "Ομαδική"}
            onChange={(v) => {
              setMode(v === "Ατομική" ? "individual" : "group");
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
              label="Αριθμός συμμετεχόντων"
              value={participantCount}
              onChange={setParticipantCount}
            />
          )}
          <Field
            label="Ημερομηνία (YYYY-MM-DD)"
            value={date}
            onChange={setDate}
          />
          <Field
            label="Διάρκεια σε λεπτά"
            value={duration}
            onChange={setDuration}
          />
          {mode === "individual" ? (
            <Text style={ui.body}>
              Κωδικός δέκτη: {code || "Επίλεξε κύκλο παραπάνω"}
            </Text>
          ) : (
            <Field
              label="Κωδικός δέκτη / ομάδας"
              value={code}
              onChange={setCode}
            />
          )}
          <Field
            label="Αναστοχασμός"
            value={reflection}
            onChange={setReflection}
            multiline
          />
          <Choices
            label="Έγινε έλεγχος αντενδείξεων;"
            values={["Όχι", "Ναι"]}
            value={safety}
            onChange={setSafety}
          />
          <Button
            label={busy ? "Αποθήκευση…" : "Αποθήκευση προχείρου"}
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
              label="Κλείσιμο επεξεργασίας"
              onPress={() => {
                setEditing("");
                setCycleId("");
                setCode("");
                setReflection("");
                setSafety("Όχι");
                setParticipantCount("");
                setMessage("");
              }}
            />
          )}
        </View>
      ) : !state.loading && !state.error ? (
        <View style={ui.card}>
          <Text style={ui.body}>
            Χρειάζεται ενεργή εγγραφή από τη σχολή για νέα εκπαιδευτική
            πρακτική.
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
            {(
              {
                draft: "Πρόχειρη",
                submitted: "Για έλεγχο",
                changes_requested: "Για διόρθωση",
                reviewed: "Ελεγμένη",
              } as Record<string, string>
            )[p.status] || p.status}
          </Text>
          <Text style={ui.heading}>
            {p.session_date} · {p.duration_minutes} λεπτά
          </Text>
          {p.review_note && <Text style={ui.body}>{p.review_note}</Text>}
          {["draft", "changes_requested"].includes(p.status) && (
            <Button
              secondary
              label="Επεξεργασία"
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
                setSafety(p.contraindications_checked ? "Ναι" : "Όχι");
                setMessage("Η πρακτική άνοιξε στη φόρμα παραπάνω.");
              }}
            />
          )}
          {["draft", "changes_requested"].includes(p.status) && (
            <Button
              label="Υποβολή για αρχικό έλεγχο"
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await api.post(`/school/practices/${p.id}/submit`);
                  await state.reload();
                  setMessage("Η πρακτική υποβλήθηκε.");
                } catch (error: any) {
                  setMessage(
                    error?.response?.status === 422
                      ? "Χρειάζονται αναστοχασμός και επιβεβαίωση ασφάλειας."
                      : error?.response?.status === 403
                        ? "Η εγγραφή δεν είναι ενεργή. Επικοινώνησε με τη σχολή."
                        : "Η υποβολή δεν επιβεβαιώθηκε. Ανανέωσε τη σελίδα για να ελέγξεις την κατάστασή της.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
        </View>
      ))}
      <Button
        secondary
        label="Παλαιότερες καταγραφές"
        onPress={() => router.push("/legacy-practices" as any)}
      />
    </Shell>
  );
}
export function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || ""),
    [bio, setBio] = useState(user?.bio || ""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const state = useLoad<School>("/school/me", empty);
  return (
    <Shell eyebrow="PROFILE" title="Το προφίλ σου.">
      <View style={ui.card}>
        <Field label="Όνομα" value={name} onChange={setName} />
        <Field
          label="Λίγα λόγια για εσένα"
          value={bio}
          onChange={setBio}
          multiline
        />
        <Button
          disabled={busy || name.trim().length < 2}
          label="Αποθήκευση"
          onPress={async () => {
            setBusy(true);
            try {
              await updateProfile({ name, bio });
              setMessage("Αποθηκεύτηκε.");
            } catch {
              setMessage("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
            } finally {
              setBusy(false);
            }
          }}
        />
        <Text style={ui.body}>{message}</Text>
      </View>
      <Status state={state} />
      <View style={ui.card}>
        <Text style={ui.heading}>Εκπαίδευση</Text>
        {state.data.enrollments.map((e) => (
          <Text key={e.id} style={ui.body}>
            {e.level_id} · {e.cohort_title}
          </Text>
        ))}
        {!state.data.enrollments.length && (
          <Text style={ui.body}>
            Δεν έχει καταχωριστεί εκπαιδευτική εγγραφή.
          </Text>
        )}
        <Text style={ui.body}>
          Παρουσίες:{" "}
          {state.data.attendance.filter((a) => a.status === "present").length}
        </Text>
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Ιστορικό συμμετοχής</Text>
        <Text style={ui.body}>
          {user?.xp || 0} παλαιότερα XP · δεν αποτελούν εκπαιδευτικό τίτλο.
        </Text>
      </View>
      <Button secondary label="Αποσύνδεση" onPress={() => void logout()} />
    </Shell>
  );
}
export { PublicExperience as PublicScreen } from "./PublicExperience";
