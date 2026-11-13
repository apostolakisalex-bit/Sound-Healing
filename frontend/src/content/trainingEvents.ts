import { type ContentItem } from "@/src/components/Wellness";

export type LiveSeminar = {
  slug: string;
  title: string;
  image?: string;
  date?: string;
  time?: string;
  end_date?: string;
  location?: string;
  level?: number | null;
  active?: boolean;
};

export type BlogTrainingPost = {
  id: number;
  title: string;
  image?: string | null;
  date?: string;
  event_start?: string | null;
  event_end?: string | null;
  category: string;
};

// Level parsed from a seminar/blog title ("Level 1", "2ο Επίπεδο", "Βασικό Επίπεδο").
const levelFromTitle = (title: string): number | null => {
  const low = (title || "").toLowerCase();
  const m = low.match(/level\s*([1-4])/) || low.match(/([1-4])\s*ο?\s*επίπεδο/);
  if (m) return Number(m[1]);
  if (low.includes("βασικό επίπεδο")) return 1;
  return null;
};
const titleIsGreek = (s: string) => /[\u0370-\u03ff]/.test(s || "");

/**
 * Single source of truth for the ACTIVE trainings/events list shown both on the
 * Εκπαιδευτικά page and on the Home "Εκδηλώσεις & Εκπαιδευτικά" section. It merges
 * CMS entries, catalog seminars, CMS events and blog posts, drops past items and
 * de-duplicates by title, sorted by the nearest end date first.
 */
export function computeActiveTrainingEvents(
  content: ContentItem[],
  seminars: LiveSeminar[],
  blog: BlogTrainingPost[],
  today: string,
  language: string,
  t: (el: string, en: string) => string,
): ContentItem[] {
  const visibleItems = content.filter(
    (i) =>
      !i.published.event_end_date ||
      i.published.event_end_date >= today ||
      ["training", "events"].includes(i.published.section || ""),
  );
  const entries = visibleItems.filter(
    (i) =>
      !["hero", "site_settings"].includes(i.published.kind) &&
      (i.published.section || "home") === "training",
  );
  const intro = entries.find((i) => i.published.kind === "page");

  const seminarItems: ContentItem[] = seminars.map((sem) => ({
    id: "seminar-" + sem.slug,
    completed:
      typeof sem.active === "boolean"
        ? !sem.active
        : !!sem.end_date && sem.end_date < today,
    published: {
      title: sem.title,
      summary: "",
      body: "",
      kind: "event",
      section: "training",
      image_url: sem.image,
      event_date: sem.date,
      event_time: sem.time,
      event_location: sem.location,
      event_end_date: sem.end_date,
      action_url: `/seminar/${sem.slug}`,
      action_label: t("Πληροφορίες & εγγραφή", "Details & registration"),
      level_id: null,
      media_url: "",
    },
  }));

  const fmtDay = (iso: string) =>
    new Intl.DateTimeFormat(language === "en" ? "en-GB" : "el-GR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso + "T00:00:00"));
  const keyOf = (end: string, level: number | null) => `${end}|${level ?? "x"}`;
  const seen = new Set(
    seminars.map((s) => keyOf(s.end_date || "", s.level ?? null)),
  );
  const wantGreek = language !== "en";
  const sorted = [...blog]
    .filter((p) => p.category === "training" || p.category === "events")
    .sort(
      (a, b) =>
        (titleIsGreek(a.title) === wantGreek ? 0 : 1) -
        (titleIsGreek(b.title) === wantGreek ? 0 : 1),
    );
  const blogItems: ContentItem[] = [];
  for (const p of sorted) {
    const start = p.event_start || p.date || "";
    const end = p.event_end || start;
    const key = keyOf(end, levelFromTitle(p.title));
    if (!start || seen.has(key)) continue;
    seen.add(key);
    const dateLabel =
      p.event_end && p.event_end !== start
        ? `${fmtDay(start)} – ${fmtDay(p.event_end)}`
        : fmtDay(start);
    blogItems.push({
      id: "blog-" + p.id,
      published: {
        title: p.title,
        summary: "",
        body: "",
        kind: "event",
        section: p.category,
        image_url: p.image || "",
        event_date: dateLabel,
        event_time: "",
        event_location: "",
        event_end_date: end,
        action_url: `/article/${p.id}`,
        action_label: t("Πληροφορίες", "Details"),
        level_id: null,
        media_url: "",
      },
    });
  }

  const eventCmsItems: ContentItem[] = visibleItems.filter(
    (i) =>
      (i.published.section || "") === "events" &&
      ["event", "announcement"].includes(i.published.kind),
  );

  const isPastItem = (it: ContentItem) =>
    it.completed ??
    (!!it.published.event_end_date && it.published.event_end_date < today);

  const merged = [
    ...entries.filter((item) => item.id !== intro?.id),
    ...seminarItems,
    ...eventCmsItems,
    ...blogItems,
  ];
  const seenTitle = new Set<string>();
  return merged
    .filter((it) => !isPastItem(it))
    .filter((it) => {
      const k = (it.published.title || "").trim().toLowerCase();
      if (!k || seenTitle.has(k)) return false;
      seenTitle.add(k);
      return true;
    })
    .sort((a, b) =>
      (a.published.event_end_date || "9999").localeCompare(
        b.published.event_end_date || "9999",
      ),
    );
}
