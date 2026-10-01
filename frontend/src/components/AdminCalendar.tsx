import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api } from "@/src/api/client";
import {
  Button,
  Choices,
  Field,
  palette,
  Status,
  ui,
  useLoad,
} from "./Wellness";

type Draft = {
  title: string;
  kind: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  cohort_id: string | null;
  content_id: string | null;
};
type Entry = Draft & { id: string; source: string; revision: number };
const kinds: Record<string, string> = {
  class: "Μάθημα",
  training: "Εκπαιδευτικό",
  event: "Εκδήλωση",
  other: "Άλλο",
  practice: "Πρακτικές",
  attendance: "Παρουσίες",
};
const iso = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const fresh = (day: string): Draft => ({
  title: "",
  kind: "class",
  start_date: day,
  end_date: day,
  start_time: "",
  end_time: "",
  location: "",
  notes: "",
  cohort_id: null,
  content_id: null,
});
export function AdminCalendar({
  cohorts,
  content,
  onOpen,
}: {
  cohorts: { id: string; title: string; level_id: string }[];
  content: {
    id: string;
    archived: boolean;
    draft: { title: string; section?: string; kind: string };
  }[];
  onOpen: (section: string) => void;
}) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, m] = month.split("-").map(Number);
  const count = new Date(year, m, 0).getDate();
  const first = `${month}-01`,
    last = `${month}-${count}`;
  const state = useLoad<Entry[]>(
    `/admin/calendar?start=${first}&end=${last}`,
    [],
  );
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState("Όλα");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [edit, setEdit] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const set = (key: keyof Draft, value: string | null) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      await task();
      await state.reload();
      setMessage("Το ημερολόγιο ενημερώθηκε.");
    } catch (e: any) {
      setMessage(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Έλεγξε τίτλο, ημερομηνίες και ώρες. Η λήξη πρέπει να είναι μετά την έναρξη.",
      );
    } finally {
      setBusy(false);
    }
  };
  const move = (step: number) => {
    const d = new Date(year, m - 1 + step, 1);
    setMonth(iso(d.getFullYear(), d.getMonth(), 1).slice(0, 7));
    setSelected("");
  };
  const entries = state.data.filter(
    (e) =>
      (filter === "Όλα" || kinds[e.kind] === filter) &&
      (!selected || (e.start_date <= selected && e.end_date >= selected)),
  );
  const links = content.filter(
    (c) =>
      !c.archived &&
      c.draft.kind === "announcement" &&
      c.draft.section === (draft?.kind === "training" ? "training" : "events"),
  );
  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Ενιαίο ημερολόγιο</Text>
      <Text style={ui.body}>
        Ώρες Ελλάδας · Europe/Athens. Πρόγραμμα σχολής, εκπαιδευτικά, εκδηλώσεις
        και καταγραφές πρακτικής. Οι νέες εγγραφές είναι εσωτερικές· η
        δημοσίευση εκδηλώσεων γίνεται από το Περιεχόμενο.
      </Text>
      <View style={ui.row}>
        <Button secondary label="Προηγούμενος μήνας" onPress={() => move(-1)} />
        <Text style={ui.heading}>
          {new Date(year, m - 1, 1).toLocaleDateString("el-GR", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Button secondary label="Επόμενος μήνας" onPress={() => move(1)} />
        <Button
          secondary
          label="Σήμερα"
          onPress={() => {
            setMonth(today.slice(0, 7));
            setSelected(today);
          }}
        />
      </View>
      <View style={[ui.card, { padding: 8 }]}>
        <View style={{ flexDirection: "row" }}>
          {["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"].map((day, i) => (
            <Text
              key={i}
              style={[ui.body, { width: `${100 / 7}%`, textAlign: "center" }]}
            >
              {day}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from(
            { length: (new Date(year, m - 1, 1).getDay() + 6) % 7 },
            (_, i) => (
              <View key={`blank${i}`} style={{ width: `${100 / 7}%` }} />
            ),
          )}
          {Array.from({ length: count }, (_, i) => {
            const day = iso(year, m - 1, i + 1);
            const n = state.data.filter(
              (e) => e.start_date <= day && e.end_date >= day,
            ).length;
            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={`${day}, ${n} εγγραφές`}
                accessibilityState={{ selected: selected === day }}
                onPress={() => setSelected(selected === day ? "" : day)}
                style={{
                  width: `${100 / 7}%`,
                  minHeight: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor:
                    selected === day ? palette.sage : "transparent",
                  borderWidth: day === today ? 1 : 0,
                  borderColor: palette.line,
                }}
              >
                <Text style={ui.body}>{i + 1}</Text>
                <Text style={{ color: palette.muted, fontSize: 10 }}>
                  {n ? `${n} ·` : " "}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Choices
        label="Εμφάνιση"
        values={["Όλα", ...Object.values(kinds)]}
        value={filter}
        onChange={setFilter}
      />
      {!!selected && (
        <Button
          secondary
          label="Όλος ο μήνας"
          onPress={() => setSelected("")}
        />
      )}
      <Button
        label="Νέα εγγραφή ημερολογίου"
        onPress={() => {
          setEdit(null);
          setDraft(fresh(selected || first));
          setMessage("");
        }}
      />
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
      {draft && (
        <View style={ui.card}>
          <Text style={ui.heading}>
            {edit ? "Επεξεργασία εγγραφής" : "Νέα εγγραφή"}
          </Text>
          <Field
            label="Τίτλος δραστηριότητας"
            value={draft.title}
            onChange={(v) => set("title", v)}
          />
          <Choices
            label="Κατηγορία"
            values={["Μάθημα", "Εκπαιδευτικό", "Εκδήλωση", "Άλλο"]}
            value={kinds[draft.kind]}
            onChange={(v) =>
              setDraft({
                ...draft,
                kind: Object.keys(kinds).find((k) => kinds[k] === v)!,
                content_id: null,
              })
            }
          />
          <Field
            label="Ημερομηνία έναρξης (YYYY-MM-DD)"
            value={draft.start_date}
            onChange={(v) => set("start_date", v)}
          />
          <Field
            label="Ημερομηνία λήξης (YYYY-MM-DD)"
            value={draft.end_date}
            onChange={(v) => set("end_date", v)}
          />
          <Text style={ui.body}>
            Άφησε και τις δύο ώρες κενές για ολοήμερη δραστηριότητα.
          </Text>
          <Field
            label="Ώρα έναρξης (HH:MM)"
            value={draft.start_time}
            onChange={(v) => set("start_time", v)}
          />
          <Field
            label="Ώρα λήξης (HH:MM)"
            value={draft.end_time}
            onChange={(v) => set("end_time", v)}
          />
          <Field
            label="Χώρος δραστηριότητας"
            value={draft.location}
            onChange={(v) => set("location", v)}
          />
          <Field
            label="Εσωτερικές σημειώσεις"
            value={draft.notes}
            onChange={(v) => set("notes", v)}
            multiline
          />
          <Text style={ui.body}>Σύνδεση με τμήμα</Text>
          <View style={ui.row}>
            <Button
              secondary={draft.cohort_id !== null}
              label="Χωρίς τμήμα"
              onPress={() => set("cohort_id", null)}
            />
            {cohorts.map((c) => (
              <Button
                key={c.id}
                secondary={draft.cohort_id !== c.id}
                label={`${c.level_id} · ${c.title}`}
                onPress={() => set("cohort_id", c.id)}
              />
            ))}
          </View>
          {["training", "event"].includes(draft.kind) && (
            <>
              <Text style={ui.body}>
                Σύνδεση με ανακοίνωση. Οι ημερομηνίες της δημόσιας καρτέλας
                παραμένουν ανεξάρτητες.
              </Text>
              <View style={ui.row}>
                <Button
                  secondary={!draft.content_id}
                  label="Χωρίς ανακοίνωση"
                  onPress={() => set("content_id", null)}
                />
                {links.map((c) => (
                  <Button
                    key={c.id}
                    secondary={draft.content_id !== c.id}
                    label={c.draft.title}
                    onPress={() => set("content_id", c.id)}
                  />
                ))}
              </View>
            </>
          )}
          <View style={ui.row}>
            <Button
              label="Αποθήκευση στο ημερολόγιο"
              disabled={busy || draft.title.trim().length < 2}
              onPress={() =>
                void run(async () => {
                  if (edit)
                    await api.put(`/admin/calendar/${edit.id}`, {
                      ...draft,
                      revision: edit.revision,
                    });
                  else await api.post("/admin/calendar", draft);
                  setDraft(null);
                  setEdit(null);
                })
              }
            />
            <Button
              secondary
              label="Κλείσιμο φόρμας"
              disabled={busy}
              onPress={() => setDraft(null)}
            />
          </View>
        </View>
      )}
      <Status state={state} />
      {!state.loading && !state.error && !entries.length && (
        <Text style={ui.body}>Δεν υπάρχουν εγγραφές σε αυτή την επιλογή.</Text>
      )}
      {entries.map((e) => (
        <View key={e.id} style={ui.card}>
          <Text style={ui.label}>{kinds[e.kind]}</Text>
          <Text style={ui.heading}>{e.title}</Text>
          <Text style={ui.body}>
            {e.start_date}
            {e.end_date !== e.start_date ? ` — ${e.end_date}` : ""} ·{" "}
            {e.start_time
              ? `${e.start_time}–${e.end_time}`
              : "Ολοήμερο / χωρίς ώρα"}
          </Text>
          {!!e.location && <Text style={ui.body}>{e.location}</Text>}
          {!!e.notes && <Text style={ui.body}>{e.notes}</Text>}
          {!!e.cohort_id && (
            <Text style={ui.body}>
              {cohorts.find((c) => c.id === e.cohort_id)?.title ||
                "Συνδεδεμένο τμήμα"}
            </Text>
          )}
          {!!e.content_id && (
            <Text style={ui.body}>
              Ανακοίνωση:{" "}
              {content.find((c) => c.id === e.content_id)?.draft.title ||
                "Αρχειοθετημένο περιεχόμενο"}
            </Text>
          )}
          {e.source === "calendar" ? (
            <View style={ui.row}>
              <Button
                secondary
                label="Επεξεργασία δραστηριότητας"
                disabled={busy}
                onPress={() => {
                  setEdit(e);
                  setDraft({
                    title: e.title,
                    kind: e.kind,
                    start_date: e.start_date,
                    end_date: e.end_date,
                    start_time: e.start_time,
                    end_time: e.end_time,
                    location: e.location,
                    notes: e.notes,
                    cohort_id: e.cohort_id,
                    content_id: e.content_id,
                  });
                }}
              />
              <Button
                secondary
                label={
                  confirm === e.id
                    ? "Επιβεβαίωση ακύρωσης δραστηριότητας"
                    : "Ακύρωση δραστηριότητας"
                }
                disabled={busy}
                onPress={() =>
                  confirm !== e.id
                    ? setConfirm(e.id)
                    : void run(async () => {
                        await api.post(`/admin/calendar/${e.id}/cancel`, {
                          revision: e.revision,
                        });
                        setConfirm(null);
                        if (edit?.id === e.id) {
                          setEdit(null);
                          setDraft(null);
                        }
                      })
                }
              />
            </View>
          ) : (
            <Button
              secondary
              label="Άνοιγμα σχετικής ενότητας"
              onPress={() =>
                onOpen(
                  e.source === "practice"
                    ? "Αξιολογήσεις"
                    : e.source === "attendance"
                      ? "Παρουσίες"
                      : "Τμήματα",
                )
              }
            />
          )}
        </View>
      ))}
    </View>
  );
}
