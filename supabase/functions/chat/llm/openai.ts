// OpenAI Chat Completions API adapter (function calling).
// The key is read only from a secret (OPENAI_API_KEY) — never expose it to the client (CLAUDE.md §6).

import {
  ensureOk,
  flattenSystem,
  MAX_TOKENS,
  resolveModel,
  safeJson,
  sseData,
  type LLMCallArgs,
  type LLMProvider,
  type LLMResult,
  type LLMStreamEvent,
} from "./types.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5.4";

/** Chat Completions streaming chunk (only the fields we need). */
interface OpenAIChunk {
  choices?: {
    delta?: {
      content?: string | null;
      tool_calls?: { function?: { name?: string; arguments?: string } }[];
    };
  }[];
}

export function createOpenAIProvider(): LLMProvider {
  return {
    name: "openai",
    async *stream({
      system,
      messages,
      tool,
    }: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) throw new Error("OPENAI_API_KEY 미설정");
      const model = resolveModel("OPENAI_MODEL", DEFAULT_MODEL);

      const res = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          // Ignore cache_control and flatten the system blocks into a single system message.
          messages: [
            { role: "system", content: flattenSystem(system) },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          tools: [
            {
              type: "function",
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.input_schema,
              },
            },
          ],
          tool_choice: "auto",
          stream: true,
        }),
      });
      ensureOk(res, "OpenAI");

      let text = "";
      let toolName: string | null = null;
      let toolArgs = ""; // function.arguments arrives split across chunks; join and parse at the end.
      for await (const payload of sseData(res)) {
        if (payload === "[DONE]") break;
        const chunk = JSON.parse(payload) as OpenAIChunk;
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) {
          text += delta.content;
          yield { type: "text", text: delta.content };
        }
        const call = delta?.tool_calls?.[0]?.function;
        if (call?.name) toolName = call.name;
        if (call?.arguments) toolArgs += call.arguments;
      }

      const toolUse: LLMResult["toolUse"] = toolName
        ? { name: toolName, input: safeJson(toolArgs) }
        : null;
      yield { type: "final", result: { text: text.trim(), toolUse } };
    },
  };
}
