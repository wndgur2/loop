import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors } from '../tokens/theme';

import { PressScale } from './press-scale';
import { LoopText } from './text';

type RadioProps = {
  selected: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
};

/** Single radio control — warm ring + filled dot when selected. */
export function Radio({ selected, onPress, disabled, size = 22 }: RadioProps) {
  const ring = (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.ringOn,
        disabled && styles.disabled,
      ]}
    >
      {selected && (
        <View
          style={[
            styles.dot,
            { width: size * 0.45, height: size * 0.45, borderRadius: size * 0.45 },
          ]}
        />
      )}
    </View>
  );
  return onPress ? (
    <PressScale onPress={onPress} disabled={disabled} hitSlop={6}>
      {ring}
    </PressScale>
  ) : (
    ring
  );
}

type Option<T> = { value: T; label: string; description?: string };

type RadioGroupProps<T> = {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  style?: StyleProp<ViewStyle>;
};

/** A vertical set of labeled radio options (single select). */
export function RadioGroup<T extends string | number>({
  value,
  onChange,
  options,
  style,
}: RadioGroupProps<T>) {
  return (
    <View style={[styles.group, style]}>
      {options.map((opt) => (
        <PressScale
          key={String(opt.value)}
          onPress={() => onChange(opt.value)}
          style={styles.optRow}
        >
          <Radio selected={opt.value === value} />
          <View style={styles.optText}>
            <LoopText variant="cardTitle">{opt.label}</LoopText>
            {!!opt.description && (
              <LoopText variant="caption" color="ink3" style={styles.optDesc}>
                {opt.description}
              </LoopText>
            )}
          </View>
        </PressScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: LoopColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOn: { borderColor: LoopColors.warm },
  dot: { backgroundColor: LoopColors.warm },
  disabled: { opacity: 0.5 },
  group: { gap: 4 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  optText: { flex: 1 },
  optDesc: { marginTop: 2 },
});
