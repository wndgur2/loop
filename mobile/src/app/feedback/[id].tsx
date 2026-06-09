import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  Chip,
  ConfirmDialog,
  HeaderAction,
  Icon,
  IconButton,
  ImportanceDots,
  LoopText,
  Screen,
  ScreenHeader,
  SectionLabel,
  Skeleton,
} from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { TakeawayChecklist } from '@/features/feedback/components';
import {
  useDeleteFeedback,
  useFeedback,
  useSetInternalized,
  useToggleTakeaway,
} from '@/features/feedback/queries';
import { useSubGoalName } from '@/features/goals/use-sub-goal-name';
import { fullDate, relativeTime } from '@/lib/date';
import { haptics } from '@/lib/haptics';
import { useI18n } from '@/lib/i18n';
import { impLabelKey } from '@/lib/importance';

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useI18n();
  const { data: feedback, isLoading } = useFeedback(id);
  const subGoalName = useSubGoalName();
  const toggleTakeaway = useToggleTakeaway();
  const setInternalized = useSetInternalized();
  const deleteFeedback = useDeleteFeedback();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!feedback) {
    return (
      <Screen edges={['top', 'bottom']}>
        {isLoading ? (
          <View style={styles.detailSkeleton}>
            <Skeleton width="70%" height={26} radius={9} />
            <Skeleton width="45%" height={12} radius={6} />
            <Skeleton width="100%" height={64} radius={12} />
            <Skeleton width="100%" height={64} radius={12} />
          </View>
        ) : (
          <View style={styles.centerFill}>
            <LoopText color="ink3">{t('detail.notfound')}</LoopText>
          </View>
        )}
      </Screen>
    );
  }

  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((tk) => tk.done).length;
  const internalized = feedback.internalized;

  async function doDelete() {
    haptics.warning();
    await deleteFeedback.mutateAsync(feedback!.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        onBack={() => router.back()}
        right={
          <>
            <HeaderAction
              icon="edit"
              onPress={() => router.push(`/feedback/new?id=${feedback.id}`)}
            />
            <HeaderAction icon="trash" onPress={() => setConfirmingDelete(true)} />
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {internalized ? <ClosedBanner /> : <StatusPill />}

        <LoopText variant="heading" style={styles.title}>
          {feedback.title}
        </LoopText>

        <MetaRow label={t('detail.meta.subgoal')}>
          <Chip
            label={subGoalName(feedback.subGoalId)}
            tone="warm"
            icon={<Icon name="target" size={13} color={LoopColors.warmDeep} />}
          />
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
            <TakeawayChecklist
              takeaways={feedback.takeaways}
              onToggle={(takeawayId, nextDone) =>
                toggleTakeaway.mutate({ feedbackId: feedback.id, takeawayId, done: nextDone })
              }
            />
          </>
        )}

        {feedback.tags.length > 0 && (
          <>
            <SectionLabel>{t('detail.section.tags')}</SectionLabel>
            <View style={styles.tagsWrap}>
              {feedback.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  icon={<Icon name="tag" size={12} color={LoopColors.ink3} />}
                />
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
        <Button
          label={t('detail.action.reflect')}
          icon="loop"
          style={styles.flex}
          onPress={() => router.push('/chat/reflect')}
        />
      </View>

      <ConfirmDialog
        visible={confirmingDelete}
        icon="trash"
        title={t('detail.delete.title')}
        message={t('detail.delete.msg')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteFeedback.isPending}
        onConfirm={doDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}

function ClosedBanner() {
  const { t } = useI18n();
  return (
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  detailSkeleton: { padding: 22, gap: 14 },
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
});
