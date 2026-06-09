/**
 * Chat session persistence helpers — shared by write/retrospective.
 * The session is created on the first send, and messages are saved fire-and-forget.
 * The Edge Function receives the message array directly (context is the full feedback), so it does not depend on DB messages.
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
  // A failure must not block the conversation flow (saving is auxiliary). Do not log message body.
  const { error } = await getSupabase().from('chat_messages').insert({ session_id: sessionId, role, content });
  if (error) console.warn('chat message save failed');
}

export async function completeSession(sessionId: string): Promise<void> {
  await getSupabase()
    .from('chat_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId);
}
