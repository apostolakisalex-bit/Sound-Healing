// Practice Realm — list of practice sessions + new session entry
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard, PrimaryButton } from '@/src/components/UI';
import { TabsTopBar } from '@/src/components/TabsTopBar';
import { api } from '@/src/api/client';
import { colors, spacing, radii } from '@/src/theme';

const statusColor = (s: string) => {
  if (s === 'XP Awarded') return colors.status.success;
  if (s.includes('Waiting')) return colors.status.warning;
  if (s === 'Rejected') return colors.status.danger;
  return colors.accent.gold;
};

export default function Practice() {
  const router = useRouter();
  const [practices, setPractices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get('/practices'); setPractices(data); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const stats = {
    total: practices.length,
    awarded: practices.filter(p => p.status === 'XP Awarded').length,
    waiting: practices.filter(p => p.status === 'Waiting for Receiver Feedback').length,
    xp: practices.reduce((s, p) => s + (p.xp_awarded || 0), 0),
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <TabsTopBar />
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
        >
          <Overline testID="practice-overline">Practice Realm</Overline>
          <Heading size="h2" style={{ marginTop: spacing.sm }}>Your verified{'\n'}resonance log.</Heading>
          <Body style={{ marginTop: spacing.sm }}>Each session received by another is a step toward certification.</Body>

          <View style={{ height: spacing.lg }} />
          <PrimaryButton testID="new-practice-btn" label="+ Log New Session" onPress={() => router.push('/practice/new')} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatChip label="Sessions" value={stats.total} color={colors.accent.cyan} />
            <StatChip label="Awarded" value={stats.awarded} color={colors.status.success} />
            <StatChip label="Awaiting" value={stats.waiting} color={colors.status.warning} />
            <StatChip label="Total XP" value={stats.xp} color={colors.accent.gold} />
          </View>

          {practices.length === 0 ? (
            <GlowCard testID="empty-practices">
              <Body>No sessions yet. Log your first ritual and invite a receiver to provide feedback.</Body>
            </GlowCard>
          ) : (
            practices.map((p, i) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(i * 60).duration(400)}>
                <Pressable onPress={() => router.push(`/practice/${p.id}`)} testID={`practice-row-${p.id}`}>
                  <GlowCard style={{ marginBottom: spacing.sm }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Overline color={statusColor(p.status)}>{p.status}</Overline>
                        <Heading size="h4" style={{ marginTop: 4 }}>{p.session_type}</Heading>
                        <Body size="small" style={{ marginTop: 4 }}>
                          {p.session_date} · {p.duration_minutes} min · Receiver: {p.receiver_name}
                        </Body>
                        <Body size="small" style={{ marginTop: 4, fontStyle: 'italic' }} color={colors.accent.gold}>
                          "{p.intention.substring(0, 80)}{p.intention.length > 80 ? '…' : ''}"
                        </Body>
                        {p.xp_awarded > 0 && (
                          <View style={styles.xpBadge}>
                            <Ionicons name="flash" size={12} color={colors.accent.gold} />
                            <Body size="caption" weight="semi" color={colors.accent.gold}>+{p.xp_awarded} XP</Body>
                          </View>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} style={{ alignSelf: 'center' }} />
                    </View>
                  </GlowCard>
                </Pressable>
              </Animated.View>
            ))
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statChip}>
      <Body weight="bold" color={color} style={{ fontSize: 22 }}>{value}</Body>
      <Body size="caption" color={colors.text.muted} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.lg },
  statChip: {
    flex: 1, padding: spacing.sm, borderRadius: radii.md,
    backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 4, paddingHorizontal: spacing.sm,
    borderRadius: radii.full, backgroundColor: 'rgba(204,163,82,0.1)',
  },
});
