import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { LoopColors, LoopRadius, LoopShadow } from '../tokens/theme';

import { LoopText } from './text';

type TooltipProps = {
  label: string;
  /** The anchor; tapping it toggles the bubble. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Tap-to-reveal tooltip bubble, anchored above its child. */
export function Tooltip({ label, children, style }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.wrap, style]}>
      {open && (
        <Animated.View
          entering={FadeIn.duration(120)}
          exiting={FadeOut.duration(120)}
          pointerEvents="none"
          style={styles.bubble}
        >
          <LoopText variant="caption" color="white" style={styles.text}>
            {label}
          </LoopText>
          <View style={styles.arrow} />
        </Animated.View>
      )}
      <Pressable onPress={() => setOpen((v) => !v)} hitSlop={4}>
        {children}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    position: 'absolute',
    bottom: '100%',
    alignSelf: 'center',
    marginBottom: 8,
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: LoopRadius.md,
    backgroundColor: LoopColors.ink,
    ...LoopShadow.strong,
  },
  text: { textAlign: 'center' },
  arrow: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: LoopColors.ink,
  },
});
