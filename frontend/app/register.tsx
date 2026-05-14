// Register screen
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading, Body, Overline, PrimaryButton } from '@/src/components/UI';
import { useAuth } from '@/src/auth/AuthContext';
import { colors, fonts, radii, spacing } from '@/src/theme';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Initiation', 'Name, email and passphrase are required.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Initiation', 'Passphrase must be at least 6 runes (characters).');
      return;
    }
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim(), location.trim());
      router.replace('/(tabs)/sanctuary');
    } catch (e: any) {
      Alert.alert('Initiation Refused', e?.response?.data?.detail || 'Unable to register');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => router.back()} testID="back-btn"><Body color={colors.accent.gold}>← Return</Body></Pressable>
            <View style={{ height: spacing.xxl }} />
            <Overline>Initiation Ritual</Overline>
            <Heading size="h1" style={{ marginTop: spacing.md }}>Begin{'\n'}your{'\n'}journey.</Heading>
            <Body size="bodyLg" style={{ marginTop: spacing.md }}>Create your practitioner identity.</Body>

            <View style={{ height: spacing.xl }} />

            <Field label="Sacred Name">
              <TextInput testID="reg-name" style={styles.input} placeholder="How shall the temple call you?"
                placeholderTextColor={colors.text.muted} value={name} onChangeText={setName} />
            </Field>
            <Field label="Email">
              <TextInput testID="reg-email" style={styles.input} placeholder="you@temple.gr"
                placeholderTextColor={colors.text.muted} value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" />
            </Field>
            <Field label="Passphrase">
              <TextInput testID="reg-password" style={styles.input} placeholder="At least 6 runes"
                placeholderTextColor={colors.text.muted} value={password} onChangeText={setPassword} secureTextEntry />
            </Field>
            <Field label="Location (optional)">
              <TextInput testID="reg-location" style={styles.input} placeholder="Athens, Greece"
                placeholderTextColor={colors.text.muted} value={location} onChangeText={setLocation} />
            </Field>

            <View style={{ height: spacing.xl }} />
            <PrimaryButton testID="reg-submit" label="Cross the Threshold" loading={busy} onPress={onSubmit} />

            <Pressable onPress={() => router.replace('/login')} testID="link-login">
              <Body style={{ textAlign: 'center', marginTop: spacing.xl }} color={colors.text.secondary}>
                Already initiated? <Body color={colors.accent.gold} weight="semi">Enter the temple →</Body>
              </Body>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Overline>{label}</Overline>
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.xl, paddingTop: spacing.lg },
  input: {
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
