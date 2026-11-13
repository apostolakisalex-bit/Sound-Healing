import React from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ManagedImage } from "./ManagedImage";
import { useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";
import { JoinPill } from "./JoinPill";
import { useWarm } from "@/src/theme/warm";
import { fonts } from "@/src/theme";
import {
  longDate,
  openSchedule,
  useSchedule,
  type ScheduleEvent,
} from "@/src/content/schedule";

const semi =
  Platform.OS === "web" ? `${fonts.bodySemi}, Arial, sans-serif` : fonts.bodySemi;
const body =
  Platform.OS === "web" ? `${fonts.body}, Arial, sans-serif` : fonts.body;

/** Large photo-led "next session" card (Bliss featured card). */
export function FeaturedEvent({
  event,
  onPress,
  cta,
}: {
  event: ScheduleEvent;
  onPress: () => void;
  cta: string;
}) {
  const warm = useWarm();
  const { language } = useLanguage();
  const locale = language === "en" ? "en-GB" : "el-GR";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={({ pressed }) => ({
        flexDirection: "row",
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: warm.card,
        borderWidth: 1,
        borderColor: warm.border,
        boxShadow: warm.shadow,
        minHeight: 158,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flex: 1, minWidth: 0, padding: 18, gap: 7, justifyContent: "center" }}>
        <Text style={{ fontFamily: semi, fontSize: 22, color: warm.ink }}>
          {event.time || longDate(event.dateISO, locale)}
        </Text>
        {!!event.time && (
          <Text style={{ fontFamily: body, fontSize: 13, color: warm.muted }}>
            {longDate(event.dateISO, locale)}
          </Text>
        )}
        <Text
          numberOfLines={2}
          style={{ fontFamily: semi, fontSize: 16, lineHeight: 22, color: warm.ink }}
        >
          {event.title}
        </Text>
        {!!event.location && (
          <Text
            numberOfLines={1}
            style={{ fontFamily: body, fontSize: 13, color: warm.muted }}
          >
            {event.location}
          </Text>
        )}
        <View style={{ marginTop: 8 }}>
          <JoinPill label={cta} />
        </View>
      </View>
      {event.image ? (
        <ManagedImage
          source={{ uri: event.image }}
          accessibilityLabel={event.title}
          resizeMode="cover"
          style={{ width: 128, alignSelf: "stretch" }}
        />
      ) : (
        <View
          style={{
            width: 128,
            alignSelf: "stretch",
            backgroundColor: warm.cardAlt,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="musical-notes-outline" size={30} color={warm.muted} />
        </View>
      )}
    </Pressable>
  );
}

/** Compact dated row used in lists (profile & extra same-day events). */
export function UpcomingRow({
  event,
  onPress,
}: {
  event: ScheduleEvent;
  onPress: () => void;
}) {
  const warm = useWarm();
  const { language } = useLanguage();
  const locale = language === "en" ? "en-GB" : "el-GR";
  const meta = [longDate(event.dateISO, locale), event.time, event.location]
    .filter(Boolean)
    .join(" · ");
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 18,
        backgroundColor: warm.cardAlt,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {event.image ? (
        <ManagedImage
          source={{ uri: event.image }}
          accessibilityLabel={event.title}
          resizeMode="cover"
          style={{ width: 54, height: 54, borderRadius: 14 }}
        />
      ) : (
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            backgroundColor: warm.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="musical-notes-outline"
            size={22}
            color={event.past ? warm.muted : warm.ink}
          />
        </View>
      )}
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          numberOfLines={2}
          style={{ fontFamily: semi, fontSize: 15, color: warm.ink }}
        >
          {event.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontFamily: body, fontSize: 12, color: warm.muted }}
        >
          {meta}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={warm.muted} />
    </Pressable>
  );
}

/** Warm greeting header for the student profile. */
export function ProfileGreeting({
  name,
  image,
}: {
  name: string;
  image?: string;
}) {
  const warm = useWarm();
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greet =
    hour < 12
      ? t("Καλημέρα", "Good morning")
      : hour < 18
        ? t("Καλησπέρα", "Good afternoon")
        : t("Καλό βράδυ", "Good evening");
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        borderRadius: 24,
        padding: 20,
        backgroundColor: warm.card,
        borderWidth: 1,
        borderColor: warm.border,
        boxShadow: warm.shadow,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: warm.cardAlt,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ width: 64, height: 64 }} />
        ) : (
          <Ionicons name="person-outline" size={28} color={warm.muted} />
        )}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: body, fontSize: 13, color: warm.muted }}>
          {greet} 😊
        </Text>
        <Text style={{ fontFamily: semi, fontSize: 20, color: warm.ink }}>
          {name || t("Καλώς ήρθες", "Welcome")}
        </Text>
        <Text style={{ fontFamily: body, fontSize: 13, color: warm.muted }}>
          {t("Η διαδρομή σου στον ήχο", "Your journey in sound")}
        </Text>
      </View>
    </View>
  );
}

/** Upcoming sessions block for the student profile. */
export function UpcomingSessions() {
  const router = useRouter();
  const ui = useUi();
  const warm = useWarm();
  const { t } = useLanguage();
  const { events, loading } = useSchedule("all");
  const upcoming = events.filter((e) => !e.past).slice(0, 3);
  if (loading || !upcoming.length) return null;
  return (
    <View style={{ gap: 12 }}>
      <Text style={[ui.heading, { color: warm.ink }]}>
        {t("Επερχόμενα", "Upcoming")}
      </Text>
      <FeaturedEvent
        event={upcoming[0]}
        cta={t("Συμμετοχή", "Join")}
        onPress={() => openSchedule(router, upcoming[0])}
      />
      {upcoming.slice(1).map((e) => (
        <UpcomingRow
          key={e.key}
          event={e}
          onPress={() => openSchedule(router, e)}
        />
      ))}
    </View>
  );
}
