import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { colors, fonts } from "@/src/theme";

// Reuse the existing Emergent brand instead of introducing a parallel theme.
const brandFont = (name: string, serif = false) =>
  Platform.OS === "web"
    ? `${name}, ${serif ? "Georgia, serif" : "Arial, sans-serif"}`
    : name;

export const palette = {
  ink: colors.text.primary,
  muted: colors.text.secondary,
  paper: colors.bg.primary,
  sage: colors.bg.tertiary,
  peach: colors.bg.tertiary,
  line: colors.border.default,
  white: colors.bg.secondary,
};
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.paper },
  wrap: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    padding: 24,
    gap: 24,
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
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  title: {
    fontFamily: brandFont(fonts.heading, true),
    fontSize: 38,
    lineHeight: 44,
    color: palette.ink,
    fontWeight: "600",
    letterSpacing: -1,
  },
  heading: {
    fontFamily: brandFont(fonts.heading, true),
    fontSize: 23,
    color: palette.ink,
    fontWeight: "600",
  },
  body: {
    fontFamily: brandFont(fonts.body),
    fontSize: 16,
    lineHeight: 25,
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
    backgroundColor: colors.bg.dark,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    minHeight: 48,
    justifyContent: "center",
  },
  secondary: { backgroundColor: palette.sage },
  error: { backgroundColor: "#FCE5DE", padding: 16, borderRadius: 12 },
});
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
  return state.loading ? (
    <ActivityIndicator color={palette.ink} />
  ) : state.error ? (
    <View style={ui.error}>
      <Text style={ui.body}>{state.error}</Text>
      <Button label="Δοκίμασε ξανά" onPress={state.reload} />
    </View>
  ) : null;
}
export function Shell({
  title,
  eyebrow,
  children,
  publicPage = false,
  siteSettings,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  publicPage?: boolean;
  siteSettings?: ContentItem["published"];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = publicPage && width < 760;
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  const links = publicPage
    ? [
        ...(siteSettings?.navigation != null
          ? siteSettings.navigation
              .filter((item) => item.visible)
              .map((item) => [item.label, "/explore/" + item.section])
          : [
              ["Εμπειρίες", "/explore/services"],
              ["Εκπαιδεύσεις", "/explore/training"],
              ["Μανώλης", "/explore/about"],
              ["Εκδηλώσεις", "/explore/events"],
              ["Άρθρα", "/explore/journal"],
              ["Επικοινωνία", "/explore/contact"],
            ]),
        ["Σύνδεση", "/login"],
        ["Εγγραφή", "/register"],
      ]
    : [
        ["Αρχική", "/(tabs)/sanctuary"],
        ["Σχολή", "/(tabs)/academy"],
        ["Πρακτική", "/(tabs)/practice"],
        ["Journey", "/(tabs)/journey"],
        ["Προφίλ", "/(tabs)/profile"],
      ];
  return (
    <ScrollView style={ui.page}>
      <View style={ui.wrap}>
        <View style={[ui.row, { justifyContent: "space-between" }]}>
          <Pressable accessibilityRole="link" onPress={() => router.push("/")}>
            <Text style={[ui.label, { letterSpacing: 2 }]}>
              {siteSettings?.title || "SOUND HEALING GREECE"}
            </Text>
            <Text style={ui.body}>
              {siteSettings
                ? siteSettings.summary
                : "learn · practise · feel connected"}
            </Text>
          </Pressable>
          {compact && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
              accessibilityState={{ expanded: menuOpen }}
              onPress={() => setMenuOpen(!menuOpen)}
              style={[ui.button, ui.secondary]}
            >
              <Text style={ui.label}>
                {menuOpen ? "Κλείσιμο ×" : "Μενού ☰"}
              </Text>
            </Pressable>
          )}
          {user && ["admin", "instructor"].includes(user.role) && (
            <Button
              secondary
              label="Διαχείριση"
              onPress={() => router.push("/admin" as any)}
            />
          )}
        </View>
        {(!compact || menuOpen) && (
          <View style={ui.row}>
            {links.map(([label, route]) =>
              publicPage ? (
                <Link
                  key={route}
                  href={route as any}
                  onPress={() => setMenuOpen(false)}
                  style={[
                    ui.body,
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor:
                        pathname === route ? colors.accent.gold : palette.line,
                      backgroundColor:
                        pathname === route ? palette.sage : palette.white,
                      color: palette.ink,
                    },
                  ]}
                >
                  {label}
                </Link>
              ) : (
                <Button
                  secondary
                  key={route}
                  label={label}
                  onPress={() => router.push(route as any)}
                />
              ),
            )}
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
            : "Sound Healing Greece · Χανιά · Αθήνα · Online"}
        </Text>
      </View>
    </ScrollView>
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
    navigation?: { section: string; label: string; visible: boolean }[] | null;
    image_url?: string;
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
  return (
    <View style={ui.card}>
      {!!p.image_url && (
        <Image
          source={{ uri: p.image_url }}
          accessibilityLabel={p.image_alt || p.title}
          resizeMode="cover"
          style={{ width: "100%", height: 240, borderRadius: 16 }}
        />
      )}
      <Text style={ui.label}>{p.level_id || "WELLNESS"}</Text>
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
          label="Άνοιγμα υλικού"
          onPress={() => {
            void Linking.openURL(p.media_url);
          }}
        />
      )}
      {complete && (
        <ResourcesSection
          parentType="cms_content"
          parentId={item.id}
          title="Υλικό μαθήματος"
        />
      )}
      {complete && (
        <Button
          disabled={busy || completed}
          label={
            completed
              ? "Ολοκληρώθηκε"
              : busy
                ? "Αποθήκευση…"
                : "Σημείωση ως ολοκληρωμένο"
          }
          onPress={async () => {
            setBusy(true);
            setMessage("");
            try {
              await api.post(`/school/lessons/${item.id}/complete`);
              setCompleted(true);
            } catch {
              setMessage("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
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
