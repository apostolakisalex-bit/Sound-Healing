// Realm detail
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, Alert, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard, PrimaryButton } from '@/src/components/UI';
import { api } from '@/src/api/client';
import { colors, spacing, radii } from '@/src/theme';

export default function RealmDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [realm, setRealm] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get(`/realms/${id}`); setRealm(data); } catch {}
    })();
  }, [id]);

  const enter = async () => {
    setBusy(true);
    try {
      await api.post(`/realms/${id}/enter`);
      Alert.alert('Welcome', `You have entered ${realm.name}. The realm awakens around you.`);
    } catch (e: any) {
      Alert.alert('Threshold', e?.response?.data?.detail || 'Cannot enter yet');
    } finally { setBusy(false); }
  };

  if (!realm) return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: realm.image }} style={styles.hero} imageStyle={{ resizeMode: 'cover' }}>
        <LinearGradient
          colors={['rgba(5,5,10,0.3)', 'rgba(5,5,10,0.6)', colors.bg.primary]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
            <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
          </Pressable>
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.contentWrap}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Overline color={colors.accent.cyan}>{realm.element} · {realm.level_required}+</Overline>
            <Heading size="h1" style={{ marginTop: spacing.sm }}>{realm.name}</Heading>
            <Body size="bodyLg" style={{ marginTop: spacing.xs, fontStyle: 'italic' }} color={colors.accent.gold}>
              "{realm.subtitle}"
            </Body>
            <Body style={{ marginTop: spacing.lg, lineHeight: 24 }}>{realm.description}</Body>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Heading size="h4" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Chambers</Heading>
            {realm.chambers.map((c: string, i: number) => (
              <GlowCard key={c} style={styles.chamber}>
                <View style={styles.chamberRow}>
                  <View style={styles.chamberNum}><Body weight="bold" color={colors.accent.gold}>{i + 1}</Body></View>
                  <View style={{ flex: 1 }}>
                    <Body weight="semi" color={colors.text.primary}>{c}</Body>
                    <Body size="caption" color={colors.text.muted} style={{ marginTop: 2 }}>Sacred space · Locked until entry</Body>
                  </View>
                  <Ionicons name="lock-closed" size={18} color={colors.text.muted} />
                </View>
              </GlowCard>
            ))}
          </Animated.View>

          <View style={{ height: spacing.xxl }} />
          {realm.is_unlocked ? (
            <PrimaryButton testID="realm-enter-btn" label="Enter the Realm" onPress={enter} loading={busy} />
          ) : (
            <GlowCard testID="realm-locked">
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="lock-closed" size={32} color={colors.accent.gold} />
                <Heading size="h4" style={{ marginTop: spacing.sm, textAlign: 'center' }}>Realm sealed</Heading>
                <Body size="small" style={{ marginTop: spacing.xs, textAlign: 'center' }}>
                  {realm.xp_required} XP needed. Practice. Complete lessons. The path will open.
                </Body>
              </View>
            </GlowCard>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  hero: { height: 320 },
  backBtn: {
    margin: spacing.md, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(5,5,10,0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  contentWrap: { flex: 1, marginTop: -40, backgroundColor: colors.bg.primary, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  chamber: { marginBottom: spacing.sm, padding: spacing.md },
  chamberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chamberNum: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.accent.gold, backgroundColor: 'rgba(204,163,82,0.08)',
  },
});
