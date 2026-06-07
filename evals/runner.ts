/**
 * evals/runner.ts — Loopi 품질 평가 러너 (스켈레톤)
 *
 * 시나리오 → Loopi 호출 → 구조화 출력 → 채점 → 리포트.
 * 채점 기준: documents/eval-rubric.md
 * Loopi 계약: documents/loopi-spec.md (4절 출력 스키마)
 * 데이터 모델: documents/data-model.md · 정본 형태: documents/feature-spec.md
 *
 * NOTE: 프로젝트 스캐폴딩 전이라 실제 배선(TODO)은 비어 있습니다.
 *       지금 고정하는 것은 "인터페이스 계약"입니다 — Loopi 코드와 eval이 같은
 *       타입을 공유하도록.
 */

// --- 시나리오 / 출력 / 채점 타입 (loopi-spec.md, data-model.md와 일치) ---

export type Importance = "high" | "mid" | "low";
export type SessionMode = "write" | "retrospective";

export interface Scenario {
  id: string;
  mode: SessionMode;
  description: string;
  user_turns: string[];
  /** 사용자의 최종 목표 + 하위 목표(=category 후보) */
  goal_context?: { goal: string; sub_goals: string[] };
  /** 회고 모드: 대상 하위목표와 기존 피드백 컨텍스트 */
  sub_goal?: string;
  existing_feedbacks?: {
    title: string;
    internalized: boolean;
    importance: Importance;
    takeaways: string[];
  }[];
  expect?: {
    // write 모드
    expected_category?: string; // 기대 하위목표(category)
    requires_category?: boolean; // 항상 하나의 하위목표가 배정돼야 함
    min_takeaways?: number;
    importance_in?: Importance[];
    // retrospective 모드
    should_review_uninternalized?: boolean;
    may_update_internalization?: boolean;
  };
}

/** loopi-spec.md 4절 구조화 출력 계약 (write 모드 산출물 = Canonical Template) */
export interface ChatOutput {
  title: string;
  situation: string; // 템플릿 ## Feedback
  root_cause: string;
  category: string; // 사용자의 하위 목표 중 하나 (필수, 미분류 불가)
  importance: Importance;
  tags: string[];
  takeaways: { text: string; done?: boolean }[];
}

export type Dimension = "D1" | "D2" | "D3" | "D4" | "D5" | "D6";

export interface ScenarioScore {
  scenario_id: string;
  scores: Record<Dimension, 0 | 1 | 2>;
  total: number;
  hard_fail: boolean;
  notes: string;
}

// --- 러너 골격 ---

/** Loopi Edge Function을 호출해 대화를 진행한다. write는 구조화 출력, retrospective는 상태 갱신 의도를 반환. */
async function runChat(_scenario: Scenario): Promise<{
  transcript: { role: "user" | "assistant"; content: string }[];
  output: ChatOutput | null; // write 모드에서만 채워짐
}> {
  // TODO: supabase/functions/chat 호출 (mode 분기). 프롬프트 캐싱 적용.
  //       ANTHROPIC_API_KEY는 환경변수/secret에서.
  throw new Error("not implemented — 프로젝트 스캐폴딩 후 배선");
}

/** D1~D4: 구조화 출력 + expect 비교(자동). D5~D6: LLM-as-judge. */
async function score(
  _scenario: Scenario,
  _result: Awaited<ReturnType<typeof runChat>>,
): Promise<ScenarioScore> {
  // TODO: eval-rubric.md 1·2절 규칙 구현.
  //       하드 실패 우선 판정: 스키마 위반 / category 미배정 / 평가·훈계.
  throw new Error("not implemented");
}

export async function runAll(_scenarios: Scenario[]): Promise<ScenarioScore[]> {
  // TODO: 시나리오 로드 → runChat → score → reports/ 에 저장.
  //       직전 버전 대비 델타 집계.
  throw new Error("not implemented");
}
