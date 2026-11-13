import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Choices, Status, useUi, useLoad } from "./Wellness";
import { useLanguage } from "./AppNavigation";

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
export function Progress({ staff = false }: { staff?: boolean }) {
  const ui = useUi();
  const { t, language } = useLanguage();
  const [offset, setOffset] = useState(0);
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const locale = language === "el" ? "el-GR" : "en-GB";
  // Display labels for the practice-status columns; keys stay stable.
  const labels: [string, string][] = [
    ["draft", t("Πρόχειρες", "Drafts")],
    ["submitted", t("Για έλεγχο", "For review")],
    ["changes_requested", t("Για διόρθωση", "For revision")],
    ["reviewed", t("Ελεγμένες", "Reviewed")],
  ];
  const state = useLoad<{ items: Row[]; total: number }>(
    `/school/progress?staff_view=${staff}&offset=${offset}&limit=20${level === "all" ? "" : `&level_id=${level}`}${status === "all" ? "" : `&enrollment_status=${status}`}`,
    { items: [], total: 0 },
  );
  const levelAll = t("Όλα", "All");
  const statusOptions: [string, string][] = [
    ["all", t("Όλες", "All")],
    ["active", t("Ενεργές", "Active")],
    ["paused", t("Σε παύση", "Paused")],
  ];
  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>{t("Η πρόοδος στην πράξη", "Progress in practice")}</Text>
      <Text style={ui.body}>
        {t(
          "Παρουσίες και καταγραφές ανά εγγραφή. Ο αρχικός έλεγχος πρακτικής δεν αποτελεί πιστοποίηση.",
          "Attendance and records per enrolment. The initial practice review is not a certification.",
        )}
      </Text>
      <Choices
        label="Level"
        values={[levelAll, "L1", "L2", "L3", "L4"]}
        value={level === "all" ? levelAll : level}
        onChange={(v) => {
          setOffset(0);
          setLevel(v === levelAll ? "all" : v);
        }}
      />
      <Choices
        label={t("Κατάσταση εγγραφής", "Enrolment status")}
        values={statusOptions.map(([, lbl]) => lbl)}
        value={statusOptions.find(([key]) => key === status)?.[1] || ""}
        onChange={(v) => {
          setOffset(0);
          setStatus(statusOptions.find(([, lbl]) => lbl === v)?.[0] || "all");
        }}
      />
      <Button
        secondary
        label={t("Ανανέωση προόδου", "Refresh progress")}
        disabled={state.loading}
        onPress={() => void state.reload()}
      />
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          {!state.data.items.length && (
            <Text style={ui.body}>
              {t(
                "Δεν βρέθηκαν εγγραφές με αυτά τα φίλτρα.",
                "No enrolments found with these filters.",
              )}
            </Text>
          )}
          {state.data.items.map((row) => (
            <View key={row.enrollment_id} style={ui.card}>
              <Text style={ui.label}>
                {row.level_id} ·{" "}
                {row.status === "active"
                  ? t("Ενεργή εγγραφή", "Active enrolment")
                  : t("Σε παύση", "Paused")}
              </Text>
              <Text style={ui.heading}>
                {staff ? `${row.learner_name} · ` : ""}
                {row.cohort_title}
              </Text>
              <Text style={ui.body}>
                {t("Παρουσίες:", "Attendance:")} {row.attendance.present.count} ·{" "}
                {t("Ώρες παρακολούθησης:", "Hours attended:")}{" "}
                {(row.attendance.present.minutes / 60).toLocaleString(locale, {
                  maximumFractionDigits: 1,
                })}{" "}
              </Text>
              <Text style={ui.body}>
                {t("Απουσίες:", "Absences:")} {row.attendance.absent.count} ·{" "}
                {t("Δικαιολογημένες:", "Excused:")} {row.attendance.excused.count}
              </Text>
              <View style={ui.row}>
                {labels
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
                        {row.practices[key]?.minutes || 0}{" "}
                        {t("λεπτά πρακτικής", "min of practice")}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          ))}
          <Text style={ui.body}>
            {t(
              `${state.data.total} εγγραφές με τα επιλεγμένα φίλτρα`,
              `${state.data.total} enrolments with the selected filters`,
            )}
          </Text>
          <View style={ui.row}>
            <Button
              secondary
              label={t("Προηγούμενες εγγραφές", "Previous enrolments")}
              disabled={offset === 0}
              onPress={() => setOffset(Math.max(0, offset - 20))}
            />
            <Button
              secondary
              label={t("Επόμενες εγγραφές", "Next enrolments")}
              disabled={offset + 20 >= state.data.total}
              onPress={() => setOffset(offset + 20)}
            />
          </View>
        </>
      )}
    </View>
  );
}
