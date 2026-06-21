import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { LoopColors, LoopMotion } from '../tokens/theme';

import { Icon } from './icon';
import { LoopText } from './text';

type AccordionProps = {
  title: string;
  children: ReactNode;
  /** Expanded on first render. */
  defaultOpen?: boolean;
};

/** Single expand/collapse section — animated height + rotating chevron. */
export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(defaultOpen ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(open ? 1 : 0, { duration: LoopMotion.timing.base }));
  }, [open, progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: progress.get() * contentHeight,
    opacity: progress.get(),
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.get() * 180}deg` }],
  }));

  return (
    <View>
      <Pressable style={styles.header} onPress={() => setOpen((v) => !v)}>
        <LoopText variant="cardTitle" style={styles.title}>
          {title}
        </LoopText>
        <Animated.View style={chevronStyle}>
          <Icon name="chevron-down" size={18} color={LoopColors.ink3} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.clip, bodyStyle]}>
        {/* Natural-height measuring layer — reports full height even while clipped. */}
        <View style={styles.inner} onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  title: { flex: 1 },
  clip: { overflow: 'hidden' },
  inner: { paddingBottom: 14 },
});
