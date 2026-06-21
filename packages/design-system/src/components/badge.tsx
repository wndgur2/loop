import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius } from '../tokens/theme';

import { LoopText } from './text';

type Tone = 'warm' | 'good' | 'danger' | 'neutral';

const TONE: Record<Tone, { bg: string; fg: string }> = {
  warm: { bg: LoopColors.warm, fg: LoopColors.white },
  good: { bg: LoopColors.good, fg: LoopColors.white },
  danger: { bg: LoopColors.danger, fg: LoopColors.white },
  neutral: { bg: LoopColors.fill, fg: LoopColors.ink2 },
};

type BadgeProps = {
  /** Count or short text. Omit (with `dot`) for a bare status dot. */
  label?: string | number;
  tone?: Tone;
  /** Render a small status dot instead of a labeled pill. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Count / status badge — a small solid pill, or a bare dot. */
export const Badge = memo(function Badge({ label, tone = 'warm', dot, style }: BadgeProps) {
  const palette = TONE[tone];
  if (dot) {
    return <View style={[styles.dot, { backgroundColor: palette.bg }, style]} />;
  }
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      <LoopText variant="small" color={palette.fg} style={styles.label}>
        {label}
      </LoopText>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: LoopRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 10.5, lineHeight: 14 },
  dot: { width: 8, height: 8, borderRadius: LoopRadius.full },
});
