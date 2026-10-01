import { wellness } from "@/src/theme";
import { ManagedImage } from "./ManagedImage";
import React, { useState } from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ContentItem, Field, ui } from "./Wellness";

/** Photo-led cards based on soundhealing.gr, with CMS-owned event details. */
export function EventGrid({
  items,
  training = false,
  compact = false,
}: {
  items: ContentItem[];
  training?: boolean;
  compact?: boolean;
}) {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const columns = width >= 1100 ? 4 : width >= 760 ? 3 : width >= 540 ? 2 : 1;
  const cardWidth = (Math.min(width - 48, 1072) - (columns - 1) * 20) / columns;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const isPast = (p: ContentItem["published"]) =>
    training && !!p.event_end_date && p.event_end_date < today;
  const ordered = [...items].sort((a, b) => {
    const difference = Number(isPast(a.published)) - Number(isPast(b.published));
    if (difference) return difference;
    return isPast(a.published)
      ? b.published.event_end_date!.localeCompare(a.published.event_end_date!) : 0;
  });
  const matches = ordered.filter(({ published: p }) =>
    [p.title, p.event_location, p.event_date]
      .join(" ")
      .toLocaleLowerCase("el")
      .includes(search.trim().toLocaleLowerCase("el")),
  );
  if (!items.length) return null;
  return (
    <View style={{ gap: 24 }}>
      {!compact && (
        <Field
          label={
            training
              ? "Αναζήτηση σεμιναρίου, χώρου ή ημερομηνίας"
              : "Αναζήτηση εκδήλωσης, χώρου ή ημερομηνίας"
          }
          value={search}
          onChange={setSearch}
        />
      )}
      {!matches.length && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {training ? "Δεν βρέθηκαν εκπαιδευτικά." : "Δεν βρέθηκαν εκδηλώσεις."} Δοκίμασε διαφορετική αναζήτηση.
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {matches.map(({ id, published: p }) => (
          <View
            key={id}
            style={{
              width: cardWidth,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: wellness.line,
              shadowColor: "#24211B",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.035,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            {p.image_url ? (
              <ManagedImage
                accessibilityLabel={p.image_alt || p.title}
                source={{ uri: p.image_url }}
                style={{ width: "100%", aspectRatio: 1.5 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  aspectRatio: 1.5,
                  backgroundColor: wellness.blueMist,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="musical-notes-outline"
                  size={40}
                  color={wellness.slate}
                />
              </View>
            )}
            <View style={{ height: 1, backgroundColor: wellness.sand }} />
            <View style={{ padding: 14, gap: 12, flex: 1 }}>
              {isPast(p) && (
                <Text style={[ui.label, { color: wellness.muted, fontSize: 11 }]}>
                  Παλαιότερο εκπαιδευτικό
                </Text>
              )}
              {p.action_url ? (
                <Link
                  href={p.action_url as any}
                  style={[
                    ui.body,
                    { fontSize: 16, lineHeight: 23, color: wellness.ink },
                  ]}
                >
                  {p.title}
                </Link>
              ) : (
                <Text
                  accessibilityRole="header"
                  style={[
                    ui.body,
                    { fontSize: 16, lineHeight: 23, color: wellness.ink },
                  ]}
                >
                  {p.title}
                </Text>
              )}
              {(
                [
                  ["calendar-outline", p.event_date],
                  ["time-outline", p.event_time],
                  ["location-outline", p.event_location],
                ] as const
              ).map(([icon, label]) =>
                label ? (
                  <View
                    key={icon}
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <Ionicons name={icon} size={17} color={wellness.muted} />
                    <Text
                      style={[
                        ui.body,
                        { flex: 1, fontSize: 13, lineHeight: 19 },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ) : null,
              )}
              {!!p.summary && (
                <Text style={[ui.body, { fontSize: 14, lineHeight: 21 }]}>
                  {p.summary}
                </Text>
              )}
              {!compact && !!p.body && (
                <Text style={[ui.body, { fontSize: 14, lineHeight: 21 }]}>
                  {p.body}
                </Text>
              )}
              {!!p.action_url && (
                <Link
                  href={p.action_url as any}
                  style={[
                    ui.body,
                    {
                      marginTop: "auto",
                      paddingTop: 10,
                      color: wellness.slate,
                      fontSize: 14,
                    },
                  ]}
                >
                  {isPast(p) ? "Πληροφορίες εκπαιδευτικού" : p.action_label ||
                    (training
                      ? "Πληροφορίες & εγγραφή"
                      : "Πληροφορίες & συμμετοχή")}{" "}
                  ↗
                </Link>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
