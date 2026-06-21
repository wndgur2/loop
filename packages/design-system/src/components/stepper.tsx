import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors } from '../tokens/theme';

import { Icon } from './icon';
import { PressScale } from './press-scale';
import { LoopText } from './text';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: StyleProp<ViewStyle>;
};

/** Numeric stepper — − / + around a value, clamped to [min, max]. */
export function Stepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  style,
}: StepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View style={[styles.wrap, style]}>
      <PressScale
        onPress={() => onChange(Math.max(min, value - step))}
        disabled={atMin}
        style={[styles.btn, atMin && styles.off]}
      >
        <Icon name="minus" size={18} color={atMin ? LoopColors.ink4 : LoopColors.ink} />
      </PressScale>
      <LoopText variant="cardTitle" style={styles.value}>
        {value}
      </LoopText>
      <PressScale
        onPress={() => onChange(Math.min(max, value + step))}
        disabled={atMax}
        style={[styles.btn, atMax && styles.off]}
      >
        <Icon name="plus" size={18} color={atMax ? LoopColors.ink4 : LoopColors.ink} />
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.45 },
  value: { minWidth: 36, textAlign: 'center' },
});
