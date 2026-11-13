import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { HERO_IMAGES } from "@/src/content/public";
import { useTheme } from "@/src/theme/ThemeContext";
import { Button, useUi, ContentItem } from "./Wellness";
import { useLanguage } from "./AppNavigation";

// Preserve the original Emergent hero asset and dark/gold composition.
export function BrandHero({ item }: { item?: ContentItem }) {
  const router = useRouter();
  const { colors } = useTheme();
  const ui = useUi();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const compact = width < 600;
  return (
    <View
      style={{
        minHeight: compact ? 580 : 640,
        backgroundColor: colors.bg.dark,
        overflow: "hidden",
        borderRadius: 24,
      }}
    >
      <ImageBackground
        source={{ uri: item?.published.media_url || HERO_IMAGES.main }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(20,22,24,0.45)",
            "rgba(20,22,24,0.75)",
            "rgba(20,22,24,0.95)",
          ]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          padding: compact ? 24 : 48,
          gap: 32,
        }}
      >
        <View style={{ gap: 24, paddingTop: compact ? 24 : 48 }}>
          <Text style={[ui.label, { color: colors.accent.gold }]}>
            SOUND HEALING GREECE
          </Text>
          <Text
            accessibilityRole="header"
            style={[
              ui.title,
              {
                fontSize: compact ? 40 : 56,
                lineHeight: compact ? 46 : 62,
                color: colors.text.inverse,
                maxWidth: 650,
              },
            ]}
          >
            {item?.published.title || t("Κάνε χώρο\nγια τον ήχο.", "Make space\nfor sound.")}
          </Text>
          <Text
            style={[
              ui.body,
              { color: colors.text.inverseSecondary, maxWidth: 520 },
            ]}
          >
            {item?.published.summary ||
              t(
                "Εκπαίδευση στην ηχοθεραπεία, προσωπική πρακτική και σύνδεση με την κοινότητα. Μια νέα σχέση με την ακρόαση.",
                "Training in sound healing, personal practice and connection with the community. A new relationship with listening.",
              )}
          </Text>
        </View>
        <View style={{ gap: 24 }}>
          <View style={ui.row}>
            <Button
              label={t("Μπες στον χώρο σου", "Enter your space")}
              onPress={() => router.push("/login")}
            />
            <Button
              secondary
              label={t("Δημιουργία λογαριασμού", "Create account")}
              onPress={() => router.push("/register")}
            />
          </View>
          <Text style={[ui.label, { color: colors.text.inverseSecondary }]}>
            {t("ΧΑΝΙΑ · ΑΘΗΝΑ · ONLINE", "CHANIA · ATHENS · ONLINE")}
          </Text>
        </View>
      </View>
    </View>
  );
}
