import React, { useState } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";
import { Button, Field, Status, useUi, useLoad } from "./Wellness";
import { useLanguage } from "./AppNavigation";
export function MembersChat() {
  const { user } = useAuth();
  const ui = useUi();
  const { t } = useLanguage();
  if (!user)
    return (
      <View style={ui.card}>
        <Text style={ui.heading}>{t("Chat μελών", "Members chat")}</Text>
        <Link href="/login" style={ui.body}>
          {t("Σύνδεση για συμμετοχή →", "Sign in to join →")}
        </Link>
      </View>
    );
  if (user.membership_status && user.membership_status !== "approved")
    return (
      <Text style={ui.body}>
        {t("Το chat ενεργοποιείται μετά την έγκριση της εγγραφής σου.", "The chat is activated after your registration is approved.")}
      </Text>
    );
  return <Chat />;
}
function Chat() {
  const { user } = useAuth();
  const ui = useUi();
  const { t, language } = useLanguage();
  const chatLocale = language === "en" ? "en-GB" : "el-GR";
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
      <Text style={ui.heading}>{t("Chat μελών", "Members chat")}</Text>
      <Text style={ui.body}>
        {t(
          "Τα μηνύματα είναι ορατά στα εγκεκριμένα μέλη και στον διαχειριστή. Μοιραζόμαστε εμπειρίες χωρίς προσωπικά στοιχεία δεκτών.",
          "Messages are visible to approved members and the administrator. We share experiences without recipients' personal details.",
        )}
      </Text>
      <Button
        secondary
        label={t("Νεότερα μηνύματα / Ανανέωση", "Newer messages / Refresh")}
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
            {m.name} · {new Date(m.created_at).toLocaleString(chatLocale)}
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
          label={t("Παλαιότερα μηνύματα", "Older messages")}
          onPress={() => setCursor(state.data[state.data.length - 1].id)}
        />
      )}
      <Field
        label={t("Το μήνυμά σου", "Your message")}
        value={message}
        onChange={setMessage}
        multiline
      />
      <Button
        label={t("Αποστολή στο chat", "Send to chat")}
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
            setError(t("Δεν στάλθηκε. Περίμενε λίγο και δοκίμασε ξανά.", "Not sent. Wait a moment and try again."));
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
