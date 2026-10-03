import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCHOOL_PHOTOS, PAST_TRAININGS } from "@/src/content/schoolGallery";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { wellness } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { iconSurface } from "./AppNavigation";
import { ManagedImage } from "./ManagedImage";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { FOUNDER, HERO_IMAGES, SOCIAL_LINKS, INSTRUMENTS } from "@/src/content/public";
import { ContentItem, ui } from "./Wellness";
import { EventGrid } from "./EventGrid";
const serviceTitles = [
  "Διαδραστικά εργαστήρια & ομιλίες",
  "Συμβουλευτική για ξενοδοχεία & Spa",
  "Εταιρικές εκδηλώσεις & εργαστήρια",
];
export function PublicHome({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compactScreen = width < 600;
  const settings = items.find(
    (i) => i.published.kind === "site_settings",
  )?.published;
  const photo = (slot: string, fallback: string) => items.find(i => i.published.kind === "app_photo" && i.published.photo_slot === slot)?.published.image_url || fallback;
  const hero = items.find((i) => i.published.kind === "hero")?.published;
  const page = (section: string) =>
    items.find(
      (i) => i.published.kind === "page" && i.published.section === section,
    )?.published;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const allProgrammes = (section: string) =>
    items.filter(
      (i) =>
        i.published.kind === "announcement" && i.published.section === section,
    );
  const programmes = (section: string) => {
    const all = allProgrammes(section);
    if (section === "training") {
      for (const past of PAST_TRAININGS) {
        if (all.some(item => item.published.action_url === past.url)) continue;
        const first = past.title.startsWith("Level 1");
        all.push({ id: first ? "archive-L1" : "archive-L2", published: {
          title: past.title, summary: "", body: "", kind: "announcement", section: "training", level_id: null, media_url: "",
          image_url: photo(first ? "past_L1" : "past_L2", past.image), action_url: past.url,
          event_date: past.date, event_end_date: first ? "2026-08-02" : "2026-08-04",
        }});
      }
    }
    const active = all.filter(
      (i) => !i.published.event_end_date || i.published.event_end_date >= today,
    );
    const past = all.filter(
      (i) => !!i.published.event_end_date && i.published.event_end_date < today,
    ).sort((a, b) => b.published.event_end_date!.localeCompare(a.published.event_end_date!));
    return (section === "training" ? [...active, ...past] : active).slice(
      0,
      section === "training" ? 4 : 4,
    );
  };
  const testimonials = items
    .filter((i) => i.published.kind === "testimonial")
    .slice(0, 3);
  const partners = items
    .filter((i) => i.published.kind === "partner" && i.published.image_url)
    .slice(0, 8);
  const socials = items.filter(
    (i) => i.published.kind === "social" && i.published.action_url,
  );
  const services = items
    .filter(
      (i) =>
        i.published.kind === "announcement" &&
        i.published.section === "services",
    )
    .slice(0, 6);
  return (
    <View style={{ gap: 28 }}>
      <View style={{ height: (compactScreen ? 260 : 360) + insets.top, marginHorizontal: -24, overflow: "hidden", backgroundColor: wellness.blueMist }}>
        <ManagedImage source={{ uri: photo("banner", hero?.image_url || hero?.media_url || HERO_IMAGES.main) }} accessibilityLabel={hero?.image_alt || "Sound Healing Greece — η εμπειρία του ήχου"} resizeMode="cover" style={{ position: "absolute", width: "100%", height: "100%" }} />
        <LinearGradient colors={["rgba(232,241,247,0.55)", "rgba(255,255,255,0.76)", "rgba(233,227,243,0.45)"]} style={{ position: "absolute", width: "100%", height: "100%" }} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 35 }}>
          <Text accessibilityRole="header" style={[ui.title, { textAlign: "center", fontSize: compactScreen ? 29 : 42, lineHeight: compactScreen ? 38 : 52, letterSpacing: 1.2, color: wellness.ink }]}>Sound Healing Greece</Text>
        </View>
        <Svg width="100%" height={60} viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: -1 }}>
          <Path d="M0 28 C100 0 150 56 250 28 S400 0 500 28 S650 56 750 28 S900 0 1000 28 S1150 56 1200 28 L1200 60 L0 60 Z" fill={wellness.white} />
        </Svg>
      </View>
      <Text style={[ui.heading, { fontWeight: "600" }]}>Γνώρισε τη σχολή και τα 4 Levels</Text>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        {[
          [
            { title: "Μανώλης Ζωγραφάκης", label: "ΣΧΕΤΙΚΑ", image: photo("about", page("about")?.image_url || FOUNDER.photo), route: "/explore/about", ratio: .68 },
            { title: "Τα θεμέλια", label: "LEVEL 1", image: photo("L1", SCHOOL_PHOTOS[0]), route: "/explore/levels?level=1", ratio: 1.35 },
            { title: "Ομαδικά Sound Baths", label: "LEVEL 3", image: photo("L3", SCHOOL_PHOTOS[3]), route: "/explore/levels?level=3", ratio: 1.05 },
          ],
          [
            { title: "Ηχοθεραπεία", label: "Η ΕΜΠΕΙΡΙΑ", image: photo("soundhealing", page("soundhealing")?.image_url || SCHOOL_PHOTOS[4]), route: "/explore/soundhealing", ratio: .68 },
            { title: "Εμβάθυνση", label: "LEVEL 2", image: photo("L2", SCHOOL_PHOTOS[1]), route: "/explore/levels?level=2", ratio: 1.35 },
            { title: "Επαγγελματική ανάπτυξη", label: "LEVEL 4", image: photo("L4", SCHOOL_PHOTOS[2]), route: "/explore/levels?level=4", ratio: .68 },
          ],
        ].map((column, index) => (
          <View key={index} style={{ flex: 1, gap: 12 }}>
            {column.map(card => (
              <Pressable key={card.route} accessibilityRole="link" accessibilityLabel={`${card.label}: ${card.title}`} onPress={() => router.push(card.route as any)} style={({ pressed }) => ({ aspectRatio: fontScale > 1.3 ? undefined : card.ratio, minHeight: Math.max(135, 95 * fontScale), borderRadius: 12, overflow: "hidden", backgroundColor: wellness.blueMist, opacity: pressed ? .85 : 1 })}>
                <ManagedImage source={{ uri: card.image }} accessibilityLabel={card.title} resizeMode="cover" style={{ position: "absolute", width: "100%", height: "100%" }} />
                <LinearGradient colors={["transparent", "rgba(22,30,40,0.82)"]} locations={[.2,1]} style={{ position: "absolute", width: "100%", height: "100%" }} />
                <View style={{ marginTop: "auto", padding: compactScreen ? 12 : 20, gap: 5, backgroundColor: "rgba(22,30,40,0.46)" }}>
                  <Text style={[ui.label, { color: "#FFFFFF", fontSize: 10, letterSpacing: 1.1 }]}>{card.label}</Text>
                  <Text style={[ui.body, { color: "#FFFFFF", fontSize: compactScreen ? 15 : 22, lineHeight: compactScreen ? 20 : 28, fontWeight: "600" }]}>{card.title} ↗</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
      {(
        [
          ["training", "Εκπαιδευτικά"],
          ["events", "Ενεργές εκδηλώσεις"],
        ] as const
      ).map(([section, title]) => (
        <View key={section} style={{ gap: 18, paddingTop: 24, borderTopWidth: 1, borderColor: wellness.line }}>
          <View style={[ui.row, { justifyContent: "space-between" }]}>
            <Text style={[ui.heading, { fontWeight: "600" }]}>{title}</Text>
            <Link href={`/explore/${section}` as any} style={ui.body}>
              Δες όλα →
            </Link>
          </View>
          <Text style={ui.body}>{section === "training" ? "Επόμενες συναντήσεις και στιγμές από προηγούμενα εκπαιδευτικά." : "Αυτοτελείς εμπειρίες ήχου με τον Μανώλη."}</Text>
          {programmes(section).length ? (
            section === "training" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {programmes(section).map((item) => (
                  <Pressable key={item.id} onPress={() => router.push((item.id.startsWith("archive-") ? item.published.action_url : "/explore/training") as any)}
                      accessibilityRole="link"
                      style={[
                        ui.card,
                        {
                          width: width < 350 || fontScale > 1.3 ? "100%" : "48%",
                          backgroundColor: item.published.event_end_date && item.published.event_end_date < today ? wellness.ice : wellness.lavender,
                          borderColor: item.published.event_end_date && item.published.event_end_date < today ? wellness.line : wellness.lavenderInk,
                          borderWidth: item.published.event_end_date && item.published.event_end_date < today ? 1 : 1.5,
                          padding: 0,
                          overflow: "hidden",
                          gap: 8,
                        },
                      ]}
                    >
                      <ManagedImage
                        source={{ uri: item.published.image_url }}
                        accessibilityLabel={
                          item.published.image_alt || item.published.title
                        }
                        style={{
                          width: "100%",
                          height: compactScreen ? 100 : 170,
                        }}
                        resizeMode="cover"
                      />
                      <View style={{ padding: 10, gap: 5 }}>
                        <Text
                          numberOfLines={2}
                          style={[ui.body, { fontWeight: "600", fontSize: 13 }]}
                        >
                          {item.published.title}
                        </Text>
                        <Text style={[ui.body, { fontSize: 11 }]}>
                          {item.published.event_date}
                        </Text>
                        {item.published.event_end_date &&
                        item.published.event_end_date < today ? (
                          <Text style={{ fontSize: 10, color: wellness.muted }}>
                            Ολοκληρώθηκε
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 10, fontWeight: "700", color: wellness.lavenderInk, letterSpacing: 1 }}>
                            ● ΕΝΕΡΓΟ
                          </Text>
                        )}
                        <Text style={{ fontSize: 12, color: wellness.slate }}>
                          Περισσότερα →
                        </Text>
                      </View>
                    </Pressable>
                ))}
              </View>
            ) : (
              <EventGrid items={programmes(section)} compact />
            )
          ) : (
            <Text style={ui.body}>Το νέο πρόγραμμα θα ανακοινωθεί εδώ.</Text>
          )}

        </View>
      ))}
      <View style={{ gap: 18, paddingTop: 24, borderTopWidth: 1, borderColor: wellness.line }}>
        <Text style={ui.heading}>Υπηρεσίες</Text>
        <View style={[ui.row, { alignItems: "stretch" }]}>
          {(services.length
            ? services.map((i) => i.published.title)
            : serviceTitles
          ).map((title, index) => (
            <Pressable key={title} onPress={() => router.push("/explore/services")}
                accessibilityRole="link"
                style={[
                  iconSurface,
                  {
                    width: compactScreen ? "46%" : 160,
                    minHeight: compactScreen ? 116 : 140,
                    padding: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    borderWidth: 1,
                    borderColor: wellness.line,
                  },
                ]}
              >
                <Ionicons
                  name={
                    (
                      ["mic-outline", "leaf-outline", "people-outline"] as const
                    )[index % 3]
                  }
                  size={26}
                  color={wellness.slate}
                />
                <Text
                  style={{
                    fontSize: 11,
                    lineHeight: 16,
                    textAlign: "center",
                    color: wellness.ink,
                  }}
                >
                  {title}
                </Text>
              </Pressable>
          ))}
        </View>
      </View>
      <View style={ui.row}>
        <Link href="/explore/about" style={ui.body}>
          Σχετικά
        </Link>
        <Link href="/explore/contact" style={ui.body}>
          Επικοινωνία & Chat →
        </Link>
      </View>
      {settings?.show_testimonials !== false && (
        <View style={{ gap: 18 }}>
          <Text style={ui.heading}>Οι εμπειρίες των μαθητών</Text>
          <View style={[ui.row, { alignItems: "stretch" }]}>
            {testimonials.length ? (
              testimonials.map((i) => (
                <View
                  key={i.id}
                  style={[ui.card, { flexBasis: 260, flexGrow: 1 }]}
                >
                  <Text style={ui.body}>“{i.published.summary}”</Text>
                  <Text style={ui.label}>{i.published.title}</Text>
                  {!!i.published.action_url && (
                    <Link href={i.published.action_url as any} style={ui.body}>
                      Πηγή ↗
                    </Link>
                  )}
                </View>
              ))
            ) : (
              <View style={[ui.card, { maxWidth: 620 }]}>
                <Text style={ui.body}>
                  «Ήταν πολλά παραπάνω από ένα εκπαιδευτικό!»
                </Text>
                <Text style={ui.label}>Eleni Z.</Text>
                <Link
                  href="https://www.soundhealing.gr/training-seminars/"
                  style={ui.body}
                >
                  Διάβασε την εμπειρία της ↗
                </Link>
              </View>
            )}
          </View>
        </View>
      )}
      {settings?.show_partners !== false && !!partners.length && (
        <View style={{ gap: 18 }}>
          <Text style={ui.label}>ΣΥΝΕΡΓΑΣΙΕΣ</Text>
          <View style={ui.row}>
            {partners.map((i) => (
              <View key={i.id} style={{ padding: 12 }}>
                <ManagedImage
                  source={{ uri: i.published.image_url }}
                  accessibilityLabel={i.published.title}
                  style={{ width: 130, height: 60 }}
                  resizeMode="contain"
                />
                {i.published.action_url ? (
                  <Link
                    href={i.published.action_url as any}
                    style={[ui.body, { fontSize: 12 }]}
                  >
                    {i.published.title} ↗
                  </Link>
                ) : (
                  <Text style={[ui.body, { fontSize: 12 }]}>
                    {i.published.title}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
      {settings?.show_socials !== false && (
        <View
          style={{
            gap: 16,
            paddingVertical: 24,
            borderTopWidth: 1,
            borderColor: wellness.line,
          }}
        >
          <Text style={ui.heading}>Ας μείνουμε σε επαφή.</Text>
          <View style={ui.row}>
            {(socials.length
              ? socials.map((i) => ({
                  label: i.published.title,
                  url: i.published.action_url!,
                }))
              : SOCIAL_LINKS
            ).map((s) => (
              <Link
                key={s.url}
                href={s.url as any}
                style={[ui.body, { paddingVertical: 10, paddingRight: 20 }]}
              >
                {s.label} ↗
              </Link>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
