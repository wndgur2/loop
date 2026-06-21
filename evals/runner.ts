/**
 * evals/runner.ts — Loopie quality evaluation runner (skeleton)
 *
 * Scenario → call Loopie → structured output → scoring → report.
 * Scoring rubric: documents/eval-rubric.md
 * Loopie contract: documents/loopie-spec.md (§4 output schema)
 * Data model: documents/data-model.md · canonical shape: documents/feature-spec.md
 *
 * NOTE: Before project scaffolding, the actual wiring (TODO) is empty.
 *       What we fix now is the "interface contract" — so that the Loopie code
 *       and the eval share the same types.
 */

// --- Scenario / output / scoring types (matching loopie-spec.md, data-model.md) ---

export type Importance = "high" | "mid" | "low";
export type SessionMode = "write" | "retrospective";

export interface Scenario {
  id: string;
  mode: SessionMode;
  description: string;
  user_turns: string[];
  /** User's final goal + sub-goals (= category candidates) */
  goal_context?: { goal: string; sub_goals: string[] };
  /** Retrospective mode: target sub-goal and existing feedback context */
  sub_goal?: string;
  existing_feedbacks?: {
    title: string;
    internalized: boolean;
    importance: Importance;
    takeaways: string[];
  }[];
  expect?: {
    // write mode
    expected_category?: string; // expected sub-goal (category)
    requires_category?: boolean; // exactly one sub-goal must always be assigned
    min_takeaways?: number;
    importance_in?: Importance[];
    // retrospective mode
    should_review_uninternalized?: boolean;
    may_update_internalization?: boolean;
  };
}

/** loopie-spec.md §4 structured output contract (write mode artifact = Canonical Template) */
export interface ChatOutput {
  title: string;
  situation: string; // template ## Feedback
  root_cause: string;
  category: string; // one of the user's sub-goals (required, cannot be uncategorized)
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

// --- Runner skeleton ---

/** Calls the Loopie Edge Function to run the conversation. write returns structured output, retrospective returns state-update intent. */
async function runChat(_scenario: Scenario): Promise<{
  transcript: { role: "user" | "assistant"; content: string }[];
  output: ChatOutput | null; // filled only in write mode
}> {
  // TODO: call supabase/functions/chat (branch on mode). Apply prompt caching.
  //       Read ANTHROPIC_API_KEY from env var / secret.
  throw new Error("not implemented — 프로젝트 스캐폴딩 후 배선");
}

/** D1~D4: structured output + expect comparison (automatic). D5~D6: LLM-as-judge. */
async function score(
  _scenario: Scenario,
  _result: Awaited<ReturnType<typeof runChat>>,
): Promise<ScenarioScore> {
  // TODO: implement eval-rubric.md §1·§2 rules.
  //       Hard-fail takes priority: schema violation / category unassigned / judging or lecturing.
  throw new Error("not implemented");
}

export async function runAll(_scenarios: Scenario[]): Promise<ScenarioScore[]> {
  // TODO: load scenarios → runChat → score → save to reports/.
  //       Aggregate delta vs the previous version.
  throw new Error("not implemented");
}
