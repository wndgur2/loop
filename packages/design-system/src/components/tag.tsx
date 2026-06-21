import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors, LoopFont, LoopRadius } from '../tokens/theme';

import { Icon } from './icon';
import { PressScale } from './press-scale';
import { LoopText } from './text';

type TagProps = {
  label: string;
  /** Optional leading color dot (e.g. to key a tag to a category). */
  color?: string;
  /** When provided, renders a trailing remove affordance. */
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Outlined keyword tag — lighter than a Chip; optionally removable. */
export const Tag = memo(function Tag({ label, color, onRemove, style }: TagProps) {
  return (
    <View style={[styles.base, style]}>
      {!!color && <View style={[styles.dot, { backgroundColor: color }]} />}
      <LoopText variant="caption" color="ink2" style={styles.label}>
        {label}
      </LoopText>
      {onRemove && (
        <PressScale onPress={onRemove} hitSlop={8} style={styles.remove}>
          <Icon name="close" size={12} color={LoopColors.ink4} />
        </PressScale>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: LoopRadius.full,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
  },
  dot: { width: 6, height: 6, borderRadius: LoopRadius.full },
  label: { fontFamily: LoopFont.semibold, fontWeight: '600' },
  remove: { marginLeft: 1 },
});
