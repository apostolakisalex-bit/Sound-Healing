// Sound Healing Greece — design tokens
// Palette extracted directly from soundhealing.gr:
//   warm ivory backgrounds, deep charcoal text, classic gold accents (#D4AF37).
//   Font: Raleway (sans) paired with Cormorant Garamond (editorial serif headings).

export const colors = {
  bg: {
    primary: '#FCFBF9',     // warm ivory — main background
    secondary: '#FFFFFF',   // pure white — cards
    tertiary: '#F4F2EE',    // subtle warm grey — input chrome
    elevated: '#FFFFFF',
    overlay: 'rgba(20, 22, 24, 0.55)',
    dark: '#141618',        // dark sections / hero overlays
    darkSoft: '#1F2124',    // softer dark
  },
  text: {
    primary: '#151515',     // headings, deep charcoal
    secondary: '#333333',   // body — warm dark grey
    muted: '#888888',       // captions
    accent: '#D4AF37',      // classic gold
    inverse: '#FCFBF9',     // text on dark surfaces
    inverseSecondary: 'rgba(252,251,249,0.78)',
  },
  accent: {
    gold: '#D4AF37',        // primary brand accent
    goldDeep: '#B8941F',
    goldSoft: '#E5C76B',
    bronze: '#8B6F2C',
    cyan: '#3D8B9C',        // muted teal — refined complement
    purple: '#6E5C8B',      // soft heather
    coral: '#C8704D',       // earthy clay
    turquoise: '#4A9CA8',
    lavender: '#A89BB8',
    indigo: '#2C2A4A',
  },
  border: {
    default: 'rgba(212, 175, 55, 0.35)',
    subtle: 'rgba(21, 21, 21, 0.08)',
    strong: 'rgba(21, 21, 21, 0.18)',
    glow: 'rgba(212, 175, 55, 0.5)',
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
  // Editorial serif — large cinematic headings
  heading: 'CormorantGaramond_600SemiBold',
  title: 'CormorantGaramond_500Medium',
  italic: 'CormorantGaramond_400Regular_Italic',
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
