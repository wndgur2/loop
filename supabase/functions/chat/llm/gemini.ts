// Google Gemini generateContent API 어댑터 (function calling).
// 키는 secret(GEMINI_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

import {
  ensureOk,
  flattenSystem,
  MAX_TOKENS,
  resolveModel,
  type LLMCallArgs,
  type LLMProvider,
  type LLMResult,
} from './types.ts';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.5-flash';

interface GeminiPart {
  text?: string;
  functionCall?: { name?: string; args?: Record<string, unknown> };
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}

export function createGeminiProvider(): LLMProvider {
  return {
    name: 'gemini',
    async complete({ system, messages, tool }: LLMCallArgs): Promise<LLMResult> {
      const apiKey = Deno.env.get('GEMINI_API_KEY');
      if (!apiKey) throw new Error('GEMINI_API_KEY 미설정');
      const model = resolveModel('GEMINI_MODEL', DEFAULT_MODEL);

      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: flattenSystem(system) }] },
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          tools: [
            {
              functionDeclarations: [
                {
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.input_schema,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: MAX_TOKENS },
        }),
      });
      ensureOk(res, 'Gemini');

      const data = (await res.json()) as { candidates?: GeminiCandidate[] };
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      let text = '';
      let toolUse: LLMResult['toolUse'] = null;
      for (const part of parts) {
        if (part.text) text += part.text;
        else if (part.functionCall?.name) {
          toolUse = { name: part.functionCall.name, input: part.functionCall.args ?? {} };
        }
      }
      return { text: text.trim(), toolUse };
    },
  };
}
