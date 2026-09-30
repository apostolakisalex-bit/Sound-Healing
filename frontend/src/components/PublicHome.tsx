import React from "react";
import { Image, Text, View } from "react-native";
import { Link } from "expo-router";
import { FOUNDER, HERO_IMAGES, SOCIAL_LINKS } from "@/src/content/public";
import { ContentItem, ui } from "./Wellness";
import { EventGrid } from "./EventGrid";
const serviceTitles = [
  "Διαδραστικά εργαστήρια & ομιλίες",
  "Συμβουλευτική για ξενοδοχεία & Spa",
  "Εταιρικές εκδηλώσεις & εργαστήρια",
];
export function PublicHome({ items }: { items: ContentItem[] }) {
  const page = (section: string) =>
    items.find(
      (i) => i.published.kind === "page" && i.published.section === section,
    )?.published;
  const programmes = (section: string) =>
    items
      .filter(
        (i) =>
          i.published.kind === "announcement" &&
          i.published.section === section,
      )
      .slice(0, 4);
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
    <View style={{ gap: 44 }}>
      <View style={[ui.row, { alignItems: "stretch" }]}>
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
                { flexGrow: 1, flexBasis: 300, padding: 0, overflow: "hidden" },
              ]}
            >
              <Image
                source={{ uri: content?.image_url || card.image }}
                accessibilityLabel={content?.image_alt || card.title}
                style={{ width: "100%", height: 300 }}
                resizeMode={card.section === "about" ? "contain" : "cover"}
              />
              <View style={{ padding: 24, gap: 12 }}>
                <Link
                  href={`/explore/${card.section}` as any}
                  style={ui.heading}
                >
                  {card.title} ↗
                </Link>
                <Text style={ui.body}>{content?.summary || card.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
      {(
        [
          ["training", "Ενεργά εκπαιδευτικά"],
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
            <EventGrid
              items={programmes(section)}
              training={section === "training"}
              compact
            />
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
          ).map((title) => (
            <Link
              key={title}
              href="/explore/services"
              style={[
                ui.body,
                {
                  flexGrow: 1,
                  flexBasis: 220,
                  padding: 24,
                  borderRadius: 18,
                  backgroundColor: "#F5F1E8",
                  borderWidth: 1,
                  borderColor: "#E1D8C6",
                  shadowColor: "#625335",
                  shadowOpacity: 0.13,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 4,
                  color: "#39352D",
                },
              ]}
            >
              {title} ↗
            </Link>
          ))}
        </View>
      </View>
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
      {!!partners.length && (
        <View style={{ gap: 18 }}>
          <Text style={ui.label}>ΣΥΝΕΡΓΑΣΙΕΣ</Text>
          <View style={ui.row}>
            {partners.map((i) => (
              <View key={i.id} style={{ padding: 12 }}>
                <Image
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
    </View>
  );
}

