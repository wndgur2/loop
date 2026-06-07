import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Button, Checkbox, Chip, Icon, IconButton, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { fullDate, relativeTime } from '@/lib/date';
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
    () => subGoals.find((s) => s.id === feedback?.subGoalId)?.name ?? '하위 목표',
    [subGoals, feedback?.subGoalId],
  );

  if (!feedback) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LoopText color="ink3">{isLoading ? t('detail.loading') : t('detail.notfound')}</LoopText>
        </View>
      </Screen>
    );
  }

  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((t) => t.done).length;
  const internalized = feedback.internalized;

  function confirmDelete() {
    Alert.alert(t('detail.delete.title'), t('detail.delete.msg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteFeedback.mutateAsync(feedback!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 2, paddingBottom: 10 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 4 }}>
          <Pressable onPress={() => router.push(`/feedback/new?id=${feedback.id}`)} hitSlop={8} style={{ padding: 6 }}>
            <Icon name="edit" size={21} color={LoopColors.ink3} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={8} style={{ padding: 6 }}>
            <Icon name="trash" size={21} color={LoopColors.ink3} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {internalized ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: LoopColors.goodSoft,
              borderRadius: 16,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 9999,
                backgroundColor: LoopColors.good,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={19} color={LoopColors.white} />
            </View>
            <View>
              <LoopText variant="label" color="good">
                {t('detail.closed.title')}
              </LoopText>
              <LoopText variant="caption" color="ink3" style={{ marginTop: 2 }}>
                {t('detail.closed.sub')}
              </LoopText>
            </View>
          </View>
        ) : (
          <StatusPill />
        )}

        <LoopText variant="heading" style={{ lineHeight: 31, marginBottom: 6 }}>
          {feedback.title}
        </LoopText>

        <MetaRow label={t('detail.meta.subgoal')}>
          <Chip label={subGoalName} tone="warm" icon={<Icon name="target" size={13} color={LoopColors.warmDeep} />} />
        </MetaRow>
        <MetaRow label={t('detail.meta.importance')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
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
            <View style={{ borderTopWidth: 1, borderTopColor: LoopColors.lineSoft }}>
              {feedback.takeaways.map((t) => (
                <View
                  key={t.id}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'flex-start',
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: LoopColors.lineSoft,
                  }}
                >
                  <Checkbox
                    done={t.done}
                    onPress={() =>
                      toggleTakeaway.mutate({ feedbackId: feedback.id, takeawayId: t.id, done: !t.done })
                    }
                  />
                  <LoopText
                    variant="bodyTight"
                    color={t.done ? 'ink4' : 'ink'}
                    style={{ flex: 1, textDecorationLine: t.done ? 'line-through' : 'none' }}
                  >
                    {t.text}
                  </LoopText>
                </View>
              ))}
            </View>
          </>
        )}

        {feedback.tags.length > 0 && (
          <>
            <SectionLabel>{t('detail.section.tags')}</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
              {feedback.tags.map((tag) => (
                <Chip key={tag} label={tag} icon={<Icon name="tag" size={12} color={LoopColors.ink3} />} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* footer actions */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingTop: 10 }}>
        {internalized ? (
          <Button
            label={t('detail.action.reopen')}
            variant="secondary"
            icon="undo"
            style={{ flex: 1 }}
            onPress={() => setInternalized.mutate({ feedbackId: feedback.id, internalized: false })}
          />
        ) : (
          <IconButton icon="check" color={LoopColors.good} onPress={() => setInternalized.mutate({ feedbackId: feedback.id, internalized: true })} />
        )}
        <Button label={t('detail.action.reflect')} icon="loop" style={{ flex: 1 }} onPress={() => router.push('/chat/reflect')} />
      </View>
    </Screen>
  );
}

function StatusPill() {
  const { t } = useI18n();
  return (
    <View
      style={{
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
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: LoopColors.warm }} />
      <LoopText variant="small" color="warmDeep" style={{ letterSpacing: 0.3 }}>
        {t('detail.openLoop')}
      </LoopText>
    </View>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: LoopColors.lineSoft,
      }}
    >
      <LoopText variant="caption" color="ink4" style={{ width: 76 }}>
        {label}
      </LoopText>
      {children}
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 24, marginBottom: 9 }}>
      {children}
    </LoopText>
  );
}
