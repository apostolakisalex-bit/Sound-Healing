// Root layout: load fonts, wrap in AuthProvider, route based on auth state.
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '@/src/auth/AuthContext';
import { colors } from '@/src/theme';

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === undefined;
    const isPublicFeedback = segments[0] === 'feedback';
    if (isPublicFeedback) return;
    if (!user && !inAuthGroup) {
      router.replace('/');
    } else if (user && (segments[0] === 'login' || segments[0] === 'register' || segments[0] === undefined)) {
      router.replace('/(tabs)/sanctuary');
    }
  }, [user, loading, segments, router]);

  if (loading) {
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
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Render anyway after error to avoid blocking forever
  if (!loaded && !error) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
});
