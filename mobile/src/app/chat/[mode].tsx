import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Chip, ComposerInput, Icon, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { applyRetrospective, describeRetrospective } from '@/features/chat/apply';
import { completeSession, createChatSession, saveMessage } from '@/features/chat/session';
import { useCreateFeedback } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { type ChatProposal, type FeedbackProposal, invokeLoopi, type LoopiMessage } from '@/lib/loopi';
import { qk } from '@/lib/query-keys';
import { IMPORTANCE_LABEL, type SessionMode } from '@/types/models';

type UiMode = 'write' | 'reflect';

const INTRO: Record<UiMode, string> = {
  write: '오늘 마음에 남은 순간을 들려주세요. 무슨 일이 있었는지부터 편하게 적어 주시면, 근본 원인과 다음 다짐까지 함께 정리해 볼게요.',
  reflect:
    '지난 피드백을 함께 되새겨 봐요. 요즘 어떤 영역이 떠오르나요? 떠오르는 상황을 적어 주시면 비슷한 옛 다짐을 같이 짚어 볼게요.',
};

export default function LoopiChatScreen() {
  const { mode } = useLocalSearchParams<{ mode: UiMode }>();
  const uiMode: UiMode = mode === 'reflect' ? 'reflect' : 'write';
  const serverMode: SessionMode = uiMode === 'reflect' ? 'retrospective' : 'write';

  const router = useRouter();
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

  function appendAssistant(content: string) {
    setMessages((cur) => [...cur, { role: 'assistant', content }]);
  }

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setProposal(null);

    const next: LoopiMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setSending(true);

    // 세션 영속은 best-effort — 실패해도 대화는 진행한다.
    if (!sessionIdRef.current) {
      try {
        sessionIdRef.current = await createChatSession(serverMode);
      } catch {
        /* skip persistence */
      }
    }
    if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'user', content);

    try {
      const res = await invokeLoopi({ mode: serverMode, messages: next });
      appendAssistant(res.reply);
      if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'assistant', res.reply);
      if (res.proposal) setProposal(res.proposal);
    } catch (e) {
      appendAssistant(e instanceof Error ? e.message : 'Loopi와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSending(false);
    }
  }

  async function acceptWrite(p: FeedbackProposal) {
    const match =
      subGoals.find((s) => s.name.trim().toLowerCase() === p.category.trim().toLowerCase()) ?? subGoals[0];
    if (!match) {
      appendAssistant('저장할 하위 목표가 없어요. 설정에서 먼저 하위 목표를 추가해 주세요.');
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
        takeaways: p.takeaways.map((t) => t.text),
        sessionId: sessionIdRef.current,
      });
      if (sessionIdRef.current) void completeSession(sessionIdRef.current);
      setProposal(null);
      router.replace(`/feedback/${fb.id}`);
    } catch {
      appendAssistant('저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
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
      appendAssistant('반영했어요. 차근차근 잘 하고 있어요.');
    } catch {
      appendAssistant('반영에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setApplying(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 11,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: LoopColors.lineSoft,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <LoopText variant="heading2" style={{ fontSize: 15 }}>
            {uiMode === 'reflect' ? '되새김' : '작성'}
          </LoopText>
          <LoopText variant="small" color="warmDeep" style={{ marginTop: 2 }}>
            Loopi와 대화 중
          </LoopText>
        </View>
        <Icon name="loop" size={20} color={LoopColors.warm} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <Bubble role="assistant" text={INTRO[uiMode]} />
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {sending && <TypingBubble />}

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
              lines={describeRetrospective(proposal)}
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
          placeholder={uiMode === 'reflect' ? '되새기고 싶은 것을 적어 주세요' : '무슨 일이 있었나요?'}
        />
        <View style={{ height: 6 }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user';
  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '84%',
        backgroundColor: isUser ? LoopColors.warm : LoopColors.surface,
        borderWidth: isUser ? 0 : 1,
        borderColor: LoopColors.lineSoft,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
      }}
    >
      <LoopText variant="bodyTight" color={isUser ? 'white' : 'ink2'}>
        {text}
      </LoopText>
    </View>
  );
}

function TypingBubble() {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: LoopColors.surface,
        borderWidth: 1,
        borderColor: LoopColors.lineSoft,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <ActivityIndicator color={LoopColors.warm} size="small" />
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
        이렇게 저장할까요?
      </LoopText>
      <LoopText variant="cardTitle">{proposal.title}</LoopText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Chip label={proposal.category} tone="warm" />
        <ImportanceDots level={proposal.importance} />
        <LoopText variant="caption" color="ink3">
          {IMPORTANCE_LABEL[proposal.importance]}
        </LoopText>
      </View>
      {proposal.takeaways.length > 0 && (
        <View style={{ gap: 4 }}>
          {proposal.takeaways.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 7 }}>
              <LoopText variant="bodyTight" color="warmDeep">
                ·
              </LoopText>
              <LoopText variant="bodyTight" color="ink2" style={{ flex: 1 }}>
                {t.text}
              </LoopText>
            </View>
          ))}
        </View>
      )}
      <ConfirmChips acceptLabel="이대로 저장" busy={busy} onAccept={onAccept} onDismiss={onDismiss} />
    </View>
  );
}

function RetroProposalCard({
  lines,
  busy,
  onAccept,
  onDismiss,
}: {
  lines: string[];
  busy: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
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
        이렇게 반영할까요?
      </LoopText>
      {lines.map((l, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 7 }}>
          <Icon name="check-sm" size={15} color={LoopColors.good} />
          <LoopText variant="bodyTight" color="ink2" style={{ flex: 1 }}>
            {l}
          </LoopText>
        </View>
      ))}
      <ConfirmChips acceptLabel="반영하기" busy={busy} onAccept={onAccept} onDismiss={onDismiss} good />
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
          아직요
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
