// Request/response contract for the Loopie Edge Function.
// Canonical source: documents/loopie-spec.md (§4 output schema · §9 retrospective) · evals/runner.ts (ChatOutput)

export type Importance = 'high' | 'mid' | 'low'
export type SessionMode = 'write' | 'retrospective'
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

/** Client → Edge Function */
export interface ChatRequest {
  mode: SessionMode
  /** In-progress session id (if absent, treated as a new conversation) */
  sessionId?: string
  /** Conversation so far (last entry is the user turn) */
  messages: ChatMessage[]
  /** If true, stream the answer token by token over SSE (text/event-stream) (see StreamEvent below). */
  stream?: boolean
}

/**
 * Streaming response SSE payload (one per `data:` line).
 * Append text via `delta`, then receive the final reply (trimmed) and proposal in `done`.
 */
export type ChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: string; proposal: ChatProposal | null }
  | { type: 'error' }

/** Output of the write-mode tool `create feedback` (loopie-spec §4 = Canonical Template) */
export interface FeedbackProposal {
  kind: 'create_feedback'
  title: string
  situation: string
  root_cause: string
  /** One of the user's sub-goals (required, cannot be uncategorized) */
  category: string
  importance: Importance
  tags: string[]
  takeaways: { text: string }[]
}

/** Output of the retrospective-mode tool `retrospective` (loopie-spec §9) — changes are committed after confirmation */
export interface RetrospectiveProposal {
  kind: 'update_feedback'
  feedback_id: string
  /** Change the internalized flag (optional) */
  internalized?: boolean
  /** Toggle takeaway done / edit text / add (optional) */
  takeaway_updates?: {
    takeaway_id?: string // if absent, add a new one
    text?: string
    done?: boolean
  }[]
}

export type ChatProposal = FeedbackProposal | RetrospectiveProposal

/** Edge Function → client */
export interface ChatResponse {
  /** assistant text (shown in the conversation) */
  reply: string
  /**
   * Tool call result (if any). **Do not commit it to the DB here** —
   * the client shows a confirmation chip and applies it when the user taps (no silent changes, CLAUDE.md §6).
   */
  proposal: ChatProposal | null
}
