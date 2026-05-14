// Home Sanctuary — personalized energetic dashboard
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard, AuraButton, BreathingGlow, XPBar } from '@/src/components/UI';
import { LevelRing } from '@/src/components/LevelRing';
import { useAuth } from '@/src/auth/AuthContext';
import { api } from '@/src/api/client';
import { LEVEL_THEMES, levelBounds, LEVEL_TITLES } from '@/src/constants/levels';
import { colors, spacing, radii, fonts } from '@/src/theme';

export default function Sanctuary() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [recentPractices, setRecentPractices] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const [p, f] = await Promise.all([
        api.get('/practices'),
        api.get('/community/feed'),
      ]);
      setRecentPractices(p.data.slice(0, 3));
      setFeed(f.data.slice(0, 3));
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { refresh(); load(); }, [refresh, load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), load()]);
    setRefreshing(false);
  };

  if (!user) return null;
  const { prev, next } = levelBounds(user.level);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0F0A1D', '#05050A', '#05050A']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(600)}>
            <Overline testID="sanctuary-overline">Sanctuary · {user.location || 'Unknown shore'}</Overline>
            <Heading size="h2" style={{ marginTop: spacing.sm }}>Welcome,{'\n'}{user.name}.</Heading>
            <Body style={{ marginTop: spacing.sm, fontStyle: 'italic' }}>The temple breathes with you.</Body>
          </Animated.View>

          {/* Level Ring Hero */}
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <GlowCard style={styles.heroCard} testID="level-hero">
              <View style={styles.heroRow}>
                <BreathingGlow><LevelRing level={user.level} xp={user.xp} prevThreshold={prev} nextThreshold={next} size={130} /></BreathingGlow>
                <View style={styles.heroText}>
                  <Overline color={colors.accent.cyan}>{LEVEL_TITLES[user.level]}</Overline>
                  <Heading size="h3" style={{ marginTop: spacing.xs }}>{LEVEL_THEMES[user.level]}</Heading>
                  <Body size="small" style={{ marginTop: spacing.sm }}>
                    {next > user.xp ? `${next - user.xp} XP until next ascension` : 'Mastery achieved'}
                  </Body>
                </View>
              </View>
              <View style={{ marginTop: spacing.lg }}>
                <XPBar xp={user.xp} prevThreshold={prev} nextThreshold={next} />
              </View>
            </GlowCard>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.quickRow}>
            <QuickAction icon="add-circle-outline" label="Log Practice" testID="qa-log-practice"
              onPress={() => router.push('/practice/new')} />
            <QuickAction icon="chatbubbles-outline" label="Aeon Oracle" testID="qa-ai-chat"
              onPress={() => router.push('/ai-chat')} />
            <QuickAction icon="planet-outline" label="Realms" testID="qa-realms"
              onPress={() => router.push('/(tabs)/journey')} />
            <QuickAction icon="book-outline" label="Academy" testID="qa-academy"
              onPress={() => router.push('/(tabs)/academy')} />
          </Animated.View>

          {/* Stamps */}
          <Animated.View entering={FadeInDown.delay(350).duration(600)}>
            <SectionHeader title="Your Sacred Stamps" hint={`${user.stamps.length} unlocked`} />
            {user.stamps.length === 0 ? (
              <GlowCard testID="stamps-empty">
                <Body size="small">Begin your first practice to unlock your first ceremonial stamp.</Body>
              </GlowCard>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}>
                {user.stamps.slice(0, 8).map((id) => (
                  <View key={id} style={styles.stampTile} testID={`stamp-${id}`}>
                    <Ionicons name="ribbon" size={28} color={colors.accent.gold} />
                  </View>
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* Recent Practices */}
          <Animated.View entering={FadeInDown.delay(450).duration(600)}>
            <SectionHeader title="Recent Practices" hint={recentPractices.length > 0 ? 'View all →' : ''}
              onPress={() => router.push('/(tabs)/practice')} />
            {recentPractices.length === 0 ? (
              <GlowCard testID="practices-empty">
                <Body size="small">No practices logged yet. Begin your first session and invite a receiver.</Body>
                <View style={{ height: spacing.md }} />
                <AuraButton testID="empty-log-practice" label="Log First Practice" onPress={() => router.push('/practice/new')} />
              </GlowCard>
            ) : recentPractices.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/practice/${p.id}`)} testID={`practice-${p.id}`}>
                <GlowCard style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Overline color={p.status === 'XP Awarded' ? colors.status.success : colors.accent.gold}>{p.status}</Overline>
                      <Body weight="semi" color={colors.text.primary} style={{ marginTop: 4 }}>{p.session_type}</Body>
                      <Body size="small" style={{ marginTop: 4 }}>{p.duration_minutes} min · {p.session_date}</Body>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} style={{ alignSelf: 'center' }} />
                  </View>
                </GlowCard>
              </Pressable>
            ))}
          </Animated.View>

          {/* Community Feed */}
          {feed.length > 0 && (
            <Animated.View entering={FadeInDown.delay(550).duration(600)}>
              <SectionHeader title="Community Resonance" />
              {feed.map((item) => (
                <GlowCard key={item.id} style={{ marginBottom: spacing.sm }} testID={`feed-${item.id}`}>
                  <Overline color={colors.accent.cyan}>{item.practitioner_level} · {item.practitioner_name}</Overline>
                  <Body weight="semi" color={colors.text.primary} style={{ marginTop: 4 }}>{item.session_type}</Body>
                  <Body size="small" style={{ marginTop: 4, fontStyle: 'italic' }}>"{item.intention}"</Body>
                </GlowCard>
              ))}
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAction({ icon, label, onPress, testID }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; testID?: string }) {
  return (
    <Pressable onPress={onPress} testID={testID} style={({ pressed }) => [styles.qa, { opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={22} color={colors.accent.gold} />
      <Body size="caption" weight="semi" color={colors.text.primary} style={{ marginTop: 6, textAlign: 'center' }}>{label}</Body>
    </Pressable>
  );
}

function SectionHeader({ title, hint, onPress }: { title: string; hint?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Heading size="h4">{title}</Heading>
      {hint && (
        <Pressable onPress={onPress}><Body size="small" color={colors.accent.gold} weight="semi">{hint}</Body></Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  heroCard: { padding: spacing.lg },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroText: { flex: 1 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  qa: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border.subtle, backgroundColor: colors.bg.secondary,
    alignItems: 'center', minHeight: 80, justifyContent: 'center',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm },
  stampTile: {
    width: 64, height: 64, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bg.tertiary, borderWidth: 1, borderColor: colors.accent.bronze,
  },
});
