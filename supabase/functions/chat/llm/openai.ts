// OpenAI Chat Completions API 어댑터 (function calling).
// 키는 secret(OPENAI_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

import {
  ensureOk,
  flattenSystem,
  MAX_TOKENS,
  resolveModel,
  type LLMCallArgs,
  type LLMProvider,
  type LLMResult,
} from './types.ts';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-5.4';

interface OpenAIToolCall {
  function?: { name?: string; arguments?: string };
}
interface OpenAIChoice {
  message?: { content?: string | null; tool_calls?: OpenAIToolCall[] };
}

export function createOpenAIProvider(): LLMProvider {
  return {
    name: 'openai',
    async complete({ system, messages, tool }: LLMCallArgs): Promise<LLMResult> {
      const apiKey = Deno.env.get('OPENAI_API_KEY');
      if (!apiKey) throw new Error('OPENAI_API_KEY 미설정');
      const model = resolveModel('OPENAI_MODEL', DEFAULT_MODEL);

      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          // cache_control은 무시하고 시스템 블록을 단일 system 메시지로 평탄화.
          messages: [
            { role: 'system', content: flattenSystem(system) },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.input_schema,
              },
            },
          ],
          tool_choice: 'auto',
        }),
      });
      ensureOk(res, 'OpenAI');

      const data = (await res.json()) as { choices?: OpenAIChoice[] };
      const message = data.choices?.[0]?.message;
      const text = (message?.content ?? '').trim();
      let toolUse: LLMResult['toolUse'] = null;
      const call = message?.tool_calls?.[0]?.function;
      if (call?.name) {
        let input: Record<string, unknown> = {};
        try {
          input = call.arguments ? JSON.parse(call.arguments) : {};
        } catch {
          input = {};
        }
        toolUse = { name: call.name, input };
      }
      return { text, toolUse };
    },
  };
}
