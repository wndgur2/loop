import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Icon } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';

/** 하단 탭 4개 — 피드백(홈) · 회고 · 대시보드 · 설정. demo TabBar 톤 매칭. */
export default function TabsLayout() {
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
          height: Platform.select({ ios: 86, default: 64 }),
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600', letterSpacing: 0.1 },
        sceneStyle: { backgroundColor: LoopColors.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '피드백',
          tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'home-fill' : 'home'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: '회고',
          tabBarIcon: ({ color }) => <Icon name="loop" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: '대시보드',
          tabBarIcon: ({ color }) => <Icon name="chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Icon name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
