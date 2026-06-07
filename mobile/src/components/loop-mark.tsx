import { memo } from 'react';
import { View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { LoopColors } from '@/constants/loop-theme';

import { LoopText } from './ui/text';

/** Loop 로고 — 닫히는 고리 마크 + 워드마크. demo LoopMark 이식. */
export const LoopMark = memo(function LoopMark({ height = 22, color = LoopColors.ink }: { height?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: height * 0.42 }}>
      <Svg width={height * 1.04} height={height} viewBox="0 0 26 25" fill="none">
        <Path
          d="M13 3.2c5.1 0 9.3 3.9 9.3 8.8S18.1 20.8 13 20.8c-3.4 0-5.2-1.9-5.2-4.2s1.9-4.1 4.7-4.1c2.6 0 4.3 1.6 4.3 3.6"
          stroke={LoopColors.warm}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </Svg>
      <LoopText style={{ fontSize: height * 0.92, fontWeight: '700', letterSpacing: -height * 0.02, color }}>
        Loop
      </LoopText>
    </View>
  );
});
