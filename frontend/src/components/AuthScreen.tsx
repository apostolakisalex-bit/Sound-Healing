import React, { useState, useEffect } from "react";
import { Text, TextInput, View, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "@/src/auth/AuthContext";
import { Shell, useUi, Button, Field, Choices } from "@/src/components/Wellness";
import { useLanguage } from "@/src/components/AppNavigation";

WebBrowser.maybeCompleteAuthSession();
export function AuthScreen({ registering = false }: { registering?: boolean }) {
  const ui = useUi();
  const { t } = useLanguage();
  const auth = useAuth(),
    router = useRouter();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleBusy, setAppleBusy] = useState(false);
  useEffect(() => {
    // Sign in with Apple is iOS-only; hide the button everywhere else.
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);
  const [lastName, setLastName] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [declaredLevel, setDeclaredLevel] = useState("L1");
  const googleSignIn = async () => {
    setError("");
    setGoogleBusy(true);
    const extractSid = (url?: string | null): string | null => {
      const m = url ? url.match(/[?#&]session_id=([^&#]+)/) : null;
      return m ? decodeURIComponent(m[1]) : null;
    };
    try {
      // Return to the public /login route (not a protected route): on Android
      // the redirect arrives as a normal deep link, so expo-router navigates to
      // this path before auth state is set. /login is allowed for logged-out
      // users, so the root AuthGate drives the post-login navigation instead of
      // bouncing to the landing page.
      const redirectUrl =
        Platform.OS === "web"
          ? window.location.origin + "/login"
          : Linking.createURL("login");
      const authUrl =
        "https://auth.emergentagent.com/?redirect=" +
        encodeURIComponent(redirectUrl);
      if (Platform.OS === "web") {
        window.location.href = authUrl;
        return;
      }
      // Android (Expo Go) often delivers the redirect as a hot deep link while
      // openAuthSessionAsync returns "dismiss" with no URL. Capture it here.
      let capturedUrl: string | null = null;
      const sub = Linking.addEventListener("url", ({ url }) => {
        if (url && /session_id=/.test(url)) capturedUrl = url;
      });
      let sid: string | null = null;
      try {
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUrl,
        );
        if (result.type === "success" && "url" in result) {
          sid = extractSid(result.url);
        }
        // dismiss/cancel may still mean success: check listener + initial URL.
        if (!sid) sid = extractSid(capturedUrl);
        if (!sid) {
          await new Promise((r) => setTimeout(r, 500));
          sid = extractSid(capturedUrl);
        }
        if (!sid) sid = extractSid(await Linking.getInitialURL());
      } finally {
        sub.remove();
      }
      if (!sid) {
        setError(
          t(
            "Η σύνδεση με Google δεν ολοκληρώθηκε.",
            "Google sign-in was not completed.",
          ),
        );
        return;
      }
      const signedIn = await auth.loginWithSession(sid);
      router.replace(
        signedIn.membership_status && signedIn.membership_status !== "approved"
          ? "/(tabs)/profile"
          : ["admin", "instructor"].includes(signedIn.role)
            ? "/admin"
            : "/(tabs)/sanctuary",
      );
    } catch {
      setError(
        t(
          "Δεν ήταν δυνατή η σύνδεση με Google.",
          "Could not sign in with Google.",
        ),
      );
    } finally {
      setGoogleBusy(false);
    }
  };
  const appleSignIn = async () => {
    if (appleBusy) return;
    setError("");
    setAppleBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError(
          t(
            "Η σύνδεση με Apple δεν ολοκληρώθηκε.",
            "Apple sign-in was not completed.",
          ),
        );
        return;
      }
      // Apple only sends the name/email on the FIRST sign-in; forward whatever
      // we got so the backend can persist it on account creation.
      const fullName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const signedIn = await auth.loginWithApple(
        credential.identityToken,
        fullName || null,
        credential.email || null,
      );
      router.replace(
        signedIn.membership_status && signedIn.membership_status !== "approved"
          ? "/(tabs)/profile"
          : ["admin", "instructor"].includes(signedIn.role)
            ? "/admin"
            : "/(tabs)/sanctuary",
      );
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") return;
      setError(
        t(
          "Δεν ήταν δυνατή η σύνδεση με Apple.",
          "Could not sign in with Apple.",
        ),
      );
    } finally {
      setAppleBusy(false);
    }
  };
  const submit = async () => {
    setError("");
    if (
      !email ||
      !password ||
      (registering && (name.trim().length < 2 || password.length < 10))
    ) {
      setError(
        t(
          "Συμπλήρωσε τα στοιχεία. Στην εγγραφή χρειάζονται τουλάχιστον 10 χαρακτήρες για τον κωδικό.",
          "Fill in the details. Registration requires at least 10 characters for the password.",
        ),
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
          signedIn.membership_status === "pending" ||
            signedIn.email_verified === false
            ? "/(tabs)/profile"
            : ["admin", "instructor"].includes(signedIn.role)
              ? "/admin"
              : "/(tabs)/sanctuary",
        );
        return;
      }

    } catch (e: any) {
      setError(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : registering
            ? t("Δεν ολοκληρώθηκε η εγγραφή. Έλεγξε τα στοιχεία ή δοκίμασε σύνδεση.", "Registration could not be completed. Check the details or try signing in.")
            : t("Δεν ήταν δυνατή η σύνδεση. Έλεγξε email και κωδικό.", "Could not sign in. Check your email and password."),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell
      publicPage
      eyebrow={t("Ο ΧΩΡΟΣ ΕΥΕΞΙΑΣ ΣΟΥ", "YOUR WELLNESS SPACE")}
      title={registering ? t("Η διαδρομή σου ξεκινά εδώ.", "Your journey begins here.") : t("Καλώς ήρθες ξανά.", "Welcome back.")}
    >
      <View
        style={[ui.card, { maxWidth: 560, width: "100%", alignSelf: "center" }]}
      >
        {registering && (
          <>
            <Field label={t("Όνομα", "First name")} value={name} onChange={setName} />
            <Field label={t("Επώνυμο", "Last name")} value={lastName} onChange={setLastName} />
            <Field
              label={t("Μήνας γέννησης (1–12)", "Birth month (1–12)")}
              value={birthMonth}
              onChange={setBirthMonth}
            />
            <Field
              label={t("Έτος γέννησης", "Birth year")}
              value={birthYear}
              onChange={setBirthYear}
            />
            <Field label={t("Τηλέφωνο", "Phone")} value={phone} onChange={setPhone} />
            <Field label={t("Διεύθυνση", "Address")} value={address} onChange={setAddress} />
            <Choices
              label={t("Δηλωμένο Level — θα επιβεβαιωθεί από τον διαχειριστή", "Declared Level — will be confirmed by the administrator")}
              values={["L1", "L2", "L3", "L4"]}
              value={declaredLevel}
              onChange={setDeclaredLevel}
            />
            <Text style={ui.body}>
              {t(
                "Τα στοιχεία αίτησης είναι ορατά μόνο σε εσένα και στον διαχειριστή. Η πρόσβαση μέλους ενεργοποιείται μετά την έγκριση.",
                "Your application details are visible only to you and the administrator. Member access is activated after approval.",
              )}
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
        <Text style={ui.body}>{t("Κωδικός", "Password")}</Text>
        <TextInput
          accessibilityLabel={t("Κωδικός", "Password")}
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
              ? t("Περίμενε…", "Please wait…")
              : registering
                ? t("Δημιουργία λογαριασμού", "Create account")
                : t("Σύνδεση", "Sign in")
          }
          onPress={() => void submit()}
        />
        <Button
          secondary
          disabled={googleBusy}
          label={googleBusy ? t("Σύνδεση…", "Signing in…") : t("Σύνδεση με Google", "Sign in with Google")}
          onPress={() => void googleSignIn()}
        />
        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              registering
                ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={{ height: 48, width: "100%" }}
            onPress={() => void appleSignIn()}
          />
        )}
        {!registering && (
          <Link href="/account-action" style={ui.body}>
            {t("Ξέχασα τον κωδικό μου", "I forgot my password")}
          </Link>
        )}
        <Link href={registering ? "/login" : "/register"} style={ui.body}>
          {registering
            ? t("Έχεις λογαριασμό; Σύνδεση", "Already have an account? Sign in")
            : t("Νέος χρήστης; Δημιουργία λογαριασμού", "New user? Create account")}
        </Link>
        {registering && (
          <Text style={ui.body}>
            {t(
              "Η δημιουργία λογαριασμού δεν αποτελεί εγγραφή σε εκπαιδευτικό Level.",
              "Creating an account is not an enrollment in a training Level.",
            )}
          </Text>
        )}
      </View>
    </Shell>
  );
}
