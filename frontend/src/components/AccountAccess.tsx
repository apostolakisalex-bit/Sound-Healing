import React, { useEffect, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import * as Linking from "expo-linking";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/auth/AuthContext";
import { Button, Choices, Field, Shell, Status, ui, useLoad } from "./Wellness";
const messageOf = (e: any) =>
  typeof e?.response?.data?.detail === "string"
    ? e.response.data.detail
    : "Έλεγξε όλα τα στοιχεία και δοκίμασε ξανά.";
export function AccountChecklist() {
  const { refresh } = useAuth();
  const state = useLoad<any>("/auth/account", {});
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const values = draft || state.data.application || {};
  const run = async (task: () => Promise<any>) => {
    setBusy(true);
    setMessage("");
    try {
      const result = await task();
      await state.reload();
      await refresh();
      setMessage(result?.data?.message || "Τα στοιχεία αποθηκεύτηκαν.");
    } catch (e) {
      setMessage(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>Ολοκλήρωση εγγραφής</Text>
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          {!state.data.application_complete && (
            <>
              <Text style={ui.body}>
                Συμπλήρωσε τα στοιχεία σου ώστε ο Μανώλης να εξετάσει την αίτησή
                σου.
              </Text>
              {[
                ["first_name", "Όνομα"],
                ["last_name", "Επώνυμο"],
                ["birth_month", "Μήνας γέννησης (1–12)"],
                ["birth_year", "Έτος γέννησης"],
                ["phone", "Τηλέφωνο"],
                ["address", "Διεύθυνση"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={values[key] ? String(values[key]) : ""}
                  onChange={(v) => setDraft({ ...values, [key]: v })}
                />
              ))}
              <Choices
                label="Δηλωμένο Level"
                values={["L1", "L2", "L3", "L4"]}
                value={values.declared_level || "L1"}
                onChange={(v) => setDraft({ ...values, declared_level: v })}
              />
              <Button
                disabled={busy}
                label="Αποθήκευση στοιχείων"
                onPress={() =>
                  void run(() =>
                    api.put("/auth/application", {
                      first_name: values.first_name || "",
                      last_name: values.last_name || "",
                      birth_month: Number(values.birth_month),
                      birth_year: Number(values.birth_year),
                      phone: values.phone || "",
                      address: values.address || "",
                      declared_level: values.declared_level || "L1",
                    }),
                  )
                }
              />
            </>
          )}
          {state.data.application_complete && (
            <Text style={ui.body}>✓ Τα στοιχεία εγγραφής είναι πλήρη.</Text>
          )}
          {!state.data.email_verified ? (
            <>
              <Text style={ui.body}>
                Επιβεβαίωσε το email σου: {state.data.email}
              </Text>
              <Button
                secondary
                disabled={busy}
                label="Αποστολή email επιβεβαίωσης"
                onPress={() =>
                  void run(() => api.post("/auth/verification-email"))
                }
              />
            </>
          ) : (
            <Text style={ui.body}>✓ Το email έχει επιβεβαιωθεί.</Text>
          )}
          <Button
            secondary
            disabled={busy}
            label="Έχω επιβεβαιώσει — Ανανέωση"
            onPress={() =>
              void run(async () => {
                await state.reload();
              })
            }
          />
        </>
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
    </View>
  );
}
export function AccountAction() {
  const [mode, setMode] = useState("forgot");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const read = (url: string) => {
      const fragment = url.split("#")[1] || "";
      const params = new URLSearchParams(fragment);
      const m = params.get("mode");
      if (m === "reset" || m === "verify") {
        setMode(m);
        setToken(params.get("token") || "");
      }
    };
    if (Platform.OS === "web") {
      read(window.location.href);
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
    } else {
      void Linking.getInitialURL().then((url) => url && read(url));
    }
    const sub = Linking.addEventListener("url", ({ url }) => read(url));
    return () => sub.remove();
  }, []);
  const submit = async () => {
    if (mode === "reset" && (password.length < 10 || password !== confirm)) {
      setMessage(
        "Χρειάζονται τουλάχιστον 10 χαρακτήρες και ίδιος κωδικός στα δύο πεδία.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const r =
        mode === "forgot"
          ? await api.post("/auth/forgot-password", { email: email.trim() })
          : mode === "reset"
            ? await api.post("/auth/reset-password", { token, password })
            : await api.post("/auth/verify-email", { token });
      setMessage(
        r.data.message ||
          (mode === "verify"
            ? "Το email επιβεβαιώθηκε. Επέστρεψε στο προφίλ σου."
            : "Ο κωδικός άλλαξε. Συνδέσου με τον νέο κωδικό."),
      );
      setDone(true);
      setPassword("");
      setConfirm("");
      setToken("");
    } catch (e) {
      setMessage(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell
      publicPage
      eyebrow="ΛΟΓΑΡΙΑΣΜΟΣ"
      title={mode === "verify" ? "Επιβεβαίωση email" : "Ανάκτηση κωδικού"}
    >
      <View
        style={[ui.card, { maxWidth: 560, width: "100%", alignSelf: "center" }]}
      >
        {!done && (
          <>
            {mode === "forgot" && (
              <TextInput
                accessibilityLabel="Email"
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                style={ui.input}
              />
            )}
            {mode === "reset" && (
              <>
                {[
                  [password, setPassword, "Νέος κωδικός"],
                  [confirm, setConfirm, "Επανάληψη κωδικού"],
                ].map(([value, setter, label], i) => (
                  <TextInput
                    key={i}
                    accessibilityLabel={label as string}
                    placeholder={label as string}
                    value={value as string}
                    onChangeText={setter as (s: string) => void}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    secureTextEntry
                    style={ui.input}
                  />
                ))}
              </>
            )}
            <Button
              disabled={busy || (mode !== "forgot" && !token)}
              label={
                busy
                  ? "Περίμενε…"
                  : mode === "forgot"
                    ? "Αποστολή οδηγιών"
                    : mode === "reset"
                      ? "Αποθήκευση νέου κωδικού"
                      : "Επιβεβαίωση email"
              }
              onPress={() => void submit()}
            />
          </>
        )}
        {!!message && (
          <Text accessibilityLiveRegion="polite" style={ui.body}>
            {message}
          </Text>
        )}
        <Link href="/login" style={ui.body}>
          Σύνδεση
        </Link>
        <Link href="/(tabs)/profile" style={ui.body}>
          Προφίλ
        </Link>
      </View>
    </Shell>
  );
}
