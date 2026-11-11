import { useTheme } from "@/src/theme/ThemeContext";
import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ManagedImage } from "./ManagedImage";
import { useUi, useLoad, Status } from "./Wellness";
import { cardShadow } from "@/src/theme";
import { useLanguage } from "./AppNavigation";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string | null;
  link?: string;
  event_start?: string | null;
  event_end?: string | null;
  category: "training" | "events" | "general";
  categories: string[];
};

const formatDate = (iso: string, locale: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
};

// Shows the real session date range when known, else the publish date.
const formatWhen = (
  start: string | null | undefined,
  end: string | null | undefined,
  fallback: string,
  locale: string,
) => {
  const s = start || fallback;
  if (!s) return "";
  if (end && end !== s) return `${formatDate(s, locale)} – ${formatDate(end, locale)}`;
  return formatDate(s, locale);
};

/** Live articles from the soundhealing.gr blog, opened in an in-app reader. */
export function BlogList({
  section,
  articlesOnly = false,
}: {
  section: "training" | "events";
  articlesOnly?: boolean;
}) {
  const router = useRouter();
  const { wellness, mode } = useTheme();
  const ui = useUi();
  const { t, language } = useLanguage();
  const dateLocale = language === "en" ? "en-GB" : "el-GR";
  const badge = (c: BlogPost["category"]) =>
    c === "training"
      ? t("Εκπαιδευτικό", "Educational")
      : c === "events"
        ? t("Εκδήλωση", "Event")
        : t("Άρθρο", "Article");
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

  // Section-specific announcements (events / εκπαιδευτικά). We split them by
  // the *event* date (parsed from the title) so a seminar announced months in
  // advance still shows as upcoming, and past ones move into the archive.
  const own = state.data.filter((p) => p.category === section);
  const general = state.data.filter((p) => p.category === "general");
  const eff = (p: BlogPost) => p.event_start || p.date || "";
  const pastOwn = own
    .filter((p) => eff(p) && eff(p) < today)
    .sort((a, b) => (eff(a) < eff(b) ? 1 : -1));
  const liveOwn = own
    .filter((p) => !eff(p) || eff(p) >= today)
    .sort((a, b) => (eff(a) < eff(b) ? -1 : 1));
  const archiveLabel =
    section === "events"
      ? t("Αρχείο εκδηλώσεων", "Events archive")
      : t("Αρχείο εκπαιδευτικών", "Training archive");

  // "Articles" grid: small cards, as many per row as fit on screen.
  const maxW = Math.min(width - 48, 1072);
  const artCols = Math.max(2, Math.min(4, Math.floor(maxW / 180)));
  const artW = (maxW - (artCols - 1) * 14) / artCols;

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
        boxShadow: cardShadow(mode === "dark"),
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
          {badge(post.category)}
          {formatWhen(post.event_start, post.event_end, post.date, dateLocale)
            ? ` · ${formatWhen(post.event_start, post.event_end, post.date, dateLocale)}`
            : ""}
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
            {t("Διάβασε περισσότερα", "Read more")}
          </Text>
          <Ionicons name="arrow-forward" size={15} color={wellness.slate} />
        </View>
      </View>
    </Pressable>
  );

  // Small "Articles" card: photo, title and date only.
  const renderArticleCard = (post: BlogPost) => (
    <Pressable
      key={post.id}
      accessibilityRole="button"
      accessibilityLabel={post.title}
      onPress={() => router.push(`/article/${post.id}` as any)}
      style={{
        width: artW,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: wellness.white,
        borderWidth: 1,
        borderColor: wellness.line,
        boxShadow: cardShadow(mode === "dark"),
      }}
    >
      {post.image ? (
        <ManagedImage
          accessibilityLabel={post.title}
          source={{ uri: post.image }}
          style={{ width: "100%", aspectRatio: 1 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            aspectRatio: 1,
            backgroundColor: wellness.blueMist,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="newspaper-outline" size={30} color={wellness.slate} />
        </View>
      )}
      <View style={{ padding: 10, gap: 4 }}>
        <Text
          numberOfLines={2}
          style={[ui.body, { fontSize: 13, lineHeight: 18, color: wellness.ink }]}
        >
          {post.title}
        </Text>
        {!!post.date && (
          <Text style={[ui.label, { color: wellness.slate, fontSize: 11 }]}>
            {formatDate(post.date, dateLocale)}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={{ gap: 16 }}>
      {state.loading && <Status state={state} />}
      {!articlesOnly && !!liveOwn.length && (
        <View style={gridStyle}>{liveOwn.map(renderCard)}</View>
      )}

      {!articlesOnly && !!pastOwn.length && (
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

      {!!general.length && (
        <View style={{ gap: 14 }}>
          <Text style={ui.heading}>{t("Άρθρα", "Articles")}</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            {general.map(renderArticleCard)}
          </View>
        </View>
      )}
    </View>
  );
}

export default BlogList;
