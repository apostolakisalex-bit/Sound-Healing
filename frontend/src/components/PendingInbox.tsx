import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Status, ui, useLoad } from "./Wellness";
import { MemberProfile } from "./MemberProfile";
export function PendingInbox({
  cohorts,
  onPractices,
}: {
  cohorts: { id: string; title: string; level_id: string }[];
  onPractices: () => void;
}) {
  const state = useLoad<any>("/admin/pending", {
    counts: {},
    registrations: [],
    training_requests: [],
  });
  const [member, setMember] = useState("");
  const c = state.data.counts;
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>Εκκρεμότητες</Text>
      <Status state={state} />
      <Text style={ui.body}>
        Νέες εγγραφές: {c.registrations || 0} · Αιτήσεις εκπαιδευτικών:{" "}
        {c.training_requests || 0}
      </Text>
      <Button
        secondary
        label={`Πρακτικές προς εξέταση: ${c.practices || 0}`}
        onPress={onPractices}
      />
      <Button
        secondary
        label="Ανανέωση εκκρεμοτήτων"
        onPress={() => void state.reload()}
      />
      {state.data.registrations.map((m: any) => (
        <Button
          secondary
          key={m.id}
          label={`${m.name} · Εγγραφή${!m.application_complete ? " · Ελλιπή στοιχεία" : ""}${!m.email_verified ? " · Αναμονή email" : ""}`}
          onPress={() => setMember(m.id)}
        />
      ))}
      {state.data.training_requests.map((m: any) => (
        <Button
          secondary
          key={m.id}
          label={`${m.name} · Αίτηση ${m.level_id}`}
          onPress={() => setMember(m.user_id)}
        />
      ))}
      {(c.registrations > 100 || c.training_requests > 100) && (
        <Text style={ui.body}>
          Εμφανίζονται οι 100 παλαιότερες αιτήσεις ανά κατηγορία. Όλα τα μέλη
          είναι διαθέσιμα στην ενότητα Μέλη.
        </Text>
      )}
      {!!member && (
        <>
          <Button
            secondary
            label="Κλείσιμο προφίλ & ανανέωση"
            onPress={() => {
              setMember("");
              void state.reload();
            }}
          />
          <MemberProfile key={member} memberId={member} cohorts={cohorts} />
        </>
      )}
    </View>
  );
}
