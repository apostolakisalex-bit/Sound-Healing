import { EventGrid } from "./EventGrid";
import React from "react";
import { Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import { EditorialIntro } from "./EditorialIntro";
import { BrandHero } from "./BrandHero";
import {
  Shell,
  ui,
  ContentCard,
  ContentItem,
  Status,
  useLoad,
} from "./Wellness";
import { FOUNDER } from "@/src/content/public";

const sections = {
  services: {
    title: "Βρες τον δικό σου χώρο στον ήχο.",
    label: "Εμπειρίες",
    summary:
      "Ατομικές συνεδρίες, ομαδικά Sound Baths και εμπειρίες για χώρους ευεξίας.",
    body: "Οι ατομικές συνεδρίες προσαρμόζονται στον δέκτη. Στα ομαδικά Sound Baths, ηχογαβάθες, gong και άλλα ακουστικά όργανα συνθέτουν μια κοινή εμπειρία ακρόασης. Για μια συνεδρία στον χώρο σου ή μια συνεργασία, επικοινώνησε με τον Μανώλη.",
  },
  training: {
    title: "Μάθε. Εξασκήσου. Εξελίξου.",
    label: "Εκπαιδεύσεις",
    summary:
      "Τέσσερα προοδευτικά Levels που συνδυάζουν θεωρία, βιωματική μάθηση και πρακτική.",
    body: "Η εκπαιδευτική διαδρομή περνά από τις Himalayan singing bowls και την ατομική πρακτική στον συντονισμό ομάδων και την επαγγελματική ανάπτυξη. Η δημιουργία λογαριασμού είναι ξεχωριστή από την εγγραφή σε εκπαιδευτικό τμήμα.",
  },
  about: {
    title: "Μανώλης Ζωγραφάκης",
    label: "Ο άνθρωπος πίσω από τον ήχο",
    summary: "Ηχοθεραπευτής, μουσικός παραγωγός και συντονιστής Breathwork.",
    body: "Με αφετηρία τη μουσική και τον διαλογισμό, ο Μανώλης εξερεύνησε την ηχοθεραπεία στο Βερολίνο και συνέχισε την εκπαίδευσή του στο Νεπάλ. Με βάση τα Χανιά, προσφέρει ατομικές και ομαδικές συνεδρίες, εκπαιδευτικά σεμινάρια και συνεργασίες με χώρους ευεξίας.",
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
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
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
  const state = useLoad<ContentItem[]>("/content/public", []);
  const settings = state.data.find(
    (i) => i.published.kind === "site_settings",
  )?.published;
  const contactUrl =
    settings?.action_url || "https://www.soundhealing.gr/el/epikoinwnia/";
  const contactLabel =
    settings?.action_label || "Επικοινώνησε με το Sound Healing Greece";
  const valid =
    !section || Object.prototype.hasOwnProperty.call(sections, section);
  const page = valid && section ? sections[section as Section] : null;
  const entries = state.data.filter(
    (i) =>
      !["hero", "site_settings"].includes(i.published.kind) &&
      (i.published.section || "home") === (section || "home"),
  );
  const intro = entries.find((i) => i.published.kind === "page");
  const title = intro?.published.title || page?.title;
  return (
    <Shell
      publicPage
      siteSettings={settings}
      eyebrow={page?.label || ""}
      title={valid ? "" : "Η σελίδα δεν βρέθηκε"}
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
      {!section && (
        <BrandHero item={state.data.find((i) => i.published.kind === "hero")} />
      )}
      {!!section && <NavLink href="/">← Αρχική</NavLink>}
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
      {!section && (
        <>
          <Text style={ui.title}>Μια στιγμή για να ακούσεις.</Text>
          <Text style={ui.body}>
            Εξερεύνησε μια εμπειρία ήχου, γνώρισε τη σχολή ή συνέχισε την
            προσωπική σου πρακτική.
          </Text>
          <View style={[ui.row, { alignItems: "stretch" }]}>
            {Object.entries(sections).map(([key, value]) => (
              <View
                key={key}
                style={[ui.card, { flexGrow: 1, flexBasis: 300 }]}
              >
                <Text style={ui.label}>{value.label}</Text>
                <Text style={ui.heading}>
                  {state.data.find(
                    (i) =>
                      i.published.kind === "page" &&
                      i.published.section === key,
                  )?.published.title || value.title}
                </Text>
                <Text style={ui.body}>
                  {state.data.find(
                    (i) =>
                      i.published.kind === "page" &&
                      i.published.section === key,
                  )?.published.summary || value.summary}
                </Text>
                <NavLink href={"/explore/" + key}>
                  Ανακάλυψε περισσότερα →
                </NavLink>
              </View>
            ))}
          </View>
        </>
      )}
      {section === "training" && (
        <View style={ui.row}>
          {[
            "Himalayan singing bowls · Τα θεμέλια",
            "Εμβάθυνση στην ατομική πρακτική",
            "Συντονισμός ομαδικών Sound Baths",
            "Εμβάθυνση και επαγγελματική ανάπτυξη",
          ].map((title, index) => (
            <View
              key={title}
              style={[ui.card, { flexGrow: 1, flexBasis: 280 }]}
            >
              <Text style={ui.label}>LEVEL {index + 1}</Text>
              <Text style={ui.heading}>{title}</Text>
            </View>
          ))}
        </View>
      )}
      {section === "training" && (
        <View style={{ gap: 12 }}>
          <Text style={ui.heading}>Επόμενα εκπαιδευτικά σεμινάρια</Text>
          <Text style={ui.body}>
            Βρες το επόμενο σεμινάριο και δήλωσε ενδιαφέρον για συμμετοχή.
          </Text>
          <NavLink href="https://www.soundhealing.gr/training-seminars/">
            Αναλυτικό πρόγραμμα εκπαίδευσης ↗
          </NavLink>
          <NavLink href="/academy">Είσαι ήδη μαθητής; Μπες στη Σχολή →</NavLink>
        </View>
      )}
      <Status state={state} />
      {(section === "events" || section === "training") && (
        <EventGrid
          training={section === "training"}
          items={entries.filter((item) => item.id !== intro?.id)}
        />
      )}
      {entries
        .filter((item) => section !== "events" && section !== "training")
        .filter((item) => !page || item.id !== intro?.id)
        .map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      {(section === "events" ||
        section === "journal" ||
        section === "training") &&
        !state.loading &&
        !state.error &&
        !entries.filter((item) => item.id !== intro?.id).length && (
          <Text style={ui.body}>
            Δεν υπάρχουν ακόμη δημοσιεύσεις σε αυτή την ενότητα της εφαρμογής.
          </Text>
        )}
      {section === "events" && (
        <NavLink href="https://www.soundhealing.gr/soundhealing-events/">
          Δες το πρόγραμμα στο soundhealing.gr ↗
        </NavLink>
      )}
      {section === "journal" && (
        <NavLink href="https://www.soundhealing.gr/">
          Επισκέψου τον επίσημο ιστότοπο ↗
        </NavLink>
      )}
      {valid && (
        <View style={ui.card}>
          <Text style={ui.heading}>
            Το επόμενο βήμα ξεκινά με μια συζήτηση.
          </Text>
          <NavLink href={contactUrl}>{contactLabel} ↗</NavLink>
          <NavLink href="/login">Έχεις ήδη λογαριασμό; Σύνδεση →</NavLink>
        </View>
      )}
    </Shell>
  );
}
export default function PublicSection() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <PublicExperience key={section} section={section} />;
}
