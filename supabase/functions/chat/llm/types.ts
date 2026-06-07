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

/**
 * 스트리밍 이벤트. 어댑터는 텍스트가 도착하는 대로 `text`를 흘려보내고,
 * 스트림이 끝나면 누적된 최종 결과(text + toolUse)를 `final`로 한 번 낸다.
 * 툴 입력(JSON)은 점진 전송돼도 부분 파싱이 위험하므로 `final`에서만 완성해 돌려준다.
 */
export type LLMStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'final'; result: LLMResult };

/** 프로바이더 어댑터가 구현하는 단일 메서드. 입력/출력 계약은 프로바이더 무관. */
export interface LLMProvider {
  readonly name: string;
  /** 응답을 스트리밍한다. 비-스트리밍 호출(callLLM)은 이 스트림을 소진해 만든다. */
  stream(args: LLMCallArgs): AsyncGenerator<LLMStreamEvent>;
}

/**
 * SSE 응답 본문을 `data:` 페이로드 단위로 흘려보낸다 (이벤트명은 버리고 data만).
 * 세 프로바이더 모두 text/event-stream을 쓰므로 파싱은 여기로 모은다.
 */
export async function* sseData(res: Response): AsyncGenerator<string> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';

  // 이벤트는 빈 줄로 구분된다. 프로바이더마다 줄바꿈이 달라(Gemini는 CRLF = \r\n\r\n,
  // Anthropic/OpenAI는 \n\n) 둘 다 받는다 — 한쪽만 보면 한 건도 못 잘라 0건이 된다.
  const BOUNDARY = /\r\n\r\n|\n\n|\r\r/;
  function* emit(block: string): Generator<string> {
    for (const line of block.split(/\r\n|\n|\r/)) {
      if (line.startsWith('data:')) {
        const payload = line.slice(5).trim();
        if (payload) yield payload;
      }
    }
  }

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let m: RegExpExecArray | null;
    while ((m = BOUNDARY.exec(buffer)) !== null) {
      const block = buffer.slice(0, m.index);
      buffer = buffer.slice(m.index + m[0].length);
      yield* emit(block);
    }
  }
  // 구분자 없이 끝난 마지막 이벤트도 흘려준다.
  if (buffer) yield* emit(buffer);
}

/** 점진 전송된 툴 입력 JSON을 안전하게 파싱 (불완전하면 빈 객체). */
export function safeJson(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
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
