import React from "react";
import {
  View,
  Text,
  Pressable,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContentItem, useUi } from "./Wellness";
import { useTheme } from "@/src/theme/ThemeContext";
import { useLanguage } from "./AppNavigation";
import { cardShadow } from "@/src/theme";
import { ManagedImage } from "./ManagedImage";

// Wide horizontal cards (image left, details right) stacked vertically.
// Shows only the active trainings & events passed in.
export function ActiveList({ items }: { items: ContentItem[] }) {
  const ui = useUi();
  const { wellness, mode } = useTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const stack = width < 420;
  const imgW = stack ? ("100%" as const) : 150;

  if (!items.length) {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Text style={[ui.body, { color: wellness.muted }]}>
          {t(
            "Δεν υπάρχει κάτι ενεργό αυτή τη στιγμή. Μείνε συντονισμένος!",
            "Nothing active right now. Stay tuned!",
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {items.map((item) => {
        const p = item.published;
        const isEvent = (p.section || "") === "events";
        return (
          <Pressable
            key={item.id}
            accessibilityRole={p.action_url ? "link" : undefined}
            accessibilityLabel={p.title}
            onPress={() => p.action_url && Linking.openURL(p.action_url)}
            style={({ pressed }) => ({
              flexDirection: stack ? "column" : "row",
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: wellness.white,
              borderWidth: 1,
              borderColor: wellness.line,
              boxShadow: cardShadow(mode === "dark"),
              opacity: pressed ? 0.9 : 1,
            })}
          >
            {p.image_url ? (
              <ManagedImage
                accessibilityLabel={p.image_alt || p.title}
                source={{ uri: p.image_url }}
                style={{
                  width: imgW,
                  height: stack ? 170 : undefined,
                  alignSelf: "stretch",
                  aspectRatio: stack ? undefined : 1,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: imgW,
                  height: stack ? 170 : undefined,
                  alignSelf: "stretch",
                  aspectRatio: stack ? undefined : 1,
                  backgroundColor: wellness.blueMist,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="musical-notes-outline"
                  size={34}
                  color={wellness.slate}
                />
              </View>
            )}
            <View
              style={{ flex: 1, padding: 16, gap: 8, justifyContent: "center" }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={[
                    ui.label,
                    {
                      fontSize: 10,
                      color: wellness.slate,
                      backgroundColor: wellness.blueMist,
                      paddingHorizontal: 9,
                      paddingVertical: 3,
                      borderRadius: 999,
                      overflow: "hidden",
                    },
                  ]}
                >
                  {isEvent ? t("Εκδήλωση", "Event") : t("Εκπαιδευτικό", "Training")}
                </Text>
              </View>
              <Text
                style={[
                  ui.body,
                  {
                    fontSize: 16,
                    lineHeight: 22,
                    fontWeight: "600",
                    color: wellness.ink,
                  },
                ]}
                numberOfLines={2}
              >
                {p.title}
              </Text>
              {p.event_date || p.event_location ? (
                <View style={{ gap: 4 }}>
                  {p.event_date ? (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 7,
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={wellness.muted}
                      />
                      <Text
                        style={[
                          ui.body,
                          { flex: 1, fontSize: 12.5, lineHeight: 18 },
                        ]}
                      >
                        {[p.event_date, p.event_time].filter(Boolean).join(" · ")}
                      </Text>
                    </View>
                  ) : null}
                  {p.event_location ? (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 7,
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={wellness.muted}
                      />
                      <Text
                        style={[
                          ui.body,
                          { flex: 1, fontSize: 12.5, lineHeight: 18 },
                        ]}
                        numberOfLines={1}
                      >
                        {p.event_location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              {!!p.summary && (
                <Text
                  style={[
                    ui.body,
                    { fontSize: 13, lineHeight: 19, color: wellness.slate },
                  ]}
                  numberOfLines={2}
                >
                  {p.summary}
                </Text>
              )}
              {!!p.action_url && (
                <Text
                  style={[
                    ui.body,
                    { color: wellness.slate, fontSize: 13, marginTop: 2 },
                  ]}
                >
                  {p.action_label ||
                    (isEvent
                      ? t("Πληροφορίες & συμμετοχή", "Details & participation")
                      : t("Πληροφορίες & εγγραφή", "Details & registration"))}{" "}
                  ↗
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
