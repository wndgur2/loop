import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoopColors, LoopMotion } from '@/constants/loop-theme';

import { Icon, type IconName } from './icon';
import { PressScale } from './press-scale';
import { LoopText } from './text';

type ScreenHeaderProps = {
  onBack: () => void;
  /** Back affordance — chevron for pushed screens, close for modal-like forms. */
  backIcon?: IconName;
  title?: string;
  /** Right-aligned actions (use HeaderAction for icon actions). */
  right?: ReactNode;
  /** Custom content between the back button and `right` (replaces `title`). */
  children?: ReactNode;
};

/** Shared header for stacked screens — back button + title (or custom content) + actions. */
export function ScreenHeader({
  onBack,
  backIcon = 'chevron-left',
  title,
  right,
  children,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <PressScale onPress={onBack} hitSlop={8} scaleTo={LoopMotion.scale.icon} style={styles.back}>
        <Icon name={backIcon} size={24} color={LoopColors.ink2} />
      </PressScale>
      {children ??
        (title ? (
          <LoopText variant="heading2" style={styles.title}>
            {title}
          </LoopText>
        ) : null)}
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

/** Icon action for the header's right slot (edit, delete, …). */
export function HeaderAction({
  icon,
  onPress,
  color = LoopColors.ink3,
}: {
  icon: IconName;
  onPress: () => void;
  color?: string;
}) {
  return (
    <PressScale
      onPress={onPress}
      hitSlop={8}
      haptic
      scaleTo={LoopMotion.scale.icon}
      style={styles.action}
    >
      <Icon name={icon} size={21} color={color} />
    </PressScale>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  back: { padding: 4 },
  title: { flexShrink: 1 },
  right: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 },
  action: { padding: 6 },
});
