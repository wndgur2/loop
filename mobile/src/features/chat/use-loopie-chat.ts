import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useCreateFeedback } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { haptics } from '@/lib/haptics';
import { useT } from '@/lib/i18n';
import {
  type ChatProposal,
  type FeedbackProposal,
  type LoopieMessage,
  type RetrospectiveProposal,
  streamLoopie,
} from '@/lib/loopie';
import { qk } from '@/lib/query-keys';
import type { SessionMode } from '@/types/models';

import { applyRetrospective } from './apply';
import { appendMessage, updateLastAssistant } from './messages';
import { completeSession, createChatSession, saveMessage } from './session';

/**
 * Conversation state for the Loopie chat screen — streaming send, session
 * persistence, and proposal accept/dismiss. Keeps the screen purely visual.
 */
export function useLoopieChat(mode: SessionMode, initial?: string) {
  const router = useRouter();
  const t = useT();
  const qc = useQueryClient();
  const { data: subGoals = [] } = useSubGoals();
  const create = useCreateFeedback();

  const [messages, setMessages] = useState<LoopieMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [proposal, setProposal] = useState<ChatProposal | null>(null);
  const [applying, setApplying] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  function showAssistant(content: string) {
    setMessages((cur) => appendMessage(cur, 'assistant', content));
  }

  function patchLastAssistant(fn: (prev: string) => string) {
    setMessages((cur) => updateLastAssistant(cur, fn));
  }

  async function sendText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setProposal(null);

    const next = appendMessage(messages, 'user', trimmed);
    setMessages(next);
    setSending(true);

    if (!sessionIdRef.current) {
      try {
        sessionIdRef.current = await createChatSession(mode);
      } catch {
        /* Keep the conversation going even if persistence fails */
      }
    }
    if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'user', trimmed);

    // Show an empty bubble first to fill in with the streaming reply.
    showAssistant('');
    try {
      const res = await streamLoopie({
        mode,
        messages: next,
        onDelta: (delta) => patchLastAssistant((prev) => prev + delta),
      });
      // Finalize with the final reply (trimmed) — reconciles minor whitespace differences from delta accumulation.
      patchLastAssistant(() => res.reply);
      haptics.tap();
      if (sessionIdRef.current) void saveMessage(sessionIdRef.current, 'assistant', res.reply);
      if (res.proposal) setProposal(res.proposal);
    } catch {
      // If the bubble is empty, replace it with an error message; if some text was already received, keep it.
      patchLastAssistant((prev) => (prev ? prev : t('chat.err.connect')));
    } finally {
      setSending(false);
    }
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
      subGoals.find((s) => s.name.trim().toLowerCase() === p.category.trim().toLowerCase()) ??
      subGoals[0];
    if (!match) {
      showAssistant(t('chat.err.noSubgoal'));
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
      showAssistant(t('chat.err.saveFail'));
    } finally {
      setApplying(false);
    }
  }

  async function acceptRetro(p: RetrospectiveProposal) {
    setApplying(true);
    try {
      await applyRetrospective(p);
      qc.invalidateQueries({ queryKey: qk.feedbacks });
      qc.invalidateQueries({ queryKey: qk.feedback(p.feedback_id) });
      if (sessionIdRef.current) void completeSession(sessionIdRef.current);
      setProposal(null);
      showAssistant(t('chat.applied'));
    } catch {
      showAssistant(t('chat.err.applyFail'));
    } finally {
      setApplying(false);
    }
  }

  return {
    messages,
    sending,
    proposal,
    applying,
    sendText,
    acceptWrite,
    acceptRetro,
    dismissProposal: () => setProposal(null),
    // Getter (not a snapshot): the ref is set lazily on the first send.
    getSessionId: () => sessionIdRef.current,
  };
}
