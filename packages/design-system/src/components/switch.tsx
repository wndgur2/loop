import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LoopColors, LoopMotion, LoopShadow } from '../tokens/theme';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

const TRACK_W = 46;
const TRACK_H = 28;
const THUMB = 22;
const PAD = 3;
const TRAVEL = TRACK_W - THUMB - PAD * 2;

/** Loop-styled toggle — track fills warm and the thumb slides on. */
export function Switch({ value, onValueChange, disabled }: SwitchProps) {
  const p = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(value ? 1 : 0, { duration: LoopMotion.timing.base }));
  }, [value, p]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.get(), [0, 1], ['#DED7CE', LoopColors.warm]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(p.get(), [0, 1], [0, TRAVEL]) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      onPress={() => !disabled && onValueChange(!value)}
      style={disabled && styles.disabled}
      hitSlop={6}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: PAD,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: LoopColors.white,
    ...LoopShadow.card,
  },
  disabled: { opacity: 0.5 },
});
