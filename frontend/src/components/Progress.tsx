import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Status, ui, useLoad } from "./Wellness";

type Metric = { count: number; minutes: number };
type Row = {
  enrollment_id: string;
  learner_name: string;
  cohort_title: string;
  level_id: string;
  status: string;
  attendance: Record<string, Metric>;
  practices: Record<string, Metric>;
};
const labels: Record<string, string> = {
  draft: "Πρόχειρες",
  submitted: "Για έλεγχο",
  changes_requested: "Για διόρθωση",
  reviewed: "Ελεγμένες",
};
export function Progress({ staff = false }: { staff?: boolean }) {
  const [offset, setOffset] = useState(0);
  const state = useLoad<{ items: Row[]; total: number }>(
    `/school/progress?staff_view=${staff}&offset=${offset}&limit=20`,
    { items: [], total: 0 },
  );
  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Η πρόοδος στην πράξη</Text>
      <Text style={ui.body}>
        Παρουσίες και καταγραφές ανά εγγραφή. Ο αρχικός έλεγχος πρακτικής δεν
        αποτελεί πιστοποίηση.
      </Text>
      <Button
        secondary
        label="Ανανέωση προόδου"
        disabled={state.loading}
        onPress={() => void state.reload()}
      />
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          {!state.data.items.length && (
            <Text style={ui.body}>Δεν υπάρχουν εγγραφές για εμφάνιση.</Text>
          )}
          {state.data.items.map((row) => (
            <View key={row.enrollment_id} style={ui.card}>
              <Text style={ui.label}>
                {row.level_id} ·{" "}
                {row.status === "active" ? "Ενεργή εγγραφή" : "Σε παύση"}
              </Text>
              <Text style={ui.heading}>
                {staff ? `${row.learner_name} · ` : ""}
                {row.cohort_title}
              </Text>
              <Text style={ui.body}>
                {row.attendance.present.count} παρουσίες ·{" "}
                {(row.attendance.present.minutes / 60).toLocaleString("el-GR", {
                  maximumFractionDigits: 1,
                })}{" "}
                ώρες παρακολούθησης
              </Text>
              <Text style={ui.body}>
                {row.attendance.absent.count} απουσίες ·{" "}
                {row.attendance.excused.count} δικαιολογημένες
              </Text>
              <View style={ui.row}>
                {Object.entries(labels)
                  .filter(([key]) => !staff || key !== "draft")
                  .map(([key, label]) => (
                    <View
                      key={key}
                      style={[ui.card, { minWidth: 140, flexGrow: 1 }]}
                    >
                      <Text style={ui.heading}>
                        {row.practices[key]?.count || 0}
                      </Text>
                      <Text style={ui.body}>{label}</Text>
                      <Text style={ui.body}>
                        {row.practices[key]?.minutes || 0} λεπτά πρακτικής
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          ))}
          <View style={ui.row}>
            <Button
              secondary
              label="Προηγούμενες εγγραφές"
              disabled={offset === 0}
              onPress={() => setOffset(Math.max(0, offset - 20))}
            />
            <Button
              secondary
              label="Επόμενες εγγραφές"
              disabled={offset + 20 >= state.data.total}
              onPress={() => setOffset(offset + 20)}
            />
          </View>
        </>
      )}
    </View>
  );
}
