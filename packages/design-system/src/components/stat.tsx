import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { type LoopColor } from '../tokens/theme';

import { LoopText } from './text';

type StatProps = {
  label: string;
  value: string | number;
  /** Secondary line under the label. */
  caption?: string;
  /** Emphasis color for the value (LoopColors key or raw color). */
  valueColor?: LoopColor | string;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
};

/** Single metric — a big value over an eyebrow label, with an optional caption. */
export const Stat = memo(function Stat({
  label,
  value,
  caption,
  valueColor = 'ink',
  align = 'left',
  style,
}: StatProps) {
  return (
    <View style={[align === 'center' && styles.center, style]}>
      <LoopText variant="eyebrow" color="ink4">
        {label}
      </LoopText>
      <LoopText variant="stat" color={valueColor} style={styles.value}>
        {value}
      </LoopText>
      {!!caption && (
        <LoopText variant="caption" color="ink3" style={styles.caption}>
          {caption}
        </LoopText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  value: { marginTop: 6 },
  caption: { marginTop: 4 },
});
