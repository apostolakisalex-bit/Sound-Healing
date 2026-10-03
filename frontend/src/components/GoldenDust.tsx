import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Soft golden "sound dust": tiny gold grains that drift and fade in gentle
// waves over the white background. Purely decorative, non-interactive.
const GOLD = "#D4B36A";
const COUNT = 16;

const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

function Grain({ index, w, h }: { index: number; w: number; h: number }) {
  const left = rnd(index + 1) * w;
  const top = rnd(index + 11) * h;
  const size = 2 + rnd(index + 23) * 4;
  const dur = 5200 + rnd(index + 31) * 5200;
  const delay = rnd(index + 41) * 5200;
  const rise = 26 + rnd(index + 53) * 44;
  const sway = 12 + rnd(index + 67) * 26;

  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(p);
  }, [p, delay, dur]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.12 + 0.5 * Math.sin(p.value * Math.PI),
    transform: [
      { translateY: -rise * p.value },
      { translateX: sway * Math.sin(p.value * Math.PI * 2) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: GOLD,
        },
        style,
      ]}
    />
  );
}

export function GoldenDust() {
  const { width, height } = useWindowDimensions();
  return (
    <Animated.View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: COUNT }).map((_, i) => (
        <Grain key={i} index={i} w={width} h={height} />
      ))}
    </Animated.View>
  );
}
