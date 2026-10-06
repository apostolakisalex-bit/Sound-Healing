// Tiny shared UI primitives for Sound Healing Greece — cinematic, glowing, breathing.
import React, { ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { colors, fonts, fontSizes, radii, spacing } from '@/src/theme';

// ── Heading (serif, editorial) ────────────────────────────────────────
export function Heading({
  children, size = 'h2', style, testID,
}: { children: ReactNode; size?: 'h1' | 'h2' | 'h3' | 'h4'; style?: TextStyle; testID?: string }) {
  return (
    <Text testID={testID} style={[
      { fontFamily: fonts.heading, color: colors.text.primary, fontSize: fontSizes[size], letterSpacing: -0.5 },
      style,
    ]}>{children}</Text>
  );
}

// ── Body ──────────────────────────────────────────────────────────────
export function Body({
  children, color, size = 'body', weight = 'regular', style, testID, numberOfLines,
}: { children: ReactNode; numberOfLines?: number; color?: string; size?: 'bodyLg' | 'body' | 'small' | 'caption'; weight?: 'regular' | 'medium' | 'semi' | 'bold'; style?: TextStyle; testID?: string }) {
  const family = weight === 'regular' ? fonts.body : weight === 'medium' ? fonts.bodyMed : weight === 'semi' ? fonts.bodySemi : fonts.bodyBold;
  return (
    <Text numberOfLines={numberOfLines} testID={testID} style={[{ fontFamily: family, color: color || colors.text.secondary, fontSize: fontSizes[size] }, style]}>
      {children}
    </Text>
  );
}

// ── Overline (small caps gold label) ──────────────────────────────────
export function Overline({ children, color = colors.accent.gold, style, testID }: { children: ReactNode; color?: string; style?: TextStyle; testID?: string }) {
  return (
    <Text testID={testID} style={[{
      fontFamily: fonts.bodySemi, color, fontSize: fontSizes.overline,
      letterSpacing: 3, textTransform: 'uppercase',
    }, style]}>{children}</Text>
  );
}

// ── GlowCard ──────────────────────────────────────────────────────────
export function GlowCard({ children, style, testID }: { children: ReactNode; style?: ViewStyle; testID?: string }) {
  return (
    <View testID={testID} style={[styles.glowCard, style]}>
      <LinearGradient
        colors={['rgba(212,163,55,0.04)', 'rgba(212,163,55,0.01)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

// ── PrimaryButton (gold) ──────────────────────────────────────────────
export function PrimaryButton({
  label, onPress, loading, disabled, testID, style,
}: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; testID?: string; style?: ViewStyle }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}>
      <LinearGradient
        colors={[colors.accent.gold, colors.accent.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {loading
        ? <ActivityIndicator color="#FFFFFF" />
        : <Text style={styles.primaryBtnText}>{label}</Text>}
    </Pressable>
  );
}

// ── AuraButton (cyan outline glow) ────────────────────────────────────
export function AuraButton({
  label, onPress, testID, style, icon,
}: { label: string; onPress: () => void; testID?: string; style?: ViewStyle; icon?: ReactNode }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.auraBtn, { opacity: pressed ? 0.7 : 1 }, style]}>
      {icon}
      <Text style={styles.auraBtnText}>{label}</Text>
    </Pressable>
  );
}

// ── BreathingGlow wrapper (slow pulse) ────────────────────────────────
export function BreathingGlow({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const opacity = useSharedValue(0.55);
  const scale = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), withTiming(0.55, { duration: 2200, easing: Easing.inOut(Easing.quad) })), -1, false);
    scale.value = withRepeat(withSequence(withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) })), -1, false);
  }, [opacity, scale]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

// ── XP Bar ────────────────────────────────────────────────────────────
export function XPBar({ xp, nextThreshold, prevThreshold, testID }: { xp: number; nextThreshold: number; prevThreshold: number; testID?: string }) {
  const range = Math.max(1, nextThreshold - prevThreshold);
  const ratio = Math.max(0, Math.min(1, (xp - prevThreshold) / range));
  return (
    <View testID={testID} style={styles.xpTrack}>
      <View style={[styles.xpFill, { width: `${ratio * 100}%` }]}>
        <LinearGradient colors={[colors.accent.cyan, colors.accent.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0px 4px 16px rgba(21, 21, 21, 0.06)' } as any)
      : { elevation: 2 }),
  },
  primaryBtn: {
    height: 54,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemi,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  auraBtn: {
    height: 50,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: 8,
  },
  auraBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.accent.gold,
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  xpTrack: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.bg.tertiary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  xpFill: {
    height: '100%',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
});

