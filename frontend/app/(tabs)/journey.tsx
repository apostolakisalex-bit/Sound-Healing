// Journey Universe — cinematic realm map
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, Pressable, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline } from '@/src/components/UI';
import { api } from '@/src/api/client';
import { colors, spacing, radii, fonts } from '@/src/theme';

type Realm = {
  id: string; name: string; subtitle: string; description: string;
  level_required: string; xp_required: number; element: string;
  image: string; chambers: string[]; is_unlocked: boolean;
};

export default function Journey() {
  const router = useRouter();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/realms');
      setRealms(data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
        >
          <Overline testID="journey-overline">Journey Universe</Overline>
          <Heading size="h2" style={{ marginTop: spacing.sm }}>Healing realms{'\n'}await your step.</Heading>
          <Body style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
            Each realm is a chamber of transformation. Unlock through resonance.
          </Body>

          {realms.map((r, i) => (
            <Animated.View key={r.id} entering={FadeInDown.delay(i * 80).duration(500)}>
              <RealmCard realm={r} onPress={() => router.push(`/realm/${r.id}`)} />
            </Animated.View>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function RealmCard({ realm, onPress }: { realm: Realm; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} testID={`realm-card-${realm.id}`} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, styles.cardWrap]}>
      <ImageBackground source={{ uri: realm.image }} style={styles.card} imageStyle={{ borderRadius: radii.lg }}>
        <LinearGradient
          colors={['rgba(5,5,10,0.2)', 'rgba(5,5,10,0.95)']}
          locations={[0, 0.85]}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
        />
        {!realm.is_unlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={26} color={colors.accent.gold} />
            <Body weight="semi" color={colors.accent.gold} style={{ marginTop: spacing.xs, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11 }}>
              {realm.xp_required} XP to unlock
            </Body>
          </View>
        )}
        <View style={styles.cardBody}>
          <Overline color={colors.accent.gold}>{realm.element} · {realm.level_required}+</Overline>
          <Heading size="h3" style={{ marginTop: spacing.xs, color: colors.text.inverse }}>{realm.name}</Heading>
          <Body size="small" color={colors.text.inverseSecondary} style={{ marginTop: spacing.xs, fontStyle: 'italic' }}>
            {realm.subtitle}
          </Body>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  container: { padding: spacing.lg },
  cardWrap: { marginBottom: spacing.md },
  card: { height: 220, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  cardBody: { padding: spacing.lg },
  lockOverlay: {
    position: 'absolute', top: spacing.md, right: spacing.md,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
    borderRadius: radii.sm, backgroundColor: 'rgba(5,5,10,0.7)',
    borderWidth: 1, borderColor: colors.accent.gold, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
});
