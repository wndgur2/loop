// LLM 프로바이더 공용 계약 — Anthropic·OpenAI·Gemini 어댑터가 공유한다.
// 프로바이더 선택은 env(LLM_PROVIDER)로, 키도 프로바이더별 secret에서만 읽는다(CLAUDE.md §6).

/**
 * 시스템 프롬프트 블록. cache_control은 Anthropic 전용 프롬프트 캐싱 힌트로,
 * 다른 프로바이더 어댑터는 무시하고 text만 이어붙인다.
 */
export interface SystemBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** 단일 툴 정의. input_schema는 JSON Schema(loopi-spec 구조화 출력 계약). */
export interface ToolDef {
  name: string;
  description: string;
  input_schema: unknown;
}

export interface LLMResult {
  text: string;
  toolUse: { name: string; input: Record<string, unknown> } | null;
}

export interface LLMCallArgs {
  system: SystemBlock[];
  messages: ChatTurn[];
  tool: ToolDef;
}

/** 프로바이더 어댑터가 구현하는 단일 메서드. 입력/출력 계약은 프로바이더 무관. */
export interface LLMProvider {
  readonly name: string;
  complete(args: LLMCallArgs): Promise<LLMResult>;
}

/** 시스템 블록들을 단일 문자열로 평탄화 (cache_control 없는 프로바이더용). */
export function flattenSystem(system: SystemBlock[]): string {
  return system.map((b) => b.text).join('\n\n');
}

/**
 * 모델 선택 우선순위: 프로바이더 전용 env({PROVIDER}_MODEL) → 공통 CHAT_MODEL → 기본값.
 * 프로바이더별 env를 두면 세 프로바이더를 모두 설정해 두고 LLM_PROVIDER만 바꿔 전환할 수 있다.
 */
export function resolveModel(providerEnvKey: string, defaultModel: string): string {
  return Deno.env.get(providerEnvKey) ?? Deno.env.get('CHAT_MODEL') ?? defaultModel;
}

/** 공용: 응답 실패 시 본문/개인정보 없이 상태코드만 노출(CLAUDE.md §6). */
export function ensureOk(res: Response, provider: string): void {
  if (!res.ok) throw new Error(`${provider} API ${res.status}`);
}

export const MAX_TOKENS = 4096;
