import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { useUi } from "./Wellness";
import { useLanguage } from "./AppNavigation";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";

export type SeminarPayload = {
  ref: string;
  title: string;
  start_date?: string;
  end_date?: string;
  date_text?: string;
  location?: string;
  image?: string;
  url?: string;
};

const iso = (s?: string) =>
  s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";

const levelFromTitle = (title?: string): number | null => {
  const low = (title || "").toLowerCase();
  const m = low.match(/level\s*([1-4])/) || low.match(/([1-4])\s*ο?\s*επίπεδο/);
  if (m) return Number(m[1]);
  if (low.includes("βασικό επίπεδο")) return 1;
  return null;
};

/** Canonical, source-independent id for a seminar so the catalog card and its
 * blog copy map to the SAME signup (prevents joining the same seminar twice). */
export function seminarRef(opts: {
  end?: string | null;
  level?: number | null;
  title?: string;
  fallback?: string;
}): string {
  const e = iso(opts.end || undefined);
  const lvl = opts.level ?? levelFromTitle(opts.title);
  if (e) return `sem-${e}-l${lvl ?? "x"}`;
  return opts.fallback || "";
}

/** "Δήλωση συμμετοχής" toggle for a seminar/event. Persists per logged-in member. */
export function JoinButton({ seminar }: { seminar: SeminarPayload }) {
  const { user } = useAuth();
  const router = useRouter();
  const { wellness } = useTheme();
  const ui = useUi();
  const { t } = useLanguage();
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const { data } = await api.get("/members/me/seminars");
        if (alive)
          setJoined(
            Array.isArray(data) && data.some((s: any) => s.ref === seminar.ref),
          );
      } catch {
        /* ignore */
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [user, seminar.ref]);

  const toggle = async () => {
    if (!user) {
      router.push("/login" as any);
      return;
    }
    setBusy(true);
    try {
      if (joined) {
        await api.delete(
          `/members/me/seminars/${encodeURIComponent(seminar.ref)}`,
        );
        setJoined(false);
      } else {
        await api.post("/members/me/seminars", {
          ...seminar,
          start_date: iso(seminar.start_date),
          end_date: iso(seminar.end_date) || iso(seminar.start_date),
        });
        setJoined(true);
      }
    } catch {
      Alert.alert(
        t("Κάτι πήγε στραβά", "Something went wrong"),
        t("Προσπάθησε ξανά σε λίγο.", "Please try again shortly."),
      );
    }
    setBusy(false);
  };

  const label = !user
    ? t("Δήλωση συμμετοχής", "Register your spot")
    : joined
      ? t("Έχεις δηλώσει συμμετοχή", "You're signed up")
      : t("Δήλωση συμμετοχής", "Register your spot");

  return (
    <Pressable
      testID="join-seminar-button"
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={busy || !ready}
      onPress={toggle}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: joined ? wellness.white : wellness.lavenderInk,
        borderWidth: 1.5,
        borderColor: wellness.lavenderInk,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 24,
        minHeight: 50,
        opacity: pressed || !ready ? 0.85 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator
          size="small"
          color={joined ? wellness.lavenderInk : wellness.white}
        />
      ) : (
        <Ionicons
          name={joined ? "checkmark-circle" : "person-add-outline"}
          size={18}
          color={joined ? wellness.lavenderInk : wellness.white}
        />
      )}
      <Text
        style={[
          ui.body,
          {
            fontWeight: "700",
            fontSize: 15,
            color: joined ? wellness.lavenderInk : wellness.white,
          },
        ]}
      >
        {label}
      </Text>
      {joined && !busy && (
        <Text style={[ui.body, { fontSize: 13, color: wellness.muted }]}>
          · {t("Ακύρωση", "Cancel")}
        </Text>
      )}
    </Pressable>
  );
}

export default JoinButton;
