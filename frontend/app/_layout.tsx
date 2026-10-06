import { LanguageProvider } from "@/src/components/AppNavigation";
// Root layout: load Raleway + Cormorant, wrap in AuthProvider, route by auth.
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import { AuthProvider, useAuth } from "@/src/auth/AuthContext";
import { colors } from "@/src/theme";

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const initialRouteHandled = useRef(false);

  useEffect(() => {
    if (loading) return;
    const onLandingRoot = segments[0] === undefined;
    const onAuthScreen = segments[0] === "login" || segments[0] === "register";
    const isPublicFeedback =
      segments[0] === "feedback" || segments[0] === "evaluation";
    if (isPublicFeedback || segments[0] === "explore" || segments[0] === "seminar") return;

    // Unauthenticated: protect non-public routes
    if (!user && !onLandingRoot && !onAuthScreen) {
      router.replace("/");
      return;
    }

    // Authenticated: send to sanctuary from auth screens always
    if (user && onAuthScreen) {
      router.replace(
        user.role === "admin" || user.role === "instructor"
          ? "/admin"
          : "/(tabs)/profile",
      );
      return;
    }
  }, [user, loading, segments, router]);

  const publicRoute = segments[0] === undefined || segments[0] === "explore" || segments[0] === "seminar";
  if (loading && !publicRoute) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="realm/[id]" />
      <Stack.Screen name="level/[id]" />
      <Stack.Screen name="seminar/[slug]" />
      <Stack.Screen name="practice/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="practice/[id]" />
      <Stack.Screen name="feedback/[token]" />
      <Stack.Screen name="ai-chat" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  if (!loaded && !error && Platform.OS !== "web") {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AuthGate />
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
