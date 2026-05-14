// Login screen
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading, Body, Overline, PrimaryButton } from '@/src/components/UI';
import { useAuth } from '@/src/auth/AuthContext';
import { colors, fonts, radii, spacing } from '@/src/theme';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Sacred Entry', 'Email and passphrase are required.');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/sanctuary');
    } catch (e: any) {
      Alert.alert('Entry Refused', e?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A0815', '#05050A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => router.back()} testID="back-btn"><Body color={colors.accent.gold}>← Return</Body></Pressable>
            <View style={{ height: spacing.xxl }} />
            <Overline>The Temple Awaits</Overline>
            <Heading size="h1" style={{ marginTop: spacing.md }}>Welcome{'\n'}back.</Heading>
            <Body size="bodyLg" style={{ marginTop: spacing.md }}>Step into the sanctuary you began building.</Body>

            <View style={{ height: spacing.xl }} />

            <View style={styles.field}>
              <Overline>Email</Overline>
              <TextInput
                testID="login-email"
                style={styles.input}
                placeholder="you@temple.gr"
                placeholderTextColor={colors.text.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Overline>Passphrase</Overline>
              <TextInput
                testID="login-password"
                style={styles.input}
                placeholder="Your sacred word"
                placeholderTextColor={colors.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={{ height: spacing.xl }} />
            <PrimaryButton testID="login-submit" label="Enter the Temple" loading={busy} onPress={onSubmit} />

            <Pressable onPress={() => router.replace('/register')} testID="link-register">
              <Body style={{ textAlign: 'center', marginTop: spacing.xl }} color={colors.text.secondary}>
                New to the path? <Body color={colors.accent.gold} weight="semi">Begin your initiation →</Body>
              </Body>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.xl, paddingTop: spacing.lg },
  field: { marginTop: spacing.lg },
  input: {
    marginTop: spacing.sm,
    height: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontFamily: fonts.body,
    fontSize: 16,
  },
});
