// Public Receiver Feedback Form — no login required
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { Heading, Body, Overline, GlowCard, PrimaryButton } from '@/src/components/UI';
import { colors, spacing, radii, fonts } from '@/src/theme';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

function ScaleField({ label, value, onChange, testID }: { label: string; value: number; onChange: (n: number) => void; testID?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Body size="caption" weight="semi" color={colors.text.secondary} style={{ letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Body>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            testID={`${testID}-${n}`}
            style={[styles.scaleNum, value === n && styles.scaleNumActive]}
          >
            <Body size="caption" weight="semi" color={value === n ? colors.bg.primary : colors.text.secondary}>{n}</Body>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function FeedbackForm() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState('');
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [emotional, setEmotional] = useState('');
  const [bodySens, setBodySens] = useState('');
  const [safety, setSafety] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [holding, setHolding] = useState(5);
  const [comments, setComments] = useState('');
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${BASE}/api/feedback/${token}`);
        setInfo(data);
        if (data.already_submitted) setSubmitted(true);
      } catch {
        setInfo({ error: true });
      } finally { setLoading(false); }
    })();
  }, [token]);

  const onSubmit = async () => {
    if (!name.trim() || !emotional.trim()) return Alert.alert('Incomplete', 'Name and emotional reflection are required.');
    if (!consent) return Alert.alert('Consent', 'Please confirm consent to submit.');
    setBusy(true);
    try {
      await axios.post(`${BASE}/api/feedback/${token}`, {
        receiver_name: name, relaxation_before: before, relaxation_after: after,
        emotional_experience: emotional, body_sensations: bodySens,
        perceived_safety: safety, clarity_of_instructions: clarity, quality_of_holding_space: holding,
        comments, consent, email,
      });
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('Submission failed', e?.response?.data?.detail || 'Please try again');
    } finally { setBusy(false); }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0F0A1D', '#05050A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {info?.error ? (
              <GlowCard>
                <Heading size="h3">Link expired</Heading>
                <Body style={{ marginTop: spacing.sm }}>This feedback link is invalid or expired.</Body>
              </GlowCard>
            ) : submitted ? (
              <GlowCard testID="feedback-thanks">
                <Overline color={colors.accent.gold}>Thank you</Overline>
                <Heading size="h2" style={{ marginTop: spacing.sm }}>Your reflection{'\n'}is received.</Heading>
                <Body style={{ marginTop: spacing.md, lineHeight: 24 }}>
                  Resonance honored. The practitioner is awarded their XP for this verified session.
                </Body>
              </GlowCard>
            ) : (
              <>
                <Overline color={colors.accent.gold} testID="feedback-overline">Sound Healing Greece</Overline>
                <Heading size="h2" style={{ marginTop: spacing.sm }}>Share your{'\n'}reflection.</Heading>
                <Body style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
                  Help <Body weight="semi" color={colors.text.primary}>{info.practitioner_name}</Body> evolve.
                  A {info.duration_minutes} min {info.session_type} on {info.session_date}.
                </Body>

                <GlowCard style={{ marginBottom: spacing.md }}>
                  <Field label="Your Name">
                    <Input testID="fb-name" value={name} onChangeText={setName} />
                  </Field>
                  <Field label="Email (optional)">
                    <Input testID="fb-email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                  </Field>
                </GlowCard>

                <GlowCard style={{ marginBottom: spacing.md }}>
                  <ScaleField label="Relaxation BEFORE the session" value={before} onChange={setBefore} testID="fb-before" />
                  <ScaleField label="Relaxation AFTER the session" value={after} onChange={setAfter} testID="fb-after" />
                  <ScaleField label="Perceived Safety" value={safety} onChange={setSafety} testID="fb-safety" />
                  <ScaleField label="Clarity of Instructions" value={clarity} onChange={setClarity} testID="fb-clarity" />
                  <ScaleField label="Quality of Holding Space" value={holding} onChange={setHolding} testID="fb-holding" />
                </GlowCard>

                <GlowCard style={{ marginBottom: spacing.md }}>
                  <Field label="Emotional Experience">
                    <Input testID="fb-emotional" value={emotional} onChangeText={setEmotional} multiline placeholder="What did you feel emotionally?" />
                  </Field>
                  <Field label="Body Sensations">
                    <Input testID="fb-body" value={bodySens} onChangeText={setBodySens} multiline placeholder="Tingling, warmth, release…" />
                  </Field>
                  <Field label="Comments">
                    <Input testID="fb-comments" value={comments} onChangeText={setComments} multiline placeholder="Anything else to share" />
                  </Field>
                </GlowCard>

                <View style={styles.contraRow}>
                  <View style={{ flex: 1 }}>
                    <Body weight="semi">I consent to this reflection being shared.</Body>
                    <Body size="caption" color={colors.text.muted}>Required</Body>
                  </View>
                  <Switch testID="fb-consent" value={consent} onValueChange={setConsent}
                    trackColor={{ false: colors.bg.tertiary, true: colors.accent.gold }} thumbColor={colors.text.primary} />
                </View>

                <View style={{ height: spacing.md }} />
                <PrimaryButton testID="fb-submit" label="Send Reflection" onPress={onSubmit} loading={busy} />
                <View style={{ height: 60 }} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Body size="caption" weight="semi" color={colors.text.secondary} style={{ letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Body>
      {children}
    </View>
  );
}
function Input(props: any) {
  return <TextInput placeholderTextColor={colors.text.muted} style={[styles.input, props.multiline && styles.inputMulti]} {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: spacing.lg },
  input: {
    backgroundColor: colors.bg.tertiary, borderRadius: radii.sm,
    borderWidth: 1, borderColor: colors.border.subtle,
    padding: spacing.md, color: colors.text.primary,
    fontFamily: fonts.body, fontSize: 15, minHeight: 44,
  },
  inputMulti: { minHeight: 70, textAlignVertical: 'top' },
  scaleRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  scaleNum: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bg.tertiary, borderWidth: 1, borderColor: colors.border.subtle,
  },
  scaleNumActive: { backgroundColor: colors.accent.gold, borderColor: colors.accent.gold },
  contraRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radii.sm, backgroundColor: colors.bg.tertiary,
    borderWidth: 1, borderColor: colors.border.subtle, marginBottom: spacing.md,
  },
});
