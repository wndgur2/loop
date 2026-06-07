// LLM 어댑터 진입점 — env(LLM_PROVIDER)로 프로바이더를 고르고 단일 인터페이스로 호출한다.
// 모든 AI 호출은 이 모듈을 경유한다(CLAUDE.md §6). 새 프로바이더는 여기 등록만 추가.

import { createAnthropicProvider } from './anthropic.ts'
import { createOpenAIProvider } from './openai.ts'
import { createGeminiProvider } from './gemini.ts'
import type { LLMCallArgs, LLMProvider, LLMResult } from './types.ts'

export type {
  LLMCallArgs,
  LLMProvider,
  LLMResult,
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

/** 선택된 프로바이더로 1회 호출. 입력/출력 계약은 프로바이더 무관. */
export function callLLM(args: LLMCallArgs): Promise<LLMResult> {
  return getProvider().complete(args)
}
