import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { useT } from '@/lib/i18n';

/** 탭바 콘텐츠(아이콘+라벨) 영역 높이. 하단 안전영역은 inset으로 따로 더한다. */
const TAB_BAR_CONTENT_HEIGHT = 64;

/** 하단 탭 4개 — 피드백(홈) · 회고 · 대시보드 · 설정. demo TabBar 톤 매칭. */
export default function TabsLayout() {
  const t = useT();
  // 기기별 하단 안전영역(홈 인디케이터·제스처 내비)을 그대로 반영해 탭바 아래에 보존한다.
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: LoopColors.warmDeep,
        tabBarInactiveTintColor: LoopColors.ink4,
        tabBarStyle: {
          backgroundColor: LoopColors.canvas,
          borderTopColor: LoopColors.lineSoft,
          borderTopWidth: 1,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600', letterSpacing: 0.1 },
        sceneStyle: { backgroundColor: LoopColors.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.feedback'),
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? 'home-fill' : 'home'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: t('tab.reflect'),
          tabBarIcon: ({ color }) => <Icon name="loop" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('tab.insights'),
          tabBarIcon: ({ color }) => <Icon name="chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab.settings'),
          tabBarIcon: ({ color }) => <Icon name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
