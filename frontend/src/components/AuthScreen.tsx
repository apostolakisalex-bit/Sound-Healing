import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { Shell, ui, Button, Field } from "@/src/components/Wellness";
export function AuthScreen({ registering = false }: { registering?: boolean }) {
  const auth = useAuth(),
    router = useRouter();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async () => {
    setError("");
    if (
      !email ||
      !password ||
      (registering && (name.trim().length < 2 || password.length < 10))
    ) {
      setError(
        "Συμπλήρωσε τα στοιχεία. Στην εγγραφή χρειάζονται τουλάχιστον 10 χαρακτήρες για τον κωδικό.",
      );
      return;
    }
    setBusy(true);
    try {
      if (registering) await auth.register(email.trim(), password, name.trim());
      else await auth.login(email.trim(), password);
      router.replace("/(tabs)/sanctuary");
    } catch {
      setError(
        registering
          ? "Δεν ολοκληρώθηκε η εγγραφή. Έλεγξε τα στοιχεία ή δοκίμασε σύνδεση."
          : "Δεν ήταν δυνατή η σύνδεση. Έλεγξε email και κωδικό.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell
      publicPage
      eyebrow="YOUR WELLNESS SPACE"
      title={registering ? "Η διαδρομή σου ξεκινά εδώ." : "Καλώς ήρθες ξανά."}
    >
      <View
        style={[ui.card, { maxWidth: 560, width: "100%", alignSelf: "center" }]}
      >
        {registering && (
          <Field label="Ονοματεπώνυμο" value={name} onChange={setName} />
        )}
        <Text style={ui.body}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          style={ui.input}
        />
        <Text style={ui.body}>Κωδικός</Text>
        <TextInput
          accessibilityLabel="Κωδικός"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={registering ? "new-password" : "current-password"}
          value={password}
          onChangeText={setPassword}
          style={ui.input}
        />
        {!!error && (
          <Text accessibilityLiveRegion="polite" style={ui.body}>
            {error}
          </Text>
        )}
        <Button
          disabled={busy}
          label={
            busy
              ? "Περίμενε…"
              : registering
                ? "Δημιουργία λογαριασμού"
                : "Σύνδεση"
          }
          onPress={() => void submit()}
        />
        <Link href={registering ? "/login" : "/register"} style={ui.body}>
          {registering
            ? "Έχεις λογαριασμό; Σύνδεση"
            : "Νέος χρήστης; Δημιουργία λογαριασμού"}
        </Link>
        {registering && (
          <Text style={ui.body}>
            Η δημιουργία λογαριασμού δεν αποτελεί εγγραφή σε εκπαιδευτικό Level.
          </Text>
        )}
      </View>
    </Shell>
  );
}
