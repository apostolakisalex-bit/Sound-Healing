import React, { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@/src/api/client";
import { Button, Field, Status, ui, useLoad } from "./Wellness";
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
      <Text style={ui.heading}>Κύκλος ατομικής πρακτικής</Text>
      <Text style={ui.body}>
        Κράτησε τις συνεδρίες του ίδιου δέκτη μαζί. Ο προγραμματισμός είναι
        δικός σου και δεν αποτελεί επίσημο κανόνα πιστοποίησης.
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
            {c.recorded_sessions} καταγραφές · {c.reviewed_sessions} με αρχικό
            έλεγχο
            {c.planned_sessions
              ? ` · ${c.planned_sessions} προγραμματισμένες`
              : ""}
          </Text>
          {!!c.intended_focus && (
            <Text style={ui.body}>{c.intended_focus}</Text>
          )}
        </View>
      ))}
      <Button
        secondary
        label={open ? "Κλείσιμο νέου κύκλου" : "Νέος κύκλος δέκτη"}
        disabled={!enrollment}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View style={ui.card}>
          <Field label="Κωδικός δέκτη" value={code} onChange={setCode} />
          <Field
            label="Εστίαση κύκλου (προαιρετικό)"
            value={focus}
            onChange={setFocus}
            multiline
          />
          <Field
            label="Προσδοκίες δέκτη (προαιρετικό)"
            value={expectations}
            onChange={setExpectations}
            multiline
          />
          <Field
            label="Προγραμματισμένες συνεδρίες (προαιρετικό)"
            value={planned}
            onChange={setPlanned}
          />
          <Button
            label="Αποθήκευση κύκλου"
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
                  "Δεν αποθηκεύτηκε. Έλεγξε την εγγραφή και τον αριθμό συνεδριών.",
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
