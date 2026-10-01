// Modern wellness: white, ice grey and pale blue, with the owner's reference palette.
export const wellness = {
  lavender: '#E9E3F3', lavenderInk: '#69577F', sage: '#E8F0E9', sageInk: '#4F6D59', champagne: '#D9CDB5', champagneInk: '#78613D',
  white: '#FFFFFF', ice: '#F3F6F8', blueMist: '#E8F1F7', blueSelected: '#DCEAF4',
  slate: '#545F7A', ink: '#293344', muted: '#617083', line: '#DCE3E9',
  rust: '#8F3D20', clay: '#CB865E', earth: '#522113', taupe: '#C2A9A5',
  sand: '#9A7F59', oat: '#D9CDB5', stone: '#E5E5E5', cream: '#E7DDD1',
};

export const colors = {
  bg: {
    primary: wellness.white,     // clean white — main background
    secondary: '#FFFFFF',   // pure white — cards
    tertiary: wellness.ice,    // ice grey — input chrome
    elevated: '#FFFFFF',
    overlay: 'rgba(20, 22, 24, 0.55)',
    dark: '#141618',        // dark sections / hero overlays
    darkSoft: '#1F2124',    // softer dark
  },
  text: {
    primary: wellness.ink,     // headings, deep charcoal
    secondary: wellness.ink,   // body — warm dark grey
    muted: wellness.muted,       // captions
    accent: wellness.slate,      // slate blue
    inverse: wellness.white,     // text on dark surfaces
    inverseSecondary: 'rgba(252,251,249,0.78)',
  },
  accent: {
    gold: wellness.slate,        // legacy key; primary slate accent
    goldDeep: wellness.slate,
    goldSoft: wellness.blueSelected,
    bronze: wellness.sand,
    cyan: '#3D8B9C',        // muted teal — refined complement
    purple: wellness.lavenderInk,      // soft heather
    coral: wellness.clay,       // earthy clay
    turquoise: '#4A9CA8',
    lavender: wellness.lavender,
    indigo: '#2C2A4A',
  },
  border: {
    default: wellness.line,
    subtle: 'rgba(21, 21, 21, 0.08)',
    strong: 'rgba(21, 21, 21, 0.18)',
    glow: 'rgba(84, 95, 122, 0.25)',
  },
  status: {
    success: '#5A8A5C',
    warning: '#C9923F',
    danger: '#B8553F',
  },
};

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

