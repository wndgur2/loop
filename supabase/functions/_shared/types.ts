// Loopi Edge Function의 요청/응답 계약.
// 정본: documents/loopi-spec.md (§4 출력 스키마 · §9 회고) · evals/runner.ts(ChatOutput)

export type Importance = 'high' | 'mid' | 'low'
export type SessionMode = 'write' | 'retrospective'
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

/** 클라이언트 → Edge Function */
export interface ChatRequest {
  mode: SessionMode
  /** 진행 중 세션 id (없으면 새 대화로 간주) */
  sessionId?: string
  /** 지금까지의 대화 (마지막은 user 턴) */
  messages: ChatMessage[]
  /** true면 SSE(text/event-stream)로 답변을 토큰 단위로 흘려보낸다(아래 StreamEvent). */
  stream?: boolean
}

/**
 * 스트리밍 응답 SSE 페이로드(`data:` 한 줄당 1개).
 * `delta`로 텍스트를 이어 붙이다가, `done`에서 최종 reply(트림본)와 proposal을 받는다.
 */
export type ChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: string; proposal: ChatProposal | null }
  | { type: 'error' }

/** 작성 모드 툴 `피드백 생성`의 산출물 (loopi-spec §4 = Canonical Template) */
export interface FeedbackProposal {
  kind: 'create_feedback'
  title: string
  situation: string
  root_cause: string
  /** 사용자의 하위 목표 중 하나 (필수, 미분류 불가) */
  category: string
  importance: Importance
  tags: string[]
  takeaways: { text: string }[]
}

/** 회고 모드 툴 `회고`의 산출물 (loopi-spec §9) — 변경은 확인 후 커밋 */
export interface RetrospectiveProposal {
  kind: 'update_feedback'
  feedback_id: string
  /** 내재화 표시 변경 (선택) */
  internalized?: boolean
  /** takeaway done 토글 / 텍스트 수정 / 추가 (선택) */
  takeaway_updates?: {
    takeaway_id?: string // 없으면 신규 추가
    text?: string
    done?: boolean
  }[]
}

export type ChatProposal = FeedbackProposal | RetrospectiveProposal

/** Edge Function → 클라이언트 */
export interface ChatResponse {
  /** assistant 텍스트(대화 표시) */
  reply: string
  /**
   * 툴 호출 결과(있으면). **여기서 바로 DB에 커밋하지 않는다** —
   * 클라이언트가 확인 칩으로 띄우고 사용자가 누를 때 반영(조용한 변경 금지, CLAUDE.md §6).
   */
  proposal: ChatProposal | null
}
