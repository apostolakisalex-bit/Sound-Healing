// Sound Healing Academy — Level browser
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard, XPBar } from '@/src/components/UI';
import { useAuth } from '@/src/auth/AuthContext';
import { api } from '@/src/api/client';
import { LEVEL_TITLES, levelBounds } from '@/src/constants/levels';
import { colors, spacing, radii } from '@/src/theme';

type Level = {
  id: string; level: string; name: string; theme: string;
  description: string; xp_required: number; xp_reward: number;
  lessons: { id: string; title: string; duration_min: number; type: string; summary: string }[];
  is_unlocked: boolean;
};

export default function Academy() {
  const router = useRouter();
  const { user } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/academy');
      setLevels(data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!user) return null;
  const { prev, next } = levelBounds(user.level);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
        >
          <Overline testID="academy-overline">Sound Healing Academy</Overline>
          <Heading size="h2" style={{ marginTop: spacing.sm }}>The path of{'\n'}the harmonic.</Heading>
          <Body style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
            Five thresholds. Five initiations. One unbroken resonance.
          </Body>

          {/* Progress card */}
          <GlowCard style={{ marginBottom: spacing.lg }} testID="academy-progress">
            <Overline color={colors.accent.gold}>Your Standing</Overline>
            <Heading size="h3" style={{ marginTop: spacing.xs }}>{user.level} · {LEVEL_TITLES[user.level]}</Heading>
            <Body size="small" style={{ marginTop: spacing.xs }}>{user.xp} XP collected</Body>
            <View style={{ marginTop: spacing.md }}>
              <XPBar xp={user.xp} prevThreshold={prev} nextThreshold={next} />
            </View>
          </GlowCard>

          {levels.map((lvl, i) => (
            <Animated.View key={lvl.id} entering={FadeInDown.delay(i * 80).duration(500)}>
              <Pressable onPress={() => router.push(`/level/${lvl.id}`)} testID={`level-card-${lvl.id}`}>
                <GlowCard style={[styles.levelCard, !lvl.is_unlocked && styles.locked]}>
                  <View style={styles.levelHead}>
                    <View style={{ flex: 1 }}>
                      <Overline color={lvl.is_unlocked ? colors.accent.cyan : colors.text.muted}>{lvl.level}</Overline>
                      <Heading size="h3" style={{ marginTop: spacing.xs }}>{lvl.name}</Heading>
                      <Body size="small" style={{ fontStyle: 'italic', marginTop: 4 }} color={colors.accent.gold}>
                        "{lvl.theme}"
                      </Body>
                    </View>
                    <Ionicons
                      name={lvl.is_unlocked ? 'lock-open' : 'lock-closed'}
                      size={22}
                      color={lvl.is_unlocked ? colors.status.success : colors.accent.gold}
                    />
                  </View>
                  <Body size="small" style={{ marginTop: spacing.md, lineHeight: 20 }}>{lvl.description}</Body>
                  <View style={styles.metaRow}>
                    <MetaPill icon="library-outline" text={`${lvl.lessons.length} lessons`} />
                    <MetaPill icon="flash-outline" text={`${lvl.xp_required}+ XP`} />
                    {lvl.xp_reward > 0 && <MetaPill icon="ribbon-outline" text={`+${lvl.xp_reward} reward`} />}
                  </View>
                </GlowCard>
              </Pressable>
            </Animated.View>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MetaPill({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={12} color={colors.accent.gold} />
      <Body size="caption" weight="semi" color={colors.text.secondary}>{text}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.lg },
  levelCard: { marginBottom: spacing.md },
  locked: { opacity: 0.6 },
  levelHead: { flexDirection: 'row', alignItems: 'flex-start' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: spacing.sm,
    borderRadius: radii.full, backgroundColor: colors.bg.tertiary,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
});
