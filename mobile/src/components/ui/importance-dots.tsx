import { View } from 'react-native';

import { LoopColors } from '@/constants/loop-theme';
import type { Importance } from '@/types/models';

/** 중요도 점 3개 — high=warm 3, mid=ink 2, low=ink 1. demo .lp-imp 이식. */
export function ImportanceDots({ level }: { level: Importance }) {
  const colors = dotColors(level);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {colors.map((c, i) => (
        <View key={i} style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: c }} />
      ))}
    </View>
  );
}

function dotColors(level: Importance): [string, string, string] {
  const off = LoopColors.line;
  if (level === 'high') return [LoopColors.warm, LoopColors.warm, LoopColors.warm];
  if (level === 'mid') return [LoopColors.ink4, LoopColors.ink4, off];
  return [LoopColors.ink4, off, off];
}
