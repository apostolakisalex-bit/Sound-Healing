import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";
import { wellness } from "@/src/theme";
import { Shell, ui } from "./Wellness";
import { TREATMENTS } from "@/src/content/treatments";

export function TreatmentsOverview() {
  const router = useRouter();

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
        accessibilityLabel="Πίσω στην Αρχική"
        onPress={() => router.push("/")}
        style={{ minHeight: 44, justifyContent: "center", paddingVertical: 6 }}
      >
        <Text
          style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}
        >
          ← Αρχική
        </Text>
      </Pressable>

      <View style={{ gap: 8 }}>
        <Text style={ui.title}>Treatments</Text>
        <Text style={[ui.body, { color: wellness.slate }]}>
          Ατομικές & ομαδικές συνεδρίες ηχοθεραπείας. Επίλεξε μια θεραπεία για να
          δεις όλες τις πληροφορίες.
        </Text>
      </View>

      <View style={{ gap: 14, marginTop: 6 }}>
        {TREATMENTS.map((t) => (
          <Pressable
            key={t.slug}
            accessibilityRole="link"
            accessibilityLabel={`${t.title}. Περισσότερα`}
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
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: wellness.lavender,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={t.icon} size={26} color={wellness.lavenderInk} />
            </View>
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
            <Ionicons
              name="chevron-forward"
              size={20}
              color={wellness.slate}
            />
          </Pressable>
        ))}
      </View>
    </Shell>
  );
}

export default TreatmentsOverview;
