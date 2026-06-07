import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { LoopColors } from '@/constants/loop-theme';

/** warm 캔버스 위 화면 컨테이너. edges로 안전영역 선택. */
export function Screen({
  children,
  edges = ['top'],
  style,
  background = LoopColors.canvas,
}: {
  children: ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  background?: string;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}
