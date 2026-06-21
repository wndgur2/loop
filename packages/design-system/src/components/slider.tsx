import { useCallback, useMemo, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '../tokens/theme';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: StyleProp<ViewStyle>;
};

const THUMB = 22;

/** Horizontal slider — tap or drag along the track. Built on PanResponder (no extra deps). */
export function Slider({ value, onChange, min = 0, max = 100, step = 1, style }: SliderProps) {
  const [width, setWidth] = useState(0);
  const range = max - min || 1;
  const ratio = Math.min(1, Math.max(0, (value - min) / range));

  const update = useCallback(
    (x: number) => {
      if (!width) return;
      const r = Math.min(1, Math.max(0, x / width));
      let v = min + r * range;
      v = Math.round(v / step) * step;
      onChange(Math.min(max, Math.max(min, v)));
    },
    [width, min, max, step, range, onChange],
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e: GestureResponderEvent) => update(e.nativeEvent.locationX),
        onPanResponderMove: (e: GestureResponderEvent) => update(e.nativeEvent.locationX),
      }),
    [update],
  );

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout} {...pan.panHandlers}>
      <View style={styles.track} />
      <View style={[styles.fill, { width: ratio * width }]} />
      <View style={[styles.thumb, { left: ratio * width - THUMB / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: THUMB, justifyContent: 'center' },
  track: {
    height: 5,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.ringTrack,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 5,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.warm,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: LoopColors.white,
    borderWidth: 1,
    borderColor: LoopColors.warmLine,
    ...LoopShadow.card,
  },
});
