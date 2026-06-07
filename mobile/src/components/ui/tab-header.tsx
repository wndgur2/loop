import type { ReactNode } from 'react';
import { View } from 'react-native';

import { LoopText } from './text';

/**
 * 4개 탭 공통 헤더 — 제목(좌) + 선택 액션(우).
 * 모든 탭이 같은 패딩·타이포를 쓰도록 한 곳에서 관리한다.
 */
export function TabHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
        paddingHorizontal: 22,
        paddingTop: 6,
        paddingBottom: 14,
      }}
    >
      <LoopText variant="title">{title}</LoopText>
      {action ? <View style={{ marginLeft: 'auto' }}>{action}</View> : null}
    </View>
  );
}
