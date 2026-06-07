import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './icon';
import { LoopColors } from '@/constants/loop-theme';
import { LoopText } from './text';

/**
 * 4개 탭 공통 헤더 — (선택 브랜드 아이콘) 제목(좌) + 선택 액션(우).
 * 모든 탭이 같은 패딩·타이포를 쓰도록 한 곳에서 관리한다.
 */
export const TabHeader = memo(function TabHeader({
  title,
  action,
  icon,
}: {
  title: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <View style={styles.header}>
      {icon ? <Icon name={icon} size={22} color={LoopColors.warm} /> : null}
      <LoopText variant="title">{title}</LoopText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 14,
  },
  action: { marginLeft: 'auto' },
});
