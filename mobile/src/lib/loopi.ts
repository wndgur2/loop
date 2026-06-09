/**
 * Loopi Edge Function client wrapper.
 * All AI calls go through this function (= Supabase Edge Function `chat`) (CLAUDE.md §6).
 * The contract is 1:1 with supabase/functions/_shared/types.ts.
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
  /** Name of one of the user's sub-goals (required) */
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

/** Sends a conversation turn to the Edge Function and receives (assistant reply + optional proposal). */
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

/** SSE payload (1:1 with the Edge Function's ChatStreamEvent). */
type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: string; proposal: ChatProposal | null }
  | { type: 'error' };

/**
 * Streams Loopi's reply token by token — receives text as it arrives via `onDelta`,
 * and returns the final {reply, proposal}. supabase-js's invoke does not expose the
 * streaming body, so we fetch the Edge Function URL directly (expo/fetch = ReadableStream support on RN).
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

  // Fall back to a non-streaming (JSON) response: if the Edge Function does not yet support
  // streaming or a proxy cut off the SSE, receive {reply, proposal} at once and show it as-is.
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

  // The event delimiter is a blank line. Accept newlines whether they arrive as \n\n or \r\n\r\n.
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
  // Do not leave behind content/personal info. Only a gentle message for the user.
  if (/401|unauthor/i.test(msg)) return '세션이 만료됐어요. 다시 로그인해 주세요.';
  return 'Loopi와 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
