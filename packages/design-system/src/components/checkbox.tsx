import { memo, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { LoopColors, LoopMotion } from '../tokens/theme';

import { Icon } from './icon';

/** Takeaway checkbox — green fill when done, with a subtle pop + check fade-in. Ported from demo .lp-check. */
export const Checkbox = memo(function Checkbox({
  done,
  onPress,
}: {
  done: boolean;
  onPress?: () => void;
}) {
  const progress = useSharedValue(done ? 1 : 0);
  const pop = useSharedValue(1);
  const press = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(done ? 1 : 0, { duration: LoopMotion.timing.fast }));
    pop.set(withSequence(withTiming(1.06, { duration: 90 }), withSpring(1, LoopMotion.spring.pop)));
  }, [done, progress, pop]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.get() * press.get() }],
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1],
      ['rgba(47,165,103,0)', LoopColors.good],
    ),
    borderColor: interpolateColor(progress.get(), [0, 1], [LoopColors.line, LoopColors.good]),
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.6 + 0.4 * progress.get() }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => press.set(withTiming(0.9, { duration: LoopMotion.timing.fast }))}
      onPressOut={() => press.set(withSpring(1, LoopMotion.spring.pop))}
      hitSlop={8}
    >
      <Animated.View style={[styles.box, boxStyle]}>
        <Animated.View style={checkStyle}>
          <Icon name="check-sm" size={14} color={LoopColors.white} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
