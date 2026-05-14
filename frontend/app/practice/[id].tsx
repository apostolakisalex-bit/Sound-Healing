// Practice detail — show status + shareable feedback link
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard, AuraButton } from '@/src/components/UI';
import { api } from '@/src/api/client';
import { colors, spacing, radii } from '@/src/theme';

const statusColor = (s: string) => {
  if (s === 'XP Awarded') return colors.status.success;
  if (s.includes('Waiting')) return colors.status.warning;
  if (s === 'Rejected') return colors.status.danger;
  return colors.accent.gold;
};

export default function PracticeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<any>(null);

  const load = useCallback(async () => {
    try { const { data } = await api.get(`/practices/${id}`); setP(data); } catch {}
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const feedbackUrl = p ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/feedback/${p.feedback_token}` : '';

  const shareLink = async () => {
    try {
      await Share.share({
        message: `Hello — please share your reflection on our recent session: ${feedbackUrl}`,
      });
    } catch {}
  };

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A0F1D', '#05050A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          <Body color={colors.text.primary}>Back</Body>
        </Pressable>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Overline color={statusColor(p.status)} testID="status-overline">{p.status}</Overline>
            <Heading size="h2" style={{ marginTop: spacing.sm }}>{p.session_type}</Heading>
            <Body size="small" style={{ marginTop: 4 }}>{p.session_date} · {p.duration_minutes} min</Body>
            {p.xp_awarded > 0 && (
              <View style={styles.xpBadge}>
                <Ionicons name="flash" size={14} color={colors.accent.gold} />
                <Body weight="semi" color={colors.accent.gold}>+{p.xp_awarded} XP awarded</Body>
              </View>
            )}
          </Animated.View>

          {/* Feedback link */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Heading size="h4" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Receiver Feedback Link</Heading>
            <GlowCard testID="feedback-link-card">
              {p.feedback ? (
                <View>
                  <Body weight="semi" color={colors.status.success}>✓ Feedback received</Body>
                  <View style={{ marginTop: spacing.md, gap: 8 }}>
                    <Row label="Relaxation" before={p.feedback.relaxation_before} after={p.feedback.relaxation_after} />
                    <DetailRow label="Safety perceived" value={`${p.feedback.perceived_safety}/10`} />
                    <DetailRow label="Clarity" value={`${p.feedback.clarity_of_instructions}/10`} />
                    <DetailRow label="Quality of holding" value={`${p.feedback.quality_of_holding_space}/10`} />
                  </View>
                  <View style={{ height: spacing.sm }} />
                  <Body size="small" style={{ fontStyle: 'italic' }}>"{p.feedback.emotional_experience}"</Body>
                  {p.feedback.comments ? <Body size="small" style={{ marginTop: 4 }}>{p.feedback.comments}</Body> : null}
                </View>
              ) : (
                <>
                  <Body size="small">Share this sacred link with {p.receiver_name}. No login required.</Body>
                  <View style={styles.linkBox}>
                    <Body size="small" color={colors.accent.cyan} numberOfLines={1} testID="feedback-url">
                      {feedbackUrl}
                    </Body>
                  </View>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <AuraButton testID="share-link-btn" label="Share Link" onPress={shareLink} />
                    </View>
                    {Platform.OS === 'web' && (
                      <View style={{ flex: 1 }}>
                        <AuraButton
                          testID="copy-link-btn"
                          label="Copy"
                          onPress={async () => {
                            try { await (navigator as any).clipboard?.writeText(feedbackUrl); Alert.alert('Copied'); } catch {}
                          }}
                        />
                      </View>
                    )}
                  </View>
                </>
              )}
            </GlowCard>
          </Animated.View>

          {/* Session detail */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Heading size="h4" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Session Anchor</Heading>
            <GlowCard>
              <Body size="caption" weight="semi" color={colors.accent.gold} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>Intention</Body>
              <Body size="small" style={{ marginTop: 4, fontStyle: 'italic' }}>"{p.intention}"</Body>
              <View style={styles.hr} />
              <DetailRow label="Receiver" value={p.receiver_name} />
              <DetailRow label="Protocol" value={p.protocol} />
              <DetailRow label="Instruments" value={p.instruments.join(', ') || '—'} />
              {p.observations ? <DetailLong label="Observations" value={p.observations} /> : null}
              {p.what_went_well ? <DetailLong label="Went Well" value={p.what_went_well} /> : null}
              {p.what_to_improve ? <DetailLong label="To Improve" value={p.what_to_improve} /> : null}
              {p.technical_reflections ? <DetailLong label="Reflections" value={p.technical_reflections} /> : null}
            </GlowCard>
          </Animated.View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Body size="caption" color={colors.text.muted} style={{ letterSpacing: 1, textTransform: 'uppercase', flex: 1 }}>{label}</Body>
      <Body size="small" weight="semi" color={colors.text.primary} style={{ flex: 2 }}>{value}</Body>
    </View>
  );
}
function DetailLong({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Body size="caption" color={colors.text.muted} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Body>
      <Body size="small" style={{ marginTop: 4 }}>{value}</Body>
    </View>
  );
}
function Row({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <View style={styles.detailRow}>
      <Body size="caption" color={colors.text.muted} style={{ letterSpacing: 1, textTransform: 'uppercase', flex: 1 }}>{label}</Body>
      <Body size="small" color={colors.text.primary} style={{ flex: 2 }}>{before}/10 → <Body weight="bold" color={colors.status.success}>{after}/10</Body></Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  content: { padding: spacing.lg, paddingTop: 0 },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm,
    alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: spacing.md,
    borderRadius: radii.full, backgroundColor: 'rgba(204,163,82,0.1)',
    borderWidth: 1, borderColor: colors.accent.gold,
  },
  linkBox: {
    marginTop: spacing.md, padding: spacing.md, borderRadius: radii.sm,
    backgroundColor: colors.bg.tertiary, borderWidth: 1, borderColor: colors.accent.cyan,
  },
  detailRow: { flexDirection: 'row', marginTop: 6, alignItems: 'center' },
  hr: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing.md },
});
