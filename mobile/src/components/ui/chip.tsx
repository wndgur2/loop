import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius } from '@/constants/loop-theme';

import { LoopText } from './text';

type ChipProps = {
  label: string;
  /** warm=하위목표 강조, neutral=기본 회색 */
  tone?: 'warm' | 'neutral' | 'good';
  icon?: ReactNode;
  style?: ViewStyle;
};

/** 알약 칩 — 카테고리(하위목표)·태그·상태. demo .lp-chip 이식. */
export function Chip({ label, tone = 'neutral', icon, style }: ChipProps) {
  const palette =
    tone === 'warm'
      ? { bg: LoopColors.warmSoft, fg: LoopColors.warmDeep }
      : tone === 'good'
        ? { bg: LoopColors.goodSoft, fg: LoopColors.good }
        : { bg: LoopColors.fill, fg: LoopColors.ink2 };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          height: 26,
          paddingHorizontal: 11,
          borderRadius: LoopRadius.full,
          backgroundColor: palette.bg,
        },
        style,
      ]}
    >
      {icon}
      <LoopText variant="caption" color={palette.fg} style={{ fontWeight: '600' }}>
        {label}
      </LoopText>
    </View>
  );
}
