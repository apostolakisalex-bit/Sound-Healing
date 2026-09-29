// Top-of-screen navigation — combines brand + sacred tab navigation + Public Site button.
// Replaces the default bottom tab bar for a more cinematic, editorial feel.
import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Body, Overline } from '@/src/components/UI';
import { colors, spacing, radii, fonts } from '@/src/theme';

// Sacred, atmospheric icons (MaterialCommunityIcons for richer spiritual iconography)
type TabIcon = keyof typeof MaterialCommunityIcons.glyphMap;
type IoIcon = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; label: string; route: string; icon: TabIcon }[] = [
  { name: 'sanctuary', label: 'Sanctuary', route: '/(tabs)/sanctuary', icon: 'meditation' },
  { name: 'journey',   label: 'Journey',   route: '/(tabs)/journey',   icon: 'compass-rose' },
  { name: 'academy',   label: 'Academy',   route: '/(tabs)/academy',   icon: 'book-open-page-variant-outline' },
  { name: 'practice',  label: 'Practice',  route: '/(tabs)/practice',  icon: 'hand-heart-outline' },
  { name: 'profile',   label: 'Profile',   route: '/(tabs)/profile',   icon: 'account-star-outline' },
];

export function TabsTopBar({ testID }: { testID?: string }) {
  const router = useRouter();
  const segments = useSegments();
  // segments[1] is the tab name when inside (tabs) group
  const current = (Array.from(segments as readonly string[])[1]) || 'sanctuary';

  return (
    <View style={styles.wrap} testID={testID || 'tabs-top-bar'}>
      {/* Row 1 — Brand + Public Site CTA */}
      <View style={styles.brandRow}>
        <View>
          <Overline color={colors.accent.gold}>Sound Healing Greece</Overline>
          <Body size="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
            Chania · Athens · Online
          </Body>
        </View>
        <Pressable
          onPress={() => router.push('/')}
          testID="tabs-view-public-btn"
          style={({ pressed }) => [styles.publicBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name={'home-outline' as IoIcon} size={13} color={colors.accent.gold} />
          <Body size="caption" weight="semi" color={colors.accent.gold}
            style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Public Site
          </Body>
        </Pressable>
      </View>

      {/* Row 2 — Sacred tab navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map((t) => {
          const active = current === t.name;
          return (
            <Pressable
              key={t.name}
              onPress={() => router.push(t.route as any)}
              testID={`top-tab-${t.name}`}
              style={({ pressed }) => [styles.tabBtn, { opacity: pressed ? 0.75 : 1 }]}
            >
              <View style={[styles.tabIconBox, active && styles.tabIconBoxActive]}>
                <MaterialCommunityIcons
                  name={t.icon}
                  size={20}
                  color={active ? colors.accent.gold : colors.text.muted}
                />
              </View>
              <Body
                size="caption"
                weight={active ? 'semi' : 'medium'}
                color={active ? colors.text.primary : colors.text.muted}
                style={{
                  marginTop: 4,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  fontSize: 10,
                }}
              >
                {t.label}
              </Body>
              {active ? <View style={styles.activeIndicator} /> : <View style={styles.activePlaceholder} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  publicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.accent.gold,
  },
  tabsRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  tabBtn: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: 6,
    minWidth: 68,
  },
  tabIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabIconBoxActive: {
    backgroundColor: 'rgba(212,175,55,0.10)',
    borderColor: colors.accent.gold,
  },
  activeIndicator: {
    marginTop: 6,
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent.gold,
  },
  activePlaceholder: {
    marginTop: 6,
    height: 2,
  },
});

