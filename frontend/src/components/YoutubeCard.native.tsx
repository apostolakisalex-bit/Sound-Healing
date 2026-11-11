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
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [play, setPlay] = useState(false);
  const [muted, setMuted] = useState(true);
  const detected = useRef(false);

  const playerWidth = Math.min(width - 48, 640);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  // Mark the card visible once it scrolls into view.
  useEffect(() => {
    const id = setInterval(() => {
      const node = hostRef.current;
      if (!node || detected.current) return;
      node.measureInWindow((_x, y, _w, h) => {
        const winH = Dimensions.get("window").height;
        const onScreen = y < winH * 0.85 && y + h > winH * 0.1;
        if (onScreen) {
          detected.current = true;
          setVisible(true);
        }
      });
    }, 300);
    return () => clearInterval(id);
  }, []);

  // Start playback only AFTER the player is ready and on screen, with a short
  // delay so the library's mute command lands first — otherwise the player
  // briefly plays with sound before muting. This guarantees a silent start.
  useEffect(() => {
    if (!ready || !visible) return;
    const id = setTimeout(() => setPlay(true), 350);
    return () => clearTimeout(id);
  }, [ready, visible]);

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
          play={play}
          mute={muted}
          volume={muted ? 0 : 100}
          videoId={VIDEO_ID}
          onReady={() => setReady(true)}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,
            playsinline: true,
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
