import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
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
export const Ring = memo(function Ring({
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
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {clamped > 0 && (
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
        )}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  center: { alignItems: 'center', justifyContent: 'center' },
});
