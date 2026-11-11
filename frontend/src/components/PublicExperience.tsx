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

const sections = {
  soundhealing: {
    title: "Γνώρισε την ηχοθεραπεία.",
    label: "Ηχοθεραπεία",
    summary: "Ο ήχος ως αφετηρία για ακρόαση, χαλάρωση και προσωπική εμπειρία.",
    body: "Οι ηχογαβάθες, τα gong και άλλα ακουστικά όργανα συνθέτουν μια εμπειρία ήχου. Στην επίσημη σελίδα μπορείς να διαβάσεις την προσέγγιση του Μανώλη και να γνωρίσεις τα όργανα που χρησιμοποιεί.",
  },
  services: {
    title: "Βρες τον δικό σου χώρο στον ήχο.",
    label: "Υπηρεσίες",
    summary:
      "Διαδραστικά εργαστήρια, εταιρικά προγράμματα και συμβουλευτική για ξενοδοχεία και Spa.",
    body: "Ο Μανώλης σχεδιάζει εργαστήρια και ομιλίες για ομάδες, εκπαιδευτικούς φορείς και διοργανώσεις ευεξίας. Συνεργάζεται με επιχειρήσεις για εταιρικές εκδηλώσεις και προσφέρει συμβουλευτική σε ξενοδοχεία και Spa για τον χώρο, τα όργανα και την εκπαίδευση του προσωπικού.",
  },
  training: {
    title: "Μάθε. Εξασκήσου. Εξελίξου.",
    label: "Εκπαιδευτικά",
    summary:
      "Τέσσερα προοδευτικά Levels που συνδυάζουν θεωρία, βιωματική μάθηση και πρακτική.",
    body: "Η εκπαιδευτική διαδρομή περνά από τις Himalayan singing bowls και την ατομική πρακτική στον συντονισμό ομάδων και την επαγγελματική ανάπτυξη. Η δημιουργία λογαριασμού είναι ξεχωριστή από την εγγραφή σε εκπαιδευτικό τμήμα.",
  },
  about: {
    title: "Μανώλης Ζωγραφάκης",
    label: "Σχετικά",
    summary: "Ηχοθεραπευτής, μουσικός παραγωγός και συντονιστής Breathwork.",
    body: "Ο Μανώλης Ζωγραφάκης είναι πιστοποιημένος ηχοθεραπευτής, μέλος των ISTA και IPHM, συντονιστής Breathwork και μουσικός παραγωγός. Η προσωπική του διαδρομή συνδέει τη μουσική με τον διαλογισμό Vipassana. Ξεκίνησε με κλασική κιθάρα και συνέχισε ως παραγωγός ηλεκτρονικής μουσικής με το όνομα ΜΑΜΑ.\n\nΜετά τις σπουδές του στο Goldsmiths του Λονδίνου, γνώρισε τις ηχογαβάθες και τα gong στο Βερολίνο. Μαθήτευσε δίπλα στην Eléna Sofia Melnishca και συνέχισε την εκπαίδευσή του στο Νεπάλ και στο Sound Healing Academy.\n\nΑπό το 2020 έχει βάση τα Χανιά. Προσφέρει ιδιωτικές και ομαδικές συνεδρίες, εκπαιδευτικά σεμινάρια, εργαστήρια και συνεργασίες με επιχειρήσεις και χώρους ευεξίας. Το 2024 συμμετείχε ως ομιλητής στο TEDxAthens.",
  },
  events: {
    title: "Συναντιόμαστε στον ήχο.",
    label: "Εκδηλώσεις",
    summary: "Sound Baths και αυτοτελείς εμπειρίες ήχου με τον Μανώλη.",
    body: "Ανακάλυψε τις δημοσιευμένες συναντήσεις παρακάτω. Για το τρέχον πρόγραμμα και πληροφορίες συμμετοχής μπορείς επίσης να επισκεφθείς το soundhealing.gr.",
  },
  journal: {
    title: "Χώρος για έμπνευση.",
    label: "Άρθρα",
    summary: "Σκέψεις γύρω από τον ήχο, την ακρόαση και την πρακτική.",
    body: "Εδώ συγκεντρώνονται τα άρθρα της ομάδας. Περισσότερα κείμενα είναι διαθέσιμα στον επίσημο ιστότοπο.",
  },
  contact: {
    title: "Ας μιλήσουμε.",
    label: "Επικοινωνία",
    summary: "Για μια συνεδρία, την εκπαίδευση ή μια συνεργασία.",
    body: "Πες μας τι σε ενδιαφέρει, ώστε να βρούμε μαζί το επόμενο βήμα. Για διαθεσιμότητα και λεπτομέρειες συμμετοχής χρησιμοποίησε την επίσημη σελίδα επικοινωνίας.",
  },
};
type Section = keyof typeof sections;
type LiveSeminar = {
  slug: string;
  title: string;
  image?: string;
  date?: string;
  time?: string;
  end_date?: string;
  location?: string;
  active?: boolean;
};
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
  const { t } = useLanguage();
  const state = useLoad<ContentItem[]>("/content/public", []);
  const seminars = useLoad<{ items: LiveSeminar[] }>("/trainings/catalog", {
    items: [],
  });
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
      ? seminars.data.items.map((t) => ({
          id: "seminar-" + t.slug,
          completed:
            typeof t.active === "boolean"
              ? !t.active
              : !!t.end_date && t.end_date < today,
          published: {
            title: t.title,
            summary: "",
            body: "",
            kind: "event",
            section: "training",
            image_url: t.image,
            event_date: t.date,
            event_time: t.time,
            event_location: t.location,
            event_end_date: t.end_date,
            action_url: `/seminar/${t.slug}`,
            action_label: "Πληροφορίες & εγγραφή",
            level_id: null,
            media_url: "",
          },
        }))
      : [];
  return (
    <Shell
      publicPage
      hideHeader={!section}
      siteSettings={settings}
      eyebrow={page?.label || ""}
      title={valid ? "" : t("Η σελίδα δεν βρέθηκε", "Page not found")}
    >
      <Head>
        <title>{page?.label || "Καλώς ήρθες"} · Sound Healing Greece</title>
        <meta
          name="description"
          content={
            intro?.published.summary ||
            page?.summary ||
            "Εμπειρίες ήχου, εκπαίδευση και προσωπική πρακτική με το Sound Healing Greece."
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
            (section === "about" ? "Μανώλης Ζωγραφάκης" : title)
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
        <EventsCalendar mode={section === "training" ? "training" : "events"} />
      )}
      {(section === "events" || section === "training") && (
        <EventGrid
          training={section === "training"}
          items={[
            ...entries.filter((item) => item.id !== intro?.id),
            ...seminarItems,
          ]}
        />
      )}
      {(section === "events" || section === "training") && (
        <BlogList section={section === "training" ? "training" : "events"} />
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
