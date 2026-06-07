// Anthropic Messages API 어댑터 (Claude API 레퍼런스 기준).
// 키는 secret(ANTHROPIC_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

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
} from './types.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-opus-4-8';

/** Messages streaming 이벤트(필요한 필드만). 정본: Claude API SSE 스펙. */
interface AnthropicEvent {
  type: string;
  content_block?: { type?: string; name?: string };
  delta?: { type?: string; text?: string; partial_json?: string };
}

export function createAnthropicProvider(): LLMProvider {
  return {
    name: 'anthropic',
    async *stream({ system, messages, tool }: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY 미설정');
      // 비용/지연 튜닝은 secret(ANTHROPIC_MODEL 또는 공통 CHAT_MODEL)으로 오버라이드.
      const model = resolveModel('ANTHROPIC_MODEL', DEFAULT_MODEL);

      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          thinking: { type: 'adaptive' },
          system, // 마지막 블록에 cache_control → tools+system 프롬프트 캐싱
          messages,
          tools: [{ name: tool.name, description: tool.description, input_schema: tool.input_schema }],
          tool_choice: { type: 'auto' },
          stream: true,
        }),
      });
      ensureOk(res, 'Anthropic');

      let text = '';
      let toolName: string | null = null;
      let toolJson = ''; // tool_use input은 input_json_delta로 쪼개져 와 끝에서 합쳐 파싱한다.
      for await (const payload of sseData(res)) {
        const ev = JSON.parse(payload) as AnthropicEvent;
        if (ev.type === 'content_block_start' && ev.content_block?.type === 'tool_use') {
          toolName = ev.content_block.name ?? null;
          toolJson = '';
        } else if (ev.type === 'content_block_delta') {
          const d = ev.delta;
          if (d?.type === 'text_delta' && d.text) {
            text += d.text;
            yield { type: 'text', text: d.text };
          } else if (d?.type === 'input_json_delta' && d.partial_json) {
            toolJson += d.partial_json;
          }
          // thinking_delta는 사용자 답변이 아니므로 흘리지 않는다.
        }
      }

      const toolUse: LLMResult['toolUse'] = toolName ? { name: toolName, input: safeJson(toolJson) } : null;
      yield { type: 'final', result: { text: text.trim(), toolUse } };
    },
  };
}
