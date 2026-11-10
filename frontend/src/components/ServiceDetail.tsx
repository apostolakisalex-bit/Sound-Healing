import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";
import { wellness } from "@/src/theme";
import { ManagedImage } from "./ManagedImage";
import { Shell, ui } from "./Wellness";
import { PhotoCarousel } from "./PhotoCarousel";
import { serviceBySlug } from "@/src/content/services";

const CONTACT_URL = "https://www.soundhealing.gr/el/epikoinwnia/";

export function ServiceDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const service = serviceBySlug(slug);

  return (
    <Shell publicPage eyebrow="" title="">
      <Head>
        <title>
          {(service?.title || "Υπηρεσία") + " · Sound Healing Greece"}
        </title>
        <meta name="description" content={service?.intro || ""} />
      </Head>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/")}
        style={{ paddingVertical: 10 }}
      >
        <Text style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}>
          ← Αρχική
        </Text>
      </Pressable>

      {!service ? (
        <Text style={ui.body}>Η υπηρεσία δεν βρέθηκε.</Text>
      ) : (
        <View style={{ gap: 22 }}>
          <View style={{ gap: 12, alignItems: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: wellness.lavender,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ManagedImage
                source={{ uri: service.symbol }}
                accessibilityLabel={service.title}
                resizeMode="contain"
                style={{ width: 38, height: 38, tintColor: wellness.lavenderInk }}
              />
            </View>
            <Text style={[ui.title, { textAlign: "center" }]}>
              {service.title}
            </Text>
            <Text
              style={[
                ui.body,
                { textAlign: "center", fontSize: 15, color: wellness.ink },
              ]}
            >
              {service.intro}
            </Text>
          </View>

          <PhotoCarousel photos={service.photos} />

          <View style={{ gap: 14 }}>
            {service.body.map((p, i) => (
              <Text key={i} style={[ui.body, { fontSize: 15 }]}>
                {p}
              </Text>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {service.highlights.map((h, i) => (
              <View
                key={i}
                style={{
                  flexGrow: 1,
                  flexBasis: "47%",
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                  backgroundColor: wellness.white,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: wellness.line,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: wellness.lavender,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={h.icon} size={18} color={wellness.lavenderInk} />
                </View>
                <Text
                  style={[ui.body, { flex: 1, fontSize: 13, color: wellness.ink }]}
                >
                  {h.label}
                </Text>
              </View>
            ))}
          </View>

          {!!service.testimonial && (
            <View style={[ui.card, { gap: 12 }]}>
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color={wellness.lavenderInk}
              />
              <Text
                style={[
                  ui.body,
                  { fontSize: 15, fontStyle: "italic", color: wellness.ink },
                ]}
              >
                {`“${service.testimonial.quote}”`}
              </Text>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                {!!service.testimonial.avatar && (
                  <ManagedImage
                    source={{ uri: service.testimonial.avatar }}
                    accessibilityLabel={service.testimonial.author}
                    resizeMode="cover"
                    style={{ width: 42, height: 42, borderRadius: 21 }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[ui.label, { fontSize: 13 }]}>
                    {service.testimonial.author}
                  </Text>
                  <Text style={[ui.body, { fontSize: 12 }]}>
                    {service.testimonial.role}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => void Linking.openURL(CONTACT_URL)}
            style={[ui.button, { alignItems: "center" }]}
          >
            <Text style={{ color: wellness.white, fontWeight: "700", fontSize: 15 }}>
              Επικοινωνία & συνεργασία
            </Text>
          </Pressable>
        </View>
      )}
    </Shell>
  );
}

export default ServiceDetail;
