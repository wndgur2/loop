/**
 * 채팅 세션 영속 헬퍼 — 작성/회고 공통.
 * 세션은 첫 전송 때 생성하고, 메시지는 fire-and-forget로 저장한다.
 * Edge Function은 메시지 배열을 직접 받으므로(컨텍스트는 전체 피드백) DB 메시지에 의존하지 않는다.
 */
import { getSupabase } from '@/lib/supabase';
import type { MessageRole, SessionMode } from '@/types/models';

export async function createChatSession(mode: SessionMode, subGoalId?: string | null): Promise<string> {
  const supabase = getSupabase();
  const { data: sess } = await supabase.auth.getSession();
  const userId = sess.session?.user.id;
  if (!userId) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, mode, sub_goal_id: subGoalId ?? null })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function saveMessage(sessionId: string, role: MessageRole, content: string): Promise<void> {
  // 실패해도 대화 흐름을 막지 않는다(저장은 부가). 로그엔 본문 남기지 않음.
  const { error } = await getSupabase().from('chat_messages').insert({ session_id: sessionId, role, content });
  if (error) console.warn('chat message save failed');
}

export async function completeSession(sessionId: string): Promise<void> {
  await getSupabase()
    .from('chat_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId);
}
