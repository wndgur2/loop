/**
 * evals/runner.ts — AI 코칭 품질 평가 러너 (스켈레톤)
 *
 * 시나리오 → 코칭 호출 → 구조화 출력 → 채점 → 리포트.
 * 채점 기준: documents/eval-rubric.md
 * 코칭 계약: documents/ai-coaching-spec.md (4절 출력 스키마)
 *
 * NOTE: 프로젝트 스캐폴딩 전이라 실제 배선(TODO)은 비어 있습니다.
 *       지금 고정하는 것은 "인터페이스 계약"입니다 — 코칭 코드와 eval이 같은
 *       타입을 공유하도록.
 */

// --- 시나리오 / 출력 / 채점 타입 (eval-rubric.md, ai-coaching-spec.md와 일치) ---

export type Category =
  | "collaborating"
  | "communication"
  | "execution"
  | "learning"
  | "leadership"
  | "wellbeing";

export type Importance = "low" | "medium" | "high";

export interface Scenario {
  id: string;
  description: string;
  user_turns: string[];
  goal_context?: { goal: string; competencies: string[] };
  expect?: {
    category?: Category;
    importance?: Importance;
    min_action_items?: number;
    should_link_competency?: boolean;
    crisis?: boolean;
    should_provide_help_resources?: boolean;
    should_not_extract_feedback?: boolean;
  };
}

/** ai-coaching-spec.md 4절 구조화 출력 계약 */
export interface CoachingOutput {
  summary: string;
  root_cause: string;
  category: Category;
  importance: Importance;
  tags: string[];
  action_items: { text: string }[];
  competency_links: string[];
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

/** 코칭 Edge Function을 호출해 대화를 진행하고 구조화 출력을 받는다. */
async function runCoaching(_scenario: Scenario): Promise<{
  transcript: { role: "user" | "assistant"; content: string }[];
  output: CoachingOutput | null; // 위기 케이스 등에서는 null 가능
}> {
  // TODO: supabase/functions/coaching 호출 (또는 프롬프트 직접 평가).
  //       프롬프트 캐싱 적용. ANTHROPIC_API_KEY는 환경변수/secret에서.
  throw new Error("not implemented — 프로젝트 스캐폴딩 후 배선");
}

/** D1~D4: 구조화 출력 + expect 비교(자동). D5~D6: LLM-as-judge. */
async function score(
  _scenario: Scenario,
  _result: Awaited<ReturnType<typeof runCoaching>>,
): Promise<ScenarioScore> {
  // TODO: eval-rubric.md 1·2절 규칙 구현. 하드 실패 우선 판정.
  throw new Error("not implemented");
}

export async function runAll(_scenarios: Scenario[]): Promise<ScenarioScore[]> {
  // TODO: 시나리오 로드 → runCoaching → score → reports/ 에 저장.
  //       직전 버전 대비 델타 집계.
  throw new Error("not implemented");
}
