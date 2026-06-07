import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Chip, ComposerInput, Icon, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { applyRetrospective, describeRetrospective } from '@/features/chat/apply';
import { completeSession, createChatSession, saveMessage } from '@/features/chat/session';
import { useCreateFeedback } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useI18n, useT } from '@/lib/i18n';
import { type ChatProposal, type FeedbackProposal, invokeLoopi, type LoopiMessage } from '@/lib/loopi';
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

  function appendAssistant(content: string) {
    setMessages((cur) => [...cur, { role: 'assistant', content }]);
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
        /* 영속 실패해도 대화는 진행 */
      }
    }
    if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'user', trimmed);

    try {
      const res = await invokeLoopi({ mode: serverMode, messages: next });
      appendAssistant(res.reply);
      if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'assistant', res.reply);
      if (res.proposal) setProposal(res.proposal);
    } catch {
      appendAssistant(t('chat.err.connect'));
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

  // 탭 하단 input에서 넘어온 첫 메시지를 한 번 자동 전송.
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (!autoSentRef.current && typeof initial === 'string' && initial.trim()) {
      autoSentRef.current = true;
      void sendText(initial);
    }
    // 최초 1회만 — initial은 진입 시 고정.
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
      {/* 헤더 — airy(quiet journal) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingBottom: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 2 }}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
        <CoachAvatar />
        <View style={{ flex: 1 }}>
          <LoopText variant="heading2" style={{ fontSize: 15 }}>
            {uiMode === 'reflect' ? t('chat.title.reflect') : t('chat.title.write')}
          </LoopText>
          <LoopText variant="small" color="warmDeep" style={{ marginTop: 2 }}>
            {t('chat.sub')}
          </LoopText>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 6, paddingBottom: 12, gap: 22 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <CoachLine text={intro} />
          {messages.map((m, i) => (m.role === 'user' ? <UserLine key={i} text={m.content} /> : <CoachLine key={i} text={m.content} />))}
          {sending && <ActivityIndicator color={LoopColors.warm} size="small" style={{ alignSelf: 'flex-start' }} />}

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
        <View style={{ height: 6 }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Loopi 작은 링 아바타. */
function CoachAvatar() {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 9999,
        backgroundColor: LoopColors.warmSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="loop" size={16} color={LoopColors.warm} />
    </View>
  );
}

/** Loopi 프롬프트 — 버블 없이 따뜻한 톤의 문장. */
function CoachLine({ text }: { text: string }) {
  return (
    <LoopText color="warmDeep" style={{ fontSize: 16, fontWeight: '600', lineHeight: 25 }}>
      {text}
    </LoopText>
  );
}

/** 사용자 발화 — 좌측 보더로 들여쓴 저널 인용. */
function UserLine({ text }: { text: string }) {
  return (
    <View style={{ paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: LoopColors.warmLine }}>
      <LoopText color="ink" style={{ fontSize: 15, fontWeight: '500', lineHeight: 24 }}>
        {text}
      </LoopText>
    </View>
  );
}

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
    <View
      style={{
        backgroundColor: LoopColors.warmSoft,
        borderWidth: 1,
        borderColor: LoopColors.warmLine,
        borderRadius: 18,
        padding: 16,
        gap: 10,
      }}
    >
      <LoopText variant="eyebrow" color="warmDeep">
        {t('chat.proposal.createTitle')}
      </LoopText>
      <LoopText variant="cardTitle">{proposal.title}</LoopText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Chip label={proposal.category} tone="warm" />
        <ImportanceDots level={proposal.importance} />
        <LoopText variant="caption" color="ink3">
          {t(impLabelKey(proposal.importance))}
        </LoopText>
      </View>
      {proposal.takeaways.length > 0 && (
        <View style={{ gap: 4 }}>
          {proposal.takeaways.map((tk, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 7 }}>
              <LoopText variant="bodyTight" color="warmDeep">
                ·
              </LoopText>
              <LoopText variant="bodyTight" color="ink2" style={{ flex: 1 }}>
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
    <View
      style={{
        backgroundColor: LoopColors.surface,
        borderWidth: 1,
        borderColor: LoopColors.line,
        borderRadius: 18,
        padding: 16,
        gap: 8,
      }}
    >
      <LoopText variant="eyebrow" color="ink4">
        {t('chat.proposal.retroTitle')}
      </LoopText>
      {lines.map((l, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 7 }}>
          <Icon name="check-sm" size={15} color={LoopColors.good} />
          <LoopText variant="bodyTight" color="ink2" style={{ flex: 1 }}>
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
    <View style={{ flexDirection: 'row', gap: 9, justifyContent: 'flex-end', marginTop: 4 }}>
      <Pressable
        onPress={onDismiss}
        disabled={busy}
        style={{
          borderWidth: 1.4,
          borderColor: LoopColors.line,
          backgroundColor: LoopColors.surface,
          borderRadius: LoopRadius.full,
          paddingHorizontal: 16,
          height: 38,
          justifyContent: 'center',
        }}
      >
        <LoopText variant="label" color="ink2">
          {t('chat.proposal.dismiss')}
        </LoopText>
      </Pressable>
      <Pressable
        onPress={onAccept}
        disabled={busy}
        style={{
          backgroundColor: good ? LoopColors.good : LoopColors.warm,
          borderRadius: LoopRadius.full,
          paddingHorizontal: 16,
          height: 38,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          opacity: busy ? 0.7 : 1,
        }}
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
