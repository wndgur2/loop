import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { LoopText, Screen, ScreenHeader } from '@/components/ui';
import { LEGAL_DOCS, type LegalDocId } from '@/features/legal/content';
import { useI18n } from '@/lib/i18n';

/** Legal document viewer — /legal/privacy and /legal/terms. Reachable before sign-in (consent links). */
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const id: LegalDocId = doc === 'terms' ? 'terms' : 'privacy';
  const router = useRouter();
  const { lang } = useI18n();
  const content = LEGAL_DOCS[lang][id];

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader onBack={() => router.back()}>
        <LoopText variant="heading2" style={styles.title}>
          {content.title}
        </LoopText>
      </ScreenHeader>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LoopText variant="caption" color="ink4">
          {content.updated}
        </LoopText>
        {content.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <LoopText variant="cardTitle">{s.heading}</LoopText>
            <LoopText variant="body" color="ink2" style={styles.body}>
              {s.body}
            </LoopText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16 },
  scroll: { paddingHorizontal: 26, paddingTop: 4, paddingBottom: 32 },
  section: { marginTop: 22 },
  body: { marginTop: 8, lineHeight: 23 },
});
