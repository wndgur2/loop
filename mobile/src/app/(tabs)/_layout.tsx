import { Tabs } from 'expo-router';
import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, usePressScale } from '@/components/ui';
import { LoopColors, LoopMotion } from '@/constants/loop-theme';
import { useT } from '@/lib/i18n';

/** Height of the tab bar content (icon + label) area. The bottom safe area is added separately via inset. */
const TAB_BAR_CONTENT_HEIGHT = 64;

/**
 * Tab button with no platform press feedback (no Android ripple / iOS opacity dim).
 * Instead the content squishes (scales down) while pressed and springs back.
 */
function SquishTabButton({
  children,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ref: _ref,
  ...rest
}: BottomTabBarButtonProps) {
  const {
    animatedStyle,
    onPressIn: scaleIn,
    onPressOut: scaleOut,
  } = usePressScale({
    scaleTo: LoopMotion.scale.squish,
    spring: LoopMotion.spring.squish,
  });
  return (
    <Pressable
      {...rest}
      style={style}
      android_ripple={null}
      onPress={onPress}
      onPressIn={(e) => {
        scaleIn();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scaleOut();
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[styles.squishInner, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

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
        tabBarButton: (props) => <SquishTabButton {...props} />,
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

const styles = StyleSheet.create({
  squishInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
