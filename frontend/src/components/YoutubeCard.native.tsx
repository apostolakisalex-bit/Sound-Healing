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
  const started = useRef(false);

  const playerWidth = Math.min(width - 48, 640);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  // Continuously track whether the card is on screen (play when it is,
  // pause when the user scrolls past it).
  useEffect(() => {
    const id = setInterval(() => {
      const node = hostRef.current;
      if (!node) return;
      node.measureInWindow((_x, y, _w, h) => {
        if (!h) return;
        const winH = Dimensions.get("window").height;
        const onScreen = y < winH * 0.9 && y + h > winH * 0.1;
        setVisible((v) => (v === onScreen ? v : onScreen));
      });
    }, 400);
    return () => clearInterval(id);
  }, []);

  // Play/pause with scroll. The very first start is delayed so the library's
  // mute command lands before playback begins (otherwise sound leaks); later
  // resumes play immediately (respecting whatever mute state the user chose).
  useEffect(() => {
    if (!ready) return;
    if (!visible) {
      setPlay(false);
      return;
    }
    if (started.current) {
      setPlay(true);
      return;
    }
    const id = setTimeout(() => {
      started.current = true;
      setPlay(true);
    }, 350);
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
