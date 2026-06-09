import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoopColors } from '@/constants/loop-theme';
import type { Importance } from '@/types/models';

/** Three importance dots — high=warm 3, mid=ink 2, low=ink 1. Ported from demo .lp-imp. */
export const ImportanceDots = memo(function ImportanceDots({ level }: { level: Importance }) {
  const colors = dotColors(level);
  return (
    <View style={styles.row}>
      {colors.map((c, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: c }]} />
      ))}
    </View>
  );
});

function dotColors(level: Importance): [string, string, string] {
  const off = LoopColors.line;
  if (level === 'high') return [LoopColors.warm, LoopColors.warm, LoopColors.warm];
  if (level === 'mid') return [LoopColors.ink4, LoopColors.ink4, off];
  return [LoopColors.ink4, off, off];
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 9999 },
});
