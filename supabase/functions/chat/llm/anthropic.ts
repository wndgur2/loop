// Anthropic Messages API 어댑터 (Claude API 레퍼런스 기준).
// 키는 secret(ANTHROPIC_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

import {
  ensureOk,
  MAX_TOKENS,
  resolveModel,
  type LLMCallArgs,
  type LLMProvider,
  type LLMResult,
} from './types.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-opus-4-8';

interface AnthropicBlock {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export function createAnthropicProvider(): LLMProvider {
  return {
    name: 'anthropic',
    async complete({ system, messages, tool }: LLMCallArgs): Promise<LLMResult> {
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
        }),
      });
      ensureOk(res, 'Anthropic');

      const data = (await res.json()) as { content?: AnthropicBlock[] };
      let text = '';
      let toolUse: LLMResult['toolUse'] = null;
      for (const block of data.content ?? []) {
        if (block.type === 'text' && block.text) text += block.text;
        else if (block.type === 'tool_use' && block.name) {
          toolUse = { name: block.name, input: block.input ?? {} };
        }
      }
      return { text: text.trim(), toolUse };
    },
  };
}
