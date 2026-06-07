// OpenAI Chat Completions API 어댑터 (function calling).
// 키는 secret(OPENAI_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

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
} from './types.ts';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-5.4';

/** Chat Completions streaming 청크(필요한 필드만). */
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
    name: 'openai',
    async *stream({ system, messages, tool }: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
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
          stream: true,
        }),
      });
      ensureOk(res, 'OpenAI');

      let text = '';
      let toolName: string | null = null;
      let toolArgs = ''; // function.arguments는 청크로 쪼개져 와 끝에서 합쳐 파싱한다.
      for await (const payload of sseData(res)) {
        if (payload === '[DONE]') break;
        const chunk = JSON.parse(payload) as OpenAIChunk;
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) {
          text += delta.content;
          yield { type: 'text', text: delta.content };
        }
        const call = delta?.tool_calls?.[0]?.function;
        if (call?.name) toolName = call.name;
        if (call?.arguments) toolArgs += call.arguments;
      }

      const toolUse: LLMResult['toolUse'] = toolName ? { name: toolName, input: safeJson(toolArgs) } : null;
      yield { type: 'final', result: { text: text.trim(), toolUse } };
    },
  };
}
