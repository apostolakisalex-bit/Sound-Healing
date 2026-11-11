import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";
import { useTheme } from "@/src/theme/ThemeContext";
import { Shell, useUi } from "./Wellness";
import { ManagedImage } from "./ManagedImage";
import { getTreatments, TREATMENTS_PHONE } from "@/src/content/treatments";
import { useLanguage } from "./AppNavigation";

export function TreatmentsOverview() {
  const router = useRouter();
  const ui = useUi();
  const { wellness } = useTheme();
  const { t: tr, language } = useLanguage();
  const treatments = getTreatments(language);

  return (
    <Shell publicPage eyebrow="" title="">
      <Head>
        <title>Treatments · Sound Healing Greece</title>
        <meta
          name="description"
          content="Ατομικές & ομαδικές συνεδρίες ηχοθεραπείας."
        />
      </Head>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={tr("Πίσω στην Αρχική", "Back to Home")}
        onPress={() => router.push("/")}
        style={{ minHeight: 44, justifyContent: "center", paddingVertical: 6 }}
      >
        <Text
          style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}
        >
          {tr("← Αρχική", "← Home")}
        </Text>
      </Pressable>

      <View style={{ gap: 8 }}>
        <Text style={ui.title}>Treatments</Text>
        <Text style={[ui.body, { color: wellness.slate }]}>
          {tr(
            "Ατομικές & ομαδικές συνεδρίες ηχοθεραπείας. Επίλεξε μια θεραπεία για να δεις όλες τις πληροφορίες.",
            "Individual & group sound healing sessions. Choose a treatment to see all the details.",
          )}
        </Text>
      </View>

      <View style={{ gap: 14, marginTop: 6 }}>
        {treatments.map((t) => (
          <Pressable
            key={t.slug}
            accessibilityRole="link"
            accessibilityLabel={`${t.title}. ${tr("Περισσότερα", "More")}`}
            onPress={() => router.push(`/treatment/${t.slug}` as any)}
            style={[
              ui.card,
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                borderWidth: 1,
                borderColor: wellness.line,
              },
            ]}
          >
            <ManagedImage
              source={{ uri: t.hero }}
              accessibilityLabel={t.title}
              resizeMode="cover"
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                backgroundColor: wellness.lavender,
              }}
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: wellness.ink,
                }}
              >
                {t.title}
              </Text>
              <Text style={[ui.label, { color: wellness.slate }]}>
                {t.tagline}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr(
                `Κλείσε ραντεβού για ${t.title} μέσω WhatsApp`,
                `Book an appointment for ${t.title} via WhatsApp`,
              )}
              hitSlop={8}
              onPress={() =>
                void Linking.openURL(
                  `https://wa.me/30${TREATMENTS_PHONE}?text=${encodeURIComponent(
                    tr(
                      `Γεια σας! Θα ήθελα να κλείσω ραντεβού για: ${t.title}.`,
                      `Hello! I would like to book an appointment for: ${t.title}.`,
                    ),
                  )}`,
                )
              }
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: wellness.lavenderInk,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons name="logo-whatsapp" size={20} color={wellness.white} />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </Shell>
  );
}

export default TreatmentsOverview;
