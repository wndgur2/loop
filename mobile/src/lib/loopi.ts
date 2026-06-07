/**
 * Loopi Edge Function 클라이언트 래퍼.
 * 모든 AI 호출은 이 함수(=Supabase Edge Function `chat`)를 경유한다(CLAUDE.md §6).
 * 계약은 supabase/functions/_shared/types.ts 와 1:1.
 */
import type { Importance, SessionMode } from '@/types/models';

import { getSupabase } from './supabase';

export interface LoopiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FeedbackProposal {
  kind: 'create_feedback';
  title: string;
  situation: string;
  root_cause: string;
  /** 사용자의 하위 목표 중 하나의 이름 (필수) */
  category: string;
  importance: Importance;
  tags: string[];
  takeaways: { text: string }[];
}

export interface RetrospectiveProposal {
  kind: 'update_feedback';
  feedback_id: string;
  internalized?: boolean;
  takeaway_updates?: {
    takeaway_id?: string;
    text?: string;
    done?: boolean;
  }[];
}

export type ChatProposal = FeedbackProposal | RetrospectiveProposal;

export interface ChatResponse {
  reply: string;
  proposal: ChatProposal | null;
}

/** 대화 턴을 Edge Function에 보내고 (assistant 답변 + 선택적 proposal)을 받는다. */
export async function invokeLoopi(args: {
  mode: SessionMode;
  messages: LoopiMessage[];
  sessionId?: string;
}): Promise<ChatResponse> {
  const { data, error } = await getSupabase().functions.invoke<ChatResponse>('chat', {
    body: { mode: args.mode, messages: args.messages, sessionId: args.sessionId },
  });

  if (error) {
    throw new Error(loopiErrorMessage(error));
  }
  if (!data || typeof data.reply !== 'string') {
    throw new Error('Loopi 응답을 이해하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
  return { reply: data.reply, proposal: data.proposal ?? null };
}

function loopiErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  // 본문/개인정보는 남기지 않는다. 사용자에겐 부드러운 안내만.
  if (/401|unauthor/i.test(msg)) return '세션이 만료됐어요. 다시 로그인해 주세요.';
  return 'Loopi와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
