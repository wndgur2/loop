import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors } from '../tokens/theme';

import { Icon } from './icon';
import { PressScale } from './press-scale';
import { LoopText } from './text';

type ListItemProps = {
  title: string;
  subtitle?: string;
  /** Leading slot — icon, avatar, etc. */
  leading?: ReactNode;
  /** Trailing slot — overrides the chevron when provided. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Show a chevron on the trailing edge (implied when `onPress` is set). */
  chevron?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Row for lists & settings — leading slot, title/subtitle, trailing slot or chevron. */
export const ListItem = memo(function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  chevron,
  style,
}: ListItemProps) {
  const showChevron = trailing == null && (chevron ?? onPress != null);
  const body = (
    <View style={[styles.row, style]}>
      {leading}
      <View style={styles.text}>
        <LoopText variant="cardTitle">{title}</LoopText>
        {!!subtitle && (
          <LoopText variant="caption" color="ink3" style={styles.subtitle}>
            {subtitle}
          </LoopText>
        )}
      </View>
      {trailing}
      {showChevron && <Icon name="chevron-right" size={18} color={LoopColors.ink4} />}
    </View>
  );

  return onPress ? <PressScale onPress={onPress}>{body}</PressScale> : body;
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  text: { flex: 1 },
  subtitle: { marginTop: 2 },
});
