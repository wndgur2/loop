// LLM 어댑터 진입점 — env(LLM_PROVIDER)로 프로바이더를 고르고 단일 인터페이스로 호출한다.
// 모든 AI 호출은 이 모듈을 경유한다(CLAUDE.md §6). 새 프로바이더는 여기 등록만 추가.

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

/** LLM_PROVIDER secret으로 프로바이더 선택 (기본 anthropic). 미지원 값이면 에러. */
export function getProvider(): LLMProvider {
  const name = (Deno.env.get('LLM_PROVIDER') ?? 'anthropic').toLowerCase()
  const factory = REGISTRY[name]
  if (!factory) {
    throw new Error(`지원하지 않는 LLM_PROVIDER: ${name} (anthropic | openai | gemini)`)
  }
  return factory()
}

/** 선택된 프로바이더로 응답을 스트리밍한다 (text 델타 → 마지막 final). */
export function streamLLM(args: LLMCallArgs): AsyncGenerator<LLMStreamEvent> {
  return getProvider().stream(args)
}

/** 비-스트리밍 1회 호출 — 스트림을 소진해 최종 결과만 돌려준다(evals 등 비대화 경로용). */
export async function callLLM(args: LLMCallArgs): Promise<LLMResult> {
  let result: LLMResult = { text: '', toolUse: null }
  for await (const ev of streamLLM(args)) {
    if (ev.type === 'final') result = ev.result
  }
  return result
}
