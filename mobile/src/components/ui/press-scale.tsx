import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated';

import { LoopMotion } from '@/constants/loop-theme';
import { haptics, type HapticKind } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * usePressScale — shared press-feedback animation. Scales content down on press-in
 * and springs back on release. Single source for the app's subtle "squish".
 */
export function usePressScale({
  scaleTo = LoopMotion.scale.press,
  spring = LoopMotion.spring.press,
}: { scaleTo?: number; spring?: WithSpringConfig } = {}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const onPressIn = () => {
    scale.set(withSpring(scaleTo, spring));
  };
  const onPressOut = () => {
    scale.set(withSpring(1, spring));
  };
  return { animatedStyle, onPressIn, onPressOut };
}

type PressScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  scaleTo?: number;
  spring?: WithSpringConfig;
  /** Fire a haptic on press. `true` = light tap. */
  haptic?: boolean | HapticKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: PressableProps['hitSlop'];
};

/**
 * PressScale — drop-in pressable with the subtle scale feedback (no ripple / no opacity).
 * Use for rows, cards, and custom pressables that aren't the Button component.
 */
export function PressScale({
  children,
  onPress,
  scaleTo,
  spring,
  haptic,
  disabled,
  style,
  hitSlop,
}: PressScaleProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({ scaleTo, spring });
  const fire = () => {
    if (haptic) haptics[haptic === true ? 'tap' : haptic]();
    onPress?.();
  };
  return (
    <AnimatedPressable
      onPress={fire}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      android_ripple={null}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
