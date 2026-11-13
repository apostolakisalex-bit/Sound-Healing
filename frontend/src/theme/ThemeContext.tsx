import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  themes,
  type Colors,
  type ThemeMode,
  type Wellness,
} from "@/src/theme";

type Preference = "system" | "light" | "dark";
const STORAGE_KEY = "themePreference";

type ThemeValue = {
  mode: ThemeMode;
  preference: Preference;
  wellness: Wellness;
  colors: Colors;
  toggle: () => void;
  setPreference: (p: Preference) => void;
};

const ThemeCtx = createContext<ThemeValue>({
  mode: "light",
  preference: "system",
  wellness: themes.light.wellness,
  colors: themes.light.colors,
  toggle: () => {},
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<Preference>("system");
  const [systemMode, setSystemMode] = useState<ThemeMode>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setPreferenceState(v);
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemMode(colorScheme === "dark" ? "dark" : "light"),
    );
    return () => sub.remove();
  }, []);

  const mode: ThemeMode = preference === "system" ? systemMode : preference;

  const setPreference = useCallback((p: Preference) => {
    setPreferenceState(p);
    void AsyncStorage.setItem(STORAGE_KEY, p);
  }, []);

  const toggle = useCallback(() => {
    setPreference(mode === "dark" ? "light" : "dark");
  }, [mode, setPreference]);

  const value = useMemo<ThemeValue>(
    () => ({
      mode,
      preference,
      wellness: themes[mode].wellness,
      colors: themes[mode].colors,
      toggle,
      setPreference,
    }),
    [mode, preference, toggle, setPreference],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
