import { wellness } from "@/src/theme";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ManagedImage } from "./ManagedImage";
import { ui, useLoad, Status } from "./Wellness";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string | null;
  link?: string;
  category: "training" | "events" | "general";
  categories: string[];
};

const BADGE: Record<BlogPost["category"], string> = {
  training: "Εκπαιδευτικό",
  events: "Εκδήλωση",
  general: "Άρθρο",
};

const formatDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
};

/** Live articles from the soundhealing.gr blog, opened in an in-app reader. */
export function BlogList({ section }: { section: "training" | "events" }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const state = useLoad<BlogPost[]>(`/blog?section=${section}`, []);
  const columns = width >= 1100 ? 3 : width >= 640 ? 2 : 1;
  const cardWidth = (Math.min(width - 48, 1072) - (columns - 1) * 20) / columns;

  if (!state.loading && !state.error && !state.data.length) return null;

  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Από το blog</Text>
      {state.loading && <Status state={state} />}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {state.data.map((post) => (
          <Pressable
            key={post.id}
            accessibilityRole="button"
            accessibilityLabel={post.title}
            onPress={() => router.push(`/article/${post.id}` as any)}
            style={{
              width: cardWidth,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: wellness.white,
              borderWidth: 1,
              borderColor: wellness.line,
            }}
          >
            {post.image ? (
              <ManagedImage
                accessibilityLabel={post.title}
                source={{ uri: post.image }}
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
                  name="newspaper-outline"
                  size={38}
                  color={wellness.slate}
                />
              </View>
            )}
            <View style={{ padding: 14, gap: 8, flex: 1 }}>
              <Text
                style={[ui.label, { color: wellness.lavenderInk, fontSize: 11 }]}
              >
                {BADGE[post.category]}
                {post.date ? ` · ${formatDate(post.date)}` : ""}
              </Text>
              <Text
                accessibilityRole="header"
                numberOfLines={3}
                style={[ui.body, { fontSize: 16, lineHeight: 22, color: wellness.ink }]}
              >
                {post.title}
              </Text>
              {!!post.excerpt && (
                <Text
                  numberOfLines={3}
                  style={[ui.body, { fontSize: 13, lineHeight: 19 }]}
                >
                  {post.excerpt}
                </Text>
              )}
              <View
                style={{
                  marginTop: "auto",
                  paddingTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={[ui.body, { color: wellness.slate, fontSize: 14 }]}
                >
                  Διάβασε περισσότερα
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={wellness.slate}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default BlogList;
