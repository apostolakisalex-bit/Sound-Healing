import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/src/theme";
import { useWarm } from "@/src/theme/warm";

const semi =
  Platform.OS === "web" ? `${fonts.bodySemi}, Arial, sans-serif` : fonts.bodySemi;

/**
 * Split-pill CTA inspired by the Bliss "Join Now" button: a round arrow chip
 * on the left joined to a solid pill with the label.
 */
export function JoinPill({
  label,
  onPress,
  dark = true,
}: {
  label: string;
  onPress?: () => void;
  dark?: boolean;
}) {
  const warm = useWarm();
  const bg = dark ? warm.fill : warm.card;
  const fg = dark ? warm.onFill : warm.ink;
  const circleBg = dark ? warm.card : warm.fill;
  const circleFg = dark ? warm.fill : warm.onFill;
  const content = (
    <>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: circleBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="arrow-forward" size={19} color={circleFg} />
      </View>
      <Text style={{ color: fg, fontFamily: semi, fontSize: 14, letterSpacing: 0.2 }}>
        {label}
      </Text>
    </>
  );
  const base = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    borderRadius: 999,
    backgroundColor: bg,
    paddingLeft: 5,
    paddingRight: 18,
    paddingVertical: 5,
    gap: 10,
  };
  // When no handler is given, render a non-interactive visual (avoids nested
  // pressables when the whole surrounding card is already tappable).
  if (!onPress) return <View style={base}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ ...base, opacity: pressed ? 0.85 : 1 })}
    >
      {content}
    </Pressable>
  );
}
