import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { LoopColors, LoopFont, LoopRadius } from '../tokens/theme';

import { LoopText } from './text';

type Tone = 'warm' | 'neutral' | 'good';

const TONE: Record<Tone, { bg: string; fg: string }> = {
  warm: { bg: LoopColors.warmSoft, fg: LoopColors.warmDeep },
  good: { bg: LoopColors.goodSoft, fg: LoopColors.good },
  neutral: { bg: LoopColors.fill, fg: LoopColors.ink2 },
};

type ChipProps = {
  label: string;
  /** warm=sub-goal emphasis, neutral=default gray, good=positive */
  tone?: Tone;
  icon?: ReactNode;
  style?: ViewStyle;
};

/** Pill chip — category (sub-goal), tag, status. Ported from demo .lp-chip. */
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
  label: { fontFamily: LoopFont.semibold, fontWeight: '600' },
});
