import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCHOOL_PHOTOS } from "@/src/content/schoolGallery";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { wellness } from "@/src/theme";
import { iconSurface } from "./AppNavigation";
import { ManagedImage } from "./ManagedImage";
import React from "react";
import {

  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addToDeviceCalendar, shareSeminar } from "@/src/utils/seminarActions";
import { Link, useRouter } from "expo-router";
import {
  FOUNDER,
  HERO_IMAGES,
  SOCIAL_LINKS,

} from "@/src/content/public";
import { ContentItem, Status, ui, useLoad } from "./Wellness";
import { EventGrid } from "./EventGrid";
type LiveTraining = {
  slug: string;
  title: string;
  image: string;
  url: string;
  date: string;
  start_date: string;
  end_date: string;
  price: string;
  location?: string;
};
const serviceTitles = [
  "Διαδραστικά εργαστήρια & ομιλίες",
  "Συμβουλευτική για ξενοδοχεία & Spa",
  "Εταιρικές εκδηλώσεις & εργαστήρια",
];
// Elegant wellness wordmark (Cormorant Garamond) for the brand logotype.
const BRAND_WORDMARK =
  Platform.OS === "web"
    ? "CormorantGaramond_600SemiBold, Georgia, serif"
    : "CormorantGaramond_600SemiBold";
// Sacred-geometry symbols sourced from soundhealing.gr (services section).
const SERVICE_SYMBOLS = [
  "https://www.soundhealing.gr/wp-content/uploads/2021/02/rsz_7sacred_shape_5-01-1.png",
  "https://www.soundhealing.gr/wp-content/uploads/2021/02/flower-of-life-2.png",
  "https://www.soundhealing.gr/wp-content/uploads/2021/02/rsz_sacred_shape_2-01-1.png",
];
export function PublicHome({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compactScreen = width < 600;
  const liveTrainings = useLoad<{ items: LiveTraining[] }>(
    "/trainings/catalog",
    { items: [] },
  );
  const cardCalendar = (item: ContentItem) => {
    const slug = item.id.startsWith("active-") ? item.id.slice(7) : "";
    const live = slug
      ? liveTrainings.data.items.find((x) => x.slug === slug)
      : undefined;
    void addToDeviceCalendar({
      title: item.published.title,
      location: live?.location || "",
      start: live?.start_date || item.published.event_end_date,
      end: item.published.event_end_date,
      notes: item.published.summary ? `Κόστος: ${item.published.summary}` : "",
    });
  };
  const settings = items.find(
    (i) => i.published.kind === "site_settings",
  )?.published;
  const photo = (slot: string, fallback: string) =>
    items.find(
      (i) =>
        i.published.kind === "app_photo" && i.published.photo_slot === slot,
    )?.published.image_url || fallback;
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
      const live = liveTrainings.data.items;
      all.length = 0;
      const activeSource = live.map((t) => ({
        id: `active-${t.slug}`,
        title: t.title,
        image: t.image,
        url: t.url,
        date: t.date,
        endDate: t.end_date,
        price: t.price,
      }));
      for (const t of activeSource) {
        if (all.some((item) => item.published.action_url === t.url)) continue;
        all.push({
          id: t.id,
          published: {
            title: t.title,
            summary: t.price || "",
            body: "",
            kind: "announcement",
            section: "training",
            level_id: null,
            media_url: "",
            image_url: t.image,
            action_url: t.url,
            event_date: t.date,
            event_end_date: t.endDate,
          },
        });
      }
    }
    const active = all.filter(
      (i) => !i.published.event_end_date || i.published.event_end_date >= today,
    );
    const past = all
      .filter(
        (i) =>
          !!i.published.event_end_date && i.published.event_end_date < today,
      )
      .sort((a, b) =>
        b.published.event_end_date!.localeCompare(a.published.event_end_date!),
      );
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
      <Status state={liveTrainings} />
      <View
        style={{
          height: (compactScreen ? 260 : 360) + insets.top,
          marginHorizontal: -24,
          overflow: "hidden",
          backgroundColor: wellness.blueMist,
        }}
      >
        <ManagedImage
          source={{
            uri: photo(
              "banner",
              hero?.image_url || hero?.media_url || HERO_IMAGES.main,
            ),
          }}
          accessibilityLabel={
            hero?.image_alt || "Sound Healing Greece — η εμπειρία του ήχου"
          }
          resizeMode="cover"
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
        <LinearGradient
          colors={[
            "rgba(232,241,247,0.55)",
            "rgba(255,255,255,0.76)",
            "rgba(233,227,243,0.45)",
          ]}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-start",
            paddingHorizontal: 24,
            paddingTop: insets.top + (compactScreen ? 20 : 34),
          }}
        >
          <Text
            accessibilityRole="header"
            style={[
              ui.title,
              {
                fontFamily: BRAND_WORDMARK,
                textAlign: "center",
                fontSize: compactScreen ? 30 : 46,
                lineHeight: compactScreen ? 40 : 56,
                letterSpacing: 2.5,
                color: wellness.ink,
              },
            ]}
          >
            Sound Healing Greece
          </Text>
        </View>
        <Svg
          width="100%"
          height={60}
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          style={{ position: "absolute", bottom: -1 }}
        >
          <Path
            d="M0 28 C100 0 150 56 250 28 S400 0 500 28 S650 56 750 28 S900 0 1000 28 S1150 56 1200 28 L1200 60 L0 60 Z"
            fill={wellness.white}
          />
        </Svg>
      </View>
      <Text style={[ui.heading, { fontWeight: "600" }]}>
        Γνώρισε τη σχολή και τα 4 Levels
      </Text>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        {[
          [
            {
              title: "Μανώλης Ζωγραφάκης",
              label: "ΣΧΕΤΙΚΑ",
              image: photo("about", page("about")?.image_url || FOUNDER.photo),
              route: "/explore/about",
              ratio: 0.68,
            },
            {
              title: "Τα θεμέλια",
              label: "LEVEL 1",
              image: photo("L1", SCHOOL_PHOTOS[0]),
              route: "/explore/levels?level=1",
              ratio: 1.35,
            },
            {
              title: "Ομαδικά Sound Baths",
              label: "LEVEL 3",
              image: photo("L3", SCHOOL_PHOTOS[3]),
              route: "/explore/levels?level=3",
              ratio: 1.05,
            },
          ],
          [
            {
              title: "Ηχοθεραπεία",
              label: "Η ΕΜΠΕΙΡΙΑ",
              image: photo(
                "soundhealing",
                page("soundhealing")?.image_url || SCHOOL_PHOTOS[4],
              ),
              route: "/explore/soundhealing",
              ratio: 0.68,
            },
            {
              title: "Εμβάθυνση",
              label: "LEVEL 2",
              image: photo("L2", SCHOOL_PHOTOS[1]),
              route: "/explore/levels?level=2",
              ratio: 1.35,
            },
            {
              title: "Επαγγελματική ανάπτυξη",
              label: "LEVEL 4",
              image: photo("L4", SCHOOL_PHOTOS[2]),
              route: "/explore/levels?level=4",
              ratio: 0.68,
            },
          ],
        ].map((column, index) => (
          <View key={index} style={{ flex: 1, gap: 12 }}>
            {column.map((card) => (
              <Pressable
                key={card.route}
                accessibilityRole="link"
                accessibilityLabel={`${card.label}: ${card.title}`}
                onPress={() => router.push(card.route as any)}
                style={({ pressed }) => ({
                  aspectRatio: fontScale > 1.3 ? undefined : card.ratio,
                  minHeight: Math.max(135, 95 * fontScale),
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: wellness.blueMist,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <ManagedImage
                  source={{ uri: card.image }}
                  accessibilityLabel={card.title}
                  resizeMode="cover"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
                <LinearGradient
                  colors={["transparent", "rgba(22,30,40,0.82)"]}
                  locations={[0.2, 1]}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
                <View
                  style={{
                    marginTop: "auto",
                    padding: compactScreen ? 12 : 20,
                    gap: 5,
                    backgroundColor: "rgba(22,30,40,0.46)",
                  }}
                >
                  <Text
                    style={[
                      ui.label,
                      { color: "#FFFFFF", fontSize: 10, letterSpacing: 1.1 },
                    ]}
                  >
                    {card.label}
                  </Text>
                  <Text
                    style={[
                      ui.body,
                      {
                        color: "#FFFFFF",
                        fontSize: compactScreen ? 15 : 22,
                        lineHeight: compactScreen ? 20 : 28,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {card.title} ↗
                  </Text>
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
        <View
          key={section}
          style={{
            gap: 18,
            paddingTop: 24,
            borderTopWidth: 1,
            borderColor: wellness.line,
          }}
        >
          <View style={[ui.row, { justifyContent: "space-between" }]}>
            <Text style={[ui.heading, { fontWeight: "600" }]}>{title}</Text>
            <Link href={`/explore/${section}` as any} style={ui.body}>
              Δες όλα →
            </Link>
          </View>
          <Text style={ui.body}>
            {section === "training"
              ? "Επόμενες συναντήσεις και στιγμές από προηγούμενα εκπαιδευτικά."
              : "Αυτοτελείς εμπειρίες ήχου με τον Μανώλη."}
          </Text>
          {programmes(section).length ? (
            section === "training" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {programmes(section).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      router.push(
                        (item.id.startsWith("active-")
                          ? `/seminar/${item.id.slice(7)}`
                          : item.id.startsWith("archive-")
                            ? item.published.action_url
                            : "/explore/training") as any,
                      )
                    }
                    accessibilityRole="link"
                    style={[
                      ui.card,
                      {
                        width: width < 350 || fontScale > 1.3 ? "100%" : "48%",
                        backgroundColor:
                          item.published.event_end_date &&
                          item.published.event_end_date < today
                            ? wellness.ice
                            : wellness.lavender,
                        borderColor:
                          item.published.event_end_date &&
                          item.published.event_end_date < today
                            ? wellness.line
                            : wellness.lavenderInk,
                        borderWidth:
                          item.published.event_end_date &&
                          item.published.event_end_date < today
                            ? 1
                            : 1.5,
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
                      {!!item.published.summary && (
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: wellness.slate,
                          }}
                        >
                          {item.published.summary}
                        </Text>
                      )}
                      {item.published.event_end_date &&
                      item.published.event_end_date < today ? (
                        <Text style={{ fontSize: 10, color: wellness.muted }}>
                          Ολοκληρώθηκε
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: wellness.lavenderInk,
                            letterSpacing: 1,
                          }}
                        >
                          ● ΕΝΕΡΓΟ
                        </Text>
                      )}
                      <Text style={{ fontSize: 12, color: wellness.slate }}>
                        Περισσότερα →
                      </Text>
                      {!(
                        item.published.event_end_date &&
                        item.published.event_end_date < today
                      ) && (
                        <View
                          style={{ flexDirection: "row", gap: 8, marginTop: 4 }}
                        >
                          <Pressable
                            accessibilityLabel="Προσθήκη στο ημερολόγιο"
                            onPress={(e) => {
                              (e as any)?.stopPropagation?.();
                              cardCalendar(item);
                            }}
                            style={{
                              flexDirection: "row",
                              gap: 5,
                              alignItems: "center",
                              backgroundColor: wellness.white,
                              borderWidth: 1,
                              borderColor: wellness.lavenderInk,
                              borderRadius: 999,
                              paddingVertical: 7,
                              paddingHorizontal: 10,
                              minHeight: 36,
                            }}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color={wellness.lavenderInk}
                            />
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: wellness.lavenderInk,
                              }}
                            >
                              Ημερολόγιο
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel="Μοιράσου"
                            onPress={(e) => {
                              (e as any)?.stopPropagation?.();
                              void shareSeminar(
                                item.published.title,
                                item.published.action_url || "",
                              );
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: wellness.white,
                              borderWidth: 1,
                              borderColor: wellness.lavenderInk,
                            }}
                          >
                            <Ionicons
                              name="share-social-outline"
                              size={15}
                              color={wellness.lavenderInk}
                            />
                          </Pressable>
                        </View>
                      )}
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
      <View
        style={{
          gap: 18,
          paddingTop: 24,
          borderTopWidth: 1,
          borderColor: wellness.line,
        }}
      >
        <Text style={ui.heading}>Υπηρεσίες</Text>
        <View style={[ui.row, { alignItems: "stretch" }]}>
          {(services.length
            ? services.map((i) => i.published.title)
            : serviceTitles
          ).map((title, index) => (
            <Pressable
              key={title}
              onPress={() => router.push("/explore/services")}
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
              <ManagedImage
                source={{ uri: SERVICE_SYMBOLS[index % 3] }}
                accessibilityLabel={title}
                resizeMode="contain"
                style={{ width: 42, height: 42, tintColor: wellness.slate }}
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
