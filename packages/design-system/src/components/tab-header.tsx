import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './icon';
import { LoopColors } from '../tokens/theme';
import { LoopText } from './text';

/**
 * Shared header for the 4 tabs — (optional brand icon) title (left) + optional action (right).
 * Managed in one place so every tab uses the same padding and typography.
 */
export const TabHeader = memo(function TabHeader({
  title,
  action,
  icon,
}: {
  title: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <View style={styles.header}>
      {icon ? <Icon name={icon} size={22} color={LoopColors.warm} /> : null}
      <LoopText variant="title">{title}</LoopText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 14,
  },
  action: { marginLeft: 'auto' },
});
