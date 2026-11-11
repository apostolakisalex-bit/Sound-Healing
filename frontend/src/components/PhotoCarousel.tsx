import React, { useRef, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { ManagedImage } from "./ManagedImage";

/** Swipeable photo carousel with dots (and chevrons on web). */
export function PhotoCarousel({
  photos,
  height = 240,
}: {
  photos: { uri: string; alt: string }[];
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const { wellness } = useTheme();
  if (!photos.length) return null;

  const go = (i: number) => {
    const clamped = Math.max(0, Math.min(photos.length - 1, i));
    setIndex(clamped);
    ref.current?.scrollTo({ x: clamped * width, animated: true });
  };

  return (
    <View style={{ gap: 10 }}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: wellness.blueMist,
        }}
      >
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            width &&
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {width > 0 &&
            photos.map((p, i) => (
              <ManagedImage
                key={i}
                source={{ uri: p.uri }}
                accessibilityLabel={p.alt}
                resizeMode="cover"
                style={{ width, height }}
              />
            ))}
        </ScrollView>

        {Platform.OS === "web" && photos.length > 1 && (
          <>
            {index > 0 && (
              <Arrow dir="chevron-back" side="left" onPress={() => go(index - 1)} />
            )}
            {index < photos.length - 1 && (
              <Arrow dir="chevron-forward" side="right" onPress={() => go(index + 1)} />
            )}
          </>
        )}
      </View>

      {photos.length > 1 && (
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}
        >
          {photos.map((_, i) => (
            <Pressable key={i} onPress={() => go(i)} hitSlop={8}>
              <View
                style={{
                  width: i === index ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i === index ? wellness.lavenderInk : wellness.line,
                }}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Arrow({
  dir,
  side,
  onPress,
}: {
  dir: "chevron-back" | "chevron-forward";
  side: "left" | "right";
  onPress: () => void;
}) {
  const { wellness } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={dir === "chevron-back" ? "Προηγούμενη φωτογραφία" : "Επόμενη φωτογραφία"}
      style={{
        position: "absolute",
        top: "50%",
        marginTop: -20,
        [side]: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={dir} size={22} color={wellness.ink} />
    </Pressable>
  );
}
