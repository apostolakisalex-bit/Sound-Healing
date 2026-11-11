import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthContext";
import { useTheme } from "@/src/theme/ThemeContext";
import { useLanguage } from "@/src/components/AppNavigation";

// Brief "Welcome, [name]" banner shown right after a Google sign-in.
// Fades in from the top, then auto-dismisses after a few seconds.
export function WelcomeToast() {
  const { welcomeName, dismissWelcome } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!welcomeName) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
    const hideTimer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => dismissWelcome());
    }, 2800);
    return () => clearTimeout(hideTimer);
  }, [welcomeName, anim, dismissWelcome]);

  if (!welcomeName) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + 10,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            backgroundColor: colors.accent.gold,
            color: colors.text.inverse,
          },
        ]}
        numberOfLines={1}
      >
        {t(`Καλώς ήρθες, ${welcomeName} ✦`, `Welcome, ${welcomeName} ✦`)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  text: {
    maxWidth: "88%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    fontSize: 15,
    fontWeight: "600",
    overflow: "hidden",
    letterSpacing: 0.3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
});
