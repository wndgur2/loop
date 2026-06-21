import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { LoopColors, LoopMotion, LoopRadius, LoopShadow } from '../tokens/theme';

import { PressScale } from './press-scale';
import { LoopText } from './text';

type Segment<T> = { value: T; label: string };

type SegmentedControlProps<T> = {
  value: T;
  onChange: (value: T) => void;
  segments: Segment<T>[];
  style?: StyleProp<ViewStyle>;
};

const PAD = 2;

/** iOS-style segmented control — a sliding pill marks the active segment. */
export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  segments,
  style,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const n = segments.length;
  const idx = Math.max(
    0,
    segments.findIndex((s) => s.value === value),
  );
  const segW = width ? (width - PAD * 2) / n : 0;
  const tx = useSharedValue(0);

  useEffect(() => {
    tx.set(withTiming(idx * segW, { duration: LoopMotion.timing.base }));
  }, [idx, segW, tx]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }],
    width: segW,
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout}>
      {width > 0 && <Animated.View style={[styles.pill, pillStyle]} />}
      {segments.map((s) => (
        <PressScale key={String(s.value)} onPress={() => onChange(s.value)} style={styles.seg}>
          <LoopText variant="label" color={s.value === value ? 'ink' : 'ink3'}>
            {s.label}
          </LoopText>
        </PressScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    height: 40,
    padding: PAD,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.fill,
  },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.surface,
    ...LoopShadow.card,
  },
});
