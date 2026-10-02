import React from "react";
import { Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Shell, ui, useLoad, Status } from "./Wellness";

type Legacy = { id: string; session_date: string; duration_minutes: number; session_type: string; receiver_name?: string; intention?: string; observations?: string; technical_reflections?: string; what_went_well?: string; what_to_improve?: string; notes?: string };
const notice = "Ιστορικό από την προηγούμενη εφαρμογή, μόνο για ανάγνωση. Οι καταγραφές αυτές δεν προσμετρώνται αυτόματα στην πρόοδο των Levels.";
function Record({ item }: { item: Legacy }) {
  return <View style={ui.card}>
    <Text style={ui.heading}>{item.session_type}</Text>
    <Text style={ui.body}>{item.session_date} · {item.duration_minutes} λεπτά</Text>
    {!!item.receiver_name && <Text style={ui.body}>Δέκτης: {item.receiver_name}</Text>}
    {[
      ["Πρόθεση", item.intention], ["Παρατηρήσεις", item.observations],
      ["Αναστοχασμός", item.technical_reflections], ["Τι λειτούργησε", item.what_went_well],
      ["Προς βελτίωση", item.what_to_improve], ["Σημειώσεις", item.notes],
    ].filter(([, value]) => value).map(([label, value]) => <View key={label} style={{ gap: 4 }}>
      <Text style={ui.label}>{label}</Text><Text style={ui.body}>{value}</Text>
    </View>)}
  </View>;
}
export function LegacyHistory() {
  const state = useLoad<Legacy[]>("/practices", []);
  return <Shell eyebrow="ΙΣΤΟΡΙΚΟ" title="Παλαιότερες καταγραφές">
    <Link href="/practice" style={ui.body}>← Εκπαιδευτική πρακτική</Link>
    <Text style={ui.body}>{notice}</Text><Status state={state} />
    {!state.loading && !state.error && !state.data.length && <Text style={ui.body}>Δεν υπάρχουν παλαιότερες καταγραφές.</Text>}
    {state.data.map(item => <View key={item.id} style={ui.card}>
      <Text style={ui.heading}>{item.session_type}</Text>
      <Text style={ui.body}>{item.session_date} · {item.duration_minutes} λεπτά</Text>
      <Link href={`/practice/${item.id}` as any} style={ui.body}>Προβολή καταγραφής →</Link>
    </View>)}
  </Shell>;
}
export function LegacyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useLoad<Legacy | null>(`/practices/${encodeURIComponent(id || "")}`, null);
  return <Shell eyebrow="ΙΣΤΟΡΙΚΟ" title="Παλαιότερη πρακτική">
    <Link href="/legacy-practices" style={ui.body}>← Ιστορικό καταγραφών</Link>
    <Text style={ui.body}>{notice}</Text><Status state={state} />
    {!!state.data && <Record item={state.data} />}
  </Shell>;
}
