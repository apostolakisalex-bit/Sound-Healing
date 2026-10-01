import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { Shell, ui, Button, Field, Choices } from "@/src/components/Wellness";
export function AuthScreen({ registering = false }: { registering?: boolean }) {
  const auth = useAuth(),
    router = useRouter();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [lastName, setLastName] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [declaredLevel, setDeclaredLevel] = useState("L1");
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
      if (registering) {
        await auth.register(email.trim(), password, name.trim(), "", {
          first_name: name.trim(),
          last_name: lastName.trim(),
          birth_month: Number(birthMonth),
          birth_year: Number(birthYear),
          phone: phone.trim(),
          address: address.trim(),
          declared_level: declaredLevel,
        });
        router.replace("/(tabs)/profile");
        return;
      } else {
        const signedIn = await auth.login(email.trim(), password);
        router.replace(
          ["admin", "instructor"].includes(signedIn.role)
            ? "/admin"
            : "/(tabs)/sanctuary",
        );
        return;
      }
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
          <>
            <Field label="Όνομα" value={name} onChange={setName} />
            <Field label="Επώνυμο" value={lastName} onChange={setLastName} />
            <Field
              label="Μήνας γέννησης (1–12)"
              value={birthMonth}
              onChange={setBirthMonth}
            />
            <Field
              label="Έτος γέννησης"
              value={birthYear}
              onChange={setBirthYear}
            />
            <Field label="Τηλέφωνο" value={phone} onChange={setPhone} />
            <Field label="Διεύθυνση" value={address} onChange={setAddress} />
            <Choices
              label="Δηλωμένο Level — θα επιβεβαιωθεί από τον διαχειριστή"
              values={["L1", "L2", "L3", "L4"]}
              value={declaredLevel}
              onChange={setDeclaredLevel}
            />
            <Text style={ui.body}>
              Τα στοιχεία αίτησης είναι ορατά μόνο σε εσένα και στον
              διαχειριστή. Η πρόσβαση μέλους ενεργοποιείται μετά την έγκριση.
            </Text>
          </>
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
