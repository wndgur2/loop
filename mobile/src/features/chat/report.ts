/**
 * AI content reports — Google Play's AI-Generated Content policy requires an
 * in-app way to flag offensive AI output. The reported reply is snapshotted so
 * the report survives session deletion. Do not log message bodies.
 */
import { getSupabase, requireUserId } from '@/lib/supabase';

export async function reportAiContent(
  sessionId: string | null,
  messageContent: string,
): Promise<void> {
  const supabase = getSupabase();
  const userId = await requireUserId();

  const { error } = await supabase.from('ai_content_reports').insert({
    user_id: userId,
    session_id: sessionId,
    message_content: messageContent,
  });
  if (error) throw error;
}
