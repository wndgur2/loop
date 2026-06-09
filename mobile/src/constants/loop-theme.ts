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
 * Type scale — distilled from the combinations frequently used in Wanted/loop.css.
 * RN has no `font` shorthand, so these are kept as objects.
 */
export const LoopType = {
  // large numbers/titles
  hero: { fontSize: 46, fontWeight: '700', letterSpacing: -1.3 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.55 },
  heading: { fontSize: 22, fontWeight: '700', letterSpacing: -0.42 },
  heading2: { fontSize: 18, fontWeight: '700', letterSpacing: -0.18 },
  cardTitle: { fontSize: 15.5, fontWeight: '600', letterSpacing: -0.1, lineHeight: 22 },
  body: { fontSize: 14.5, fontWeight: '500', lineHeight: 24 },
  bodyTight: { fontSize: 14, fontWeight: '500', lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  small: { fontSize: 11.5, fontWeight: '600' },
  // uppercase eyebrow
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
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
  /** withTiming durations (ms) */
  timing: { fast: 140, base: 220, slow: 380 },
  /** press scale targets — intentionally shallow (subtle); icon is deeper so bare icons read */
  scale: { press: 0.97, card: 0.98, icon: 0.86, squish: 0.88 },
} as const;
