// LLM adapter entry point — pick a provider via env (LLM_PROVIDER) and call through a single interface.
// All AI calls go through this module (CLAUDE.md §6). For a new provider, just add a registration here.

import { createAnthropicProvider } from './anthropic.ts'
import { createOpenAIProvider } from './openai.ts'
import { createGeminiProvider } from './gemini.ts'
import type { LLMCallArgs, LLMProvider, LLMResult, LLMStreamEvent } from './types.ts'

export type {
  LLMCallArgs,
  LLMProvider,
  LLMResult,
  LLMStreamEvent,
  SystemBlock,
  ChatTurn,
  ToolDef,
} from './types.ts'

const REGISTRY: Record<string, () => LLMProvider> = {
  anthropic: createAnthropicProvider,
  openai: createOpenAIProvider,
  gemini: createGeminiProvider,
}

/** Select the provider via the LLM_PROVIDER secret (default gemini). Errors on an unsupported value. */
export function getProvider(): LLMProvider {
  const name = (Deno.env.get('LLM_PROVIDER') ?? 'gemini').toLowerCase()
  const factory = REGISTRY[name]
  if (!factory) {
    throw new Error(`지원하지 않는 LLM_PROVIDER: ${name} (anthropic | openai | gemini)`)
  }
  return factory()
}

/** Stream the response with the selected provider (text deltas → final at the end). */
export function streamLLM(args: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
  return getProvider().stream(args)
}

/** Non-streaming single call — drains the stream and returns only the final result (for non-conversational paths like evals). */
export async function callLLM(args: LLMCallArgs): Promise<LLMResult> {
  let result: LLMResult = { text: '', toolUse: null }
  for await (const ev of streamLLM(args)) {
    if (ev.type === 'final') result = ev.result
  }
  return result
}
