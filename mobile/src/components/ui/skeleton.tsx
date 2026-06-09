import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Card } from './card';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Single shimmer block — a soft opacity pulse. Compose into screen-shaped presets below. */
export function Skeleton({ width = '100%', height = 16, radius = LoopRadius.md, style }: SkeletonProps) {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [pulse]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.get() }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: LoopColors.fill }, animatedStyle, style]}
    />
  );
}

/** Placeholder matching FeedbackRow's layout (imp bar + meta + title). */
export function FeedbackRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={3} height={52} radius={9999} />
      <View style={styles.content}>
        <Skeleton width={88} height={11} radius={6} />
        <Skeleton width="78%" height={15} radius={7} style={styles.gap10} />
        <Skeleton width="48%" height={4} radius={9999} style={styles.gap12} />
      </View>
    </View>
  );
}

/** A short list of row placeholders for the feedback home while loading. */
export function FeedbackListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <FeedbackRowSkeleton key={i} />
      ))}
    </View>
  );
}

/** Placeholder matching the insights dashboard (hero ring + tiles + distribution). */
export function InsightsSkeleton() {
  return (
    <View>
      <Card radius={24} style={styles.hero}>
        <Skeleton width={132} height={132} radius={9999} />
        <View style={styles.heroText}>
          <Skeleton width="90%" height={14} radius={7} />
          <Skeleton width="60%" height={12} radius={6} style={styles.gap8} />
        </View>
      </Card>
      <View style={styles.tiles}>
        <Card radius={20} style={styles.tile}>
          <Skeleton width="55%" height={11} radius={6} />
          <Skeleton width="70%" height={26} radius={8} style={styles.gap10} />
        </Card>
        <Card radius={20} style={styles.tile}>
          <Skeleton width="55%" height={11} radius={6} />
          <Skeleton width="70%" height={26} radius={8} style={styles.gap10} />
        </Card>
      </View>
      <Card radius={20} style={styles.distCard}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i}>
            <Skeleton width="40%" height={12} radius={6} />
            <Skeleton width="100%" height={8} radius={9999} style={styles.gap8} />
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 13, paddingVertical: 15 },
  content: { flex: 1 },
  gap8: { marginTop: 8 },
  gap10: { marginTop: 10 },
  gap12: { marginTop: 12 },
  hero: { padding: 22, flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroText: { flex: 1 },
  tiles: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tile: { flex: 1, padding: 16 },
  distCard: { padding: 16, gap: 16, marginTop: 26 },
});
