import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { LoopColors, LoopRadius } from '@/constants/loop-theme';

import { Icon, type IconName } from './icon';
import { usePressScale } from './press-scale';
import { LoopText } from './text';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  style?: ViewStyle;
};

/** Default action button — primary=warm fill, secondary=surface+border. */
export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  height = 50,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const fg = isPrimary ? LoopColors.white : LoopColors.ink2;
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      android_ripple={null}
      style={style}
    >
      <Animated.View
        style={[
          styles.base,
          { height },
          isPrimary ? styles.primary : styles.secondary,
          { opacity: disabled ? 0.5 : 1 },
          animatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon && <Icon name={icon} size={19} color={fg} />}
            <LoopText variant="label" color={fg} style={styles.label}>
              {label}
            </LoopText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
});

/** Icon-only square button (e.g. detail-screen actions). */
export const IconButton = memo(function IconButton({
  icon,
  onPress,
  color = LoopColors.ink3,
  size = 50,
}: {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      android_ripple={null}
    >
      <Animated.View style={[styles.iconBtn, { width: size, height: size }, animatedStyle]}>
        <Icon name={icon} size={22} color={color} />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: LoopRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: LoopColors.warm, borderWidth: 0 },
  secondary: { backgroundColor: LoopColors.surface, borderWidth: 1, borderColor: LoopColors.line },
  label: { fontWeight: '700', fontSize: 15 },
  iconBtn: {
    borderRadius: LoopRadius.xl,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
