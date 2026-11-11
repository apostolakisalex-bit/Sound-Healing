import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Head from "expo-router/head";
import { useTheme } from "@/src/theme/ThemeContext";
import { Shell, useUi, useLoad, Status } from "./Wellness";
import { ManagedImage } from "./ManagedImage";
import { useLanguage } from "./AppNavigation";

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt?: string };

type Article = {
  id: number;
  title: string;
  date: string;
  image?: string | null;
  link?: string;
  category: string;
  categories: string[];
  blocks: Block[];
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

/** In-app reader for a single soundhealing.gr article. */
export function ArticleReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { wellness } = useTheme();
  const ui = useUi();
  const { t, language } = useLanguage();
  const dateLocale = language === "en" ? "en-GB" : "el-GR";
  const state = useLoad<Article | null>(`/blog/${id}`, null);
  const article = state.data;

  return (
    <Shell publicPage eyebrow="" title="">
      <Head>
        <title>
          {(article?.title || t("Άρθρο", "Article")) + " · Sound Healing Greece"}
        </title>
      </Head>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t("Πίσω", "Back")}
        onPress={() => (router.canGoBack() ? router.back() : router.push("/"))}
        style={{ minHeight: 44, justifyContent: "center", paddingVertical: 6 }}
      >
        <Text style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}>
          {t("← Πίσω", "← Back")}
        </Text>
      </Pressable>

      <Status state={state} />

      {article && (
        <View style={{ gap: 16 }}>
          {!!article.image && (
            <ManagedImage
              accessibilityLabel={article.title}
              source={{ uri: article.image }}
              style={{ width: "100%", aspectRatio: 1.5, borderRadius: 14 }}
              resizeMode="cover"
            />
          )}
          {!!article.date && (
            <Text style={[ui.label, { color: wellness.slate }]}>
              {formatDate(article.date, dateLocale)}
            </Text>
          )}
          <Text style={ui.title}>{article.title}</Text>

          {article.blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <Text key={i} style={[ui.heading, { marginTop: 8 }]}>
                  {block.text}
                </Text>
              );
            }
            if (block.type === "paragraph") {
              return (
                <Text key={i} style={[ui.body, { lineHeight: 24 }]}>
                  {block.text}
                </Text>
              );
            }
            if (block.type === "quote") {
              return (
                <View
                  key={i}
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: wellness.lavenderInk,
                    paddingLeft: 14,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={[ui.body, { fontStyle: "italic", lineHeight: 24 }]}>
                    {block.text}
                  </Text>
                </View>
              );
            }
            if (block.type === "list") {
              return (
                <View key={i} style={{ gap: 8 }}>
                  {block.items.map((it, j) => (
                    <View key={j} style={{ flexDirection: "row", gap: 10 }}>
                      <Text style={[ui.body, { color: wellness.lavenderInk }]}>•</Text>
                      <Text style={[ui.body, { flex: 1, lineHeight: 24 }]}>{it}</Text>
                    </View>
                  ))}
                </View>
              );
            }
            if (block.type === "image") {
              return (
                <ManagedImage
                  key={i}
                  accessibilityLabel={block.alt || article.title}
                  source={{ uri: block.src }}
                  style={{ width: "100%", aspectRatio: 1.5, borderRadius: 12 }}
                  resizeMode="cover"
                />
              );
            }
            return null;
          })}

          {!!article.link && (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(article.link!)}
              style={{ minHeight: 44, justifyContent: "center", paddingVertical: 6 }}
            >
              <Text
                style={[ui.body, { color: wellness.lavenderInk, fontWeight: "700" }]}
              >
                {t("Διάβασε στο soundhealing.gr ↗", "Read on soundhealing.gr ↗")}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Shell>
  );
}

export default ArticleReader;
