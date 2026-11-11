import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";
import { useTheme } from "@/src/theme/ThemeContext";
import { ManagedImage } from "./ManagedImage";
import { Shell, useUi } from "./Wellness";
import { treatmentBySlug, TREATMENTS_PHONE } from "@/src/content/treatments";
import { capsGreek } from "@/src/utils/greek";
import { SoundSpiral } from "./icons/SoundSpiral";
import { useLanguage } from "./AppNavigation";

export function TreatmentDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t: tr, language } = useLanguage();
  const t = treatmentBySlug(slug, language);
  const ui = useUi();
  const { wellness } = useTheme();

  return (
    <Shell publicPage eyebrow="" title="">
      <Head>
        <title>{(t?.title || "Treatment") + " · Sound Healing Greece"}</title>
        <meta name="description" content={t?.intro || ""} />
      </Head>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={tr("Πίσω στις Θεραπείες", "Back to Treatments")}
        onPress={() => router.push("/treatments")}
        style={{ minHeight: 44, justifyContent: "center", paddingVertical: 6 }}
      >
        <Text style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}>
          {tr("← Θεραπείες", "← Treatments")}
        </Text>
      </Pressable>

      {!t ? (
        <Text style={ui.body}>{tr("Η θεραπεία δεν βρέθηκε.", "Treatment not found.")}</Text>
      ) : (
        <View style={{ gap: 22 }}>
          <View style={{ gap: 12, alignItems: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: wellness.lavender,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.slug === "sound-bath" ? (
                <SoundSpiral size={34} color={wellness.lavenderInk} strokeWidth={1.8} />
              ) : (
                <Ionicons name={t.icon} size={32} color={wellness.lavenderInk} />
              )}
            </View>
            <Text style={[ui.title, { textAlign: "center" }]}>{t.title}</Text>
            <Text
              style={[ui.label, { textAlign: "center", color: wellness.slate }]}
            >
              {t.tagline}
            </Text>
          </View>

          <ManagedImage
            source={{ uri: t.hero }}
            accessibilityLabel={t.title}
            resizeMode="cover"
            style={{ width: "100%", height: 200, borderRadius: 18 }}
          />

          <Text
            style={[
              ui.body,
              { fontSize: 15, color: wellness.ink, textAlign: "center" },
            ]}
          >
            {t.intro}
          </Text>

          {/* Infographic — βασικά στοιχεία συνεδρίας */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {t.stats.map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: wellness.white,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: wellness.line,
                  paddingVertical: 16,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name={s.icon} size={20} color={wellness.lavenderInk} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: wellness.ink,
                    textAlign: "center",
                  }}
                >
                  {s.value}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    letterSpacing: 0.6,
                    color: wellness.slate,
                    textAlign: "center",
                  }}
                >
                  {capsGreek(s.label)}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            <Text style={ui.heading}>{tr("Τι είναι", "What it is")}</Text>
            {t.body.map((p, i) => (
              <Text key={i} style={[ui.body, { fontSize: 15 }]}>
                {p}
              </Text>
            ))}
          </View>

          {/* Infographic — οφέλη ως checklist */}
          <View style={{ gap: 12 }}>
            <Text style={ui.heading}>{tr("Οφέλη", "Benefits")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {t.benefits.map((b, i) => (
                <View
                  key={i}
                  style={{
                    flexGrow: 1,
                    flexBasis: "47%",
                    flexDirection: "row",
                    gap: 8,
                    alignItems: "flex-start",
                    backgroundColor: wellness.ice,
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={wellness.lavenderInk}
                  />
                  <Text
                    style={[ui.body, { flex: 1, fontSize: 13, color: wellness.ink }]}
                  >
                    {b}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Infographic — τι να περιμένεις ως αριθμημένα βήματα */}
          <View style={{ gap: 12 }}>
            <Text style={ui.heading}>{tr("Τι να περιμένεις", "What to expect")}</Text>
            <View style={{ gap: 2 }}>
              {t.expect.map((step, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ alignItems: "center", width: 28 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: wellness.lavenderInk,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{ color: wellness.white, fontWeight: "800", fontSize: 13 }}
                      >
                        {i + 1}
                      </Text>
                    </View>
                    {i < t.expect.length - 1 && (
                      <View
                        style={{
                          flex: 1,
                          width: 2,
                          backgroundColor: wellness.line,
                          marginVertical: 2,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      ui.body,
                      { flex: 1, fontSize: 14, paddingBottom: 16, color: wellness.ink },
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              ui.card,
              {
                backgroundColor: wellness.lavender,
                borderColor: wellness.lavenderInk,
                gap: 14,
              },
            ]}
          >
            <Text style={[ui.heading, { color: wellness.ink }]}>
              {tr("Κλείσε ραντεβού", "Book an appointment")}
            </Text>
            <Text style={[ui.body, { color: wellness.ink }]}>
              {tr(
                "Επικοινώνησε για διαθεσιμότητα και κράτηση της συνεδρίας.",
                "Get in touch for availability and to book your session.",
              )}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr("Κράτηση μέσω WhatsApp", "Book via WhatsApp")}
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
                  flexGrow: 1,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: wellness.lavenderInk,
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  borderRadius: 24,
                  minHeight: 48,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons name="logo-whatsapp" size={18} color={wellness.white} />
                <Text
                  style={{ color: wellness.white, fontWeight: "700", fontSize: 15 }}
                >
                  WhatsApp
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(`Κλήση ${TREATMENTS_PHONE}`, `Call ${TREATMENTS_PHONE}`)}
                onPress={() =>
                  void Linking.openURL(`tel:+30${TREATMENTS_PHONE}`)
                }
                style={({ pressed }) => ({
                  flexGrow: 1,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: wellness.white,
                  borderWidth: 1,
                  borderColor: wellness.lavenderInk,
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  borderRadius: 24,
                  minHeight: 48,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons name="call-outline" size={18} color={wellness.lavenderInk} />
                <Text
                  style={{
                    color: wellness.lavenderInk,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {tr("Κλήση", "Call")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Shell>
  );
}

export default TreatmentDetail;
