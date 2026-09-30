import React, { useState } from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ContentItem, Field, ui } from "./Wellness";

/** Photo-led cards based on soundhealing.gr, with CMS-owned event details. */
export function EventGrid({
  items,
  training = false,
}: {
  items: ContentItem[];
  training?: boolean;
}) {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const columns = width >= 1100 ? 4 : width >= 760 ? 3 : width >= 540 ? 2 : 1;
  const cardWidth = (Math.min(width - 48, 1072) - (columns - 1) * 20) / columns;
  const matches = items.filter(({ published: p }) =>
    [p.title, p.event_location, p.event_date]
      .join(" ")
      .toLocaleLowerCase("el")
      .includes(search.trim().toLocaleLowerCase("el")),
  );
  if (!items.length) return null;
  return (
    <View style={{ gap: 24 }}>
      <Field
        label={
          training
            ? "Αναζήτηση σεμιναρίου, χώρου ή ημερομηνίας"
            : "Αναζήτηση εκδήλωσης, χώρου ή ημερομηνίας"
        }
        value={search}
        onChange={setSearch}
      />
      {!matches.length && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          Δεν βρέθηκαν εκδηλώσεις. Δοκίμασε διαφορετική αναζήτηση.
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
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ECE9E2",
              shadowColor: "#24211B",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.09,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            {p.image_url ? (
              <Image
                accessibilityLabel={p.image_alt || p.title}
                source={{ uri: p.image_url }}
                style={{ width: "100%", aspectRatio: 1.5 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  aspectRatio: 1.5,
                  backgroundColor: "#EDE8DD",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="musical-notes-outline"
                  size={40}
                  color="#9B8757"
                />
              </View>
            )}
            <View style={{ height: 3, backgroundColor: "#B7A56C" }} />
            <View style={{ padding: 16, gap: 12, flex: 1 }}>
              {p.action_url ? (
                <Link
                  href={p.action_url as any}
                  style={[
                    ui.body,
                    { fontSize: 20, lineHeight: 27, color: "#4B4944" },
                  ]}
                >
                  {p.title}
                </Link>
              ) : (
                <Text
                  accessibilityRole="header"
                  style={[
                    ui.body,
                    { fontSize: 20, lineHeight: 27, color: "#4B4944" },
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
                    <Ionicons name={icon} size={17} color="#8C897F" />
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
              {!!p.body && (
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
                      color: "#80651D",
                      fontSize: 14,
                    },
                  ]}
                >
                  {p.action_label ||
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
