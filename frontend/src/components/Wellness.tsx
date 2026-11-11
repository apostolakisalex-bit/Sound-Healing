import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader, BottomNavigation, HeaderControls, useLanguage } from "./AppNavigation";
import { GoldenDust } from "./GoldenDust";
import { ManagedImage } from "./ManagedImage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { ResourcesSection } from "@/src/components/ResourcesSection";
import { api } from "@/src/api/client";
import {
  fonts,
  lightWellness,
  lightColors,
  darkColors,
  type Wellness as WellnessPalette,
  type Colors,
} from "@/src/theme";
import { useTheme } from "@/src/theme/ThemeContext";

// Reuse the existing Emergent brand instead of introducing a parallel theme.
const brandFont = (name: string, serif = false) =>
  Platform.OS === "web"
    ? `${name}, ${serif ? "Georgia, serif" : "Arial, sans-serif"}`
    : name;

export function makePalette(colors: Colors) {
  return {
    ink: colors.text.primary,
    muted: colors.text.secondary,
    paper: colors.bg.primary,
    sage: colors.bg.tertiary,
    peach: colors.bg.tertiary,
    line: colors.border.default,
    white: colors.bg.secondary,
  };
}

export function makeUi(wellness: WellnessPalette, colors: Colors) {
  const palette = makePalette(colors);
  const isDark = colors === darkColors;
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: palette.paper },
    wrap: {
      width: "100%",
      maxWidth: 1120,
      alignSelf: "center",
      padding: 24,
      gap: 20,
      paddingBottom: 64,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "center",
    },
    card: {
      backgroundColor: palette.white,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: palette.line,
      boxShadow: isDark
        ? "0 1px 2px rgba(0,0,0,0.3), 0 14px 28px rgba(0,0,0,0.4)"
        : "0 1px 2px rgba(45,38,66,0.06), 0 14px 28px rgba(45,38,66,0.12)",
      gap: 12,
    },
    title: {
      fontFamily: brandFont(fonts.title),
      fontSize: 26,
      lineHeight: 34,
      color: palette.ink,
      fontWeight: "400",
      letterSpacing: -0.3,
    },
    heading: {
      fontFamily: brandFont(fonts.title),
      fontSize: 20,
      color: palette.ink,
      fontWeight: "400",
    },
    body: {
      fontFamily: brandFont(fonts.body),
      fontSize: 14,
      lineHeight: 23,
      color: palette.muted,
    },
    label: {
      fontFamily: brandFont(fonts.bodySemi),
      fontSize: 12,
      letterSpacing: 1.6,
      fontWeight: "700",
      color: palette.ink,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      fontFamily: brandFont(fonts.body),
      color: palette.ink,
      backgroundColor: palette.white,
      minHeight: 48,
    },
    button: {
      backgroundColor: isDark ? "#7A68A0" : wellness.lavenderInk,
      borderWidth: 1,
      borderColor: isDark ? "#7A68A0" : wellness.lavenderInk,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 24,
      minHeight: 48,
      justifyContent: "center",
    },
    secondary: {
      backgroundColor: palette.sage,
      borderColor: palette.line,
    },
    error: {
      backgroundColor: isDark ? "rgba(212,116,92,0.18)" : "#FCE5DE",
      padding: 16,
      borderRadius: 12,
    },
  });
}

// Back-compat static light exports (module-scope usage not yet themed).
export const palette = makePalette(lightColors);
export const ui = makeUi(lightWellness, lightColors);

export function usePalette() {
  const { colors } = useTheme();
  return useMemo(() => makePalette(colors), [colors]);
}
export function useUi() {
  const { wellness, colors } = useTheme();
  return useMemo(() => makeUi(wellness, colors), [wellness, colors]);
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const ui = useUi();
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        secondary && ui.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text
        style={{
          color: secondary ? palette.ink : "white",
          fontWeight: "600",
          fontFamily: brandFont(fonts.bodySemi),
          fontSize: 15,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  multiline?: boolean;
}) {
  const ui = useUi();
  return (
    <View style={{ gap: 6 }}>
      <Text style={ui.body}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        style={[
          ui.input,
          multiline && { minHeight: 100, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Choices({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  const ui = useUi();
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.body}>{label}</Text>
      <View style={ui.row}>
        {values.map((v) => (
          <Button
            key={v}
            label={v}
            secondary={v !== value}
            onPress={() => onChange(v)}
          />
        ))}
      </View>
    </View>
  );
}
export function useLoad<T>(url: string, initial: T) {
  const empty = useRef(initial);
  const pending = useRef<AbortController | null>(null);
  const [data, setData] = useState<T>(initial),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = useCallback(async () => {
    pending.current?.abort();
    const request = new AbortController();
    pending.current = request;
    setLoading(true);
    setError("");
    setData(empty.current);
    try {
      const response = await api.get(url, { signal: request.signal });
      if (!request.signal.aborted) setData(response.data);
    } catch {
      if (!request.signal.aborted)
        setError("Δεν μπορέσαμε να φορτώσουμε τα στοιχεία. Δοκίμασε ξανά.");
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    void reload();
    return () => pending.current?.abort();
  }, [reload]);
  return { data, loading, error, reload };
}
export function Status({
  state,
}: {
  state: { loading: boolean; error: string; reload: () => void };
}) {
  const ui = useUi();
  const palette = usePalette();
  const { t } = useLanguage();
  return state.loading ? (
    <ActivityIndicator color={palette.ink} />
  ) : state.error ? (
    <View style={ui.error}>
      <Text style={ui.body}>
        {t(
          "Δεν μπορέσαμε να φορτώσουμε τα στοιχεία. Δοκίμασε ξανά.",
          "We couldn't load this. Please try again.",
        )}
      </Text>
      <Button label={t("Δοκίμασε ξανά", "Try again")} onPress={state.reload} />
    </View>
  ) : null;
}
export function Shell({
  title,
  eyebrow,
  children,
  publicPage = false,
  siteSettings,
  hideHeader = false,
  notifications = false,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  publicPage?: boolean;
  hideHeader?: boolean;
  notifications?: boolean;
  siteSettings?: ContentItem["published"];
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const ui = useUi();
  const { t } = useLanguage();
  const staff = !!user && ["admin", "instructor"].includes(user.role);
  return (
    <KeyboardAvoidingView style={[ui.page, { paddingLeft: insets.left, paddingRight: insets.right }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <GoldenDust />
      {hideHeader && <HeaderControls floating />}
      <ScrollView style={[ui.page, { backgroundColor: "transparent" }]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={[ui.wrap, { paddingBottom: 110 + insets.bottom, paddingTop: hideHeader ? 0 : 24 + insets.top }]}>
          {!hideHeader && <AppHeader notifications={notifications} />}
          {staff && !publicPage && (
            <View style={ui.row}>
              <Text style={ui.body}>
                {user?.name} ·{" "}
                {user?.role === "admin" ? "Διαχειριστής" : "Εκπαιδευτής"}
              </Text>
              <Button
                secondary
                label="Αποσύνδεση"
                onPress={() => {
                  void logout().then(() => router.replace("/"));
                }}
              />
            </View>
          )}
          {!!title && (
            <View style={{ gap: 10, marginTop: 16 }}>
              <Text style={ui.label}>{eyebrow}</Text>
              <Text style={ui.title}>{title}</Text>
            </View>
          )}
          {children}
          <Text style={ui.body}>
            {siteSettings
              ? siteSettings.body
              : t(
                  "Sound Healing Greece · Χανιά · Αθήνα · Online",
                  "Sound Healing Greece · Chania · Athens · Online",
                )}
          </Text>
        </View>
      </ScrollView>
      <BottomNavigation />
    </KeyboardAvoidingView>
  );
}
export type ContentItem = {
  id: string;
  completed?: boolean;
  published: {
    title: string;
    summary: string;
    body: string;
    kind: string;
    section?: string;
    show_testimonials?: boolean;
    show_partners?: boolean;
    show_socials?: boolean;
    navigation?: { section: string; label: string; visible: boolean }[] | null;
    image_url?: string;
  photo_slot?: string;
    event_end_date?: string;
    event_date?: string;
    event_time?: string;
    event_location?: string;
    image_alt?: string;
    action_label?: string;
    action_url?: string;
    level_id: string | null;
    media_url: string;
  };
};
export function ContentCard({
  item,
  complete = false,
}: {
  item: ContentItem;
  complete?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(!!item.completed);
  useEffect(() => {
    setCompleted(!!item.completed);
    setMessage("");
  }, [item.id, item.completed]);
  const p = item.published;
  const ui = useUi();
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <View style={ui.card}>
      {!!p.image_url && (
        <ManagedImage
          source={{ uri: p.image_url }}
          accessibilityLabel={p.image_alt || p.title}
          resizeMode="cover"
          style={{ width: "100%", height: 240, borderRadius: 16 }}
        />
      )}
      <Text style={ui.label}>{p.level_id || t("ΕΥΕΞΙΑ", "WELLNESS")}</Text>
      <Text style={ui.heading}>{p.title}</Text>
      <Text style={ui.body}>{p.summary}</Text>
      {!!p.body && <Text style={ui.body}>{p.body}</Text>}
      {!!p.action_url && !!p.action_label && (
        <Link
          href={p.action_url as any}
          style={[
            ui.body,
            {
              color: colors.text.primary,
              textDecorationLine: "underline",
              paddingVertical: 12,
            },
          ]}
        >
          {p.action_label} ↗
        </Link>
      )}
      {!!p.media_url && (
        <Button
          secondary
          label={t("Άνοιγμα υλικού", "Open material")}
          onPress={() => {
            void Linking.openURL(p.media_url);
          }}
        />
      )}
      {complete && (
        <ResourcesSection
          parentType="cms_content"
          parentId={item.id}
          title={t("Υλικό μαθήματος", "Lesson material")}
        />
      )}
      {complete && (
        <Button
          disabled={busy || completed}
          label={
            completed
              ? t("Ολοκληρώθηκε", "Completed")
              : busy
                ? t("Αποθήκευση…", "Saving…")
                : t("Σημείωση ως ολοκληρωμένο", "Mark as complete")
          }
          onPress={async () => {
            setBusy(true);
            setMessage("");
            try {
              await api.post(`/school/lessons/${item.id}/complete`);
              setCompleted(true);
            } catch {
              setMessage(t("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.", "Not saved. Please try again."));
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
    </View>
  );
}
