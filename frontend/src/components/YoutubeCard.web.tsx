import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";

const VIDEO_ID = "X74zlekpNbA";

// Web (React Native Web) YouTube player via a real iframe + the IFrame API.
// Autoplays (muted) once scrolled into view, with a sound toggle and the
// native YouTube fullscreen control.
export default function YoutubeCard() {
  const { wellness } = useTheme();
  const ui = useUi();
  const { t } = useLanguage();
  const frame = useRef<HTMLIFrameElement | null>(null);
  const host = useRef<any>(null);
  const [muted, setMuted] = useState(true);

  const command = (func: string) => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*",
    );
  };

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.4) {
          command("playVideo");
        } else {
          command("pauseVideo");
        }
      },
      { threshold: [0, 0.4, 0.75] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const toggleSound = () => {
    command(muted ? "unMute" : "mute");
    command("playVideo");
    setMuted((m) => !m);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const src =
    `https://www.youtube.com/embed/${VIDEO_ID}` +
    `?enablejsapi=1&autoplay=0&mute=1&playsinline=1&controls=1&fs=1&rel=0&modestbranding=1` +
    (origin ? `&origin=${encodeURIComponent(origin)}` : "");

  return (
    <View style={{ position: "relative", width: "100%" }}>
      {React.createElement(
        "div",
        { ref: host, style: { width: "100%", lineHeight: 0 } },
        React.createElement("iframe", {
          ref: frame,
          title: "Sound Healing Greece",
          src,
          allow:
            "autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope",
          allowFullScreen: true,
          style: {
            width: "100%",
            aspectRatio: "16 / 9",
            border: "0",
            display: "block",
          },
        }),
      )}
      <Pressable
        onPress={toggleSound}
        accessibilityRole="button"
        accessibilityLabel={
          muted ? t("Ενεργοποίηση ήχου", "Enable sound") : t("Σίγαση", "Mute")
        }
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 7,
          paddingHorizontal: 11,
          borderRadius: 999,
          backgroundColor: "rgba(15,16,10,0.72)",
        }}
      >
        <Ionicons
          name={muted ? "volume-mute" : "volume-high"}
          size={16}
          color="#FFFFFF"
        />
        {muted ? (
          <Text style={[ui.label, { color: "#FFFFFF", fontSize: 11 }]}>
            {t("Ήχος", "Sound")}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}
