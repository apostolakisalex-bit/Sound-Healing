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
import { FOUNDER, HERO_IMAGES, SOCIAL_LINKS } from "@/src/content/public";
import { ContentItem, ui } from "./Wellness";
import { EventGrid } from "./EventGrid";
const serviceTitles = [
  "Διαδραστικά εργαστήρια & ομιλίες",
  "Συμβουλευτική για ξενοδοχεία & Spa",
  "Εταιρικές εκδηλώσεις & εργαστήρια",
];
export function PublicHome({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compactScreen = width < 600;
  const settings = items.find(
    (i) => i.published.kind === "site_settings",
  )?.published;
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
    const active = all.filter(
      (i) => !i.published.event_end_date || i.published.event_end_date >= today,
    );
    const past = all.filter(
      (i) => !!i.published.event_end_date && i.published.event_end_date < today,
    ).sort((a, b) => b.published.event_end_date!.localeCompare(a.published.event_end_date!));
    return (section === "training" ? [...active, ...past] : active).slice(
      0,
      section === "training" ? 2 : 4,
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
    <View style={{ gap: 32 }}>
      <View style={{ gap: 22 }}>
        {[
          {
            section: "about",
            title: "Μανώλης Ζωγραφάκης",
            text: "Γνώρισε τον άνθρωπο πίσω από το Sound Healing Greece.",
            image: FOUNDER.photo,
          },
          {
            section: "soundhealing",
            title: "Ηχοθεραπεία",
            text: "Μια γνωριμία με τον ήχο, τα όργανα και την εμπειρία της ακρόασης.",
            image: HERO_IMAGES.philosophy,
          },
        ].map((card) => {
          const content = page(card.section);
          return (
            <View
              key={card.section}
              style={[
                ui.card,
                {
                  padding: 0,
                  overflow: "hidden",
                  borderWidth: 0,
                  backgroundColor: "transparent",
                  flexDirection: card.section === "about" ? "row" : "column",
                  alignItems: card.section === "about" ? "center" : "stretch",
                  gap: 16,
                },
              ]}
            >
              <ManagedImage
                source={{ uri: content?.image_url || card.image }}
                accessibilityLabel={content?.image_alt || card.title}
                style={
                  card.section === "about"
                    ? {
                        width: compactScreen ? 92 : 120,
                        height: compactScreen ? 92 : 120,
                        borderRadius: 60,
                        backgroundColor: "#F0EDE7",
                      }
                    : {
                        width: "100%",
                        height: compactScreen ? 160 : 210,
                        borderRadius: 16,
                        backgroundColor: "#F0EDE7",
                      }
                }
                resizeMode="cover"
              />
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 2,
                  gap: 7,
                  flex: 1,
                }}
              >
                <Link
                  href={`/explore/${card.section}` as any}
                  style={ui.heading}
                >
                  {card.title} ↗
                </Link>
                <Text style={ui.body}>{content?.summary || card.text}</Text>
                <Link
                  href={`/explore/${card.section}` as any}
                  style={[ui.body, { color: "#94712F", fontSize: 12 }]}
                >
                  {card.section === "about"
                    ? "Γνώρισέ τον →"
                    : "Ανακάλυψε την ηχοθεραπεία →"}
                </Link>
              </View>
            </View>
          );
        })}
      </View>
      {(
        [
          ["training", "Εκπαιδευτικά"],
          ["events", "Ενεργές εκδηλώσεις"],
        ] as const
      ).map(([section, title]) => (
        <View key={section} style={{ gap: 18 }}>
          <View style={[ui.row, { justifyContent: "space-between" }]}>
            <Text style={ui.heading}>{title}</Text>
            <Link href={`/explore/${section}` as any} style={ui.body}>
              Δες όλα →
            </Link>
          </View>
          {programmes(section).length ? (
            section === "training" ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                {programmes(section).map((item) => (
                  <Pressable key={item.id} onPress={() => router.push("/explore/training")}
                      accessibilityRole="link"
                      style={[
                        ui.card,
                        {
                          width: "48%",
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
                        {!!item.published.event_end_date &&
                          item.published.event_end_date < today && (
                            <Text style={{ fontSize: 10, color: "#81755F" }}>
                              Παλαιότερο εκπαιδευτικό
                            </Text>
                          )}
                        <Text style={{ fontSize: 12, color: "#94712F" }}>
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
      <View style={{ gap: 18 }}>
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
                    width: compactScreen ? "30%" : 160,
                    minHeight: compactScreen ? 116 : 140,
                    padding: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    borderWidth: 1,
                    borderColor: "#E9E2D5",
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
                  color="#927545"
                />
                <Text
                  style={{
                    fontSize: 11,
                    lineHeight: 16,
                    textAlign: "center",
                    color: "#39352D",
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
          <Text style={ui.heading}>What students say</Text>
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
                  “It was so much more than a training!”
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
            borderColor: "#E7E0D3",
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
