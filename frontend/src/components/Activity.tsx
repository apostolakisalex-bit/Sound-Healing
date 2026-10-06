import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Status, ui, useLoad } from "./Wellness";
const labels: Record<string, string> = {
  "content.create": "Δημιουργία περιεχομένου",
  "content.edit": "Επεξεργασία προχείρου",
  "content.publish": "Δημοσίευση περιεχομένου",
  "content.archive": "Αρχειοθέτηση περιεχομένου",
  "content.restore_draft": "Επαναφορά έκδοσης σε πρόχειρο",
  "cohort.create": "Δημιουργία τμήματος",
  "enrollment.create": "Καταχώριση εγγραφής",
  "enrollment.active": "Ενεργοποίηση εγγραφής",
  "enrollment.paused": "Παύση εγγραφής",
  "attendance.record": "Καταγραφή παρουσίας",
  "practice.review": "Έλεγχος πρακτικής",
  "workspace.export": "Εξαγωγή δεδομένων",
};
type Event = {
  id: string;
  actor_name: string;
  action: string;
  entity_id: string;
  created_at: string;
};
export function Activity() {
  const [offset, setOffset] = useState(0);
  const state = useLoad<{ items: Event[]; total: number }>(
    `/admin/activity?offset=${offset}&limit=20`,
    { items: [], total: 0 },
  );
  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Ιστορικό διαχείρισης</Text>
      <Text style={ui.body}>
        Καταγεγραμμένες ενέργειες περιεχομένου και σχολής. Δεν περιλαμβάνει
        προσωπικές σημειώσεις πρακτικής.
      </Text>
      <Button
        secondary
        label="Ανανέωση ιστορικού"
        disabled={state.loading}
        onPress={() => void state.reload()}
      />
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          {!state.data.items.length && (
            <Text style={ui.body}>
              Δεν υπάρχουν καταγεγραμμένες ενέργειες σε αυτή τη σελίδα.
            </Text>
          )}
          {state.data.items.map((event) => (
            <View style={ui.card} key={event.id}>
              <Text style={ui.label}>
                {new Date(event.created_at).toLocaleString("el-GR")}
              </Text>
              <Text style={ui.heading}>
                {labels[event.action] || event.action}
              </Text>
              <Text style={ui.body}>{event.actor_name}</Text>
              <Text selectable style={ui.body}>
                Αναφορά: {event.entity_id}
              </Text>
            </View>
          ))}
          <Text style={ui.body}>
            {state.data.total} καταγεγραμμένες ενέργειες
          </Text>
          <View style={ui.row}>
            <Button
              secondary
              label="Προηγούμενες ενέργειες"
              disabled={offset === 0}
              onPress={() => setOffset(Math.max(0, offset - 20))}
            />
            <Button
              secondary
              label="Επόμενες ενέργειες"
              disabled={offset + 20 >= state.data.total}
              onPress={() => setOffset(offset + 20)}
            />
          </View>
        </>
      )}
    </View>
  );
}
