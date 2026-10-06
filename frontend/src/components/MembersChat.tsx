import React, { useState } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";
import { Button, Field, Status, ui, useLoad } from "./Wellness";
export function MembersChat() {
  const { user } = useAuth();
  if (!user)
    return (
      <View style={ui.card}>
        <Text style={ui.heading}>Chat μελών</Text>
        <Link href="/login" style={ui.body}>
          Σύνδεση για συμμετοχή →
        </Link>
      </View>
    );
  if (user.membership_status && user.membership_status !== "approved")
    return (
      <Text style={ui.body}>
        Το chat ενεργοποιείται μετά την έγκριση της εγγραφής σου.
      </Text>
    );
  return <Chat />;
}
function Chat() {
  const { user } = useAuth();
  const [cursor, setCursor] = useState("");
  const state = useLoad<
    {
      id: string;
      user_id: string;
      name: string;
      text: string;
      created_at: string;
    }[]
  >(
    `/members/chat${cursor ? `?before=${encodeURIComponent(cursor)}` : ""}`,
    [],
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>Chat μελών</Text>
      <Text style={ui.body}>
        Τα μηνύματα είναι ορατά στα εγκεκριμένα μέλη και στον διαχειριστή.
        Μοιραζόμαστε εμπειρίες χωρίς προσωπικά στοιχεία δεκτών.
      </Text>
      <Button
        secondary
        label="Νεότερα μηνύματα / Ανανέωση"
        onPress={() => {
          if (cursor) setCursor("");
          else void state.reload();
        }}
      />
      <Status state={state} />
      {[...state.data].reverse().map((m) => (
        <View
          key={m.id}
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: m.user_id === user?.id ? "#EFE7D5" : "#F6F4EF",
            gap: 5,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600" }}>
            {m.name} · {new Date(m.created_at).toLocaleString("el-GR")}
          </Text>
          <Text style={ui.body}>{m.text}</Text>
          {user?.role === "admin" && (
            <Button
              secondary
              label="Απόκρυψη μηνύματος"
              onPress={async () => {
                try {
                  await api.post(
                    `/admin/chat/${encodeURIComponent(m.id)}/hide`,
                  );
                  await state.reload();
                } catch {
                  setError("Δεν αποκρύφτηκε το μήνυμα.");
                }
              }}
            />
          )}
        </View>
      ))}
      {state.data.length === 50 && (
        <Button
          secondary
          label="Παλαιότερα μηνύματα"
          onPress={() => setCursor(state.data[state.data.length - 1].id)}
        />
      )}
      <Field
        label="Το μήνυμά σου"
        value={message}
        onChange={setMessage}
        multiline
      />
      <Button
        label="Αποστολή στο chat"
        disabled={busy || !message.trim() || message.length > 2000}
        onPress={async () => {
          setBusy(true);
          setError("");
          try {
            await api.post("/members/chat", { text: message });
            setMessage("");
            if (cursor) setCursor("");
            else await state.reload();
          } catch {
            setError("Δεν στάλθηκε. Περίμενε λίγο και δοκίμασε ξανά.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {error}
        </Text>
      )}
    </View>
  );
}
