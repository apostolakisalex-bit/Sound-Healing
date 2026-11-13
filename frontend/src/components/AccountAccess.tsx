import React, { useEffect, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import * as Linking from "expo-linking";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/auth/AuthContext";
import { Button, Choices, Field, Shell, Status, useUi, useLoad } from "./Wellness";
import { useLanguage } from "./AppNavigation";
const messageOf = (e: any, fallback: string) =>
  typeof e?.response?.data?.detail === "string"
    ? e.response.data.detail
    : fallback;
export function AccountChecklist() {
  const { refresh } = useAuth();
  const ui = useUi();
  const { t } = useLanguage();
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
      setMessage(result?.data?.message || t("Τα στοιχεία αποθηκεύτηκαν.", "Your details have been saved."));
    } catch (e) {
      setMessage(messageOf(e, t("Έλεγξε όλα τα στοιχεία και δοκίμασε ξανά.", "Check all the details and try again.")));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>{t("Ολοκλήρωση εγγραφής", "Complete registration")}</Text>
      <Status state={state} />
      {!state.loading && !state.error && (
        <>
          {!state.data.application_complete && (
            <>
              <Text style={ui.body}>
                {t(
                  "Συμπλήρωσε τα στοιχεία σου ώστε ο Μανώλης να εξετάσει την αίτησή σου.",
                  "Fill in your details so Manolis can review your application.",
                )}
              </Text>
              {[
                ["first_name", t("Όνομα", "First name")],
                ["last_name", t("Επώνυμο", "Last name")],
                ["birth_month", t("Μήνας γέννησης (1–12)", "Birth month (1–12)")],
                ["birth_year", t("Έτος γέννησης", "Birth year")],
                ["phone", t("Τηλέφωνο", "Phone")],
                ["address", t("Διεύθυνση", "Address")],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={values[key] ? String(values[key]) : ""}
                  onChange={(v) => setDraft({ ...values, [key]: v })}
                />
              ))}
              <Choices
                label={t("Δηλωμένο Level", "Declared Level")}
                values={["L1", "L2", "L3", "L4"]}
                value={values.declared_level || "L1"}
                onChange={(v) => setDraft({ ...values, declared_level: v })}
              />
              <Button
                disabled={busy}
                label={t("Αποθήκευση στοιχείων", "Save details")}
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
            <Text style={ui.body}>{t("✓ Τα στοιχεία εγγραφής είναι πλήρη.", "✓ Registration details are complete.")}</Text>
          )}
          {!state.data.email_verified ? (
            <>
              <Text style={ui.body}>
                {t("Επιβεβαίωσε το email σου:", "Confirm your email:")} {state.data.email}
              </Text>
              <Button
                secondary
                disabled={busy}
                label={t("Αποστολή email επιβεβαίωσης", "Send confirmation email")}
                onPress={() =>
                  void run(() => api.post("/auth/verification-email"))
                }
              />
            </>
          ) : (
            <Text style={ui.body}>{t("✓ Το email έχει επιβεβαιωθεί.", "✓ Email has been confirmed.")}</Text>
          )}
          <Button
            secondary
            disabled={busy}
            label={t("Έχω επιβεβαιώσει — Ανανέωση", "I've confirmed — Refresh")}
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
  const ui = useUi();
  const { t } = useLanguage();
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
        t(
          "Χρειάζονται τουλάχιστον 10 χαρακτήρες και ίδιος κωδικός στα δύο πεδία.",
          "At least 10 characters are required and the password must match in both fields.",
        ),
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
            ? t("Το email επιβεβαιώθηκε. Επέστρεψε στο προφίλ σου.", "Your email has been confirmed. Return to your profile.")
            : t("Ο κωδικός άλλαξε. Συνδέσου με τον νέο κωδικό.", "Your password has changed. Sign in with the new password.")),
      );
      setDone(true);
      setPassword("");
      setConfirm("");
      setToken("");
    } catch (e) {
      setMessage(messageOf(e, t("Έλεγξε όλα τα στοιχεία και δοκίμασε ξανά.", "Check all the details and try again.")));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell
      publicPage
      eyebrow={t("ΛΟΓΑΡΙΑΣΜΟΣ", "ACCOUNT")}
      title={mode === "verify" ? t("Επιβεβαίωση email", "Email confirmation") : t("Ανάκτηση κωδικού", "Password recovery")}
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
                  [password, setPassword, t("Νέος κωδικός", "New password")],
                  [confirm, setConfirm, t("Επανάληψη κωδικού", "Repeat password")],
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
                  ? t("Περίμενε…", "Please wait…")
                  : mode === "forgot"
                    ? t("Αποστολή οδηγιών", "Send instructions")
                    : mode === "reset"
                      ? t("Αποθήκευση νέου κωδικού", "Save new password")
                      : t("Επιβεβαίωση email", "Confirm email")
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
          {t("Σύνδεση", "Sign in")}
        </Link>
        <Link href="/(tabs)/profile" style={ui.body}>
          {t("Προφίλ", "Profile")}
        </Link>
      </View>
    </Shell>
  );
}
