import React from "react";
import { Alert, Linking, Platform, Pressable, Text, View } from "react-native";
import * as Calendar from "expo-calendar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { wellness } from "@/src/theme";
import { ManagedImage } from "./ManagedImage";
import { Shell, ui, Status, useLoad } from "./Wellness";

type Training = {
  slug: string;
  url: string;
  full_title?: string;
  title: string;
  level?: number | null;
  location?: string;
  image?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  time?: string;
  address?: string;
  price?: string;
  language?: string;
  max_participants?: string;
  phone?: string;
  description?: string;
  program?: string[];
  audience?: string[];
  instructor?: string;
  certification?: string;
};

const EMPTY = {} as Training;

const LEVEL_TONE: Record<number, { bg: string; ink: string }> = {
  1: { bg: wellness.lavender, ink: wellness.lavenderInk },
  2: { bg: wellness.sage, ink: wellness.sageInk },
  3: { bg: wellness.champagne, ink: wellness.champagneInk },
  4: { bg: wellness.blueMist, ink: wellness.slate },
};

function Fact({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: "47%",
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        backgroundColor: wellness.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: wellness.line,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: tint,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={wellness.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, letterSpacing: 1, color: wellness.muted }}>
          {label}
        </Text>
        <Text
          style={{ fontSize: 13, fontWeight: "700", color: wellness.ink }}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function BulletList({
  items,
  icon,
  tint,
}: {
  items: string[];
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons name={icon} size={18} color={tint} style={{ marginTop: 2 }} />
          <Text style={[ui.body, { flex: 1, color: wellness.ink }]}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function SeminarDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const state = useLoad<Training>(`/trainings/${slug}`, EMPTY);
  const t = state.data;
  const tone = LEVEL_TONE[t.level || 0] || LEVEL_TONE[4];
  const phone = t.phone || "6945562818";

  const addToCalendar = async () => {
    const start = t.start_date || t.end_date;
    const end = t.end_date || t.start_date;
    if (!start) {
      Alert.alert("Ημερομηνία μη διαθέσιμη");
      return;
    }
    const title = t.full_title || t.title;
    const location = t.address || t.location || "";
    const notes = [
      t.time && `Ώρα: ${t.time}`,
      t.price && `Κόστος: ${t.price}`,
      t.phone && `Κράτηση: ${t.phone}`,
    ]
      .filter(Boolean)
      .join("\n");

    if (Platform.OS === "web") {
      const ymd = (iso: string) => iso.replace(/-/g, "");
      const e = new Date(`${end}T00:00:00`);
      e.setDate(e.getDate() + 1);
      const endExcl = `${e.getFullYear()}${String(e.getMonth() + 1).padStart(2, "0")}${String(e.getDate()).padStart(2, "0")}`;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title,
      )}&dates=${ymd(start!)}/${endExcl}&details=${encodeURIComponent(
        notes,
      )}&location=${encodeURIComponent(location)}`;
      void Linking.openURL(url);
      return;
    }

    try {
      let perm = await Calendar.getCalendarPermissionsAsync();
      if (perm.status !== "granted") {
        perm = await Calendar.requestCalendarPermissionsAsync();
      }
      if (perm.status !== "granted") {
        Alert.alert(
          "Άδεια ημερολογίου",
          perm.canAskAgain
            ? "Χρειαζόμαστε πρόσβαση στο ημερολόγιο για να προσθέσουμε το σεμινάριο."
            : "Δώσε πρόσβαση στο ημερολόγιο από τις Ρυθμίσεις.",
          perm.canAskAgain
            ? [{ text: "Εντάξει" }]
            : [
                { text: "Άκυρο", style: "cancel" },
                { text: "Ρυθμίσεις", onPress: () => void Linking.openSettings() },
              ],
        );
        return;
      }
      let calId = "";
      try {
        const def = await Calendar.getDefaultCalendarAsync();
        calId = def?.id || "";
      } catch {
        calId = "";
      }
      if (!calId) {
        const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const writable = cals.find((c) => c.allowsModifications) || cals[0];
        calId = writable?.id || "";
      }
      if (!calId) {
        Alert.alert("Δεν βρέθηκε ημερολόγιο στη συσκευή.");
        return;
      }
      await Calendar.createEventAsync(calId, {
        title,
        location,
        notes,
        startDate: new Date(`${start}T09:00:00`),
        endDate: new Date(`${end}T18:00:00`),
        timeZone: "Europe/Athens",
        alarms: [{ relativeOffset: -60 * 24 }],
      });
      Alert.alert("Έτοιμο ✓", "Το σεμινάριο προστέθηκε στο ημερολόγιό σου.");
    } catch {
      Alert.alert("Ωχ!", "Δεν μπορέσαμε να προσθέσουμε το σεμινάριο. Δοκίμασε ξανά.");
    }
  };

  const facts: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    tint: string;
  }[] = [
    { icon: "calendar-outline", label: "ΗΜΕΡΟΜΗΝΙΑ", value: t.date, tint: wellness.lavender },
    { icon: "time-outline", label: "ΩΡΑ", value: t.time, tint: wellness.sage },
    { icon: "cash-outline", label: "ΚΟΣΤΟΣ", value: t.price, tint: wellness.champagne },
    { icon: "location-outline", label: "ΧΩΡΟΣ", value: t.address || t.location, tint: wellness.blueMist },
    { icon: "people-outline", label: "ΘΕΣΕΙΣ", value: t.max_participants ? `έως ${t.max_participants} άτομα` : "", tint: wellness.ice },
    { icon: "chatbubble-ellipses-outline", label: "ΓΛΩΣΣΑ", value: t.language, tint: wellness.lavender },
  ];

  return (
    <Shell publicPage eyebrow="" title="">
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/explore/training")}
        style={{ paddingVertical: 10 }}
      >
        <Text style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}>
          ← Εκπαιδευτικά
        </Text>
      </Pressable>

      <Status state={state} />

      {!state.loading && !state.error && !!t.slug && (
        <View style={{ gap: 20 }}>
          {!!t.image && (
            <View
              style={{
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: wellness.blueMist,
              }}
            >
              <ManagedImage
                source={{ uri: t.image }}
                accessibilityLabel={t.full_title || t.title}
                resizeMode="cover"
                style={{ width: "100%", height: 210 }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {!!t.level && (
                  <View
                    style={{
                      backgroundColor: tone.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "800", color: tone.ink, letterSpacing: 1 }}>
                      LEVEL {t.level}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.92)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800", color: wellness.lavenderInk, letterSpacing: 1 }}>
                    ● ΕΝΕΡΓΟ
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ gap: 6 }}>
            <Text style={ui.title}>{t.full_title || t.title}</Text>
            <Text style={[ui.body, { color: wellness.slate, fontWeight: "600" }]}>
              {[t.date, t.location].filter(Boolean).join("  ·  ")}
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {facts
              .filter((f) => !!f.value)
              .map((f) => (
                <Fact key={f.label} icon={f.icon} label={f.label} value={f.value!} tint={f.tint} />
              ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={addToCalendar}
            style={({ pressed }) => ({
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: wellness.white,
              borderWidth: 1.5,
              borderColor: wellness.lavenderInk,
              paddingVertical: 14,
              paddingHorizontal: 18,
              borderRadius: 24,
              minHeight: 48,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="calendar-outline" size={18} color={wellness.lavenderInk} />
            <Text style={{ color: wellness.lavenderInk, fontWeight: "700", fontSize: 15 }}>
              Πρόσθεσε στο ημερολόγιο
            </Text>
          </Pressable>

          {/* Booking CTA */}
          <View
            style={[
              ui.card,
              { backgroundColor: wellness.lavender, borderColor: wellness.lavenderInk, gap: 14 },
            ]}
          >
            <Text style={[ui.heading, { color: wellness.ink }]}>Κράτηση θέσης</Text>
            <Text style={[ui.body, { color: wellness.ink }]}>
              Οι θέσεις είναι περιορισμένες και απαιτείται προκαταβολή. Κλείσε τη θέση σου με μια κλήση ή μήνυμα.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void Linking.openURL(`tel:+30${phone}`)}
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
                <Ionicons name="call-outline" size={18} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
                  Κλήση {phone}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void Linking.openURL(`https://wa.me/30${phone}`)}
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
                <Ionicons name="logo-whatsapp" size={18} color={wellness.lavenderInk} />
                <Text style={{ color: wellness.lavenderInk, fontWeight: "700", fontSize: 15 }}>
                  WhatsApp / Viber
                </Text>
              </Pressable>
            </View>
          </View>

          {!!t.description && (
            <Text style={[ui.body, { fontSize: 15, lineHeight: 24, color: wellness.ink }]}>
              {t.description}
            </Text>
          )}

          {!!t.program?.length && (
            <View style={{ gap: 14 }}>
              <Text style={ui.heading}>Τι θα δούμε</Text>
              <BulletList items={t.program} icon="checkmark-circle" tint={wellness.lavenderInk} />
            </View>
          )}

          {!!t.audience?.length && (
            <View style={{ gap: 14 }}>
              <Text style={ui.heading}>Για ποιους είναι</Text>
              <BulletList items={t.audience} icon="person-circle-outline" tint={wellness.sageInk} />
            </View>
          )}

          {(!!t.instructor || !!t.certification) && (
            <View style={{ gap: 12 }}>
              {!!t.instructor && (
                <View style={[ui.card, { backgroundColor: wellness.ice, gap: 6 }]}>
                  <Text style={ui.label}>ΕΙΣΗΓΗΤΗΣ</Text>
                  <Text style={[ui.body, { color: wellness.ink }]}>{t.instructor}</Text>
                </View>
              )}
              {!!t.certification && (
                <View style={[ui.card, { backgroundColor: wellness.ice, gap: 6 }]}>
                  <Text style={ui.label}>ΠΙΣΤΟΠΟΙΗΣΗ</Text>
                  <Text style={[ui.body, { color: wellness.ink }]}>{t.certification}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </Shell>
  );
}

export default function SeminarScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <SeminarDetail key={slug} />;
}
