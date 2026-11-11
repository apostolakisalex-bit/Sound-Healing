// Warm "wellness" palette: taupe/greige page, cream cards, espresso + caramel accents.
export const lightWellness = {
  lavender: '#EADCC8', lavenderInk: '#6B5540', sage: '#E8E0D2', sageInk: '#6E5D45', champagne: '#D9CDB5', champagneInk: '#78613D',
  white: '#FBF7F1', ice: '#ECE3D8', blueMist: '#EFE6D9', blueSelected: '#E3D5C1',
  slate: '#7C6650', ink: '#2F2823', muted: '#8A7C6C', line: '#E2D8C9',
  rust: '#8F3D20', clay: '#CB865E', earth: '#522113', taupe: '#C2A9A5',
  sand: '#9A7F59', oat: '#D9CDB5', stone: '#E6DED3', cream: '#E7DDD1',
};
export type Wellness = typeof lightWellness;

// Calm, spa-like warm night palette. "white" = card surface, "ink" = primary (light) text.
export const darkWellness: Wellness = {
  lavender: '#332B22', lavenderInk: '#D8C2A2', sage: '#2A271F', sageInk: '#C7B79A', champagne: '#33302A', champagneInk: '#D8C39A',
  white: '#262019', ice: '#1A1511', blueMist: '#262019', blueSelected: '#352C22',
  slate: '#C6B096', ink: '#F1EAE0', muted: '#A89A86', line: '#332B22',
  rust: '#C96A47', clay: '#D79A74', earth: '#6B3A28', taupe: '#C2A9A5',
  sand: '#C2A878', oat: '#D9CDB5', stone: '#3A352C', cream: '#2A251F',
};

// Back-compat default (light) for any module-scope usage not yet themed.
export const wellness = lightWellness;

export const lightColors = {
  bg: {
    primary: lightWellness.white,     // clean white — main background
    secondary: '#FFFFFF',   // pure white — cards
    tertiary: lightWellness.ice,    // ice grey — input chrome
    elevated: '#FFFFFF',
    overlay: 'rgba(20, 22, 24, 0.55)',
    dark: '#141618',        // dark sections / hero overlays
    darkSoft: '#1F2124',    // softer dark
  },
  text: {
    primary: lightWellness.ink,     // headings, deep charcoal
    secondary: lightWellness.ink,   // body — warm dark grey
    muted: lightWellness.muted,       // captions
    accent: lightWellness.slate,      // slate blue
    inverse: lightWellness.white,     // text on dark surfaces
    inverseSecondary: 'rgba(252,251,249,0.78)',
  },
  accent: {
    gold: lightWellness.slate,        // legacy key; primary slate accent
    goldDeep: lightWellness.slate,
    goldSoft: lightWellness.blueSelected,
    bronze: lightWellness.sand,
    cyan: '#B08A5A',        // warm caramel
    purple: lightWellness.lavenderInk,      // warm coffee accent
    coral: lightWellness.clay,       // earthy clay
    turquoise: '#A8894A',
    lavender: lightWellness.lavender,
    indigo: '#3A2E22',
  },
  border: {
    default: lightWellness.line,
    subtle: 'rgba(21, 21, 21, 0.08)',
    strong: 'rgba(21, 21, 21, 0.18)',
    glow: 'rgba(124, 102, 80, 0.25)',
  },
  status: {
    success: '#5A8A5C',
    warning: '#C9923F',
    danger: '#B8553F',
  },
};
export type Colors = typeof lightColors;

export const darkColors: Colors = {
  bg: {
    primary: darkWellness.ice,       // deep page background
    secondary: darkWellness.white,   // cards
    tertiary: darkWellness.blueMist, // input chrome
    elevated: '#232838',
    overlay: 'rgba(0, 0, 0, 0.6)',
    dark: '#0E1018',
    darkSoft: '#141824',
  },
  text: {
    primary: darkWellness.ink,
    secondary: '#D5DAE4',
    muted: darkWellness.muted,
    accent: darkWellness.slate,
    inverse: darkWellness.ice,
    inverseSecondary: 'rgba(20,24,36,0.78)',
  },
  accent: {
    gold: darkWellness.slate,
    goldDeep: darkWellness.slate,
    goldSoft: darkWellness.blueSelected,
    bronze: darkWellness.sand,
    cyan: '#C9A878',
    purple: darkWellness.lavenderInk,
    coral: darkWellness.clay,
    turquoise: '#C6A86A',
    lavender: darkWellness.lavender,
    indigo: '#D8C2A2',
  },
  border: {
    default: darkWellness.line,
    subtle: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.18)',
    glow: 'rgba(198, 176, 150, 0.28)',
  },
  status: {
    success: '#6FB071',
    warning: '#D9A94F',
    danger: '#D4745C',
  },
};

// Back-compat default (light).
export const colors = lightColors;

export const themes = {
  light: { wellness: lightWellness, colors: lightColors },
  dark: { wellness: darkWellness, colors: darkColors },
};
export type ThemeMode = keyof typeof themes;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

// Unified card elevation — one consistent, slightly 3D surface shadow across the app.
export const cardShadow = (isDark: boolean) =>
  isDark
    ? '0px 2px 4px rgba(0,0,0,0.35), 0px 10px 24px rgba(0,0,0,0.5)'
    : '0px 2px 4px rgba(60,48,34,0.1), 0px 10px 24px rgba(60,48,34,0.16)';


export const fonts = {
  // Clean sans-serif throughout the active experience
  heading: 'Raleway_600SemiBold',
  title: 'Raleway_500Medium',
  italic: 'Raleway_400Regular',
  // Raleway — matches soundhealing.gr exactly
  body: 'Raleway_400Regular',
  bodyMed: 'Raleway_500Medium',
  bodySemi: 'Raleway_600SemiBold',
  bodyBold: 'Raleway_700Bold',
};

export const fontSizes = {
  h1: 44,
  h2: 34,
  h3: 26,
  h4: 20,
  bodyLg: 17,
  body: 15,
  small: 13,
  caption: 11,
  overline: 10,
};
