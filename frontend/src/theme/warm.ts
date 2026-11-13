import { useTheme } from "./ThemeContext";

/**
 * Warm "sunrise beige" surface set used only on the events & student-profile
 * screens (inspired by the Bliss reference). Centralised here so both light and
 * dark modes stay cohesive without touching the app-wide palette.
 */
export type Warm = {
  bg: string;
  card: string;
  cardAlt: string;
  ink: string;
  muted: string;
  border: string;
  fill: string; // strong "ink" surface for pills / selected day
  onFill: string; // text/icon colour on `fill`
  accent: string;
  shadow: string;
};

const light: Warm = {
  bg: "#FBF7F0",
  card: "#FFFFFF",
  cardAlt: "#F3ECE0",
  ink: "#2A2520",
  muted: "#8A7F6E",
  border: "#EBE3D5",
  fill: "#2A2520",
  onFill: "#FBF7F0",
  accent: "#C9B896",
  shadow:
    "0px 2px 4px rgba(74,62,42,0.08), 0px 12px 28px rgba(74,62,42,0.14)",
};

const dark: Warm = {
  bg: "#17140F",
  card: "#221E18",
  cardAlt: "#2C271F",
  ink: "#F2EADD",
  muted: "#A89C87",
  border: "#352F26",
  fill: "#E3D5B8",
  onFill: "#221E18",
  accent: "#8C7A58",
  shadow: "0px 2px 6px rgba(0,0,0,0.4), 0px 14px 30px rgba(0,0,0,0.5)",
};

export function useWarm(): Warm {
  const { mode } = useTheme();
  return mode === "dark" ? dark : light;
}
