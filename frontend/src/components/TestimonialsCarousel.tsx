import React, { useEffect, useRef } from "react";
import { ScrollView, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUi } from "./Wellness";
import { useTheme } from "@/src/theme/ThemeContext";
import { cardShadow } from "@/src/theme";

export type Review = { quote: string; name: string; avatar?: string };

// Gently self-scrolling testimonials carousel. It drifts slowly and pauses the
// moment the user touches/drag it, resuming shortly after they let go.
export function TestimonialsCarousel({ reviews }: { reviews: Review[] }) {
  const ui = useUi();
  const { wellness, mode } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const paused = useRef(false);
  const setW = useRef(0);
  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);

  const GAP = 14;
  const CARD_W = 290;

  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current || setW.current <= 0) return;
      offset.current += 0.4; // gentle drift
      if (offset.current >= setW.current) offset.current -= setW.current;
      scrollRef.current?.scrollTo({ x: offset.current, animated: false });
    }, 16);
    return () => {
      clearInterval(id);
      if (resume.current) clearTimeout(resume.current);
    };
  }, []);

  const pause = () => {
    paused.current = true;
    if (resume.current) clearTimeout(resume.current);
  };
  const resumeSoon = () => {
    if (resume.current) clearTimeout(resume.current);
    resume.current = setTimeout(() => {
      paused.current = false;
    }, 1400);
  };

  if (!reviews.length) return null;

  const card = (r: Review, key: string) => (
    <View
      key={key}
      style={{
        width: CARD_W,
        borderRadius: 18,
        padding: 18,
        backgroundColor: wellness.white,
        borderWidth: 1,
        borderColor: wellness.line,
        boxShadow: cardShadow(mode === "dark"),
      }}
    >
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={20}
        color={wellness.sand}
        style={{ marginBottom: 10 }}
      />
      <Text
        style={[ui.body, { fontSize: 14, lineHeight: 21, minHeight: 126 }]}
        numberOfLines={6}
      >
        “{r.quote}”
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 14,
        }}
      >
        {r.avatar ? (
          <Image
            source={{ uri: r.avatar }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: wellness.blueMist,
            }}
          />
        ) : null}
        <Text style={[ui.label, { fontSize: 13 }]}>{r.name}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(e) => {
        offset.current = e.nativeEvent.contentOffset.x;
      }}
      onTouchStart={pause}
      onTouchEnd={resumeSoon}
      onTouchCancel={resumeSoon}
      onScrollBeginDrag={pause}
      onScrollEndDrag={resumeSoon}
      onMomentumScrollEnd={resumeSoon}
      contentContainerStyle={{ gap: GAP, paddingHorizontal: 24 }}
    >
      <View
        style={{ flexDirection: "row", gap: GAP }}
        onLayout={(e) => {
          setW.current = e.nativeEvent.layout.width + GAP;
        }}
      >
        {reviews.map((r, i) => card(r, "a" + i))}
      </View>
      <View style={{ flexDirection: "row", gap: GAP }}>
        {reviews.map((r, i) => card(r, "b" + i))}
      </View>
    </ScrollView>
  );
}
