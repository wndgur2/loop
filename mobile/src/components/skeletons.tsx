import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@loop/ui';

// App-specific loading placeholders, composed from the design system's generic
// `Skeleton` primitive. These mirror concrete screen layouts, so they live in the
// app rather than in @loop/ui.

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

/** Placeholder matching the reflect tab cards (today card + recommendation cards). */
export function ReflectSkeleton() {
  return (
    <View style={styles.reflectCards}>
      <Card radius={22} style={styles.reflectCard}>
        <Skeleton width={96} height={11} radius={6} />
        <Skeleton width="82%" height={15} radius={7} style={styles.gap10} />
        <Skeleton width="55%" height={12} radius={6} style={styles.gap8} />
        <Skeleton width="100%" height={44} radius={14} style={styles.gap12} />
      </Card>
      <Card radius={22} style={styles.reflectCard}>
        <Skeleton width={96} height={11} radius={6} />
        <Skeleton width="70%" height={14} radius={7} style={styles.gap10} />
        <Skeleton width="90%" height={12} radius={6} style={styles.gap8} />
      </Card>
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
  reflectCards: { gap: 14 },
  reflectCard: { padding: 18 },
  hero: { padding: 22, flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroText: { flex: 1 },
  tiles: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tile: { flex: 1, padding: 16 },
  distCard: { padding: 16, gap: 16, marginTop: 26 },
});
