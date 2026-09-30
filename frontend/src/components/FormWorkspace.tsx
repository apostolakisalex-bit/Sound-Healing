import React, { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@/src/api/client";
import { Button, Choices, Field, Status, ui, useLoad } from "./Wellness";
type Question = {
  key: string;
  label: string;
  kind: string;
  applies_to?: string;
  required: boolean | null;
  options: string[];
};
type Version = {
  id: string;
  template_key: string;
  source_note: string;
  questions: Question[];
  created_at: string;
};
type Catalog = {
  key: string;
  title: string;
  source: string;
  open_decisions: string[];
};
const blank = (): Question => ({
  key: "",
  label: "",
  kind: "unknown",
  required: null,
  options: [],
});
export function FormWorkspace() {
  const state = useLoad<{
    catalog: Catalog[];
    versions: Version[];
    active_assignments?: { _id: string; form_id: string }[];
    source_templates?: Version[];
  }>("/admin/forms", { catalog: [], versions: [] });
  const [key, setKey] = useState(""),
    [note, setNote] = useState(""),
    [questions, setQuestions] = useState<Question[]>([]),
    [question, setQuestion] = useState(blank()),
    [options, setOptions] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [level, setLevel] = useState("L1"),
    [resolution, setResolution] = useState("");
  const selected = state.data.catalog.find((c) => c.key === key);
  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Εκδόσεις αξιολογήσεων</Text>
      <Text style={ui.body}>
        Χώρος προετοιμασίας επίσημων φορμών. Κάθε αποθήκευση δημιουργεί νέο,
        αμετάβλητο πρόχειρο. Μετά την επαλήθευση των ερωτήσεων και την καταγραφή
        των αποφάσεων, ενεργοποίησε την έκδοση για τις νέες πρακτικές.
      </Text>
      <Status state={state} />
      {state.data.active_assignments?.map((a) => (
        <Text key={a._id} style={ui.body}>
          Ενεργή αντιστοίχιση: {a._id}
        </Text>
      ))}
      {state.data.catalog.map((c) => (
        <View key={c.key} style={ui.card}>
          <Button
            secondary={key !== c.key}
            label={c.title}
            onPress={() => {
              setKey(c.key);
              const source = state.data.source_templates?.find(
                (v) => v.template_key === c.key,
              );
              setQuestions(source?.questions || []);
              setNote(source?.source_note || "");
              setQuestion(blank());
              setOptions("");
            }}
          />
          <Text style={ui.body}>Πηγή: {c.source}</Text>
          {c.open_decisions.map((d) => (
            <Text key={d} style={ui.body}>
              Εκκρεμεί: {d}
            </Text>
          ))}
        </View>
      ))}
      {selected && (
        <View style={ui.card}>
          <Text style={ui.heading}>{selected.title}</Text>
          <Field
            label="Τεκμηρίωση πηγής / παρατηρήσεις έκδοσης"
            value={note}
            onChange={setNote}
            multiline
          />
          <Text style={ui.body}>{questions.length} ερωτήσεις στο πρόχειρο</Text>
          {questions.map((q, i) => (
            <View key={q.key} style={{ gap: 8 }}>
              <Text style={ui.body}>
                {i + 1}. {q.label}
              </Text>
              <Button
                secondary
                label={`Επεξεργασία ερώτησης ${i + 1}`}
                onPress={() => {
                  setQuestion(q);
                  setOptions(q.options.join("\n"));
                  setQuestions(questions.filter((_, index) => index !== i));
                }}
              />
              <Button
                secondary
                label={`Αφαίρεση ερώτησης ${i + 1}`}
                onPress={() =>
                  setQuestions(questions.filter((_, index) => index !== i))
                }
              />
            </View>
          ))}
          <Field
            label="Σταθερός κωδικός ερώτησης (π.χ. comfort)"
            value={question.key}
            onChange={(v) => setQuestion({ ...question, key: v })}
          />
          <Field
            label="Ακριβές κείμενο ερώτησης"
            value={question.label}
            onChange={(v) => setQuestion({ ...question, label: v })}
            multiline
          />
          <Choices
            label="Εμφάνιση ερώτησης"
            values={["all", "first", "repeat"]}
            value={question.applies_to || "all"}
            onChange={(v) => setQuestion({ ...question, applies_to: v })}
          />
          <Choices
            label="Τύπος απάντησης"
            values={["unknown", "text", "single", "multi", "scale"]}
            value={question.kind}
            onChange={(v) => setQuestion({ ...question, kind: v })}
          />
          <Choices
            label="Υποχρεωτική;"
            values={["Άγνωστο", "Ναι", "Όχι"]}
            value={
              question.required === null
                ? "Άγνωστο"
                : question.required
                  ? "Ναι"
                  : "Όχι"
            }
            onChange={(v) =>
              setQuestion({
                ...question,
                required: v === "Άγνωστο" ? null : v === "Ναι",
              })
            }
          />
          <Field
            label="Επαληθευμένες επιλογές — μία ανά γραμμή"
            value={options}
            onChange={setOptions}
            multiline
          />
          <Button
            secondary
            label="Προσθήκη ερώτησης"
            onPress={() => {
              if (
                !/^[a-z][a-z0-9_]{0,63}$/.test(question.key) ||
                question.label.trim().length < 2 ||
                questions.some((q) => q.key === question.key)
              ) {
                setMessage(
                  "Χρειάζονται μοναδικός κωδικός και κείμενο ερώτησης.",
                );
                return;
              }
              setQuestions([
                ...questions,
                {
                  ...question,
                  options: options
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              ]);
              setQuestion(blank());
              setOptions("");
              setMessage("");
            }}
          />
          <Button
            label="Αποθήκευση νέας έκδοσης"
            disabled={busy || !questions.length || note.trim().length < 3}
            onPress={async () => {
              setBusy(true);
              try {
                await api.post("/admin/forms", {
                  template_key: key,
                  source_note: note,
                  questions,
                });
                await state.reload();
                setMessage("Αποθηκεύτηκε νέα έκδοση. Δεν έχει δημοσιευτεί.");
              } catch {
                setMessage(
                  "Δεν αποθηκεύτηκε. Έλεγξε τους τύπους, τις επιλογές και τους κωδικούς των ερωτήσεων.",
                );
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
      <View style={ui.card}>
        <Text style={ui.heading}>Ενεργοποίηση επαληθευμένης έκδοσης</Text>
        <Choices
          label="Level της φόρμας"
          values={["L1", "L2", "L3", "L4"]}
          value={level}
          onChange={setLevel}
        />
        <Field
          label="Καταγραφή επιβεβαίωσης πηγής και επίλυσης εκκρεμοτήτων"
          value={resolution}
          onChange={setResolution}
          multiline
        />
        <Text style={ui.body}>
          Η ενεργοποίηση δεν αλλάζει φόρμες που έχουν ήδη συνδεθεί με πρακτικές.
          Επίλεξε έκδοση μόνο αφού επιβεβαιώσεις όλες τις ερωτήσεις, τις
          υποχρεωτικότητες και τις παραπάνω εκκρεμότητες.
        </Text>
      </View>
      {state.data.versions
        .filter((v) => !key || v.template_key === key)
        .map((v) => (
          <View key={v.id} style={ui.card}>
            <Text style={ui.label}>ΠΡΟΧΕΙΡΟ · {v.created_at.slice(0, 10)}</Text>
            <Text style={ui.body}>
              {v.template_key} · {v.questions.length} ερωτήσεις
            </Text>
            <Text style={ui.body}>{v.source_note}</Text>
            <Button
              label={`Ενεργοποίηση για ${level}`}
              disabled={
                busy ||
                resolution.trim().length < 10 ||
                v.questions.some(
                  (q) => q.kind === "unknown" || q.required === null,
                )
              }
              onPress={async () => {
                setBusy(true);
                try {
                  await api.post(`/admin/forms/${v.id}/activate`, {
                    level_id: level,
                    mode: v.template_key.includes("group")
                      ? "group"
                      : "individual",
                    respondent: v.template_key.startsWith("practitioner")
                      ? "practitioner"
                      : "receiver",
                    resolution_note: resolution,
                  });
                  setMessage(`Ενεργοποιήθηκε η φόρμα για ${level}.`);
                } catch {
                  setMessage(
                    "Δεν ενεργοποιήθηκε. Έλεγξε το Level και την πληρότητα της φόρμας.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
            <Button
              secondary
              label="Χρήση ως βάση νέας έκδοσης"
              onPress={() => {
                setKey(v.template_key);
                setQuestions(
                  v.questions.map((q) => ({ ...q, options: [...q.options] })),
                );
                setNote(v.source_note);
              }}
            />
          </View>
        ))}
    </View>
  );
}
