import React, { useEffect, useRef } from "react";
import { ScrollView } from "react-native";

// A horizontal row that drifts gently on its own and pauses the moment the user
// touches / drags it, resuming shortly after they let go. Each card is rendered
// ONCE (no duplicates); when the drift reaches the end it jumps back to the
// start and begins again.
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
  const maxScroll = useRef(0);
  const contentW = useRef(0);
  const viewW = useRef(0);
  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recompute = () => {
    maxScroll.current = Math.max(0, contentW.current - viewW.current);
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current || maxScroll.current <= 0) return;
      offset.current += speed;
      if (offset.current >= maxScroll.current) offset.current = 0;
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
      onLayout={(e) => {
        viewW.current = e.nativeEvent.layout.width;
        recompute();
      }}
      onContentSizeChange={(w) => {
        contentW.current = w;
        recompute();
      }}
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
      {items.map((it, i) => renderItem(it, "c" + i))}
    </ScrollView>
  );
}
