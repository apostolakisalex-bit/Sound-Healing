import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { useUi, useLoad } from "./Wellness";
import { cardShadow } from "@/src/theme";
import { ManagedImage } from "./ManagedImage";
import { useLanguage } from "./AppNavigation";
import { athensToday } from "@/src/content/schedule";

type Signup = {
  ref: string;
  title: string;
  start_date?: string;
  end_date?: string;
  date_text?: string;
  location?: string;
  image?: string;
  url?: string;
};

const daysBetween = (fromISO: string, toISO: string) => {
  const [ya, ma, da] = fromISO.split("-").map(Number);
  const [yb, mb, db] = toISO.split("-").map(Number);
  const a = Date.UTC(ya, ma - 1, da);
  const b = Date.UTC(yb, mb - 1, db);
  return Math.round((b - a) / 86400000);
};

/** "My events" — the seminars the member declared participation for, with a
 * clear countdown to the next upcoming one. Renders nothing when empty. */
export function MySeminars() {
  const router = useRouter();
  const { wellness, mode } = useTheme();
  const ui = useUi();
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-GB" : "el-GR";
  const state = useLoad<Signup[]>("/members/me/seminars", []);
  const today = athensToday();

  const items = (state.data || [])
    .slice()
    .sort((a, b) => (a.start_date || "").localeCompare(b.start_date || ""));
  if (!items.length) return null;

  const upcoming = items.filter((s) => (s.end_date || s.start_date || "") >= today);
  const next = upcoming[0];

  const countdown = (() => {
    if (!next?.start_date) return "";
    const d = daysBetween(today, next.start_date);
    if (d <= 0) return t("Σήμερα", "Today");
    if (d === 1) return t("Αύριο", "Tomorrow");
    return t(`σε ${d} ημέρες`, `in ${d} days`);
  })();

  const whenText = (s: Signup) => {
    if (s.date_text) return s.date_text;
    if (!s.start_date) return "";
    const fmt = (i: string) => {
      const [y, m, d] = i.split("-").map(Number);
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(y, m - 1, d));
    };
    return s.end_date && s.end_date !== s.start_date
      ? `${fmt(s.start_date)} – ${fmt(s.end_date)}`
      : fmt(s.start_date);
  };

  return (
    <View testID="my-seminars-section" style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Text style={[ui.heading, { flexShrink: 1 }]}>
          {t("Οι εκδηλώσεις μου", "My events")}
        </Text>
        {!!countdown && !!next && (
          <View
            testID="my-seminars-countdown"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: wellness.lavender,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Ionicons name="time-outline" size={14} color={wellness.lavenderInk} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: wellness.lavenderInk,
              }}
            >
              {t("Επόμενη", "Next")}: {countdown}
            </Text>
          </View>
        )}
      </View>

      {items.map((s) => {
        const past = (s.end_date || s.start_date || "") < today;
        return (
          <Pressable
            key={s.ref}
            testID={`my-seminar-row-${s.ref}`}
            accessibilityRole={s.url ? "link" : undefined}
            onPress={() => s.url && router.push(s.url as any)}
            style={({ pressed }) => ({
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              backgroundColor: wellness.white,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: s.ref === next?.ref ? wellness.lavenderInk : wellness.line,
              padding: 10,
              boxShadow: cardShadow(mode === "dark"),
              opacity: pressed ? 0.9 : past ? 0.6 : 1,
            })}
          >
            {s.image ? (
              <ManagedImage
                source={{ uri: s.image }}
                accessibilityLabel={s.title}
                resizeMode="cover"
                style={{ width: 56, height: 56, borderRadius: 10 }}
              />
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  backgroundColor: wellness.blueMist,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="calendar" size={22} color={wellness.slate} />
              </View>
            )}
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                numberOfLines={2}
                style={[ui.body, { fontSize: 14, fontWeight: "600", color: wellness.ink }]}
              >
                {s.title}
              </Text>
              {!!whenText(s) && (
                <Text style={{ fontSize: 12, color: wellness.muted }}>
                  {whenText(s)}
                </Text>
              )}
              {!!s.location && (
                <Text style={{ fontSize: 12, color: wellness.muted }}>
                  {s.location}
                </Text>
              )}
            </View>
            {s.url && (
              <Ionicons name="chevron-forward" size={18} color={wellness.muted} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default MySeminars;
