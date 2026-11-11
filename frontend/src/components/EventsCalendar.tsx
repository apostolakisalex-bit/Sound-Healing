import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";
import { useWarm } from "@/src/theme/warm";
import { FeaturedEvent, UpcomingRow } from "./UpcomingSessions";
import {
  eachISO,
  longDate,
  monthLabel,
  openSchedule,
  p2,
  useSchedule,
} from "@/src/content/schedule";

export function EventsCalendar({ mode }: { mode?: "training" | "events" | "all" }) {
  const router = useRouter();
  const ui = useUi();
  const warm = useWarm();
  const { t, language } = useLanguage();
  const dateLocale = language === "en" ? "en-GB" : "el-GR";
  const WEEKDAYS =
    language === "en"
      ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
      : ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];

  const { events, loading, today } = useSchedule(
    mode === "training" ? "training" : mode === "events" ? "events" : "all",
  );

  const [filter, setFilter] = useState<"all" | "upcoming">("all");
  const filtered = useMemo(
    () => (filter === "upcoming" ? events.filter((e) => !e.past) : events),
    [events, filter],
  );
  const upcomingCount = useMemo(
    () => events.filter((e) => !e.past).length,
    [events],
  );

  const byDay = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const e of filtered)
      for (const iso of eachISO(e.dateISO, e.endISO)) (map[iso] ||= []).push(e);
    return map;
  }, [filtered]);

  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState("");
  const initialized = useRef(false);

  // Jump to the nearest upcoming happening once data loads. If nothing is
  // upcoming, we deliberately surface nothing (no stale/past event card).
  useEffect(() => {
    if (initialized.current || !events.length) return;
    initialized.current = true;
    const upcoming = events.filter((e) => e.endISO >= today);
    if (!upcoming.length) return;
    const target = upcoming[0].dateISO;
    const [y, m] = target.split("-").map(Number);
    setCursor({ y, m: m - 1 });
    setSelected(target);
  }, [events, today]);

  // Drop a stale selection when the active filter removes its events.
  useEffect(() => {
    if (selected && !byDay[selected]) setSelected("");
  }, [byDay, selected]);

  const { y, m } = cursor;
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const step = (delta: number) => {
    const next = new Date(y, m + delta, 1);
    setCursor({ y: next.getFullYear(), m: next.getMonth() });
  };

  const selectedEvents = selected ? byDay[selected] || [] : [];
  const nextUpcoming = useMemo(
    () => events.filter((e) => !e.past && e.endISO >= today)[0],
    [events, today],
  );
  const featured = selectedEvents[0] || nextUpcoming;
  const extra = selectedEvents.slice(1);

  const FilterPill = ({
    value,
    label,
  }: {
    value: "all" | "upcoming";
    label: string;
  }) => {
    const active = filter === value;
    return (
      <Pressable
        onPress={() => setFilter(value)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 999,
          backgroundColor: active ? warm.fill : "transparent",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: active ? warm.onFill : warm.muted,
            fontWeight: active ? "700" : "500",
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={[ui.heading, { color: warm.ink }]}>
        {mode === "training"
          ? t("Ημερολόγιο εκπαιδευτικών", "Training calendar")
          : t("Ημερολόγιο εκδηλώσεων", "Events calendar")}
      </Text>

      <View
        style={{
          maxWidth: 460,
          width: "100%",
          alignSelf: "center",
          gap: 14,
          borderRadius: 28,
          padding: 16,
          backgroundColor: warm.card,
          borderWidth: 1,
          borderColor: warm.border,
          boxShadow: warm.shadow,
        }}
      >
        {/* Month navigation */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => step(-1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t("Προηγούμενος μήνας", "Previous month")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: warm.cardAlt,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={warm.ink} />
          </Pressable>
          <Text
            accessibilityRole="header"
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: warm.ink,
              textTransform: "capitalize",
            }}
          >
            {monthLabel(y, m, dateLocale)}
          </Text>
          <Pressable
            onPress={() => step(1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t("Επόμενος μήνας", "Next month")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: warm.cardAlt,
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={warm.ink} />
          </Pressable>
        </View>

        {/* Filter pills */}
        <View
          style={{
            flexDirection: "row",
            alignSelf: "center",
            gap: 4,
            padding: 4,
            borderRadius: 999,
            backgroundColor: warm.cardAlt,
          }}
        >
          <FilterPill value="all" label={t("Όλα", "All")} />
          <FilterPill
            value="upcoming"
            label={`${t("Επερχόμενα", "Upcoming")}${upcomingCount ? ` ${upcomingCount}` : ""}`}
          />
        </View>

        {/* Weekday headers */}
        <View style={{ flexDirection: "row" }}>
          {WEEKDAYS.map((w) => (
            <Text
              key={w}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 12,
                color: warm.muted,
              }}
            >
              {w}
            </Text>
          ))}
        </View>

        {/* Day grid */}
        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: "row", gap: 4 }}>
            {week.map((day, di) => {
              if (day === null)
                return <View key={di} style={{ flex: 1, aspectRatio: 1 }} />;
              const iso = `${y}-${p2(m + 1)}-${p2(day)}`;
              const dayEvents = byDay[iso];
              const hasEvents = !!dayEvents?.length;
              const upcoming = hasEvents && dayEvents!.some((e) => !e.past);
              const isSelected = iso === selected && hasEvents;
              const isToday = iso === today;
              const dotColor =
                !isSelected && hasEvents
                  ? upcoming
                    ? warm.fill
                    : warm.muted
                  : "transparent";
              return (
                <Pressable
                  key={di}
                  disabled={!hasEvents}
                  onPress={() => setSelected(iso)}
                  accessibilityRole={hasEvents ? "button" : undefined}
                  accessibilityLabel={
                    hasEvents
                      ? `${day}, ${dayEvents!.length} ${t("εκδήλωση/εις", "event(s)")}`
                      : undefined
                  }
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    backgroundColor: isSelected
                      ? warm.fill
                      : hasEvents
                        ? warm.cardAlt
                        : "transparent",
                    borderWidth: isToday && !isSelected ? 1.5 : 0,
                    borderColor: warm.fill,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isSelected
                        ? warm.onFill
                        : hasEvents
                          ? warm.ink
                          : warm.muted,
                      fontWeight: hasEvents ? "700" : "400",
                    }}
                  >
                    {day}
                  </Text>
                  <View
                    style={{
                      marginTop: 3,
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: dotColor,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        ))}

        {/* Legend */}
        <View style={{ flexDirection: "row", gap: 18, paddingTop: 2 }}>
          <Legend color={warm.fill} label={t("Επερχόμενες", "Upcoming")} />
          <Legend color={warm.muted} label={t("Ολοκληρωμένες", "Completed")} />
        </View>
      </View>

      {/* Featured event for the selected day (or next upcoming) */}
      {featured && (
        <View style={{ gap: 10 }}>
          {mode === "training" && (
            <Text style={[ui.heading, { color: warm.ink }]}>
              {t("Τι ακολουθεί", "What's Next")}
            </Text>
          )}
          <Text style={[ui.label, { color: warm.ink }]}>
            {selectedEvents.length
              ? longDate(selected, dateLocale)
              : t("Επόμενη εκδήλωση", "Next event")}
          </Text>
          <FeaturedEvent
            event={featured}
            cta={
              featured.kind === "training"
                ? t("Πληροφορίες & εγγραφή", "Details & registration")
                : t("Πληροφορίες & συμμετοχή", "Details & participation")
            }
            onPress={() => openSchedule(router, featured)}
          />
          {extra.map((e) => (
            <UpcomingRow
              key={e.key}
              event={e}
              onPress={() => openSchedule(router, e)}
            />
          ))}
        </View>
      )}

      {loading && <Text style={ui.body}>{t("Φόρτωση…", "Loading…")}</Text>}
      {!loading && !events.length && (
        <Text style={ui.body}>
          {t(
            "Δεν υπάρχουν ακόμη καταχωρημένες ημερομηνίες.",
            "No dates have been scheduled yet.",
          )}
        </Text>
      )}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const ui = useUi();
  const warm = useWarm();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <View
        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}
      />
      <Text style={[ui.body, { fontSize: 12, color: warm.muted }]}>{label}</Text>
    </View>
  );
}
