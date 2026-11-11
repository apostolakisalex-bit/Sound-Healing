import { TrainingLevelCards } from "./TrainingLevels";
import { MembersChat } from "./MembersChat";
import { PublicHome } from "./PublicHome";
import { EventGrid } from "./EventGrid";
import React from "react";
import { Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import { EditorialIntro } from "./EditorialIntro";

import { SoundHealingGuide } from "./SoundHealingGuide";
import { EventsCalendar } from "./EventsCalendar";
import { BlogList } from "./BlogList";
import {
  Shell,
  useUi,
  ContentCard,
  ContentItem,
  Status,
  useLoad,
} from "./Wellness";
import { FOUNDER } from "@/src/content/public";
import { useLanguage } from "./AppNavigation";

const SECTION_KEYS = [
  "soundhealing",
  "services",
  "training",
  "about",
  "events",
  "journal",
  "contact",
] as const;
type Section = (typeof SECTION_KEYS)[number];
const makeSections = (t: (el: string, en: string) => string) => ({
  soundhealing: {
    title: t("Γνώρισε την ηχοθεραπεία.", "Discover sound healing."),
    label: t("Ηχοθεραπεία", "Sound healing"),
    summary: t(
      "Ο ήχος ως αφετηρία για ακρόαση, χαλάρωση και προσωπική εμπειρία.",
      "Sound as a starting point for listening, relaxation and personal experience.",
    ),
    body: t(
      "Οι ηχογαβάθες, τα gong και άλλα ακουστικά όργανα συνθέτουν μια εμπειρία ήχου. Στην επίσημη σελίδα μπορείς να διαβάσεις την προσέγγιση του Μανώλη και να γνωρίσεις τα όργανα που χρησιμοποιεί.",
      "Singing bowls, gongs and other acoustic instruments compose a sound experience. On the official website you can read about Manolis' approach and get to know the instruments he uses.",
    ),
  },
  services: {
    title: t("Βρες τον δικό σου χώρο στον ήχο.", "Find your own space in sound."),
    label: t("Υπηρεσίες", "Services"),
    summary: t(
      "Διαδραστικά εργαστήρια, εταιρικά προγράμματα και συμβουλευτική για ξενοδοχεία και Spa.",
      "Interactive workshops, corporate programmes and consulting for hotels and spas.",
    ),
    body: t(
      "Ο Μανώλης σχεδιάζει εργαστήρια και ομιλίες για ομάδες, εκπαιδευτικούς φορείς και διοργανώσεις ευεξίας. Συνεργάζεται με επιχειρήσεις για εταιρικές εκδηλώσεις και προσφέρει συμβουλευτική σε ξενοδοχεία και Spa για τον χώρο, τα όργανα και την εκπαίδευση του προσωπικού.",
      "Manolis designs workshops and talks for groups, educational organisations and wellness events. He collaborates with businesses for corporate events and offers consulting to hotels and spas on the space, the instruments and staff training.",
    ),
  },
  training: {
    title: t("Μάθε. Εξασκήσου. Εξελίξου.", "Learn. Practise. Grow."),
    label: t("Εκπαιδευτικά", "Training"),
    summary: t(
      "Τέσσερα προοδευτικά Levels που συνδυάζουν θεωρία, βιωματική μάθηση και πρακτική.",
      "Four progressive Levels that combine theory, experiential learning and practice.",
    ),
    body: t(
      "Η εκπαιδευτική διαδρομή περνά από τις Himalayan singing bowls και την ατομική πρακτική στον συντονισμό ομάδων και την επαγγελματική ανάπτυξη. Η δημιουργία λογαριασμού είναι ξεχωριστή από την εγγραφή σε εκπαιδευτικό τμήμα.",
      "The training path moves from Himalayan singing bowls and individual practice to facilitating groups and professional development. Creating an account is separate from enrolling in a training class.",
    ),
  },
  about: {
    title: t("Μανώλης Ζωγραφάκης", "Manolis Zografakis"),
    label: t("Σχετικά", "About"),
    summary: t(
      "Ηχοθεραπευτής, μουσικός παραγωγός και συντονιστής Breathwork.",
      "Sound healer, music producer and Breathwork facilitator.",
    ),
    body: t(
      "Ο Μανώλης Ζωγραφάκης είναι πιστοποιημένος ηχοθεραπευτής, μέλος των ISTA και IPHM, συντονιστής Breathwork και μουσικός παραγωγός. Η προσωπική του διαδρομή συνδέει τη μουσική με τον διαλογισμό Vipassana. Ξεκίνησε με κλασική κιθάρα και συνέχισε ως παραγωγός ηλεκτρονικής μουσικής με το όνομα ΜΑΜΑ.\n\nΜετά τις σπουδές του στο Goldsmiths του Λονδίνου, γνώρισε τις ηχογαβάθες και τα gong στο Βερολίνο. Μαθήτευσε δίπλα στην Eléna Sofia Melnishca και συνέχισε την εκπαίδευσή του στο Νεπάλ και στο Sound Healing Academy.\n\nΑπό το 2020 έχει βάση τα Χανιά. Προσφέρει ιδιωτικές και ομαδικές συνεδρίες, εκπαιδευτικά σεμινάρια, εργαστήρια και συνεργασίες με επιχειρήσεις και χώρους ευεξίας. Το 2024 συμμετείχε ως ομιλητής στο TEDxAthens.",
      "Manolis Zografakis is a certified sound healer, a member of ISTA and IPHM, a Breathwork facilitator and a music producer. His personal path connects music with Vipassana meditation. He started with classical guitar and continued as an electronic music producer under the name MAMA.\n\nAfter his studies at Goldsmiths in London, he discovered singing bowls and gongs in Berlin. He trained alongside Eléna Sofia Melnishca and continued his education in Nepal and at the Sound Healing Academy.\n\nSince 2020 he has been based in Chania. He offers private and group sessions, training seminars, workshops and collaborations with businesses and wellness spaces. In 2024 he spoke at TEDxAthens.",
    ),
  },
  events: {
    title: t("Συναντιόμαστε στον ήχο.", "We meet in sound."),
    label: t("Εκδηλώσεις", "Events"),
    summary: t(
      "Sound Baths και αυτοτελείς εμπειρίες ήχου με τον Μανώλη.",
      "Sound baths and standalone sound experiences with Manolis.",
    ),
    body: t(
      "Ανακάλυψε τις δημοσιευμένες συναντήσεις παρακάτω. Για το τρέχον πρόγραμμα και πληροφορίες συμμετοχής μπορείς επίσης να επισκεφθείς το soundhealing.gr.",
      "Discover the published gatherings below. For the current programme and participation details you can also visit soundhealing.gr.",
    ),
  },
  journal: {
    title: t("Χώρος για έμπνευση.", "A space for inspiration."),
    label: t("Άρθρα", "Articles"),
    summary: t(
      "Σκέψεις γύρω από τον ήχο, την ακρόαση και την πρακτική.",
      "Thoughts on sound, listening and practice.",
    ),
    body: t(
      "Εδώ συγκεντρώνονται τα άρθρα της ομάδας. Περισσότερα κείμενα είναι διαθέσιμα στον επίσημο ιστότοπο.",
      "The team's articles are gathered here. More texts are available on the official website.",
    ),
  },
  contact: {
    title: t("Ας μιλήσουμε.", "Let's talk."),
    label: t("Επικοινωνία", "Contact"),
    summary: t(
      "Για μια συνεδρία, την εκπαίδευση ή μια συνεργασία.",
      "For a session, training or a collaboration.",
    ),
    body: t(
      "Πες μας τι σε ενδιαφέρει, ώστε να βρούμε μαζί το επόμενο βήμα. Για διαθεσιμότητα και λεπτομέρειες συμμετοχής χρησιμοποίησε την επίσημη σελίδα επικοινωνίας.",
      "Tell us what you're interested in, so we can find the next step together. For availability and participation details, use the official contact page.",
    ),
  },
});
type LiveSeminar = {
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
type BlogTrainingPost = {
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
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const ui = useUi();
  return (
    <Link
      href={href as any}
      style={[
        ui.body,
        {
          color: "#80651D",
          textDecorationLine: "underline",
          paddingVertical: 12,
        },
      ]}
    >
      {children}
    </Link>
  );
}
export function PublicExperience({ section }: { section?: string }) {
  const ui = useUi();
  const { t, language } = useLanguage();
  const sections = makeSections(t);
  const state = useLoad<ContentItem[]>("/content/public", []);
  const seminars = useLoad<{ items: LiveSeminar[] }>("/trainings/catalog", {
    items: [],
  });
  const blogTraining = useLoad<BlogTrainingPost[]>("/blog?section=training", []);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const visibleItems = state.data.filter(
    (i) =>
      !i.published.event_end_date ||
      i.published.event_end_date >= today ||
      ((section === "training" || section === "events") &&
        ["training", "events"].includes(i.published.section || "")),
  );
  const settings = state.data.find(
    (i) => i.published.kind === "site_settings",
  )?.published;
  const contactUrl =
    settings?.action_url || "https://www.soundhealing.gr/el/epikoinwnia/";
  const contactLabel =
    settings?.action_label ||
    t("Επικοινώνησε με το Sound Healing Greece", "Contact Sound Healing Greece");
  const valid =
    !section || Object.prototype.hasOwnProperty.call(sections, section);
  const page = valid && section ? sections[section as Section] : null;
  const entries = visibleItems.filter(
    (i) =>
      !["hero", "site_settings"].includes(i.published.kind) &&
      (i.published.section || "home") === (section || "home"),
  );
  const intro = entries.find((i) => i.published.kind === "page");
  const title = intro?.published.title || page?.title;
  // Live seminars from the catalog → cards under the training calendar.
  // Completed seminars (curated `active:false` or past end date) fall into the archive.
  const seminarItems: ContentItem[] =
    section === "training"
      ? seminars.data.items.map((sem) => ({
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
        }))
      : [];
  // Live training announcements from the public site (blog feed). We merge them
  // with the catalog so each seminar appears ONCE: a catalog match (same end
  // date + level) wins (it keeps the in-app booking page), and the EN/GR copies
  // of the same post collapse to the current language.
  const blogItems: ContentItem[] = React.useMemo(() => {
    if (section !== "training") return [];
    const fmtDay = (iso: string) =>
      new Intl.DateTimeFormat(language === "en" ? "en-GB" : "el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(iso + "T00:00:00"));
    const keyOf = (end: string, level: number | null) =>
      `${end}|${level ?? "x"}`;
    const seen = new Set(
      seminars.data.items.map((s) => keyOf(s.end_date || "", s.level ?? null)),
    );
    const wantGreek = language !== "en";
    const sorted = [...blogTraining.data]
      .filter((p) => p.category === "training")
      .sort(
        (a, b) =>
          (titleIsGreek(a.title) === wantGreek ? 0 : 1) -
          (titleIsGreek(b.title) === wantGreek ? 0 : 1),
      );
    const out: ContentItem[] = [];
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
      out.push({
        id: "blog-" + p.id,
        published: {
          title: p.title,
          summary: "",
          body: "",
          kind: "event",
          section: "training",
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
    return out;
  }, [section, blogTraining.data, seminars.data.items, language, t]);
  return (
    <Shell
      publicPage
      hideHeader={!section}
      siteSettings={settings}
      eyebrow={page?.label || ""}
      title={valid ? "" : t("Η σελίδα δεν βρέθηκε", "Page not found")}
    >
      <Head>
        <title>{page?.label || t("Καλώς ήρθες", "Welcome")} · Sound Healing Greece</title>
        <meta
          name="description"
          content={
            intro?.published.summary ||
            page?.summary ||
            t("Εμπειρίες ήχου, εκπαίδευση και προσωπική πρακτική με το Sound Healing Greece.", "Sound experiences, training and personal practice with Sound Healing Greece.")
          }
        />
      </Head>
      {!!section && <NavLink href="/">{t("← Αρχική", "← Home")}</NavLink>}
      {page && (
        <EditorialIntro
          title={title || page.title}
          summary={intro ? intro.published.summary : page.summary}
          body={intro ? intro.published.body : page.body}
          imageUrl={
            intro?.published.image_url ||
            (section === "about" ? FOUNDER.photo : undefined)
          }
          imageAlt={
            intro?.published.image_alt ||
            (section === "about" ? t("Μανώλης Ζωγραφάκης", "Manolis Zografakis") : title)
          }
          actionLabel={intro?.published.action_label}
          actionUrl={intro?.published.action_url}
        />
      )}
      {!section && !state.loading && !state.error && (
        <PublicHome items={state.data} />
      )}
      {section === "training" && <TrainingLevelCards />}
      {section === "services" && (
        <NavLink href="https://www.soundhealing.gr/el/epipleon-yphresies/">
          {t("Αναλυτικά οι υπηρεσίες και οι συνεργασίες ↗", "All services and collaborations in detail ↗")}
        </NavLink>
      )}
      {section === "about" && (
        <NavLink href="https://www.soundhealing.gr/el/about-me/">
          {t("Η διαδρομή του Μανώλη · αναλυτικό βιογραφικό ↗", "Manolis' journey · full biography ↗")}
        </NavLink>
      )}
      {section === "soundhealing" && !intro && <SoundHealingGuide />}
      {section === "contact" && <MembersChat />}
      <Status state={state} />
      {(section === "events" || section === "training") && (
        <EventsCalendar mode={section === "training" ? "training" : "all"} />
      )}
      {(section === "events" || section === "training") && (
        <EventGrid
          training={section === "training"}
          items={[
            ...entries.filter((item) => item.id !== intro?.id),
            ...seminarItems,
            ...blogItems,
          ]}
        />
      )}
      {(section === "events" || section === "training") && (
        <BlogList
          section={section === "training" ? "training" : "events"}
          articlesOnly={section === "training"}
        />
      )}
      {entries
        .filter(
          (item) =>
            !!section &&
            section !== "events" &&
            section !== "training" &&
            !["testimonial", "partner", "social"].includes(item.published.kind),
        )
        .filter((item) => !page || item.id !== intro?.id)
        .map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      {section === "events" && (
        <NavLink href="https://www.soundhealing.gr/soundhealing-events/">
          {t("Δες το πρόγραμμα στο soundhealing.gr ↗", "See the programme on soundhealing.gr ↗")}
        </NavLink>
      )}
      {section === "journal" && (
        <NavLink href="https://www.soundhealing.gr/">
          {t("Επισκέψου τον επίσημο ιστότοπο ↗", "Visit the official website ↗")}
        </NavLink>
      )}
      {valid && !!section && (
        <View style={ui.card}>
          <Text style={ui.heading}>
            {t("Το επόμενο βήμα ξεκινά με μια συζήτηση.", "The next step starts with a conversation.")}
          </Text>
          <NavLink href={contactUrl}>{contactLabel} ↗</NavLink>
          <NavLink href="/login">{t("Έχεις ήδη λογαριασμό; Σύνδεση →", "Already have an account? Sign in →")}</NavLink>
        </View>
      )}
    </Shell>
  );
}
export default function PublicSection() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <PublicExperience key={section} section={section} />;
}
