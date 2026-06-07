/**
 * Loopi Edge Function 클라이언트 래퍼.
 * 모든 AI 호출은 이 함수(=Supabase Edge Function `chat`)를 경유한다(CLAUDE.md §6).
 * 계약은 supabase/functions/_shared/types.ts 와 1:1.
 */
import { fetch as expoFetch } from 'expo/fetch';

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

/** SSE 페이로드(Edge Function의 ChatStreamEvent와 1:1). */
type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: string; proposal: ChatProposal | null }
  | { type: 'error' };

/**
 * Loopi 답변을 토큰 단위로 스트리밍한다 — `onDelta`로 텍스트가 도착하는 대로 받고,
 * 최종 {reply, proposal}을 반환한다. supabase-js의 invoke는 스트리밍 본문을 노출하지 않아
 * Edge Function URL로 직접 fetch한다(expo/fetch = RN에서 ReadableStream 지원).
 */
export async function streamLoopi(args: {
  mode: SessionMode;
  messages: LoopiMessage[];
  sessionId?: string;
  onDelta: (delta: string) => void;
}): Promise<ChatResponse> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('Supabase 환경변수가 없습니다.');

  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  const accessToken = session?.access_token ?? anonKey;

  const res = await expoFetch(`${url}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      apikey: anonKey,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      mode: args.mode,
      messages: args.messages,
      sessionId: args.sessionId,
      stream: true,
    }),
  });

  if (!res.ok) {
    throw new Error(loopiErrorMessage(new Error(`stream ${res.status}`)));
  }

  // 비-스트리밍(JSON) 응답으로 폴백: Edge Function이 아직 스트리밍 미지원이거나
  // 프록시가 SSE를 끊은 경우, {reply, proposal}을 한 번에 받아 그대로 보여준다.
  const contentType = res.headers.get('content-type') ?? '';
  if (!res.body || !contentType.includes('text/event-stream')) {
    const data = (await res.json().catch(() => null)) as Partial<ChatResponse> | null;
    const reply = data && typeof data.reply === 'string' ? data.reply : '';
    if (!reply) throw new Error('Loopi 응답을 이해하지 못했어요. 잠시 후 다시 시도해 주세요.');
    args.onDelta(reply);
    return { reply, proposal: data?.proposal ?? null };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let reply = '';
  let proposal: ChatProposal | null = null;

  // 이벤트 구분자는 빈 줄. 줄바꿈이 \n\n / \r\n\r\n 어느 쪽으로 와도 받는다.
  const BOUNDARY = /\r\n\r\n|\n\n|\r\r/;
  const handle = (block: string) => {
    const line = block.split(/\r\n|\n|\r/).find((l) => l.startsWith('data:'));
    if (!line) return;
    const payload = line.slice(5).trim();
    if (!payload) return;
    const ev = JSON.parse(payload) as StreamEvent;
    if (ev.type === 'delta') {
      reply += ev.text;
      args.onDelta(ev.text);
    } else if (ev.type === 'done') {
      reply = ev.reply;
      proposal = ev.proposal;
    } else {
      throw new Error('Loopi 응답 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let m: RegExpExecArray | null;
    while ((m = BOUNDARY.exec(buffer)) !== null) {
      const block = buffer.slice(0, m.index);
      buffer = buffer.slice(m.index + m[0].length);
      handle(block);
    }
  }
  if (buffer) handle(buffer);

  return { reply, proposal };
}

function loopiErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  // 본문/개인정보는 남기지 않는다. 사용자에겐 부드러운 안내만.
  if (/401|unauthor/i.test(msg)) return '세션이 만료됐어요. 다시 로그인해 주세요.';
  return 'Loopi와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
