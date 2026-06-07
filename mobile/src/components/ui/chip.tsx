import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius } from '@/constants/loop-theme';

import { LoopText } from './text';

type Tone = 'warm' | 'neutral' | 'good';

const TONE: Record<Tone, { bg: string; fg: string }> = {
  warm: { bg: LoopColors.warmSoft, fg: LoopColors.warmDeep },
  good: { bg: LoopColors.goodSoft, fg: LoopColors.good },
  neutral: { bg: LoopColors.fill, fg: LoopColors.ink2 },
};

type ChipProps = {
  label: string;
  /** warm=하위목표 강조, neutral=기본 회색, good=긍정 */
  tone?: Tone;
  icon?: ReactNode;
  style?: ViewStyle;
};

/** 알약 칩 — 카테고리(하위목표)·태그·상태. demo .lp-chip 이식. */
export const Chip = memo(function Chip({ label, tone = 'neutral', icon, style }: ChipProps) {
  const palette = TONE[tone];
  return (
    <View style={[styles.base, { backgroundColor: palette.bg }, style]}>
      {icon}
      <LoopText variant="caption" color={palette.fg} style={styles.label}>
        {label}
      </LoopText>
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 11,
    borderRadius: LoopRadius.full,
  },
  label: { fontWeight: '600' },
});
