import React, { useEffect } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "./AppNavigation";

const GONG = require("../../assets/welcome/gong.webp");

const SERIF =
  Platform.OS === "web"
    ? "CormorantGaramond_600SemiBold, Georgia, serif"
    : "CormorantGaramond_600SemiBold";

const RING = 300;

// One expanding "cymatic" ring — soft sound wave spreading outward in a slow loop.
function Ripple({
  delay,
  duration,
  maxScale,
  size,
  peak,
  borderWidth,
  color,
}: {
  delay: number;
  duration: number;
  maxScale: number;
  size: number;
  peak: number;
  borderWidth: number;
  color: string;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(p);
  }, [delay, duration, p]);
  const style = useAnimatedStyle(() => ({
    opacity: (1 - p.value) * peak,
    transform: [{ scale: 0.1 + p.value * maxScale }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

// Slow, multi-layered cymatic field — many concentric sound waves spreading out.
const OUTER_COUNT = 8;
const OUTER_DURATION = 9000;
const INNER_COUNT = 5;
const INNER_DURATION = 12000;

function CymaticField({ maxScale }: { maxScale: number }) {
  return (
    <>
      <View style={styles.glow} />
      {Array.from({ length: OUTER_COUNT }).map((_, i) => (
        <Ripple
          key={`o${i}`}
          delay={Math.round((i * OUTER_DURATION) / OUTER_COUNT)}
          duration={OUTER_DURATION}
          maxScale={maxScale}
          size={RING}
          peak={0.5}
          borderWidth={i % 2 === 0 ? 1.5 : 1}
          color={
            i % 2 === 0 ? "rgba(243,221,178,0.7)" : "rgba(243,221,178,0.45)"
          }
        />
      ))}
      {/* a slower inner family for a layered, three-dimensional feel */}
      {Array.from({ length: INNER_COUNT }).map((_, i) => (
        <Ripple
          key={`i${i}`}
          delay={Math.round((i * INNER_DURATION) / INNER_COUNT) + 700}
          duration={INNER_DURATION}
          maxScale={maxScale * 0.62}
          size={RING * 0.62}
          peak={0.32}
          borderWidth={1}
          color="rgba(255,241,214,0.5)"
        />
      ))}
    </>
  );
}

/** Opening welcome screen: the gong photo softly blurs and dissolves into a
 * cymatic sound-wave field, with a 3D "Get Started" CTA. */
export function Welcome({ onStart }: { onStart: () => void }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { t } = useLanguage();
  const compact = height < 740;
  const maxScale = Math.max(width, height) / RING + 1.1;

  // 0 -> 1 dissolve: image blurs & fades, cymatic field + darkening fade in.
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(
      350,
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
    );
    return () => cancelAnimation(prog);
  }, [prog]);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: 1 - prog.value * 0.45,
    transform: [{ scale: 1 + prog.value * 0.05 }],
  }));
  const blurStyle = useAnimatedStyle(() => ({ opacity: prog.value }));
  const cymaticStyle = useAnimatedStyle(() => ({ opacity: prog.value }));
  const gradientStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + prog.value * 0.5,
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
        <Image source={GONG} style={styles.fill} resizeMode="cover" />
      </Animated.View>

      {/* image softly blurs (not distorts) and is lost into the new field */}
      <Animated.View
        style={[StyleSheet.absoluteFill, blurStyle]}
        pointerEvents="none"
      >
        <BlurView
          intensity={Platform.OS === "web" ? 22 : 48}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* cymatic sound waves spreading across the whole screen */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.center, cymaticStyle]}
        pointerEvents="none"
      >
        <CymaticField maxScale={maxScale} />
      </Animated.View>

      {/* darken the lower half so the title + button stay crisp */}
      <Animated.View
        style={[StyleSheet.absoluteFill, gradientStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            "rgba(14,11,8,0.05)",
            "rgba(14,11,8,0.45)",
            "rgba(14,11,8,0.97)",
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* content — always crisp, unaffected by the animation */}
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 26 },
        ]}
      >
        <Text
          style={[
            styles.title,
            { fontSize: compact ? 22 : 26, lineHeight: compact ? 28 : 32 },
          ]}
        >
          {t("Καλώς ήρθες στο", "Welcome to")}
        </Text>
        <Text style={[styles.title, { fontSize: compact ? 34 : 42 }]}>
          Sound Healing
        </Text>
        <Text
          style={[styles.title, { fontSize: compact ? 34 : 42, marginBottom: 14 }]}
        >
          Greece
        </Text>
        <Text style={styles.subtitle}>
          {t(
            "Βυθίσου στον κόσμο της ηχοθεραπείας.",
            "Immerse yourself in the world of sound healing.",
          )}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          onPress={onStart}
          style={({ pressed }) => ({
            marginTop: 26,
            transform: [{ translateY: pressed ? 2 : 0 }],
            opacity: pressed ? 0.96 : 1,
          })}
        >
          <LinearGradient
            colors={["#FCF5E7", "#E8D6B4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{t("Ας ξεκινήσουμε", "Get Started")}</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.terms}>
          {t(
            "Συνεχίζοντας, αποδέχεσαι τους Όρους Χρήσης.",
            "By continuing, you agree to our Terms & Conditions.",
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0E0B08" },
  fill: { width: "100%", height: "100%" },
  center: { alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    width: RING * 0.9,
    height: RING * 0.9,
    borderRadius: RING,
    backgroundColor: "rgba(243,221,178,0.10)",
    boxShadow: "0px 0px 90px 30px rgba(243,221,178,0.12)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "flex-end",
  },
  title: {
    fontFamily: SERIF,
    color: "#F4ECDC",
    lineHeight: 46,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#CFC3AC",
    fontSize: 17,
    lineHeight: 25,
  },
  cta: {
    borderRadius: 30,
    paddingVertical: 17,
    alignItems: "center",
    boxShadow:
      "0px 12px 26px rgba(0,0,0,0.55), inset 0px 1.5px 0px rgba(255,255,255,0.85), inset 0px -3px 4px rgba(150,120,80,0.3)",
  },
  ctaText: {
    color: "#2B2117",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  terms: {
    color: "#9A9079",
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
  },
});

export default Welcome;
