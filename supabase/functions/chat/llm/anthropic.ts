// Anthropic Messages API adapter (per the Claude API reference).
// The key is read only from a secret (ANTHROPIC_API_KEY) — never expose it to the client (CLAUDE.md §6).

import {
  ensureOk,
  MAX_TOKENS,
  resolveModel,
  safeJson,
  sseData,
  type LLMCallArgs,
  type LLMProvider,
  type LLMResult,
  type LLMStreamEvent,
} from "./types.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-8";

/** Messages streaming event (only the fields we need). Canonical source: Claude API SSE spec. */
interface AnthropicEvent {
  type: string;
  content_block?: { type?: string; name?: string };
  delta?: { type?: string; text?: string; partial_json?: string };
}

export function createAnthropicProvider(): LLMProvider {
  return {
    name: "anthropic",
    async *stream({
      system,
      messages,
      tool,
    }: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
      const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY 미설정");
      // Override for cost/latency tuning via a secret (ANTHROPIC_MODEL or the shared CHAT_MODEL).
      const model = resolveModel("ANTHROPIC_MODEL", DEFAULT_MODEL);

      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          thinking: { type: "adaptive" },
          system, // cache_control on the last block → caches the tools+system prompt
          messages,
          tools: [
            {
              name: tool.name,
              description: tool.description,
              input_schema: tool.input_schema,
            },
          ],
          tool_choice: { type: "auto" },
          stream: true,
        }),
      });
      ensureOk(res, "Anthropic");

      let text = "";
      let toolName: string | null = null;
      let toolJson = ""; // tool_use input arrives split across input_json_delta; join and parse at the end.
      for await (const payload of sseData(res)) {
        const ev = JSON.parse(payload) as AnthropicEvent;
        if (
          ev.type === "content_block_start" &&
          ev.content_block?.type === "tool_use"
        ) {
          toolName = ev.content_block.name ?? null;
          toolJson = "";
        } else if (ev.type === "content_block_delta") {
          const d = ev.delta;
          if (d?.type === "text_delta" && d.text) {
            text += d.text;
            yield { type: "text", text: d.text };
          } else if (d?.type === "input_json_delta" && d.partial_json) {
            toolJson += d.partial_json;
          }
          // thinking_delta is not part of the user-facing answer, so it is not streamed.
        }
      }

      const toolUse: LLMResult["toolUse"] = toolName
        ? { name: toolName, input: safeJson(toolJson) }
        : null;
      yield { type: "final", result: { text: text.trim(), toolUse } };
    },
  };
}
