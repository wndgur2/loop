import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * 임시 진입 화면 — 스캐폴딩 확인용.
 * 실제 화면(피드백·회고·대시보드·설정)은 feature-spec 화면 인벤토리에 따라 이후 작업한다.
 */
export default function IndexScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Loop</ThemedText>
        <ThemedText themeColor="textSecondary">스캐폴딩 완료 · 화면은 이후 작업</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
