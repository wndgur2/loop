import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

import { LoopColors } from '@/constants/loop-theme';

type RingProps = {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
};

/** 진척 링 — 내재화율의 시각 모티프(닫히는 고리). demo home Ring 이식. */
export function Ring({
  value,
  size = 92,
  stroke = 9,
  color = LoopColors.warm,
  track = LoopColors.ringTrack,
  children,
}: RingProps) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <Circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
