/** Insights building blocks — metric tiles and distribution rows. */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, LoopText, ProgressBar } from '@loop/ui';

/** Big-number metric card (rate + sub caption). */
export const MetricTile = memo(function MetricTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card radius={20} style={styles.tile}>
      <LoopText variant="eyebrow" color="ink4">
        {label}
      </LoopText>
      <LoopText variant="stat" color="warmDeep" style={styles.tileValue}>
        {value}
      </LoopText>
      <LoopText variant="caption" color="ink4" style={styles.tileSub}>
        {sub}
      </LoopText>
    </Card>
  );
});

/** Labeled distribution bar (count + fraction of total). */
export const DistRow = memo(function DistRow({
  label,
  count,
  fraction,
  caption,
}: {
  label: string;
  count: number;
  fraction: number;
  caption?: string;
}) {
  return (
    <View>
      <View style={styles.distHead}>
        <LoopText variant="label" color="ink2" numberOfLines={1} style={styles.flex}>
          {label}
        </LoopText>
        {caption && (
          <LoopText variant="caption" color="ink4" style={styles.distCaption}>
            {caption}
          </LoopText>
        )}
        <LoopText variant="label" color="ink">
          {count}
        </LoopText>
      </View>
      <ProgressBar value={fraction} height={8} minPct={4} />
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tile: { flex: 1, padding: 16 },
  tileValue: { marginTop: 8 },
  tileSub: { marginTop: 4 },
  distHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  distCaption: { marginRight: 8 },
});
