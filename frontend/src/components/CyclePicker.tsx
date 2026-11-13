import React, { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@/src/api/client";
import { Button, Field, Status, useUi, useLoad } from "./Wellness";
import { useLanguage } from "./AppNavigation";
type Cycle = {
  id: string;
  enrollment_id: string;
  receiver_code: string;
  intended_focus: string;
  receiver_expectations: string;
  planned_sessions: number | null;
  recorded_sessions: number;
  reviewed_sessions: number;
};
export function CyclePicker({
  enrollment,
  value,
  onSelect,
}: {
  enrollment: string;
  value: string;
  onSelect: (id: string, code: string) => void;
}) {
  const ui = useUi();
  const { t } = useLanguage();
  const state = useLoad<Cycle[]>("/school/cycles", []);
  const [code, setCode] = useState(""),
    [focus, setFocus] = useState(""),
    [expectations, setExpectations] = useState(""),
    [planned, setPlanned] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const cycles = state.data.filter((c) => c.enrollment_id === enrollment);
  return (
    <View style={{ gap: 12 }}>
      <Text style={ui.heading}>{t("Κύκλος ατομικής πρακτικής", "Individual practice cycle")}</Text>
      <Text style={ui.body}>
        {t(
          "Κράτησε τις συνεδρίες του ίδιου δέκτη μαζί. Ο προγραμματισμός είναι δικός σου και δεν αποτελεί επίσημο κανόνα πιστοποίησης.",
          "Keep sessions with the same receiver together. The planning is yours and is not an official certification rule.",
        )}
      </Text>
      <Status state={state} />
      {cycles.map((c) => (
        <View key={c.id} style={ui.card}>
          <Button
            label={c.receiver_code}
            secondary={value !== c.id}
            onPress={() => onSelect(c.id, c.receiver_code)}
          />
          <Text style={ui.body}>
            {t(
              `${c.recorded_sessions} καταγραφές · ${c.reviewed_sessions} με αρχικό έλεγχο${c.planned_sessions ? ` · ${c.planned_sessions} προγραμματισμένες` : ""}`,
              `${c.recorded_sessions} records · ${c.reviewed_sessions} reviewed${c.planned_sessions ? ` · ${c.planned_sessions} planned` : ""}`,
            )}
          </Text>
          {!!c.intended_focus && (
            <Text style={ui.body}>{c.intended_focus}</Text>
          )}
        </View>
      ))}
      <Button
        secondary
        label={open ? t("Κλείσιμο νέου κύκλου", "Close new cycle") : t("Νέος κύκλος δέκτη", "New receiver cycle")}
        disabled={!enrollment}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View style={ui.card}>
          <Field label={t("Κωδικός δέκτη", "Receiver code")} value={code} onChange={setCode} />
          <Field
            label={t("Εστίαση κύκλου (προαιρετικό)", "Cycle focus (optional)")}
            value={focus}
            onChange={setFocus}
            multiline
          />
          <Field
            label={t("Προσδοκίες δέκτη (προαιρετικό)", "Receiver expectations (optional)")}
            value={expectations}
            onChange={setExpectations}
            multiline
          />
          <Field
            label={t("Προγραμματισμένες συνεδρίες (προαιρετικό)", "Planned sessions (optional)")}
            value={planned}
            onChange={setPlanned}
          />
          <Button
            label={t("Αποθήκευση κύκλου", "Save cycle")}
            disabled={busy || !code.trim()}
            onPress={async () => {
              setBusy(true);
              setError("");
              try {
                const { data } = await api.post("/school/cycles", {
                  enrollment_id: enrollment,
                  receiver_code: code,
                  intended_focus: focus,
                  receiver_expectations: expectations,
                  planned_sessions: planned ? Number(planned) : null,
                });
                await state.reload();
                onSelect(data.id, data.receiver_code);
                setOpen(false);
                setCode("");
                setFocus("");
                setExpectations("");
                setPlanned("");
              } catch {
                setError(
                  t(
                    "Δεν αποθηκεύτηκε. Έλεγξε την εγγραφή και τον αριθμό συνεδριών.",
                    "Not saved. Check the enrolment and the number of sessions.",
                  ),
                );
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>
      )}
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {error}
        </Text>
      )}
    </View>
  );
}
