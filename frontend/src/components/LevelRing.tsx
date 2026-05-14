// Level Ring — cinematic circular XP indicator using SVG
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { colors, fonts } from '@/src/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function LevelRing({
  size = 140, stroke = 8, level, xp, nextThreshold, prevThreshold, testID,
}: { size?: number; stroke?: number; level: string; xp: number; nextThreshold: number; prevThreshold: number; testID?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const range = Math.max(1, nextThreshold - prevThreshold);
  const ratio = Math.max(0, Math.min(1, (xp - prevThreshold) / range));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [ratio, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View testID={testID} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLG id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.accent.cyan} stopOpacity="1" />
            <Stop offset="60%" stopColor={colors.accent.purple} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.accent.gold} stopOpacity="1" />
          </SvgLG>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.bg.tertiary} strokeWidth={stroke} fill="transparent" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.center}>
          <Text style={styles.levelTxt}>{level}</Text>
          <Text style={styles.xpTxt}>{xp} XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  levelTxt: { fontFamily: fonts.heading, fontSize: 36, color: colors.text.primary, letterSpacing: 2 },
  xpTxt: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.accent.gold, letterSpacing: 2, marginTop: 4 },
});
