import type { ColorValue } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

import { LoopColors } from '@/constants/loop-theme';

/**
 * Loop 아이콘 — demo/loop-icons.js의 calm rounded-stroke 글리프를 react-native-svg로 이식.
 * 24×24 viewBox, currentColor 대신 color prop. 기본 stroke 기반(softer feel).
 */
export type IconName =
  | 'home'
  | 'home-fill'
  | 'loop'
  | 'chart'
  | 'settings'
  | 'send'
  | 'plus'
  | 'check'
  | 'check-sm'
  | 'close'
  | 'more'
  | 'edit'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'arrow-right'
  | 'sparkle'
  | 'target'
  | 'flag'
  | 'clock'
  | 'tag'
  | 'bell'
  | 'undo'
  | 'trash';

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
};

export function Icon({ name, size = 24, color = LoopColors.ink }: IconProps) {
  const s = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const filled = { fill: color, stroke: 'none' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {renderIcon(name, s, filled, color)}
    </Svg>
  );
}

function renderIcon(
  name: IconName,
  s: { stroke: ColorValue; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round'; fill: string },
  filled: { fill: ColorValue; stroke: 'none' },
  color: ColorValue,
) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path {...s} d="M4 10.5 12 4l8 6.5" />
          <Path {...s} d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 4 0v5h3.5a1 1 0 0 0 1-1V9.5" />
        </>
      );
    case 'home-fill':
      return (
        <>
          <Path {...s} strokeWidth={1.6} d="M4 10.5 12 4l8 6.5" />
          <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill={color} d="M5.5 9.3V19a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 4 0v5h3.5a1 1 0 0 0 1-1V9.3" />
        </>
      );
    case 'loop':
      return (
        <>
          <Path {...s} d="M19.5 11A7.5 7.5 0 0 0 6.4 6.3L4.5 8" />
          <Path {...s} d="M4.5 13A7.5 7.5 0 0 0 17.6 17.7L19.5 16" />
          <Path {...s} d="M4.5 4v4h4" />
          <Path {...s} d="M19.5 20v-4h-4" />
        </>
      );
    case 'chart':
      return (
        <>
          <Path {...s} d="M4 20h16" />
          <Path {...s} d="M7 20v-6" />
          <Path {...s} d="M12 20V8" />
          <Path {...s} d="M17 20v-9" />
        </>
      );
    case 'settings':
      return (
        <>
          <Path {...s} d="M4 7h10" />
          <Path {...s} d="M18 7h2" />
          <Circle {...s} cx={16} cy={7} r={2} />
          <Path {...s} d="M4 17h2" />
          <Path {...s} d="M10 17h10" />
          <Circle {...s} cx={8} cy={17} r={2} />
        </>
      );
    case 'send':
      return (
        <>
          <Path {...s} d="M12 19V6" />
          <Path {...s} d="M6.5 11.5 12 6l5.5 5.5" />
        </>
      );
    case 'plus':
      return <Path {...s} d="M12 5v14M5 12h14" />;
    case 'check':
      return <Path {...s} strokeWidth={2} d="M5 12.5 10 17.5 19 7" />;
    case 'check-sm':
      return <Path {...s} strokeWidth={2.4} d="M5 12.5 10 17.5 19 7" />;
    case 'close':
      return <Path {...s} d="M6 6l12 12M18 6 6 18" />;
    case 'more':
      return (
        <>
          <Circle {...filled} cx={5} cy={12} r={1.4} />
          <Circle {...filled} cx={12} cy={12} r={1.4} />
          <Circle {...filled} cx={19} cy={12} r={1.4} />
        </>
      );
    case 'edit':
      return (
        <>
          <Path {...s} d="M14.5 5.5l4 4L9 19l-4.5.5L5 15z" />
          <Path {...s} d="M13 7l4 4" />
        </>
      );
    case 'chevron-right':
      return <Path {...s} strokeWidth={2} d="M9 5l7 7-7 7" />;
    case 'chevron-left':
      return <Path {...s} strokeWidth={2} d="M15 5l-7 7 7 7" />;
    case 'chevron-down':
      return <Path {...s} strokeWidth={2} d="M5 9l7 7 7-7" />;
    case 'arrow-right':
      return (
        <>
          <Path {...s} d="M4 12h15" />
          <Path {...s} d="M13 6l6 6-6 6" />
        </>
      );
    case 'sparkle':
      return (
        <>
          <Path {...filled} d="M12 4c.5 3.5 1.5 4.5 5 5-3.5.5-4.5 1.5-5 5-.5-3.5-1.5-4.5-5-5 3.5-.5 4.5-1.5 5-5Z" />
          <Path {...filled} d="M18.5 13.5c.25 1.6.75 2.1 2.3 2.4-1.55.3-2.05.8-2.3 2.4-.25-1.6-.75-2.1-2.3-2.4 1.55-.3 2.05-.8 2.3-2.4Z" />
        </>
      );
    case 'target':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={8} />
          <Circle {...s} cx={12} cy={12} r={4.2} />
          <Circle {...filled} cx={12} cy={12} r={1} />
        </>
      );
    case 'flag':
      return (
        <>
          <Path {...s} d="M6 21V4" />
          <Path {...s} d="M6 4.5h10.5l-2 3.5 2 3.5H6" />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={8} />
          <Path {...s} d="M12 8v4.3l2.8 1.7" />
        </>
      );
    case 'tag':
      return (
        <>
          <Path {...s} d="M4 11.5V5.5a1.5 1.5 0 0 1 1.5-1.5h6L20 12.5a1.5 1.5 0 0 1 0 2.1l-5.4 5.4a1.5 1.5 0 0 1-2.1 0L4 11.5Z" />
          <Circle {...filled} cx={8.2} cy={8.2} r={1.1} />
        </>
      );
    case 'bell':
      return (
        <>
          <Path {...s} d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 2 6H4.5c.5-.5 2-2 2-6Z" />
          <Path {...s} d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </>
      );
    case 'undo':
      return (
        <>
          <Path {...s} d="M9 7 4.5 11 9 15" />
          <Path {...s} d="M4.5 11H14a5 5 0 0 1 0 10h-2" />
        </>
      );
    case 'trash':
      return (
        <>
          <Path {...s} d="M5 7h14" />
          <Path {...s} d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          <Path {...s} d="M6.5 7l.8 11a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-11" />
        </>
      );
    default:
      return null;
  }
}
