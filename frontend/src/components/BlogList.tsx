import { useTheme } from "@/src/theme/ThemeContext";
import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ManagedImage } from "./ManagedImage";
import { useUi, useLoad, Status } from "./Wellness";

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
  const { wellness } = useTheme();
  const ui = useUi();
  const { width } = useWindowDimensions();
  const state = useLoad<BlogPost[]>(`/blog?section=${section}`, []);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const columns = width >= 1100 ? 3 : width >= 640 ? 2 : 1;
  const cardWidth = (Math.min(width - 48, 1072) - (columns - 1) * 20) / columns;
  const today = React.useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Athens",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    [],
  );

  if (!state.loading && !state.error && !state.data.length) return null;

  // Section-specific announcements (events / εκπαιδευτικά) split by date so
  // past ones move into a collapsible archive; general articles stay visible.
  const own = state.data.filter((p) => p.category === section);
  const general = state.data.filter((p) => p.category === "general");
  const pastOwn = own.filter((p) => p.date && p.date < today);
  const liveOwn = own.filter((p) => !p.date || p.date >= today);
  const live = [...liveOwn, ...general];
  const archiveLabel =
    section === "events" ? "Αρχείο εκδηλώσεων" : "Αρχείο εκπαιδευτικών";

  const gridStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "stretch",
  } as const;

  const renderCard = (post: BlogPost) => (
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
        <Text style={[ui.label, { color: wellness.lavenderInk, fontSize: 11 }]}>
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
          <Text style={[ui.body, { color: wellness.slate, fontSize: 14 }]}>
            Διάβασε περισσότερα
          </Text>
          <Ionicons name="arrow-forward" size={15} color={wellness.slate} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{ gap: 16 }}>
      <Text style={ui.heading}>Από το blog</Text>
      {state.loading && <Status state={state} />}
      {!!live.length && <View style={gridStyle}>{live.map(renderCard)}</View>}

      {!!pastOwn.length && (
        <View style={{ gap: 16 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${archiveLabel}, ${pastOwn.length}`}
            onPress={() => setArchiveOpen((o) => !o)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: wellness.line,
              backgroundColor: wellness.white,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name="archive-outline" size={20} color={wellness.slate} />
            <Text style={[ui.body, { flex: 1, fontSize: 15, color: wellness.ink }]}>
              {archiveLabel}{" "}
              <Text style={{ color: wellness.muted }}>({pastOwn.length})</Text>
            </Text>
            <Ionicons
              name={archiveOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={wellness.slate}
            />
          </Pressable>
          {archiveOpen && (
            <View style={gridStyle}>{pastOwn.map(renderCard)}</View>
          )}
        </View>
      )}
    </View>
  );
}

export default BlogList;
