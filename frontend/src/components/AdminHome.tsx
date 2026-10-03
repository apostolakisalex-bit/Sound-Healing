import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { wellness } from "@/src/theme";
import { pickPhoto } from "@/src/utils/pickPhoto";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/auth/AuthContext";
import { ui, useLoad } from "./Wellness";
import { iconSurface } from "./AppNavigation";

type Stat = { label: string; value: number };

// Admin home header — mirrors the student profile header (avatar circle + name)
// but shows a "Δάσκαλος" badge instead of Level bars, with school stats in circles.
export function AdminHome({ stats }: { stats: Stat[] }) {
  const { user } = useAuth();
  const me = useLoad<{ name: string; profile_image?: string }>("/members/me", {
    name: user?.name || "",
    profile_image: "",
  });
  const [busy, setBusy] = React.useState(false);

  const changePhoto = async () => {
    const data = await pickPhoto();
    if (!data) return;
    setBusy(true);
    try {
      await api.post("/members/me/avatar", { data });
      await me.reload();
    } finally {
      setBusy(false);
    }
  };

  const photo = me.data.profile_image;
  return (
    <View style={[ui.card, { gap: 18 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <Pressable
          onPress={changePhoto}
          accessibilityRole="button"
          accessibilityLabel="Αλλαγή φωτογραφίας"
          style={[
            iconSurface,
            {
              width: 84,
              height: 84,
              borderRadius: 42,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              opacity: busy ? 0.6 : 1,
            },
          ]}
        >
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={{ width: 84, height: 84, borderRadius: 42 }}
            />
          ) : (
            <Ionicons name="camera-outline" size={32} color={wellness.muted} />
          )}
        </Pressable>
        <View style={{ flex: 1, gap: 8 }}>
          <Text
            style={[ui.body, { fontWeight: "600", color: wellness.ink, fontSize: 18 }]}
          >
            {me.data.name || user?.name}
          </Text>
          <View style={styles.teacherBadge}>
            <Text style={styles.teacherText}>ΔΑΣΚΑΛΟΣ</Text>
          </View>
        </View>
      </View>
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statWrap}>
            <View style={styles.statCircle}>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
            <Text style={styles.statLabel} numberOfLines={2}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  teacherBadge: {
    alignSelf: "flex-start",
    backgroundColor: wellness.lavenderInk,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  teacherText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-around",
  },
  statWrap: { alignItems: "center", gap: 6, width: 78 },
  statCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: wellness.lavenderInk,
    backgroundColor: wellness.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: wellness.lavenderInk,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
    color: wellness.muted,
  },
});
