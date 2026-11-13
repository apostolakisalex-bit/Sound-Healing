import React, { useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { AdminHome } from "./AdminHome";
import { PendingInbox } from "./PendingInbox";
import { useUi, useLoad } from "./Wellness";

type Workspace = {
  users: { id: string; name: string; email: string; role: string }[];
  cohorts: { id: string; title: string; level_id: string }[];
  enrollments: {
    id: string;
    user_id: string;
    cohort_title?: string;
    status: string;
    status_label?: string;
  }[];
  practices: { id: string; status: string }[];
};

type Row = { id: string; primary: string; secondary?: string };

function DetailCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Row[];
  empty: string;
}) {
  const ui = useUi();
  const { wellness } = useTheme();
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>{title}</Text>
      {rows.length === 0 ? (
        <Text style={ui.body}>{empty}</Text>
      ) : (
        rows.slice(0, 60).map((r) => (
          <View
            key={r.id}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: wellness.line,
              gap: 2,
            }}
          >
            <Text style={[ui.body, { color: wellness.ink, fontWeight: "600" }]}>
              {r.primary}
            </Text>
            {!!r.secondary && (
              <Text style={[ui.body, { fontSize: 13, color: wellness.muted }]}>
                {r.secondary}
              </Text>
            )}
          </View>
        ))
      )}
      {rows.length > 60 && (
        <Text style={[ui.body, { fontSize: 13, color: wellness.muted }]}>
          +{rows.length - 60} ακόμη
        </Text>
      )}
    </View>
  );
}

/**
 * Admin overview header: the four stat circles are now tappable CTAs that
 * reveal the matching list below. Pending items ("Εκκρεμότητες") live inside
 * the "Για έλεγχο" circle.
 */
export function AdminOverview({
  workspace,
  cohorts,
  onPractices,
}: {
  workspace: Workspace;
  cohorts: { id: string; title: string; level_id: string }[];
  onPractices: () => void;
}) {
  const pending = useLoad<any>("/admin/pending", {
    counts: {},
    registrations: [],
    training_requests: [],
  });
  const [open, setOpen] = useState<string | null>(null);

  const students = workspace.users.filter((u) => u.role === "student");
  const activeEnroll = workspace.enrollments.filter(
    (e) => e.status === "active",
  );
  const userName = (id: string) =>
    workspace.users.find((u) => u.id === id)?.name || "Μέλος";

  const pc = pending.data.counts || {};
  const reviewCount =
    (pc.registrations || 0) + (pc.training_requests || 0) + (pc.practices || 0);

  const stats = [
    { key: "students", label: "Μαθητές", value: students.length },
    { key: "enrollments", label: "Ενεργές εγγραφές", value: activeEnroll.length },
    { key: "cohorts", label: "Τμήματα", value: workspace.cohorts.length },
    { key: "review", label: "Για έλεγχο", value: reviewCount },
  ];

  return (
    <View style={{ gap: 16 }}>
      <AdminHome
        stats={stats}
        activeKey={open}
        onStat={(k) => setOpen((o) => (o === k ? null : k))}
      />

      {open === "review" && (
        <PendingInbox
          state={pending}
          cohorts={cohorts}
          onPractices={onPractices}
        />
      )}

      {open === "students" && (
        <DetailCard
          title="Μαθητές"
          empty="Δεν υπάρχουν μαθητές ακόμη."
          rows={students.map((u) => ({
            id: u.id,
            primary: u.name || u.email || u.id,
            secondary: u.email,
          }))}
        />
      )}

      {open === "enrollments" && (
        <DetailCard
          title="Ενεργές εγγραφές"
          empty="Δεν υπάρχουν ενεργές εγγραφές."
          rows={activeEnroll.map((e) => ({
            id: e.id,
            primary: userName(e.user_id),
            secondary: [e.cohort_title, e.status_label || e.status]
              .filter(Boolean)
              .join(" · "),
          }))}
        />
      )}

      {open === "cohorts" && (
        <DetailCard
          title="Τμήματα"
          empty="Δεν υπάρχουν τμήματα."
          rows={workspace.cohorts.map((c) => ({
            id: c.id,
            primary: c.title,
            secondary: c.level_id ? `Level ${c.level_id}` : undefined,
          }))}
        />
      )}
    </View>
  );
}

export default AdminOverview;
