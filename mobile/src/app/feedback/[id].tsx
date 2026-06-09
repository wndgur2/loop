import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Checkbox, Chip, Icon, IconButton, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { fullDate, relativeTime } from '@/lib/date';
import { haptics } from '@/lib/haptics';
import {
  useDeleteFeedback,
  useFeedback,
  useSetInternalized,
  useToggleTakeaway,
} from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useI18n } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';
import type { Importance } from '@/types/models';

function impLabelKey(imp: Importance): TKey {
  return imp === 'high' ? 'imp.high' : imp === 'low' ? 'imp.low' : 'imp.mid';
}

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useI18n();
  const { data: feedback, isLoading } = useFeedback(id);
  const { data: subGoals = [] } = useSubGoals();
  const toggleTakeaway = useToggleTakeaway();
  const setInternalized = useSetInternalized();
  const deleteFeedback = useDeleteFeedback();

  const subGoalName = useMemo(
    () => subGoals.find((s) => s.id === feedback?.subGoalId)?.name ?? '—',
    [subGoals, feedback?.subGoalId],
  );

  if (!feedback) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={styles.centerFill}>
          <LoopText color="ink3">{isLoading ? t('detail.loading') : t('detail.notfound')}</LoopText>
        </View>
      </Screen>
    );
  }

  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((tk) => tk.done).length;
  const internalized = feedback.internalized;

  function confirmDelete() {
    Alert.alert(t('detail.delete.title'), t('detail.delete.msg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          haptics.warning();
          await deleteFeedback.mutateAsync(feedback!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerBtn}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push(`/feedback/new?id=${feedback.id}`)} hitSlop={8} style={styles.headerAction}>
            <Icon name="edit" size={21} color={LoopColors.ink3} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={8} style={styles.headerAction}>
            <Icon name="trash" size={21} color={LoopColors.ink3} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {internalized ? (
          <View style={styles.closedBanner}>
            <View style={styles.closedIcon}>
              <Icon name="check" size={19} color={LoopColors.white} />
            </View>
            <View>
              <LoopText variant="label" color="good">
                {t('detail.closed.title')}
              </LoopText>
              <LoopText variant="caption" color="ink3" style={styles.closedSub}>
                {t('detail.closed.sub')}
              </LoopText>
            </View>
          </View>
        ) : (
          <StatusPill />
        )}

        <LoopText variant="heading" style={styles.title}>
          {feedback.title}
        </LoopText>

        <MetaRow label={t('detail.meta.subgoal')}>
          <Chip label={subGoalName} tone="warm" icon={<Icon name="target" size={13} color={LoopColors.warmDeep} />} />
        </MetaRow>
        <MetaRow label={t('detail.meta.importance')}>
          <View style={styles.impValue}>
            <ImportanceDots level={feedback.importance} />
            <LoopText variant="label" color="ink2">
              {t(impLabelKey(feedback.importance))}
            </LoopText>
          </View>
        </MetaRow>
        <MetaRow label={internalized ? t('detail.meta.internalized') : t('detail.meta.created')}>
          <LoopText variant="label" color={internalized ? 'good' : 'ink2'}>
            {internalized && feedback.internalizedAt
              ? `${fullDate(feedback.internalizedAt, lang)}`
              : `${fullDate(feedback.createdAt, lang)} · ${relativeTime(feedback.createdAt, lang)}`}
          </LoopText>
        </MetaRow>

        <SectionLabel>{t('detail.section.feedback')}</SectionLabel>
        <LoopText variant="body" color="ink2">
          {feedback.situation}
        </LoopText>

        <SectionLabel>{t('detail.section.rootcause')}</SectionLabel>
        <LoopText variant="body" color="ink2">
          {feedback.rootCause}
        </LoopText>

        {total > 0 && (
          <>
            <SectionLabel>{t('detail.section.takeaways', { done, total })}</SectionLabel>
            <View style={styles.takeawayList}>
              {feedback.takeaways.map((tk) => (
                <View key={tk.id} style={styles.takeawayRow}>
                  <Checkbox
                    done={tk.done}
                    onPress={() => toggleTakeaway.mutate({ feedbackId: feedback.id, takeawayId: tk.id, done: !tk.done })}
                  />
                  <LoopText
                    variant="bodyTight"
                    color={tk.done ? 'ink4' : 'ink'}
                    style={[styles.takeawayText, tk.done && styles.takeawayDone]}
                  >
                    {tk.text}
                  </LoopText>
                </View>
              ))}
            </View>
          </>
        )}

        {feedback.tags.length > 0 && (
          <>
            <SectionLabel>{t('detail.section.tags')}</SectionLabel>
            <View style={styles.tagsWrap}>
              {feedback.tags.map((tag) => (
                <Chip key={tag} label={tag} icon={<Icon name="tag" size={12} color={LoopColors.ink3} />} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* footer actions */}
      <View style={styles.footer}>
        {internalized ? (
          <Button
            label={t('detail.action.reopen')}
            variant="secondary"
            icon="undo"
            style={styles.flex}
            onPress={() => setInternalized.mutate({ feedbackId: feedback.id, internalized: false })}
          />
        ) : (
          <IconButton
            icon="check"
            color={LoopColors.good}
            onPress={() =>
              setInternalized.mutate(
                { feedbackId: feedback.id, internalized: true },
                { onSuccess: () => haptics.success() },
              )
            }
          />
        )}
        <Button label={t('detail.action.reflect')} icon="loop" style={styles.flex} onPress={() => router.push('/chat/reflect')} />
      </View>
    </Screen>
  );
}

function StatusPill() {
  const { t } = useI18n();
  return (
    <View style={styles.statusPill}>
      <View style={styles.statusDot} />
      <LoopText variant="small" color="warmDeep" style={styles.statusLabel}>
        {t('detail.openLoop')}
      </LoopText>
    </View>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.metaRow}>
      <LoopText variant="caption" color="ink4" style={styles.metaLabel}>
        {label}
      </LoopText>
      {children}
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={styles.sectionLabel}>
      {children}
    </LoopText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  headerBtn: { padding: 4 },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 4 },
  headerAction: { padding: 6 },
  scroll: { paddingHorizontal: 22, paddingBottom: 16 },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: LoopColors.goodSoft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  closedIcon: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    backgroundColor: LoopColors.good,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedSub: { marginTop: 2 },
  title: { lineHeight: 31, marginBottom: 6 },
  impValue: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  takeawayList: { borderTopWidth: 1, borderTopColor: LoopColors.lineSoft },
  takeawayRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: LoopColors.lineSoft,
  },
  takeawayText: { flex: 1 },
  takeawayDone: { textDecorationLine: 'line-through' },
  tagsWrap: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingTop: 10 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    height: 26,
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 9999,
    backgroundColor: LoopColors.warmSoft,
    marginBottom: 14,
  },
  statusDot: { width: 6, height: 6, borderRadius: 9999, backgroundColor: LoopColors.warm },
  statusLabel: { letterSpacing: 0.3 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: LoopColors.lineSoft,
  },
  metaLabel: { width: 76 },
  sectionLabel: { marginTop: 24, marginBottom: 9 },
});
