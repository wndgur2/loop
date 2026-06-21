/**
 * Loop design tokens — ports demo/loop.css's "ordered warmth" palette to RN.
 * Single warm clay/honey accent + warm canvas + calm rounding.
 * Source-of-truth design: demo/ (Claude Design handoff). MVP prioritizes light mode.
 */

export const LoopColors = {
  // warm accent (the only saturated color in the UI)
  warm: '#DD8A4F',
  warmHover: '#CD7A3E',
  warmDeep: '#B06A33', // text/icons on light
  warmPress: '#9E5C2A',
  warmSoft: '#FBF1E8', // tinted surface
  warmSoft2: '#F5E4D4', // chip / fill
  warmLine: '#EAD3BD', // hairline on warm
  ringTrack: '#EFE6DC', // progress ring track

  // calm positive (internalized / done)
  good: '#2FA567',
  goodSoft: '#E7F4ED',

  // destructive — warm terracotta red (harmonizes with the warm palette, still reads as danger)
  danger: '#C7553F',
  dangerSoft: 'rgba(199, 85, 63, 0.12)',

  // canvas / surface
  canvas: '#FAF8F5',
  surface: '#FFFFFF',

  // warm-leaning neutrals (text)
  ink: '#1F1D1B',
  ink2: 'rgba(40, 36, 33, 0.78)',
  ink3: 'rgba(48, 43, 39, 0.56)',
  ink4: 'rgba(48, 43, 39, 0.34)',
  line: 'rgba(60, 50, 42, 0.12)',
  lineSoft: 'rgba(60, 50, 42, 0.07)',
  fill: 'rgba(60, 50, 42, 0.05)',

  white: '#FFFFFF',
} as const;

export type LoopColor = keyof typeof LoopColors;

/** 4px grid */
export const LoopSpace = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
} as const;

export const LoopRadius = {
  sm: 8,
  md: 10,
  lg: 13,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

/**
 * Pretendard — the design's canonical typeface (demo/colors_and_type.css).
 * Static weights are bundled in mobile/assets/fonts and registered via
 * expo-font in app/_layout. With custom fonts, weight must be driven by the
 * family name (Android ignores fontWeight when fontFamily names a static cut),
 * so every type token sets `fontFamily` explicitly; `fontWeight` is kept in
 * sync as a hint for web/RN-web fallback.
 */
export const LoopFont = {
  medium: 'Pretendard-Medium', // 500 — body
  semibold: 'Pretendard-SemiBold', // 600 — headings, labels
  bold: 'Pretendard-Bold', // 700 — titles, display numbers
} as const;

/**
 * Type scale — ports the demo's 18-step Wanted scale to the variants the app uses.
 * Line-heights are intentionally generous (Hangul needs more leading than Latin),
 * and letter-spacing follows the demo's "tighten as size grows, open up when small"
 * rule (negative tracking on display, slight positive on body/caption).
 * RN has no `font` shorthand, so these are kept as objects.
 */
export const LoopType = {
  // display / large numbers (Bold, tight tracking + leading)
  hero: {
    fontFamily: LoopFont.bold,
    fontSize: 46,
    fontWeight: '700',
    lineHeight: 50,
    letterSpacing: -1.3,
  },
  display: {
    fontFamily: LoopFont.bold,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  stat: {
    fontFamily: LoopFont.bold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  // titles & headings
  title: {
    fontFamily: LoopFont.bold,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.55,
  },
  heading: {
    fontFamily: LoopFont.semibold,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: -0.43,
  },
  heading2: {
    fontFamily: LoopFont.semibold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  cardTitle: {
    fontFamily: LoopFont.semibold,
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  // body (Medium) — generous leading for Korean reading
  body: {
    fontFamily: LoopFont.medium,
    fontSize: 14.5,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  bodyTight: {
    fontFamily: LoopFont.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  // labels & captions
  label: {
    fontFamily: LoopFont.semibold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.25,
  },
  caption: {
    fontFamily: LoopFont.medium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  small: {
    fontFamily: LoopFont.semibold,
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 15,
    letterSpacing: 0.3,
  },
  // uppercase eyebrow — wide tracking carries the caps
  eyebrow: {
    fontFamily: LoopFont.bold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
} as const;

/** iOS-style soft shadow (RN shadow* + elevation). */
export const LoopShadow = {
  card: {
    shadowColor: '#3C322A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  strong: {
    shadowColor: '#3C322A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

/**
 * Motion tokens — keep interactions subtle. Springs drive press feedback,
 * timings drive entrances. Reuses the tab "squish" feel tuned in (tabs)/_layout.
 */
export const LoopMotion = {
  spring: {
    squish: { damping: 20, stiffness: 360, mass: 0.4 }, // tab press
    press: { damping: 20, stiffness: 340, mass: 0.5 }, // buttons / cards
    pop: { damping: 16, stiffness: 380, mass: 0.5 }, // checkbox toggle
  },
  /** withTiming durations (ms) — pulse is the skeleton shimmer half-cycle */
  timing: { fast: 140, base: 220, slow: 380, pulse: 900 },
  /** press scale targets — intentionally shallow (subtle); icon is deeper so bare icons read */
  scale: { press: 0.97, card: 0.98, icon: 0.86, squish: 0.88 },
} as const;
