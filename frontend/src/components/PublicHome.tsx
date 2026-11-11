import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCHOOL_PHOTOS } from "@/src/content/schoolGallery";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/theme/ThemeContext";
import { useIconSurface, useLanguage } from "./AppNavigation";
import { SacredMandala } from "./icons/SacredMandala";
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
import { ContentItem, Status, useUi, useLoad } from "./Wellness";
import { EventGrid } from "./EventGrid";
import { getServices, serviceSlugByTitle } from "@/src/content/services";
import { STUDENT_REVIEWS } from "@/src/content/testimonials";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { AutoScrollCarousel } from "./AutoScrollCarousel";
import YoutubeCard from "./YoutubeCard";
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
  const { wellness } = useTheme();
  const ui = useUi();
  const { t, language } = useLanguage();
  const iconSurface = useIconSurface();
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
      notes: item.published.summary ? `${t("Κόστος", "Price")}: ${item.published.summary}` : "",
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
    return active.slice(0, 6);
  };
  const testimonials = items
    .filter((i) => i.published.kind === "testimonial")
    .slice(0, 8);
  const reviewCards = [
    ...testimonials.map((i) => ({
      quote: i.published.summary,
      name: i.published.title,
      avatar: i.published.image_url,
    })),
    ...STUDENT_REVIEWS.map((r) => ({
      quote: language === "el" ? r.el : r.en,
      name: language === "el" ? r.name_el : r.name_en,
      avatar: r.avatar,
    })),
  ];
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
  type MosaicCard = {
    title: string;
    label: string;
    image: string;
    route: string;
    ratio: number;
  };
  const introCards: MosaicCard[] = [
    {
      title: t("Μανώλης Ζωγραφάκης", "Manolis Zografakis"),
      label: t("ΣΧΕΤΙΚΑ", "ABOUT"),
      image: photo("about", page("about")?.image_url || FOUNDER.photo),
      route: "/explore/about",
      ratio: 0.82,
    },
    {
      title: t("Ηχοθεραπεία", "Sound Healing"),
      label: t("Η ΕΜΠΕΙΡΙΑ", "THE EXPERIENCE"),
      image: photo(
        "soundhealing",
        "https://www.soundhealing.gr/wp-content/uploads/2021/02/singing-bowl-4595876_1920-1.jpg",
      ),
      route: "/explore/soundhealing",
      ratio: 0.82,
    },
  ];
  const levels: MosaicCard[] = [
    {
      title: t("Τα θεμέλια", "The foundations"),
      label: "LEVEL 1",
      image: photo("L1", SCHOOL_PHOTOS[0]),
      route: "/explore/levels?level=1",
      ratio: 2.6,
    },
    {
      title: t("Εμβάθυνση", "Going deeper"),
      label: "LEVEL 2",
      image: photo("L2", SCHOOL_PHOTOS[1]),
      route: "/explore/levels?level=2",
      ratio: 2.6,
    },
    {
      title: t("Ομαδικά Sound Baths", "Group Sound Baths"),
      label: "LEVEL 3",
      image: photo("L3", SCHOOL_PHOTOS[3]),
      route: "/explore/levels?level=3",
      ratio: 2.6,
    },
    {
      title: t("Επαγγελματική ανάπτυξη", "Professional development"),
      label: "LEVEL 4",
      image: photo(
        "L4",
        "https://customer-assets-7cd3h4nn.emergentagent.net/job_healing-universe/artifacts/c3d1215cc5ffd685_Screenshot%202026-11-11%20220351.png",
      ),
      route: "/explore/levels?level=4",
      ratio: 2.6,
    },
  ];
  const fillAbs = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };
  // Clear-photo intro tile with depth/volume (no glass, no glow).
  const renderIntroTile = (card: MosaicCard) => {
    // The founder (Manolis) card is a touch taller with a lighter overlay so
    // his face is more visible.
    const big = card.route === "/explore/about";
    return (
      <Pressable
        key={card.route}
        accessibilityRole="link"
        accessibilityLabel={`${card.label}: ${card.title}`}
        onPress={() => router.push(card.route as any)}
        style={({ pressed }) => ({
          height: big
            ? compactScreen
              ? 300
              : 360
            : compactScreen
              ? 152
              : 184,
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: wellness.blueMist,
          boxShadow:
            "0px 3px 6px rgba(60,48,34,0.16), 0px 22px 38px rgba(60,48,34,0.28)",
          transform: [{ translateY: pressed ? 1 : 0 }],
          opacity: pressed ? 0.97 : 1,
        })}
      >
        {!!card.image && (
          <ManagedImage
            source={{ uri: card.image }}
            accessibilityLabel={card.title}
            resizeMode="cover"
            style={
              big
                ? {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    aspectRatio: 1204 / 1432,
                  }
                : fillAbs
            }
          />
        )}
        <LinearGradient
          colors={["transparent", "rgba(22,30,40,0.78)"]}
          locations={big ? [0.52, 1] : [0.35, 1]}
          style={fillAbs}
        />
        <View style={{ marginTop: "auto", padding: 18, gap: 5 }}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              ui.label,
              { color: "#FFFFFF", fontSize: 11, letterSpacing: 1.2 },
            ]}
          >
            {card.label}
          </Text>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[
              ui.body,
              {
                color: "#FFFFFF",
                fontSize: compactScreen ? 18 : 22,
                fontWeight: "700",
              },
            ]}
          >
            {card.title} ↗
          </Text>
        </View>
      </Pressable>
    );
  };
  const renderLevelCard = (card: MosaicCard) => (
    <Pressable
      key={card.route}
      accessibilityRole="link"
      accessibilityLabel={`${card.label}: ${card.title}`}
      onPress={() => router.push(card.route as any)}
      style={({ pressed }) => ({
        aspectRatio: fontScale > 1.3 ? undefined : card.ratio,
        minHeight: Math.max(108, 82 * fontScale),
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: wellness.blueMist,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <ManagedImage
        source={{ uri: card.image }}
        accessibilityLabel={card.title}
        resizeMode="cover"
        style={fillAbs}
      />
      <LinearGradient
        colors={["transparent", "rgba(22,30,40,0.85)"]}
        locations={[0.25, 1]}
        style={fillAbs}
      />
      <View
        style={{
          marginTop: "auto",
          padding: compactScreen ? 14 : 20,
          gap: 4,
        }}
      >
        <Text
          style={[
            ui.label,
            { color: "#FFFFFF", fontSize: 10, letterSpacing: 1.4 },
          ]}
        >
          {card.label}
        </Text>
        <Text
          style={[
            ui.body,
            {
              color: "#FFFFFF",
              fontSize: compactScreen ? 16 : 22,
              lineHeight: compactScreen ? 21 : 28,
              fontWeight: "600",
            },
          ]}
        >
          {card.title} ↗
        </Text>
      </View>
    </Pressable>
  );

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
            // Drop the wordmark below the floating language/theme controls
            // (which sit at insets.top + 12 and are ~40px tall) so the two
            // icons never touch the word "Greece".
            paddingTop: insets.top + (compactScreen ? 104 : 130),
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
                color: "#15100A",
                textShadowColor: "rgba(43,34,22,0.45)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 5,
              },
            ]}
          >
            Sound Healing Greece
          </Text>
        </View>
        <Svg
          width="100%"
          height={72}
          viewBox="0 0 1200 72"
          preserveAspectRatio="none"
          style={{ position: "absolute", bottom: -1 }}
        >
          <Path
            d="M0 22 C150 -8 250 52 400 22 S650 -8 800 22 S1050 52 1200 22 L1200 72 L0 72 Z"
            fill={wellness.white}
            fillOpacity={0.35}
          />
          <Path
            d="M0 36 C150 10 250 62 400 36 S650 10 800 36 S1050 62 1200 36 L1200 72 L0 72 Z"
            fill={wellness.white}
            fillOpacity={0.6}
          />
          <Path
            d="M0 48 C150 26 250 68 400 48 S650 26 800 48 S1050 68 1200 48 L1200 72 L0 72 Z"
            fill={wellness.white}
          />
        </Svg>
      </View>
      <View style={{ gap: 16 }}>
        {introCards.map(renderIntroTile)}
      </View>
      <Text style={[ui.heading, { fontWeight: "600" }]}>
        {t("Γνώρισε τη σχολή και τα 4 Levels", "Meet the school and the 4 Levels")}
      </Text>
      <View style={{ gap: 12 }}>{levels.map(renderLevelCard)}</View>
      {(
        [["training", t("Ενεργές Εκδηλώσεις και Εκπαιδευτικά", "Active Events & Training")]] as [string, string][]
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
              {t("Δες όλα →", "See all →")}
            </Link>
          </View>
          <Text style={ui.body}>
            {section === "training"
              ? t(
                  "Επόμενες συναντήσεις και στιγμές από προηγούμενα εκπαιδευτικά.",
                  "Upcoming sessions and moments from past trainings.",
                )
              : t(
                  "Αυτοτελείς εμπειρίες ήχου με τον Μανώλη.",
                  "Stand-alone sound experiences with Manolis.",
                )}
          </Text>
          {programmes(section).length ? (
            section === "training" ? (
              <AutoScrollCarousel
                items={programmes(section)}
                gap={12}
                renderItem={(item, key) => (
                  <Pressable
                    key={key}
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
                        width: width < 380 ? 240 : 280,
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
                          {t("Ολοκληρώθηκε", "Completed")}
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
                          {t("● ΕΝΕΡΓΟ", "● ACTIVE")}
                        </Text>
                      )}
                      <Text style={{ fontSize: 12, color: wellness.slate }}>
                        {t("Περισσότερα →", "More →")}
                      </Text>
                      {!(
                        item.published.event_end_date &&
                        item.published.event_end_date < today
                      ) && (
                        <View
                          style={{ flexDirection: "row", gap: 8, marginTop: 4 }}
                        >
                          <Pressable
                            accessibilityLabel={t("Προσθήκη στο ημερολόγιο", "Add to calendar")}
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
                              {t("Ημερολόγιο", "Calendar")}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel={t("Μοιράσου", "Share")}
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
                )}
              />
            ) : (
              <EventGrid items={programmes(section)} compact />
            )
          ) : (
            <Text style={ui.body}>{t("Το νέο πρόγραμμα θα ανακοινωθεί εδώ.", "The new programme will be announced here.")}</Text>
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
        <Text style={ui.heading}>{t("Υπηρεσίες", "Services")}</Text>
        <View style={[ui.row, { alignItems: "stretch" }]}>
          {(services.length
            ? services.map((i) => i.published.title)
            : getServices(language).map((s) => s.title)
          ).map((title, index) => (
            <Pressable
              key={title}
              onPress={() => {
                const serviceSlug = serviceSlugByTitle(title);
                router.push(
                  serviceSlug
                    ? (`/service/${serviceSlug}` as any)
                    : "/explore/services",
                );
              }}
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
                  backgroundColor: wellness.lavender,
                  borderColor: wellness.lavenderInk,
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
                numberOfLines={2}
                style={{
                  fontSize: 11,
                  lineHeight: 16,
                  minHeight: 32,
                  textAlign: "center",
                  color: wellness.ink,
                }}
              >
                {title}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push("/treatments" as any)}
            accessibilityRole="link"
            accessibilityLabel={t("Θεραπείες. Δείτε τις θεραπείες", "Treatments. See the treatments")}
            style={[
              iconSurface,
              {
                width: compactScreen ? "46%" : 160,
                minHeight: compactScreen ? 116 : 140,
                padding: 12,
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 12,
                borderWidth: 1,
                backgroundColor: wellness.lavender,
                borderColor: wellness.lavenderInk,
              },
            ]}
          >
            <View
              style={{
                height: 42,
                width: 42,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SacredMandala size={40} color={wellness.slate} strokeWidth={1} />
            </View>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 11,
                lineHeight: 16,
                minHeight: 32,
                textAlign: "center",
                color: wellness.ink,
              }}
            >
              {t("Θεραπείες", "Treatments")}
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={ui.row}>
        <Link href="/explore/about" style={ui.body}>
          {t("Σχετικά", "About")}
        </Link>
        <Link href="/explore/contact" style={ui.body}>
          {t("Επικοινωνία & Chat →", "Contact & Chat →")}
        </Link>
      </View>
      {settings?.show_testimonials !== false && (
        <View style={{ gap: 18 }}>
          <Text style={ui.heading}>{t("Οι εμπειρίες των μαθητών", "Student experiences")}</Text>
          <View style={{ marginHorizontal: -24 }}>
            <TestimonialsCarousel reviews={reviewCards} />
          </View>
        </View>
      )}
      {settings?.show_partners !== false && !!partners.length && (
        <View style={{ gap: 18 }}>
          <Text style={ui.label}>{t("ΣΥΝΕΡΓΑΣΙΕΣ", "PARTNERS")}</Text>
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
      <View
        style={{
          gap: 16,
          paddingVertical: 24,
          borderTopWidth: 1,
          borderColor: wellness.line,
        }}
      >
        <Text style={ui.heading}>{t("Δες & άκουσε", "Watch & listen")}</Text>
        <View
          style={{
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#000000",
            boxShadow:
              "0px 3px 6px rgba(60,48,34,0.16), 0px 18px 34px rgba(60,48,34,0.22)",
          }}
        >
          <YoutubeCard />
        </View>
      </View>
      {settings?.show_socials !== false && (
        <View
          style={{
            gap: 16,
            paddingVertical: 24,
            borderTopWidth: 1,
            borderColor: wellness.line,
          }}
        >
          <Text style={ui.heading}>{t("Ας μείνουμε σε επαφή.", "Let's stay in touch.")}</Text>
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
