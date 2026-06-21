// Shared contract for LLM providers — shared by the Anthropic, OpenAI, and Gemini adapters.
// Provider selection is via env (LLM_PROVIDER), and keys are read only from per-provider secrets (CLAUDE.md §6).

/**
 * System prompt block. cache_control is an Anthropic-only prompt-caching hint;
 * other provider adapters ignore it and just concatenate the text.
 */
export interface SystemBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Single tool definition. input_schema is JSON Schema (loopie-spec structured output contract). */
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
 * Streaming event. The adapter streams `text` as it arrives, and when the stream ends,
 * emits the accumulated final result (text + toolUse) once as `final`.
 * Tool input (JSON) may be sent incrementally, but partial parsing is risky, so it is only completed and returned in `final`.
 */
export type LLMStreamEvent =
  | { type: "text"; text: string }
  | { type: "final"; result: LLMResult };

/** The single method a provider adapter implements. The input/output contract is provider-agnostic. */
export interface LLMProvider {
  readonly name: string;
  /** Streams the response. Non-streaming calls (callLLM) are built by draining this stream. */
  stream(args: LLMCallArgs): AsyncGenerator<LLMStreamEvent>;
}

/**
 * Streams the SSE response body as `data:` payloads (drops the event name, keeps only data).
 * All three providers use text/event-stream, so parsing is centralized here.
 */
export async function* sseData(res: Response): AsyncGenerator<string> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  // Events are separated by blank lines. Line breaks differ per provider (Gemini uses CRLF = \r\n\r\n,
  // Anthropic/OpenAI use \n\n), so accept both — handling only one would split nothing and yield zero events.
  const BOUNDARY = /\r\n\r\n|\n\n|\r\r/;
  function* emit(block: string): Generator<string> {
    for (const line of block.split(/\r\n|\n|\r/)) {
      if (line.startsWith("data:")) {
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
  // Also emit the last event if it ends without a separator.
  if (buffer) yield* emit(buffer);
}

/** Safely parses incrementally-sent tool input JSON (returns an empty object if incomplete). */
export function safeJson(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** Flattens the system blocks into a single string (for providers without cache_control). */
export function flattenSystem(system: SystemBlock[]): string {
  return system.map((b) => b.text).join("\n\n");
}

/**
 * Model selection priority: provider-specific env ({PROVIDER}_MODEL) → shared CHAT_MODEL → default.
 * Per-provider env lets you configure all three providers and switch by changing only LLM_PROVIDER.
 */
export function resolveModel(
  providerEnvKey: string,
  defaultModel: string,
): string {
  return (
    Deno.env.get(providerEnvKey) ?? Deno.env.get("CHAT_MODEL") ?? defaultModel
  );
}

/** Shared: on a failed response, expose only the status code, no body or personal data (CLAUDE.md §6). */
export function ensureOk(res: Response, provider: string): void {
  if (!res.ok) throw new Error(`${provider} API ${res.status}`);
}

export const MAX_TOKENS = 4096;
