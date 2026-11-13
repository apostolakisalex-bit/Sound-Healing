import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { ManagedImage } from "./ManagedImage";
import { Shell, useUi, Status, useLoad } from "./Wellness";
import { addToDeviceCalendar, shareSeminar } from "@/src/utils/seminarActions";
import { JoinButton, seminarRef } from "./JoinButton";
import { useLanguage } from "./AppNavigation";

type Training = {
  active?: boolean;
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
  const { wellness } = useTheme();
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
  const { wellness } = useTheme();
  const ui = useUi();
  return (
    <View style={{ gap: 10 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons
            name={icon}
            size={18}
            color={tint}
            style={{ marginTop: 2 }}
          />
          <Text style={[ui.body, { flex: 1, color: wellness.ink }]}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function SeminarDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { wellness } = useTheme();
  const ui = useUi();
  const { t: tr } = useLanguage();
  const LEVEL_TONE: Record<number, { bg: string; ink: string }> = {
    1: { bg: wellness.lavender, ink: wellness.lavenderInk },
    2: { bg: wellness.sage, ink: wellness.sageInk },
    3: { bg: wellness.champagne, ink: wellness.champagneInk },
    4: { bg: wellness.blueMist, ink: wellness.slate },
  };
  const state = useLoad<Training>(`/trainings/${slug}`, EMPTY);
  const t = state.data;
  const tone = LEVEL_TONE[t.level || 0] || LEVEL_TONE[4];
  const phone = t.phone || "";

  const addToCalendar = () =>
    addToDeviceCalendar({
      title: t.full_title || t.title,
      location: t.address || t.location,
      start: t.start_date,
      end: t.end_date,
      notes: [
        t.time && `${tr("Ώρα", "Time")}: ${t.time}`,
        t.price && `${tr("Κόστος", "Cost")}: ${t.price}`,
        t.phone && `${tr("Κράτηση", "Booking")}: ${t.phone}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

  const facts: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    tint: string;
  }[] = [
    {
      icon: "calendar-outline",
      label: tr("ΗΜΕΡΟΜΗΝΙΑ", "DATE"),
      value: t.date,
      tint: wellness.lavender,
    },
    { icon: "time-outline", label: tr("ΩΡΑ", "TIME"), value: t.time, tint: wellness.sage },
    {
      icon: "cash-outline",
      label: tr("ΚΟΣΤΟΣ", "COST"),
      value: t.price,
      tint: wellness.champagne,
    },
    {
      icon: "location-outline",
      label: tr("ΧΩΡΟΣ", "VENUE"),
      value: t.address || t.location,
      tint: wellness.blueMist,
    },
    {
      icon: "people-outline",
      label: tr("ΘΕΣΕΙΣ", "SPOTS"),
      value: t.max_participants
        ? tr(`έως ${t.max_participants} άτομα`, `up to ${t.max_participants} people`)
        : "",
      tint: wellness.ice,
    },
    {
      icon: "chatbubble-ellipses-outline",
      label: tr("ΓΛΩΣΣΑ", "LANGUAGE"),
      value: t.language,
      tint: wellness.lavender,
    },
  ];

  return (
    <Shell publicPage eyebrow="" title="">
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/explore/training")}
        style={{ paddingVertical: 10 }}
      >
        <Text
          style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}
        >
          ← {tr("Εκπαιδευτικά", "Training")}
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
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: tone.ink,
                        letterSpacing: 1,
                      }}
                    >
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
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: wellness.lavenderInk,
                      letterSpacing: 1,
                    }}
                  >
                    {t.active
                      ? tr("● ΕΝΕΡΓΟ", "● ACTIVE")
                      : tr(
                          "ΟΛΟΚΛΗΡΩΘΗΚΕ / ΧΩΡΙΣ ΕΝΕΡΓΕΣ ΗΜΕΡΟΜΗΝΙΕΣ",
                          "COMPLETED / NO ACTIVE DATES",
                        )}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ gap: 6 }}>
            <Text style={ui.title}>{t.full_title || t.title}</Text>
            <Text
              style={[ui.body, { color: wellness.slate, fontWeight: "600" }]}
            >
              {[t.date, t.location].filter(Boolean).join("  ·  ")}
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {facts
              .filter((f) => !!f.value)
              .map((f) => (
                <Fact
                  key={f.label}
                  icon={f.icon}
                  label={f.label}
                  value={f.value!}
                  tint={f.tint}
                />
              ))}
          </View>

          {t.active && (
            <JoinButton
              seminar={{
                ref: seminarRef({
                  end: t.end_date || t.start_date,
                  level: t.level,
                  title: t.full_title || t.title,
                  fallback: t.slug,
                }),
                title: t.full_title || t.title,
                start_date: t.start_date,
                end_date: t.end_date,
                date_text: t.date,
                location: t.address || t.location,
                image: t.image,
                url: `/seminar/${t.slug}`,
              }}
            />
          )}

          <View style={{ flexDirection: "row", gap: 10 }}>
            {t.active && (
              <Pressable
                accessibilityRole="button"
                onPress={addToCalendar}
                style={({ pressed }) => ({
                  flexGrow: 1,
                  flexBasis: "47%",
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: wellness.white,
                  borderWidth: 1.5,
                  borderColor: wellness.lavenderInk,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 24,
                  minHeight: 48,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={wellness.lavenderInk}
                />
                <Text
                  style={{
                    color: wellness.lavenderInk,
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  {tr("Ημερολόγιο", "Calendar")}
                </Text>
              </Pressable>
            )}
              <Pressable
                accessibilityRole="button"
                onPress={() => shareSeminar(t.full_title || t.title, t.url)}
                style={({ pressed }) => ({
                  flexGrow: 1,
                  flexBasis: "47%",
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: wellness.white,
                  borderWidth: 1.5,
                  borderColor: wellness.lavenderInk,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 24,
                  minHeight: 48,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={wellness.lavenderInk}
                />
                <Text
                  style={{
                    color: wellness.lavenderInk,
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  {tr("Μοιράσου", "Share")}
                </Text>
              </Pressable>
          </View>
          {/* Booking CTA */}
          {!!phone && t.active && (
            <>
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
                  {tr("Κράτηση θέσης", "Reserve your spot")}
                </Text>
                <Text style={[ui.body, { color: wellness.ink }]}>
                  {tr(
                    "Επικοινώνησε για διαθεσιμότητα και πληροφορίες συμμετοχής.",
                    "Get in touch for availability and participation details.",
                  )}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
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
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "700",
                        fontSize: 15,
                      }}
                    >
                      {tr("Κλήση", "Call")} {phone}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      void Linking.openURL(`https://wa.me/30${phone}`)
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
                    <Ionicons
                      name="logo-whatsapp"
                      size={18}
                      color={wellness.lavenderInk}
                    />
                    <Text
                      style={{
                        color: wellness.lavenderInk,
                        fontWeight: "700",
                        fontSize: 15,
                      }}
                    >
                      WhatsApp / Viber
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
          {!!t.description && (
            <Text
              style={[
                ui.body,
                { fontSize: 15, lineHeight: 24, color: wellness.ink },
              ]}
            >
              {t.description}
            </Text>
          )}

          {!!t.program?.length && (
            <View style={{ gap: 14 }}>
              <Text style={ui.heading}>{tr("Τι θα δούμε", "What we'll cover")}</Text>
              <BulletList
                items={t.program}
                icon="checkmark-circle"
                tint={wellness.lavenderInk}
              />
            </View>
          )}

          {!!t.audience?.length && (
            <View style={{ gap: 14 }}>
              <Text style={ui.heading}>{tr("Για ποιους είναι", "Who it's for")}</Text>
              <BulletList
                items={t.audience}
                icon="person-circle-outline"
                tint={wellness.sageInk}
              />
            </View>
          )}

          {(!!t.instructor || !!t.certification) && (
            <View style={{ gap: 12 }}>
              {!!t.instructor && (
                <View
                  style={[ui.card, { backgroundColor: wellness.ice, gap: 6 }]}
                >
                  <Text style={ui.label}>{tr("ΕΙΣΗΓΗΤΗΣ", "INSTRUCTOR")}</Text>
                  <Text style={[ui.body, { color: wellness.ink }]}>
                    {t.instructor}
                  </Text>
                </View>
              )}
              {!!t.certification && (
                <View
                  style={[ui.card, { backgroundColor: wellness.ice, gap: 6 }]}
                >
                  <Text style={ui.label}>{tr("ΠΙΣΤΟΠΟΙΗΣΗ", "CERTIFICATION")}</Text>
                  <Text style={[ui.body, { color: wellness.ink }]}>
                    {t.certification}
                  </Text>
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
