import { useLocalSearchParams, useRouter } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useQueryClient } from '@tanstack/react-query';

import { Chip, ComposerInput, Icon, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { applyRetrospective, describeRetrospective } from '@/features/chat/apply';
import { completeSession, createChatSession, saveMessage } from '@/features/chat/session';
import { useCreateFeedback } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { haptics } from '@/lib/haptics';
import { useI18n, useT } from '@/lib/i18n';
import { type ChatProposal, type FeedbackProposal, type LoopiMessage, streamLoopi } from '@/lib/loopi';
import { qk } from '@/lib/query-keys';
import type { TKey } from '@/lib/translations';
import { type Importance, type SessionMode } from '@/types/models';

type UiMode = 'write' | 'reflect';

function impLabelKey(imp: Importance): TKey {
  return imp === 'high' ? 'imp.high' : imp === 'low' ? 'imp.low' : 'imp.mid';
}

export default function LoopiChatScreen() {
  const { mode, initial } = useLocalSearchParams<{ mode: UiMode; initial?: string }>();
  const uiMode: UiMode = mode === 'reflect' ? 'reflect' : 'write';
  const serverMode: SessionMode = uiMode === 'reflect' ? 'retrospective' : 'write';

  const router = useRouter();
  const t = useT();
  const qc = useQueryClient();
  const { data: subGoals = [] } = useSubGoals();
  const create = useCreateFeedback();

  const [messages, setMessages] = useState<LoopiMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [proposal, setProposal] = useState<ChatProposal | null>(null);
  const [applying, setApplying] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const intro = uiMode === 'reflect' ? t('chat.intro.reflect') : t('chat.intro.write');
  const lastMessage = messages[messages.length - 1];
  const lastAssistantHasText = lastMessage?.role === 'assistant' && lastMessage.content.length > 0;

  function appendAssistant(content: string) {
    setMessages((cur) => [...cur, { role: 'assistant', content }]);
  }

  /** Update the content of the last assistant bubble (accumulate streaming deltas / finalize). */
  function updateLastAssistant(fn: (prev: string) => string) {
    setMessages((cur) => {
      const copy = cur.slice();
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') {
          copy[i] = { ...copy[i], content: fn(copy[i].content) };
          break;
        }
      }
      return copy;
    });
  }

  async function sendText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setProposal(null);

    const next: LoopiMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setSending(true);

    if (!sessionIdRef.current) {
      try {
        sessionIdRef.current = await createChatSession(serverMode);
      } catch {
        /* Keep the conversation going even if persistence fails */
      }
    }
    if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'user', trimmed);

    // Show an empty bubble first to fill in with the streaming reply.
    appendAssistant('');
    try {
      const res = await streamLoopi({
        mode: serverMode,
        messages: next,
        onDelta: (delta) => updateLastAssistant((prev) => prev + delta),
      });
      // Finalize with the final reply (trimmed) — reconciles minor whitespace differences from delta accumulation.
      updateLastAssistant(() => res.reply);
      if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'assistant', res.reply);
      if (res.proposal) setProposal(res.proposal);
    } catch {
      // If the bubble is empty, replace it with an error message; if some text was already received, keep it.
      updateLastAssistant((prev) => (prev ? prev : t('chat.err.connect')));
    } finally {
      setSending(false);
    }
  }

  function send() {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    void sendText(content);
  }

  // Auto-send the first message passed from the bottom tab input once.
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (!autoSentRef.current && typeof initial === 'string' && initial.trim()) {
      autoSentRef.current = true;
      void sendText(initial);
    }
    // Only once on first mount — initial is fixed at entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  async function acceptWrite(p: FeedbackProposal) {
    const match =
      subGoals.find((s) => s.name.trim().toLowerCase() === p.category.trim().toLowerCase()) ?? subGoals[0];
    if (!match) {
      appendAssistant(t('chat.err.noSubgoal'));
      setProposal(null);
      return;
    }
    setApplying(true);
    try {
      const fb = await create.mutateAsync({
        title: p.title,
        situation: p.situation,
        rootCause: p.root_cause,
        subGoalId: match.id,
        importance: p.importance,
        tags: p.tags,
        takeaways: p.takeaways.map((x) => x.text),
        sessionId: sessionIdRef.current,
      });
      if (sessionIdRef.current) void completeSession(sessionIdRef.current);
      haptics.success();
      setProposal(null);
      router.replace(`/feedback/${fb.id}`);
    } catch {
      appendAssistant(t('chat.err.saveFail'));
    } finally {
      setApplying(false);
    }
  }

  async function acceptRetro(p: Extract<ChatProposal, { kind: 'update_feedback' }>) {
    setApplying(true);
    try {
      await applyRetrospective(p);
      qc.invalidateQueries({ queryKey: qk.feedbacks });
      qc.invalidateQueries({ queryKey: qk.feedback(p.feedback_id) });
      if (sessionIdRef.current) void completeSession(sessionIdRef.current);
      haptics.success();
      setProposal(null);
      appendAssistant(t('chat.applied'));
    } catch {
      appendAssistant(t('chat.err.applyFail'));
    } finally {
      setApplying(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      {/* Header — airy (quiet journal) */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
        <CoachAvatar />
        <View style={styles.flex}>
          <LoopText variant="heading2" style={styles.title}>
            {uiMode === 'reflect' ? t('chat.title.reflect') : t('chat.title.write')}
          </LoopText>
          <LoopText variant="small" color="warmDeep" style={styles.sub}>
            {t('chat.sub')}
          </LoopText>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <CoachLine text={intro} />
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <UserLine key={i} text={m.content} />
            ) : m.content ? (
              <CoachLine key={i} text={m.content} />
            ) : null,
          )}
          {/* Show the typing indicator only until the first token (once streaming starts, text is shown instead). */}
          {sending && !lastAssistantHasText && (
            <ActivityIndicator color={LoopColors.warm} size="small" style={styles.typing} />
          )}

          {proposal?.kind === 'create_feedback' && (
            <CreateProposalCard
              proposal={proposal}
              busy={applying}
              onAccept={() => acceptWrite(proposal)}
              onDismiss={() => setProposal(null)}
            />
          )}
          {proposal?.kind === 'update_feedback' && (
            <RetroProposalCard
              proposal={proposal}
              busy={applying}
              onAccept={() => acceptRetro(proposal)}
              onDismiss={() => setProposal(null)}
            />
          )}
        </ScrollView>

        <ComposerInput
          value={input}
          onChangeText={setInput}
          onSend={send}
          disabled={sending}
          placeholder={uiMode === 'reflect' ? t('chat.ph.reflect') : t('chat.ph.write')}
        />
        <View style={styles.bottomSpacer} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Small Loopi ring avatar. */
const CoachAvatar = memo(function CoachAvatar() {
  return (
    <View style={styles.avatar}>
      <Icon name="loop" size={16} color={LoopColors.warm} />
    </View>
  );
});

/** Loopi prompt — a warm-toned sentence without a bubble. */
const CoachLine = memo(function CoachLine({ text }: { text: string }) {
  return (
    <LoopText color="warmDeep" style={styles.coachLine}>
      {text}
    </LoopText>
  );
});

/** User utterance — a journal quote indented with a left border. */
const UserLine = memo(function UserLine({ text }: { text: string }) {
  return (
    <View style={styles.userLine}>
      <LoopText color="ink" style={styles.userText}>
        {text}
      </LoopText>
    </View>
  );
});

function CreateProposalCard({
  proposal,
  busy,
  onAccept,
  onDismiss,
}: {
  proposal: FeedbackProposal;
  busy: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
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
      <ConfirmChips acceptLabel={t('chat.proposal.save')} busy={busy} onAccept={onAccept} onDismiss={onDismiss} />
    </View>
  );
}

function RetroProposalCard({
  proposal,
  busy,
  onAccept,
  onDismiss,
}: {
  proposal: Extract<ChatProposal, { kind: 'update_feedback' }>;
  busy: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
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
      <ConfirmChips acceptLabel={t('chat.proposal.apply')} busy={busy} onAccept={onAccept} onDismiss={onDismiss} good />
    </View>
  );
}

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
      <Pressable onPress={onDismiss} disabled={busy} style={styles.dismiss}>
        <LoopText variant="label" color="ink2">
          {t('chat.proposal.dismiss')}
        </LoopText>
      </Pressable>
      <Pressable
        onPress={onAccept}
        disabled={busy}
        style={[styles.accept, { backgroundColor: good ? LoopColors.good : LoopColors.warm, opacity: busy ? 0.7 : 1 }]}
      >
        {busy ? (
          <ActivityIndicator color={LoopColors.white} size="small" />
        ) : (
          <Icon name="check-sm" size={15} color={LoopColors.white} />
        )}
        <LoopText variant="label" color="white">
          {acceptLabel}
        </LoopText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  back: { padding: 2 },
  title: { fontSize: 15 },
  sub: { marginTop: 2 },
  scroll: { paddingHorizontal: 26, paddingTop: 6, paddingBottom: 12, gap: 22 },
  typing: { alignSelf: 'flex-start' },
  bottomSpacer: { height: 6 },
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
