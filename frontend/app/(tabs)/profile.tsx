// Profile Evolution — cinematic practitioner card
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard, AuraButton, BreathingGlow, XPBar } from '@/src/components/UI';
import { LevelRing } from '@/src/components/LevelRing';
import { useAuth } from '@/src/auth/AuthContext';
import { api } from '@/src/api/client';
import { LEVEL_TITLES, levelBounds, LEVELS, LEVEL_THRESHOLDS } from '@/src/constants/levels';
import { colors, spacing, radii } from '@/src/theme';

type Stamp = {
  id: string; name: string; rarity: string; meaning: string;
  category: string; owned: boolean;
};

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [realms, setRealms] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([api.get('/stamps'), api.get('/realms')]);
      setStamps(s.data); setRealms(r.data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onPickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow photo access to set your sacred image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0].base64) {
      const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try { await updateProfile({ profile_image: dataUrl }); } catch { Alert.alert('Update failed'); }
    }
  };

  if (!user) return null;
  const { prev, next } = levelBounds(user.level);

  const ownedStamps = stamps.filter(s => s.owned);
  const lockedStamps = stamps.filter(s => !s.owned);
  const unlockedRealms = realms.filter(r => user.unlocked_realms.includes(r.id) || (r as any).is_unlocked);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary, colors.bg.primary]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
        >
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(600)}>
            <View style={styles.heroWrap}>
              <BreathingGlow style={styles.avatarWrap}>
                <Pressable onPress={onPickImage} testID="profile-avatar">
                  {user.profile_image ? (
                    <Image source={{ uri: user.profile_image }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={50} color={colors.accent.gold} />
                    </View>
                  )}
                  <View style={styles.avatarEdit}>
                    <Ionicons name="camera" size={14} color={colors.bg.primary} />
                  </View>
                </Pressable>
              </BreathingGlow>
              <Heading size="h2" style={{ marginTop: spacing.lg, textAlign: 'center' }} testID="profile-name">{user.name}</Heading>
              <Overline color={colors.accent.gold} style={{ marginTop: spacing.xs, textAlign: 'center' }}>
                {user.title}
              </Overline>
              {user.location ? <Body size="small" style={{ marginTop: spacing.xs, textAlign: 'center' }}>📍 {user.location}</Body> : null}
              {user.bio ? <Body size="small" style={{ marginTop: spacing.sm, textAlign: 'center', fontStyle: 'italic' }}>"{user.bio}"</Body> : null}
            </View>
          </Animated.View>

          {/* Level ring */}
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <GlowCard style={{ alignItems: 'center' }}>
              <LevelRing level={user.level} xp={user.xp} prevThreshold={prev} nextThreshold={next} size={170} stroke={10} />
              <Body size="small" color={colors.accent.gold} style={{ marginTop: spacing.md, letterSpacing: 2, textTransform: 'uppercase' }}>
                {next > user.xp ? `${next - user.xp} XP to next initiation` : 'Mastery achieved'}
              </Body>
              <View style={{ width: '100%', marginTop: spacing.md }}>
                <XPBar xp={user.xp} prevThreshold={prev} nextThreshold={next} />
              </View>
            </GlowCard>
          </Animated.View>

          {/* Stats Row */}
          <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.statsRow}>
            <Stat label="Stamps" value={ownedStamps.length} max={stamps.length} />
            <Stat label="Realms" value={unlockedRealms.length} max={realms.length} />
            <Stat label="XP" value={user.xp} />
          </Animated.View>

          {/* Level Roadmap */}
          <Animated.View entering={FadeInDown.delay(350).duration(600)}>
            <Heading size="h4" style={{ marginBottom: spacing.sm }}>Initiation Path</Heading>
            <GlowCard>
              {LEVELS.map((lvl, idx) => {
                const reached = user.xp >= LEVEL_THRESHOLDS[lvl];
                return (
                  <View key={lvl} style={[styles.roadmapRow, idx < LEVELS.length - 1 && styles.roadmapBorder]}>
                    <View style={[styles.roadmapDot, reached && styles.roadmapDotOn]} />
                    <View style={{ flex: 1 }}>
                      <Body weight="semi" color={reached ? colors.text.primary : colors.text.muted}>
                        {lvl} · {LEVEL_TITLES[lvl]}
                      </Body>
                      <Body size="caption" color={colors.text.muted}>{LEVEL_THRESHOLDS[lvl]} XP</Body>
                    </View>
                    {reached && <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />}
                  </View>
                );
              })}
            </GlowCard>
          </Animated.View>

          {/* Stamps gallery */}
          <Animated.View entering={FadeInDown.delay(450).duration(600)}>
            <Heading size="h4" style={{ marginBottom: spacing.sm }}>Sacred Stamps</Heading>
            <View style={styles.stampGrid}>
              {[...ownedStamps, ...lockedStamps].map((s) => (
                <View key={s.id} style={[styles.stampBox, !s.owned && styles.stampLocked]} testID={`stamp-tile-${s.id}`}>
                  <Ionicons
                    name={s.owned ? 'ribbon' : 'lock-closed'}
                    size={26}
                    color={s.owned ? colors.accent.gold : colors.text.muted}
                  />
                  <Body size="caption" weight="semi" color={s.owned ? colors.text.primary : colors.text.muted}
                    style={{ marginTop: 6, textAlign: 'center' }} numberOfLines={2}>
                    {s.name}
                  </Body>
                  <Body size="caption" color={colors.text.muted} style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 9 }}>
                    {s.rarity}
                  </Body>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.delay(550).duration(600)} style={{ marginTop: spacing.lg }}>
            <AuraButton testID="logout-btn" label="Leave the Temple" onPress={async () => { await logout(); router.replace('/'); }} />
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value, max }: { label: string; value: number; max?: number }) {
  return (
    <View style={styles.statBox}>
      <Heading size="h3">{value}{max !== undefined ? `/${max}` : ''}</Heading>
      <Body size="caption" color={colors.text.muted} style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.lg, gap: spacing.lg },
  heroWrap: { alignItems: 'center', paddingVertical: spacing.lg },
  avatarWrap: { borderRadius: radii.full },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: colors.accent.gold },
  avatarPlaceholder: { backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' },
  avatarEdit: {
    position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.accent.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg.primary,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.subtle, alignItems: 'center' },
  roadmapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  roadmapBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  roadmapDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.bg.tertiary, borderWidth: 2, borderColor: colors.border.default },
  roadmapDotOn: { backgroundColor: colors.accent.gold, borderColor: colors.accent.gold },
  stampGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stampBox: {
    width: '31%', aspectRatio: 1, borderRadius: radii.md,
    backgroundColor: colors.bg.tertiary, borderWidth: 1, borderColor: colors.accent.bronze,
    alignItems: 'center', justifyContent: 'center', padding: spacing.xs,
  },
  stampLocked: { borderColor: colors.border.subtle, opacity: 0.55 },
});
