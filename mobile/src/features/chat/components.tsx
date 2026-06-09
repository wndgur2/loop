/** Chat-screen building blocks — Loopi/user lines and proposal cards. */
import { memo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Chip, Icon, ImportanceDots, LoopText, PressScale } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useI18n, useT } from '@/lib/i18n';
import { impLabelKey } from '@/lib/importance';
import type { FeedbackProposal, RetrospectiveProposal } from '@/lib/loopi';

import { describeRetrospective } from './apply';

/** Small Loopi ring avatar. */
export const CoachAvatar = memo(function CoachAvatar() {
  return (
    <View style={styles.avatar}>
      <Icon name="loop" size={16} color={LoopColors.warm} />
    </View>
  );
});

/** Loopi prompt — a warm-toned sentence without a bubble. */
export const CoachLine = memo(function CoachLine({ text }: { text: string }) {
  return (
    <LoopText color="warmDeep" style={styles.coachLine}>
      {text}
    </LoopText>
  );
});

/** User utterance — a journal quote indented with a left border. */
export const UserLine = memo(function UserLine({ text }: { text: string }) {
  return (
    <View style={styles.userLine}>
      <LoopText color="ink" style={styles.userText}>
        {text}
      </LoopText>
    </View>
  );
});

type ProposalCardProps<P> = {
  proposal: P;
  busy: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

/** New-feedback proposal — preview of the structured entry + confirm chips. */
export function CreateProposalCard({
  proposal,
  busy,
  onAccept,
  onDismiss,
}: ProposalCardProps<FeedbackProposal>) {
  const t = useT();
  return (
    <View style={styles.createCard}>
      <LoopText variant="eyebrow" color="warmDeep">
        {t('chat.proposal.createTitle')}
      </LoopText>
      <LoopText variant="cardTitle">{proposal.title}</LoopText>
      <View style={styles.metaRow}>
        <Chip label={proposal.category} tone="warm" />
        <ImportanceDots level={proposal.importance} />
        <LoopText variant="caption" color="ink3">
          {t(impLabelKey(proposal.importance))}
        </LoopText>
      </View>
      {proposal.takeaways.length > 0 && (
        <View style={styles.takeaways}>
          {proposal.takeaways.map((tk, i) => (
            <View key={i} style={styles.takeawayItem}>
              <LoopText variant="bodyTight" color="warmDeep">
                ·
              </LoopText>
              <LoopText variant="bodyTight" color="ink2" style={styles.flex}>
                {tk.text}
              </LoopText>
            </View>
          ))}
        </View>
      )}
      <ConfirmChips
        acceptLabel={t('chat.proposal.save')}
        busy={busy}
        onAccept={onAccept}
        onDismiss={onDismiss}
      />
    </View>
  );
}

/** Retrospective proposal — human-readable change summary + confirm chips. */
export function RetroProposalCard({
  proposal,
  busy,
  onAccept,
  onDismiss,
}: ProposalCardProps<RetrospectiveProposal>) {
  const { t } = useI18n();
  const lines = describeRetrospective(proposal, t);
  return (
    <View style={styles.retroCard}>
      <LoopText variant="eyebrow" color="ink4">
        {t('chat.proposal.retroTitle')}
      </LoopText>
      {lines.map((l, i) => (
        <View key={i} style={styles.takeawayItem}>
          <Icon name="check-sm" size={15} color={LoopColors.good} />
          <LoopText variant="bodyTight" color="ink2" style={styles.flex}>
            {l}
          </LoopText>
        </View>
      ))}
      <ConfirmChips
        acceptLabel={t('chat.proposal.apply')}
        busy={busy}
        onAccept={onAccept}
        onDismiss={onDismiss}
        good
      />
    </View>
  );
}

/** Dismiss/accept chip pair shared by both proposal cards. */
function ConfirmChips({
  acceptLabel,
  busy,
  onAccept,
  onDismiss,
  good,
}: {
  acceptLabel: string;
  busy: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  good?: boolean;
}) {
  const t = useT();
  return (
    <View style={styles.chips}>
      <PressScale onPress={onDismiss} disabled={busy} style={styles.dismiss}>
        <LoopText variant="label" color="ink2">
          {t('chat.proposal.dismiss')}
        </LoopText>
      </PressScale>
      <PressScale
        onPress={onAccept}
        disabled={busy}
        style={[
          styles.accept,
          { backgroundColor: good ? LoopColors.good : LoopColors.warm, opacity: busy ? 0.7 : 1 },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={LoopColors.white} size="small" />
        ) : (
          <Icon name="check-sm" size={15} color={LoopColors.white} />
        )}
        <LoopText variant="label" color="white">
          {acceptLabel}
        </LoopText>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: LoopColors.warmSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachLine: { fontSize: 16, fontWeight: '600', lineHeight: 25 },
  userLine: { paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: LoopColors.warmLine },
  userText: { fontSize: 15, fontWeight: '500', lineHeight: 24 },
  createCard: {
    backgroundColor: LoopColors.warmSoft,
    borderWidth: 1,
    borderColor: LoopColors.warmLine,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  retroCard: {
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  takeaways: { gap: 4 },
  takeawayItem: { flexDirection: 'row', gap: 7 },
  chips: { flexDirection: 'row', gap: 9, justifyContent: 'flex-end', marginTop: 4 },
  dismiss: {
    borderWidth: 1.4,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
    borderRadius: LoopRadius.full,
    paddingHorizontal: 16,
    height: 38,
    justifyContent: 'center',
  },
  accept: {
    borderRadius: LoopRadius.full,
    paddingHorizontal: 16,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
