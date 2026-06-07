/**
 * Loop 디자인 토큰 — demo/loop.css의 "정돈된 따뜻함" 팔레트를 RN으로 이식.
 * 단일 warm clay/honey 액센트 + 따뜻한 캔버스 + 차분한 라운드.
 * 정본 디자인: demo/ (Claude Design handoff). MVP는 라이트 모드 우선.
 */

export const LoopColors = {
  // warm accent (UI 유일의 채도색)
  warm: '#DD8A4F',
  warmHover: '#CD7A3E',
  warmDeep: '#B06A33', // light 위 텍스트/아이콘
  warmPress: '#9E5C2A',
  warmSoft: '#FBF1E8', // tinted surface
  warmSoft2: '#F5E4D4', // chip / fill
  warmLine: '#EAD3BD', // warm 위 hairline
  ringTrack: '#EFE6DC', // progress ring track

  // calm positive (내재화 / done)
  good: '#2FA567',
  goodSoft: '#E7F4ED',

  // canvas / surface
  canvas: '#FAF8F5',
  surface: '#FFFFFF',

  // warm-leaning neutrals (텍스트)
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

/** 4px 그리드 */
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
 * 타입 스케일 — Wanted/loop.css에서 자주 쓰는 조합을 추렸다.
 * RN은 `font` 단축속성이 없으므로 객체로 둔다.
 */
export const LoopType = {
  // 큰 숫자/타이틀
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
  // 대문자 eyebrow
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
} as const;

/** iOS 스타일 소프트 섀도 (RN shadow* + elevation). */
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
