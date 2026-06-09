import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { useT } from '@/lib/i18n';

/** Height of the tab bar content (icon + label) area. The bottom safe area is added separately via inset. */
const TAB_BAR_CONTENT_HEIGHT = 64;

/** Four bottom tabs — Feedback (home) · Reflect · Dashboard · Settings. Matches the demo TabBar tone. */
export default function TabsLayout() {
  const t = useT();
  // Reflect each device's bottom safe area (home indicator / gesture nav) and preserve it below the tab bar.
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: LoopColors.warmDeep,
        tabBarInactiveTintColor: LoopColors.ink4,
        tabBarStyle: {
          backgroundColor: LoopColors.canvas,
          borderTopWidth: 0,
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
