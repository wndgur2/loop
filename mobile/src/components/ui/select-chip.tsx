import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius } from '@/constants/loop-theme';

import { PressScale } from './press-scale';
import { LoopText } from './text';

type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** solid=warm fill when selected (white label) · soft=warm tint when selected */
  tone?: 'solid' | 'soft';
  /** Leading content (icon, importance dots). */
  leading?: ReactNode;
  /** Trailing content (e.g. remove icon on selected chips). */
  trailing?: ReactNode;
  height?: number;
  /** Style for the pressable wrapper (e.g. flex: 1 in a row). */
  style?: StyleProp<ViewStyle>;
  /** Style for the chip surface itself. */
  chipStyle?: StyleProp<ViewStyle>;
};

/** Selectable pill chip — sub-goal / importance / language pickers. */
export function SelectChip({
  label,
  selected,
  onPress,
  tone = 'solid',
  leading,
  trailing,
  height = 40,
  style,
  chipStyle,
}: SelectChipProps) {
  const labelColor =
    tone === 'solid' ? (selected ? 'white' : 'ink2') : selected ? 'warmDeep' : 'ink3';
  return (
    <PressScale onPress={onPress} haptic="select" style={style}>
      <View
        style={[
          styles.chip,
          { height },
          selected && (tone === 'solid' ? styles.solidOn : styles.softOn),
          chipStyle,
        ]}
      >
        {leading}
        <LoopText variant="label" color={labelColor}>
          {label}
        </LoopText>
        {trailing}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: LoopRadius.full,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
  },
  solidOn: { backgroundColor: LoopColors.warm, borderColor: LoopColors.warm },
  softOn: { backgroundColor: LoopColors.warmSoft, borderColor: LoopColors.warmLine },
});
