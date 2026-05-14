// New Practice Session — comprehensive form
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body, Overline, PrimaryButton, GlowCard } from '@/src/components/UI';
import { api } from '@/src/api/client';
import { colors, spacing, radii, fonts } from '@/src/theme';

const SESSION_TYPES = ['Tibetan Bowls', 'Crystal Bowls', 'Sound Bath', 'Gong Bath', 'Body Sound Massage', 'Group Ceremony', 'Online Session'];
const INSTRUMENTS = ['Tibetan Bowls', 'Crystal Bowls', 'Gong', 'Tuning Forks', 'Voice', 'Chimes', 'Drum', 'Koshi Bells', 'Hang Drum'];

export default function NewPractice() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState('60');
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [protocol, setProtocol] = useState('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [intention, setIntention] = useState('');
  const [observations, setObservations] = useState('');
  const [reflections, setReflections] = useState('');
  const [wentWell, setWentWell] = useState('');
  const [improve, setImprove] = useState('');
  const [safety, setSafety] = useState('');
  const [contraOK, setContraOK] = useState(false);
  const [notes, setNotes] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleInstrument = (i: string) => setInstruments(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const onSubmit = async () => {
    if (!intention.trim() || !receiverName.trim() || !protocol.trim()) {
      Alert.alert('Incomplete', 'Intention, protocol, and receiver name are required.');
      return;
    }
    if (!contraOK) {
      Alert.alert('Safety', 'Please confirm contraindications have been checked.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/practices', {
        session_date: date,
        duration_minutes: parseInt(duration) || 0,
        session_type: sessionType,
        protocol,
        instruments,
        intention,
        observations,
        technical_reflections: reflections,
        what_went_well: wentWell,
        what_to_improve: improve,
        safety_concerns: safety,
        contraindications_checked: contraOK,
        notes,
        receiver_name: receiverName,
        receiver_email: receiverEmail,
      });
      router.replace(`/practice/${data.id}`);
    } catch (e: any) {
      Alert.alert('Submission Failed', e?.response?.data?.detail || 'Could not submit');
    } finally { setBusy(false); }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A0F1D', '#05050A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} testID="close-btn"><Ionicons name="close" size={26} color={colors.text.primary} /></Pressable>
            <Heading size="h4">Log Session</Heading>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Body style={{ fontStyle: 'italic', marginBottom: spacing.lg }} color={colors.accent.gold}>
              "Every session honored becomes resonance recorded."
            </Body>

            <Section title="Session Details">
              <Field label="Date"><Input testID="f-date" value={date} onChangeText={setDate} /></Field>
              <Field label="Duration (min)"><Input testID="f-duration" value={duration} onChangeText={setDuration} keyboardType="number-pad" /></Field>
              <Field label="Session Type">
                <View style={styles.chipRow}>
                  {SESSION_TYPES.map(t => (
                    <Pressable key={t} onPress={() => setSessionType(t)} testID={`type-${t}`}
                      style={[styles.chip, sessionType === t && styles.chipActive]}>
                      <Body size="caption" weight="semi" color={sessionType === t ? colors.bg.primary : colors.text.secondary}>{t}</Body>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Protocol / Approach Used">
                <Input testID="f-protocol" value={protocol} onChangeText={setProtocol} placeholder="e.g. 7-bowl chakra alignment" />
              </Field>
              <Field label="Instruments Used">
                <View style={styles.chipRow}>
                  {INSTRUMENTS.map(t => (
                    <Pressable key={t} onPress={() => toggleInstrument(t)} testID={`instr-${t}`}
                      style={[styles.chip, instruments.includes(t) && styles.chipActive]}>
                      <Body size="caption" weight="semi" color={instruments.includes(t) ? colors.bg.primary : colors.text.secondary}>{t}</Body>
                    </Pressable>
                  ))}
                </View>
              </Field>
            </Section>

            <Section title="Intention & Reflection">
              <Field label="Intention of the Session">
                <Input testID="f-intention" value={intention} onChangeText={setIntention} multiline placeholder="What did you intend to hold for this session?" />
              </Field>
              <Field label="Observations">
                <Input testID="f-observations" value={observations} onChangeText={setObservations} multiline placeholder="What you noticed in the receiver / space" />
              </Field>
              <Field label="Technical Reflections">
                <Input testID="f-reflections" value={reflections} onChangeText={setReflections} multiline placeholder="Tonal choices, transitions, pacing…" />
              </Field>
              <Field label="What Went Well">
                <Input testID="f-well" value={wentWell} onChangeText={setWentWell} multiline />
              </Field>
              <Field label="What Could Improve">
                <Input testID="f-improve" value={improve} onChangeText={setImprove} multiline />
              </Field>
            </Section>

            <Section title="Safety & Care">
              <Field label="Safety Concerns (if any)">
                <Input testID="f-safety" value={safety} onChangeText={setSafety} multiline />
              </Field>
              <View style={styles.contraRow}>
                <View style={{ flex: 1 }}>
                  <Body weight="semi">Contraindications checked</Body>
                  <Body size="caption" color={colors.text.muted}>Required before submission</Body>
                </View>
                <Switch
                  testID="f-contra"
                  value={contraOK}
                  onValueChange={setContraOK}
                  trackColor={{ false: colors.bg.tertiary, true: colors.accent.gold }}
                  thumbColor={contraOK ? colors.text.primary : colors.text.muted}
                />
              </View>
              <Field label="Optional Notes">
                <Input testID="f-notes" value={notes} onChangeText={setNotes} multiline />
              </Field>
            </Section>

            <Section title="Receiver">
              <Field label="Receiver Name">
                <Input testID="f-rname" value={receiverName} onChangeText={setReceiverName} placeholder="Full name" />
              </Field>
              <Field label="Receiver Email (optional, for direct link)">
                <Input testID="f-remail" value={receiverEmail} onChangeText={setReceiverEmail} keyboardType="email-address" autoCapitalize="none" />
              </Field>
            </Section>

            <View style={{ height: spacing.lg }} />
            <PrimaryButton testID="submit-practice" label="Seal Practice & Generate Link" onPress={onSubmit} loading={busy} />
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Overline color={colors.accent.gold} style={{ marginBottom: spacing.sm }}>{title}</Overline>
      <GlowCard style={{ padding: spacing.md }}>{children}</GlowCard>
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
  return (
    <TextInput
      placeholderTextColor={colors.text.muted}
      style={[styles.input, props.multiline && styles.inputMulti]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, paddingTop: spacing.sm },
  content: { padding: spacing.lg, paddingTop: 0 },
  input: {
    backgroundColor: colors.bg.tertiary, borderRadius: radii.sm,
    borderWidth: 1, borderColor: colors.border.subtle,
    padding: spacing.md, color: colors.text.primary,
    fontFamily: fonts.body, fontSize: 15,
    minHeight: 44,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingVertical: 8, paddingHorizontal: spacing.sm, borderRadius: radii.full,
    backgroundColor: colors.bg.tertiary, borderWidth: 1, borderColor: colors.border.subtle,
  },
  chipActive: { backgroundColor: colors.accent.gold, borderColor: colors.accent.gold },
  contraRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radii.sm, backgroundColor: colors.bg.tertiary,
    borderWidth: 1, borderColor: colors.border.subtle, marginBottom: spacing.md,
  },
});
