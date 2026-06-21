import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius } from '../tokens/theme';

import { Icon, type IconName } from './icon';
import { PressScale } from './press-scale';
import { LoopText } from './text';

type Tone = 'info' | 'good' | 'danger' | 'neutral';

const TONE: Record<Tone, { bg: string; border: string; fg: string; icon: IconName }> = {
  info: {
    bg: LoopColors.warmSoft,
    border: LoopColors.warmLine,
    fg: LoopColors.warmDeep,
    icon: 'sparkle',
  },
  good: { bg: LoopColors.goodSoft, border: 'transparent', fg: LoopColors.good, icon: 'check' },
  danger: { bg: LoopColors.dangerSoft, border: 'transparent', fg: LoopColors.danger, icon: 'flag' },
  neutral: { bg: LoopColors.fill, border: LoopColors.line, fg: LoopColors.ink2, icon: 'bell' },
};

type BannerProps = {
  tone?: Tone;
  title?: string;
  message?: string;
  /** Override the tone's default icon (or pass null logic via tone). */
  icon?: IconName;
  /** Trailing action node (e.g. a small button or link). */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Inline callout — a tinted card carrying a short status message. */
export const Banner = memo(function Banner({
  tone = 'info',
  title,
  message,
  icon,
  action,
  onDismiss,
  style,
}: BannerProps) {
  const palette = TONE[tone];
  return (
    <View
      style={[styles.base, { backgroundColor: palette.bg, borderColor: palette.border }, style]}
    >
      <Icon name={icon ?? palette.icon} size={18} color={palette.fg} />
      <View style={styles.text}>
        {!!title && (
          <LoopText variant="label" color={palette.fg}>
            {title}
          </LoopText>
        )}
        {!!message && (
          <LoopText variant="caption" color="ink2" style={title ? styles.message : undefined}>
            {message}
          </LoopText>
        )}
      </View>
      {action}
      {onDismiss && (
        <PressScale onPress={onDismiss} hitSlop={8}>
          <Icon name="close" size={16} color={LoopColors.ink4} />
        </PressScale>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 14,
    borderRadius: LoopRadius.xl,
    borderWidth: 1,
  },
  text: { flex: 1, gap: 0 },
  message: { marginTop: 3 },
});
