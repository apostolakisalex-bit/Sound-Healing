import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { useTheme } from "@/src/theme/ThemeContext";
import { useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";

const VIDEO_ID = "X74zlekpNbA";

// Native (Expo Go / device) YouTube player. Autoplays (muted) once scrolled
// into view, with a sound toggle and the player's native fullscreen control.
export default function YoutubeCard() {
  const { wellness } = useTheme();
  const ui = useUi();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const hostRef = useRef<View>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const started = useRef(false);

  const playerWidth = Math.min(width - 48, 640);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  useEffect(() => {
    const id = setInterval(() => {
      const node = hostRef.current;
      if (!node || started.current) return;
      node.measureInWindow((_x, y, _w, h) => {
        const winH = Dimensions.get("window").height;
        const visible = y < winH * 0.78 && y + h > winH * 0.18;
        if (visible) {
          started.current = true;
          setPlaying(true);
        }
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <View
      ref={hostRef}
      collapsable={false}
      style={{ width: playerWidth, alignSelf: "center" }}
    >
      <View style={{ height: playerHeight, backgroundColor: "#000000" }}>
        <YoutubePlayer
          height={playerHeight}
          width={playerWidth}
          play={playing}
          mute={muted}
          videoId={VIDEO_ID}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,
          }}
          webViewProps={{
            allowsFullscreenVideo: true,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          forceAndroidAutoplay
        />
      </View>
      <Pressable
        onPress={() => setMuted((m) => !m)}
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
