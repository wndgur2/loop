/**
 * 앱 도메인 모델 (camelCase) + DB Row(snake_case) 매퍼.
 * DB↔앱 경계는 여기로 일원화한다(CLAUDE.md §5·data-model.md).
 */
import type { Database } from './database';

type Tables = Database['public']['Tables'];
export type FeedbackRow = Tables['feedbacks']['Row'];
export type TakeawayRow = Tables['takeaways']['Row'];
export type SubGoalRow = Tables['sub_goals']['Row'];
export type GoalRow = Tables['goals']['Row'];
export type ChatSessionRow = Tables['chat_sessions']['Row'];
export type ChatMessageRow = Tables['chat_messages']['Row'];

export type Importance = Database['public']['Enums']['importance'];
export type SessionMode = Database['public']['Enums']['session_mode'];
export type SessionStatus = Database['public']['Enums']['session_status'];
export type MessageRole = Database['public']['Enums']['message_role'];
export type SubGoalSource = Database['public']['Enums']['sub_goal_source'];

export const IMPORTANCE_VALUES: Importance[] = ['high', 'mid', 'low'];

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  high: '높음',
  mid: '보통',
  low: '낮음',
};

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SubGoal {
  id: string;
  goalId: string;
  name: string;
  source: SubGoalSource;
  sortOrder: number;
}

export interface Takeaway {
  id: string;
  feedbackId: string;
  text: string;
  done: boolean;
  doneAt: string | null;
  sortOrder: number;
}

export interface Feedback {
  id: string;
  title: string;
  situation: string;
  rootCause: string;
  subGoalId: string;
  importance: Importance;
  tags: string[];
  internalized: boolean;
  internalizedAt: string | null;
  sessionId: string | null;
  createdAt: string;
}

/** 상세/목록에서 takeaway를 함께 들고 다닌다. */
export interface FeedbackWithTakeaways extends Feedback {
  takeaways: Takeaway[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

// ─────────────────────────── 매퍼 ───────────────────────────

export function toGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    isActive: r.is_active,
    createdAt: r.created_at,
  };
}

export function toSubGoal(r: SubGoalRow): SubGoal {
  return { id: r.id, goalId: r.goal_id, name: r.name, source: r.source, sortOrder: r.sort_order };
}

export function toTakeaway(r: TakeawayRow): Takeaway {
  return {
    id: r.id,
    feedbackId: r.feedback_id,
    text: r.text,
    done: r.done,
    doneAt: r.done_at,
    sortOrder: r.sort_order,
  };
}

export function toFeedback(r: FeedbackRow): Feedback {
  return {
    id: r.id,
    title: r.title,
    situation: r.situation,
    rootCause: r.root_cause,
    subGoalId: r.sub_goal_id,
    importance: r.importance,
    tags: r.tags ?? [],
    internalized: r.internalized,
    internalizedAt: r.internalized_at,
    sessionId: r.session_id,
    createdAt: r.created_at,
  };
}

/** feedbacks + takeaways(중첩 select) 행 매핑. */
export function toFeedbackWithTakeaways(r: FeedbackRow & { takeaways?: TakeawayRow[] | null }): FeedbackWithTakeaways {
  const takeaways = (r.takeaways ?? [])
    .map(toTakeaway)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return { ...toFeedback(r), takeaways };
}

export function toChatMessage(r: ChatMessageRow): ChatMessage {
  return { id: r.id, sessionId: r.session_id, role: r.role, content: r.content, createdAt: r.created_at };
}
