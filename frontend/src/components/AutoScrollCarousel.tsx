import React, { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";

// A horizontal row that drifts gently on its own and pauses the moment the user
// touches / drags it, resuming shortly after they let go. Content is rendered
// twice so the drift loops seamlessly.
export function AutoScrollCarousel<T>({
  items,
  renderItem,
  gap = 12,
  speed = 0.4,
}: {
  items: T[];
  renderItem: (item: T, key: string) => React.ReactNode;
  gap?: number;
  speed?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const paused = useRef(false);
  const setW = useRef(0);
  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current || setW.current <= 0) return;
      offset.current += speed;
      if (offset.current >= setW.current) offset.current -= setW.current;
      scrollRef.current?.scrollTo({ x: offset.current, animated: false });
    }, 16);
    return () => {
      clearInterval(id);
      if (resume.current) clearTimeout(resume.current);
    };
  }, [speed]);

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

  if (!items.length) return null;

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
      contentContainerStyle={{ gap }}
    >
      <View
        style={{ flexDirection: "row", gap }}
        onLayout={(e) => {
          setW.current = e.nativeEvent.layout.width + gap;
        }}
      >
        {items.map((it, i) => renderItem(it, "a" + i))}
      </View>
      <View style={{ flexDirection: "row", gap }}>
        {items.map((it, i) => renderItem(it, "b" + i))}
      </View>
    </ScrollView>
  );
}
