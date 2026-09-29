import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/AuthContext";
import { ResourcesSection } from "@/src/components/ResourcesSection";
import { api } from "@/src/api/client";

export const palette = {
  ink: "#193F36",
  muted: "#586E64",
  paper: "#F7F8F2",
  sage: "#E5EDDC",
  peach: "#F8E6D8",
  line: "#D8E1D5",
  white: "#FFFFFF",
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
    fontSize: 38,
    lineHeight: 44,
    color: palette.ink,
    fontWeight: "600",
    letterSpacing: -1,
  },
  heading: { fontSize: 23, color: palette.ink, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 25, color: palette.muted },
  label: {
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
    color: palette.ink,
    backgroundColor: palette.white,
    minHeight: 48,
  },
  button: {
    backgroundColor: palette.ink,
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
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  publicPage?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const links = publicPage
    ? [
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
              SOUND HEALING GREECE
            </Text>
            <Text style={ui.body}>learn · practise · feel connected</Text>
          </Pressable>
          {user && ["admin", "instructor"].includes(user.role) && (
            <Button
              secondary
              label="Διαχείριση"
              onPress={() => router.push("/admin" as any)}
            />
          )}
        </View>
        <View style={ui.row}>
          {links.map(([label, route]) => (
            <Button
              secondary
              key={route}
              label={label}
              onPress={() => router.push(route as any)}
            />
          ))}
        </View>
        <View style={{ gap: 10, marginTop: 16 }}>
          <Text style={ui.label}>{eyebrow}</Text>
          <Text style={ui.title}>{title}</Text>
        </View>
        {children}
        <Text style={ui.body}>
          Sound Healing Greece · Χανιά · Αθήνα · Online
        </Text>
      </View>
    </ScrollView>
  );
}
export type ContentItem = {
  id: string;
  published: {
    title: string;
    summary: string;
    body: string;
    kind: string;
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
  const p = item.published;
  return (
    <View style={ui.card}>
      <Text style={ui.label}>{p.level_id || "WELLNESS"}</Text>
      <Text style={ui.heading}>{p.title}</Text>
      <Text style={ui.body}>{p.summary}</Text>
      {!!p.body && <Text style={ui.body}>{p.body}</Text>}
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
          disabled={busy || !!message}
          label={message || "Σημείωση ως ολοκληρωμένο"}
          onPress={async () => {
            setBusy(true);
            try {
              await api.post(`/school/lessons/${item.id}/complete`);
              setMessage("Ολοκληρώθηκε");
            } catch {
              setMessage("Αποτυχία αποθήκευσης — άνοιξε ξανά το μάθημα.");
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </View>
  );
}
