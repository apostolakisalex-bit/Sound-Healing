// Persistent header at the top of every tab screen.
// Shows brand on the left + "View Public Site" link on the right.
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Overline } from '@/src/components/UI';
import { colors, spacing, radii } from '@/src/theme';

export function TabsTopBar({ testID }: { testID?: string }) {
  const router = useRouter();
  return (
    <View style={styles.bar} testID={testID || 'tabs-top-bar'}>
      <View>
        <Overline color={colors.accent.gold}>Sound Healing Greece</Overline>
      </View>
      <Pressable
        onPress={() => router.push('/')}
        testID="tabs-view-public-btn"
        style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="home-outline" size={14} color={colors.accent.gold} />
        <Body size="caption" weight="semi" color={colors.accent.gold} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
          Public Site
        </Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    backgroundColor: colors.bg.primary,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    backgroundColor: 'transparent',
  },
});
