import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Status, ui } from "./Wellness";
import { MemberProfile } from "./MemberProfile";
export function PendingInbox({
  state,
  cohorts,
  onPractices,
}: {
  state: {
    data: { counts?: any; registrations?: any[]; training_requests?: any[] };
    loading: boolean;
    error: string;
    reload: () => void | Promise<void>;
  };
  cohorts: { id: string; title: string; level_id: string }[];
  onPractices: () => void;
}) {
  const [member, setMember] = useState("");
  const c = state.data.counts || {};
  const registrations = state.data.registrations || [];
  const training_requests = state.data.training_requests || [];
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
      {registrations.map((m: any) => (
        <Button
          secondary
          key={m.id}
          label={`${m.name} · Εγγραφή${!m.application_complete ? " · Ελλιπή στοιχεία" : ""}${!m.email_verified ? " · Αναμονή email" : ""}`}
          onPress={() => setMember(m.id)}
        />
      ))}
      {training_requests.map((m: any) => (
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
