import { Linking } from "react-native";
import { useMemo } from "react";
import { useLoad, type ContentItem } from "@/src/components/Wellness";

/** A single dated happening (training seminar or CMS event) for the calendar. */
export type ScheduleEvent = {
  key: string;
  title: string;
  dateISO: string; // YYYY-MM-DD the pin sits on
  endISO: string;
  dateText?: string;
  time?: string;
  location?: string;
  image?: string;
  past: boolean;
  kind: "training" | "event";
  slug?: string;
  url?: string;
};

type LiveTraining = {
  slug: string;
  title: string;
  image?: string;
  date?: string;
  time?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  active?: boolean;
};

export const p2 = (n: number) => String(n).padStart(2, "0");
const isISO = (s?: string) =>
  s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";

/** Inclusive list of YYYY-MM-DD strings from start..end (capped at 60 days). */
export function eachISO(start: string, end: string): string[] {
  const out: string[] = [];
  if (!start) return out;
  const [ys, ms, ds] = start.split("-").map(Number);
  const cur = new Date(ys, ms - 1, ds);
  let endD = cur;
  if (end) {
    const [ye, me, de] = end.split("-").map(Number);
    endD = new Date(ye, me - 1, de);
  }
  let guard = 0;
  while (cur <= endD && guard < 60) {
    out.push(`${cur.getFullYear()}-${p2(cur.getMonth() + 1)}-${p2(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return out;
}

export const athensToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export const monthLabel = (y: number, m: number, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(y, m, 1),
  );

export const longDate = (iso: string, locale: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
};

/** Loads trainings + CMS events and normalises them into dated ScheduleEvents. */
export function useSchedule(mode: "training" | "events" | "all" = "all") {
  const trainings = useLoad<{ items: LiveTraining[] }>("/trainings/catalog", {
    items: [],
  });
  const content = useLoad<ContentItem[]>("/content/public", []);
  const today = athensToday();

  const events = useMemo<ScheduleEvent[]>(() => {
    const out: ScheduleEvent[] = [];
    if (mode !== "events")
      for (const tr of trainings.data.items) {
        const dateISO = isISO(tr.start_date) || isISO(tr.end_date);
        if (!dateISO) continue;
        const endISO = isISO(tr.end_date) || dateISO;
        out.push({
          key: "t-" + tr.slug,
          title: tr.title,
          dateISO,
          endISO,
          dateText: tr.date,
          time: tr.time,
          location: tr.location,
          image: tr.image,
          past: typeof tr.active === "boolean" ? !tr.active : endISO < today,
          kind: "training",
          slug: tr.slug,
        });
      }
    if (mode !== "training")
      for (const item of content.data) {
        const p = item.published;
        if (p.section !== "events") continue;
        const dateISO = isISO(p.event_date) || isISO(p.event_end_date);
        if (!dateISO) continue;
        const endISO = isISO(p.event_end_date) || dateISO;
        out.push({
          key: "e-" + item.id,
          title: p.title,
          dateISO,
          endISO,
          dateText: p.event_date,
          time: p.event_time,
          location: p.event_location,
          image: p.image_url,
          past: endISO < today,
          kind: "event",
          url: p.action_url,
        });
      }
    return out.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, [trainings.data, content.data, today, mode]);

  return {
    events,
    loading: trainings.loading || content.loading,
    today,
  };
}

export function openSchedule(
  router: { push: (href: any) => void },
  e: ScheduleEvent,
) {
  if (e.kind === "training" && e.slug) router.push(`/seminar/${e.slug}`);
  else if (e.url) void Linking.openURL(e.url);
}
