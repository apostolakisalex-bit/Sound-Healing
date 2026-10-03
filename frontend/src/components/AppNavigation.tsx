import { wellness } from "@/src/theme";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SoundSpiral } from "@/src/components/icons/SoundSpiral";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";

// Elegant wellness wordmark (Cormorant Garamond) for the brand logotype.
const BRAND_WORDMARK =
  Platform.OS === "web"
    ? "CormorantGaramond_600SemiBold, Georgia, serif"
    : "CormorantGaramond_600SemiBold";

const Language = createContext({ language: "el", toggle: () => {} });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("el");
  return (
    <Language.Provider
      value={{
        language,
        toggle: () => setLanguage((v) => (v === "el" ? "en" : "el")),
      }}
    >
      {children}
    </Language.Provider>
  );
}
export const useLanguage = () => useContext(Language);
export const iconSurface = {
  backgroundColor: wellness.ice,
  borderRadius: 15,
  shadowColor: "#655A42",
  shadowOpacity: 0.12,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

export function AppHeader({
  hideBrand = false,
  notifications: showNotifications = false,
}: {
  hideBrand?: boolean;
  notifications?: boolean;
}) {
  const { user } = useAuth();
  const { language, toggle } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<
    { id: string; text: string; read: boolean }[]
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    setRows([]);
    setOpen(false);
    if (user)
      api
        .get("/notifications")
        .then((r) => setRows(r.data))
        .catch(() => {});
  }, [user?.id]);
  const notifications = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setOpen((v) => !v);
    setError("");
    try {
      setRows((await api.get("/notifications")).data);
    } catch {
      setError("Δεν φορτώθηκαν οι ειδοποιήσεις.");
    }
  };
  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {!hideBrand && <Pressable
          accessibilityRole="link"
          accessibilityLabel="Sound Healing Greece Home"
          onPress={() => router.push("/")}
          style={{ flex: 1 }}
        >
          <Text
            style={{
              fontSize: 21,
              fontFamily: BRAND_WORDMARK,
              fontWeight: "600",
              color: wellness.ink,
              letterSpacing: 1.2,
            }}
          >
            Sound Healing Greece
          </Text>
        </Pressable>}
        {hideBrand && <View style={{ flex: 1 }} />}

        {showNotifications && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              language === "el" ? "Ειδοποιήσεις" : "Notifications"
            }
            onPress={() => void notifications()}
            style={{
              padding: 10,
              minHeight: 44,
              minWidth: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={wellness.ink}
            />
            {rows.some((r) => !r.read) && (
              <View
                style={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: wellness.slate,
                }}
              />
            )}
          </Pressable>
        )}
      </View>
      {open && (
        <View
          style={{
            padding: 14,
            backgroundColor: wellness.ice,
            borderRadius: 12,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {language === "el" ? "Ειδοποιήσεις" : "Notifications"}
          </Text>
          {!!error && <Text>{error}</Text>}
          {!rows.length && !error && (
            <Text>
              {language === "el"
                ? "Δεν υπάρχουν ειδοποιήσεις."
                : "No notifications."}
            </Text>
          )}
          {rows.map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              onPress={async () => {
                try {
                  await api.post(`/notifications/${r.id}/read`);
                  setRows((old) =>
                    old.map((n) => (n.id === r.id ? { ...n, read: true } : n)),
                  );
                } catch {
                  setError("Δεν αποθηκεύτηκε η ανάγνωση.");
                }
              }}
            >
              <Text
                style={{ color: wellness.ink, fontWeight: r.read ? "400" : "600" }}
              >
                {r.text}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function BottomNavigation() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const routes: {
    label: string;
    en: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
  }[] = [
    { label: "Αρχική", en: "Home", icon: "home-outline", route: "/" },
    {
      label: "Ηχοθεραπεία",
      en: "Sound",
      icon: "musical-notes-outline",
      route: "/explore/soundhealing",
    },
    {
      label: "Εκπαιδευτικά",
      en: "Training",
      icon: "school-outline",
      route: "/explore/training",
    },
    {
      label: "Εκδηλώσεις",
      en: "Events",
      icon: "calendar-outline",
      route: "/explore/events",
    },
    {
      label: "Προφίλ",
      en: "Profile",
      icon: "person-outline",
      route: user
        ? ["admin", "instructor"].includes(user.role)
          ? "/admin"
          : "/profile"
        : "/login",
    },
  ];
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
        backgroundColor: wellness.white,
        borderTopWidth: 1,
        borderColor: wellness.line,
        shadowColor: "#4B4030",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -3 },
        elevation: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          maxWidth: 650,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {routes.map((item, index) => {
          const active =
            pathname === item.route ||
            (index === 2 && pathname === "/explore/levels") ||
            (index === 4 && ["/profile", "/admin"].includes(pathname));
          return (
            <Pressable
              key={item.route}
              accessibilityRole="link"
              accessibilityLabel={language === "el" ? item.label : item.en}
              accessibilityState={{ selected: active }}
              onPress={() => router.push(item.route as any)}
              style={{
                flex: 1,
                alignItems: "center",
                gap: 3,
                minHeight: 48,
                paddingVertical: 4,
              }}
            >
              <View
                style={{
                  minWidth: 46,
                  height: 30,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  backgroundColor: active ? wellness.lavender : "transparent",
                }}
              >
                {index === 4 && user?.profile_image ? (
                  <Image
                    source={{ uri: user.profile_image }}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                  />
                ) : index === 1 ? (
                  <SoundSpiral
                    size={21}
                    color={active ? wellness.lavenderInk : wellness.ink}
                  />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={21}
                    color={active ? wellness.lavenderInk : wellness.ink}
                  />
                )}
              </View>
              <Text
                numberOfLines={1}
                style={{ fontSize: 10, color: active ? wellness.lavenderInk : wellness.muted }}
              >
                {language === "el" ? item.label : item.en}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
