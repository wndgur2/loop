// Google Gemini generateContent API 어댑터 (function calling).
// 키는 secret(GEMINI_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

import {
  ensureOk,
  flattenSystem,
  MAX_TOKENS,
  resolveModel,
  sseData,
  type LLMCallArgs,
  type LLMProvider,
  type LLMResult,
  type LLMStreamEvent,
} from './types.ts';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.5-flash';

interface GeminiPart {
  text?: string;
  functionCall?: { name?: string; args?: Record<string, unknown> };
}
/** streamGenerateContent의 각 SSE 청크(부분 응답). */
interface GeminiChunk {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

export function createGeminiProvider(): LLMProvider {
  return {
    name: 'gemini',
    async *stream({ system, messages, tool }: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
      const apiKey = Deno.env.get('GEMINI_API_KEY');
      if (!apiKey) throw new Error('GEMINI_API_KEY 미설정');
      const model = resolveModel('GEMINI_MODEL', DEFAULT_MODEL);

      // alt=sse 로 받아야 청크가 text/event-stream으로 온다(기본은 JSON 배열).
      const res = await fetch(`${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse`, {
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

      let text = '';
      let toolUse: LLMResult['toolUse'] = null;
      for await (const payload of sseData(res)) {
        const chunk = JSON.parse(payload) as GeminiChunk;
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          if (part.text) {
            text += part.text;
            yield { type: 'text', text: part.text };
          } else if (part.functionCall?.name) {
            toolUse = { name: part.functionCall.name, input: part.functionCall.args ?? {} };
          }
        }
      }

      yield { type: 'final', result: { text: text.trim(), toolUse } };
    },
  };
}
