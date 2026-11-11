import React, { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { ContentItem, useUi, useLoad, Status } from "./Wellness";
import { ManagedImage } from "./ManagedImage";

/** A single dated happening placed on the calendar grid. */
type CalEvent = {
  key: string;
  title: string;
  dateISO: string; // the day the pin sits on (YYYY-MM-DD)
  dateText?: string;
  location?: string;
  image?: string;
  past: boolean;
  open: () => void;
};

type LiveTraining = {
  slug: string;
  title: string;
  image?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  active?: boolean;
};

const WEEKDAYS = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];

const p2 = (n: number) => String(n).padStart(2, "0");
const isISO = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "");

const athensToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric" }).format(
    new Date(y, m, 1),
  );

const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
};

export function EventsCalendar({ mode }: { mode?: "training" | "events" }) {
  const router = useRouter();
  const { wellness } = useTheme();
  const ui = useUi();
  const PURPLE = wellness.lavenderInk; // επερχόμενες
  const GREY = wellness.muted; // ολοκληρωμένες
  const trainings = useLoad<{ items: LiveTraining[] }>("/trainings/catalog", {
    items: [],
  });
  const content = useLoad<ContentItem[]>("/content/public", []);
  const today = athensToday();

  const events = useMemo<CalEvent[]>(() => {
    const out: CalEvent[] = [];
    // Εκπαιδευτικά σεμινάρια
    if (mode !== "events")
      for (const t of trainings.data.items) {
        const dateISO = isISO(t.start_date) || isISO(t.end_date);
        if (!dateISO) continue;
        const endISO = isISO(t.end_date) || dateISO;
        out.push({
          key: "t-" + t.slug,
          title: t.title,
          dateISO,
          dateText: t.date,
          location: t.location,
          image: t.image,
          past: typeof t.active === "boolean" ? !t.active : endISO < today,
          open: () => router.push(`/seminar/${t.slug}` as any),
        });
      }
    // Εκδηλώσεις / sound baths από το CMS
    if (mode !== "training")
      for (const item of content.data) {
        const p = item.published;
        if (p.section !== "events") continue;
        const dateISO = isISO(p.event_date) || isISO(p.event_end_date);
        if (!dateISO) continue;
        const endISO = isISO(p.event_end_date) || dateISO;
        const url = p.action_url;
        out.push({
          key: "e-" + item.id,
          title: p.title,
          dateISO,
          dateText: p.event_date,
          location: p.event_location,
          image: p.image_url,
          past: endISO < today,
          open: url ? () => void Linking.openURL(url) : () => {},
        });
      }
    return out;
  }, [trainings.data, content.data, today, router, mode]);

  const byDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const e of events) (map[e.dateISO] ||= []).push(e);
    return map;
  }, [events]);

  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState<string>("");
  const initialized = useRef(false);

  // Μόλις φορτώσουν τα δεδομένα, μετακινήσου στην πλησιέστερη επερχόμενη εκδήλωση.
  useEffect(() => {
    if (initialized.current || !events.length) return;
    initialized.current = true;
    const upcoming = events
      .filter((e) => e.dateISO >= today)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const target = (upcoming[0] || events.sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0])
      .dateISO;
    const [y, m] = target.split("-").map(Number);
    setCursor({ y, m: m - 1 });
    setSelected(target);
  }, [events, today]);

  const { y, m } = cursor;
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Δευτέρα = 0
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
  const loading = trainings.loading || content.loading;

  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>
        {mode === "training" ? "Ημερολόγιο εκπαιδευτικών" : "Ημερολόγιο εκδηλώσεων"}
      </Text>
      <View
        style={[ui.card, { maxWidth: 460, width: "100%", alignSelf: "center", gap: 14 }]}
      >
        {/* Πλοήγηση μήνα */}
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
            accessibilityLabel="Προηγούμενος μήνας"
            style={{ padding: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={wellness.ink} />
          </Pressable>
          <Text
            accessibilityRole="header"
            style={[ui.label, { fontSize: 15, letterSpacing: 0.4, textTransform: "capitalize" }]}
          >
            {monthLabel(y, m)}
          </Text>
          <Pressable
            onPress={() => step(1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Επόμενος μήνας"
            style={{ padding: 8 }}
          >
            <Ionicons name="chevron-forward" size={22} color={wellness.ink} />
          </Pressable>
        </View>

        {/* Ημέρες εβδομάδας */}
        <View style={{ flexDirection: "row" }}>
          {WEEKDAYS.map((w) => (
            <Text
              key={w}
              style={[
                ui.body,
                { flex: 1, textAlign: "center", fontSize: 12, color: wellness.muted },
              ]}
            >
              {w}
            </Text>
          ))}
        </View>

        {/* Πλέγμα ημερών */}
        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: "row" }}>
            {week.map((day, di) => {
              if (day === null)
                return <View key={di} style={{ flex: 1, aspectRatio: 1 }} />;
              const iso = `${y}-${p2(m + 1)}-${p2(day)}`;
              const dayEvents = byDay[iso];
              const hasEvents = !!dayEvents?.length;
              const dotColor = hasEvents
                ? dayEvents!.some((e) => !e.past)
                  ? PURPLE
                  : GREY
                : "transparent";
              const isToday = iso === today;
              const isSelected = iso === selected;
              return (
                <Pressable
                  key={di}
                  disabled={!hasEvents}
                  onPress={() => {
                    setSelected(iso);
                    if (dayEvents!.length === 1) dayEvents![0].open();
                  }}
                  accessibilityRole={hasEvents ? "button" : undefined}
                  accessibilityLabel={
                    hasEvents ? `${day}, ${dayEvents!.length} εκδήλωση/εις` : undefined
                  }
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: isSelected ? wellness.lavender : "transparent",
                    borderWidth: isToday ? 1 : 0,
                    borderColor: wellness.lavenderInk,
                  }}
                >
                  <Text
                    style={[
                      ui.body,
                      {
                        fontSize: 14,
                        color: hasEvents ? wellness.ink : wellness.muted,
                        fontWeight: hasEvents ? "700" : "400",
                      },
                    ]}
                  >
                    {day}
                  </Text>
                  <View
                    style={{
                      marginTop: 3,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: dotColor,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        ))}

        {/* Υπόμνημα */}
        <View style={{ flexDirection: "row", gap: 18, flexWrap: "wrap", paddingTop: 2 }}>
          <Legend color={PURPLE} label="Επερχόμενες" />
          <Legend color={GREY} label="Ολοκληρωμένες" />
        </View>
      </View>

      {/* Εκδηλώσεις επιλεγμένης ημέρας */}
      {!!selectedEvents.length && (
        <View style={{ gap: 10 }}>
          <Text style={[ui.label, { fontSize: 13, color: wellness.ink }]}>
            {longDate(selected)}
          </Text>
          {selectedEvents.map((e) => (
            <Pressable
              key={e.key}
              onPress={e.open}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: wellness.line,
                backgroundColor: wellness.white,
              }}
            >
              {e.image ? (
                <ManagedImage
                  source={{ uri: e.image }}
                  accessibilityLabel={e.title}
                  resizeMode="cover"
                  style={{ width: 52, height: 52, borderRadius: 10 }}
                />
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    backgroundColor: wellness.ice,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="musical-notes-outline" size={22} color={e.past ? GREY : PURPLE} />
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[ui.body, { fontSize: 15, color: wellness.ink }]} numberOfLines={2}>
                  {e.title}
                </Text>
                <Text style={[ui.body, { fontSize: 12 }]} numberOfLines={1}>
                  {[e.dateText, e.location].filter(Boolean).join(" · ") ||
                    (e.past ? "Ολοκληρώθηκε" : "Επερχόμενη")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={wellness.muted} />
            </Pressable>
          ))}
        </View>
      )}

      {loading && <Status state={trainings.loading ? trainings : content} />}
      {!loading && !events.length && (
        <Text style={ui.body}>Δεν υπάρχουν ακόμη καταχωρημένες ημερομηνίες.</Text>
      )}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const ui = useUi();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={[ui.body, { fontSize: 12 }]}>{label}</Text>
    </View>
  );
}
