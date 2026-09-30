// Root layout: load Raleway + Cormorant, wrap in AuthProvider, route by auth.
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import { AuthProvider, useAuth } from '@/src/auth/AuthContext';
import { colors } from '@/src/theme';

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const initialRouteHandled = useRef(false);

  useEffect(() => {
    if (loading) return;
    const onLandingRoot = segments[0] === undefined;
    const onAuthScreen = segments[0] === 'login' || segments[0] === 'register';
    const isPublicFeedback = segments[0] === 'feedback';
    if (isPublicFeedback || segments[0] === 'explore') return;

    // Unauthenticated: protect non-public routes
    if (!user && !onLandingRoot && !onAuthScreen) {
      router.replace('/');
      return;
    }

    // Authenticated: send to sanctuary from auth screens always
    if (user && onAuthScreen) {
      router.replace('/(tabs)/sanctuary');
      return;
    }

    // Authenticated: only auto-redirect from "/" on initial app load,
    // so users can re-visit the public landing page via the Profile button.
    if (user && onLandingRoot && !initialRouteHandled.current) {
      initialRouteHandled.current = true;
      router.replace('/(tabs)/sanctuary');
    } else if (!initialRouteHandled.current) {
      initialRouteHandled.current = true;
    }
  }, [user, loading, segments, router]);

  const publicRoute = segments[0] === undefined || segments[0] === 'explore';
  if (loading && !publicRoute) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.primary }, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="realm/[id]" />
      <Stack.Screen name="level/[id]" />
      <Stack.Screen name="practice/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="practice/[id]" />
      <Stack.Screen name="feedback/[token]" />
      <Stack.Screen name="ai-chat" options={{ presentation: 'modal' }} />
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

  if (!loaded && !error && Platform.OS !== 'web') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AuthGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
});

