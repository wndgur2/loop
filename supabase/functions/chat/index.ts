// Loopi Edge Function — 작성(write)·회고(retrospective) 공통 엔진, 모드당 툴 1개.
// 정본: documents/loopi-spec.md · 계약: ../_shared/types.ts
// 모든 AI 호출은 이 함수를 경유한다(CLAUDE.md §6). 변경(생성/수정)은 여기서 커밋하지 않고
// 제안(proposal)만 돌려준다 — 클라이언트가 확인 칩으로 사용자 동의를 받아 반영한다.

import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { createUserClient } from '../_shared/client.ts'
import type {
  ChatProposal,
  ChatRequest,
  ChatResponse,
  ChatStreamEvent,
  Importance,
  SessionMode,
} from '../_shared/types.ts'
import { buildContext } from './context.ts'
import { toolForMode } from './tools.ts'
import { callLLM, streamLLM, type ChatTurn, type SystemBlock, type ToolDef } from './llm/index.ts'
// 프롬프트는 import되는 모듈로 버전 관리(loopi-spec §5).
// edge-runtime은 비-import 정적 파일을 번들하지 않으므로 readTextFile(.md)은 쓰지 않는다.
import { SYSTEM } from './prompts/system.ts'
import { EXTRACT } from './prompts/extract.ts'
import { RETROSPECTIVE } from './prompts/retrospective.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    // 사용자 스코프 클라이언트(RLS 적용) + 인증 확인.
    // getUser()는 세션 기반이라 Edge Function에선 헤더의 토큰을 명시적으로 넘겨야 한다.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const supabase = createUserClient(req)
    const {
      data: { user },
    } = await supabase.auth.getUser(token)
    if (!user) return jsonResponse({ error: 'unauthorized' }, 401)

    const body = (await req.json().catch(() => null)) as ChatRequest | null
    if (!body || (body.mode !== 'write' && body.mode !== 'retrospective')) {
      return jsonResponse({ error: 'invalid_mode' }, 400)
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: 'invalid_messages' }, 400)
    }

    // 컨텍스트 = 전체 피드백 + 하위목표 (두 모드 공통)
    const context = await buildContext(supabase)
    const modePrompt = body.mode === 'write' ? EXTRACT : RETROSPECTIVE

    const system: SystemBlock[] = [
      { type: 'text', text: `${SYSTEM}\n\n${modePrompt}` }, // 모드별로 안정적
      { type: 'text', text: context, cache_control: { type: 'ephemeral' } }, // 크고 세션 내 안정 → 캐시
    ]
    const messages = body.messages.map((m) => ({ role: m.role, content: m.content }))
    const tool = toolForMode(body.mode)

    // 스트리밍: 답변 텍스트를 토큰 단위로 흘려보내고, 마지막에 proposal을 함께 닫는다.
    if (body.stream) {
      return streamResponse(body.mode, { system, messages, tool })
    }

    const { text, toolUse } = await callLLM({ system, messages, tool })

    const response: ChatResponse = {
      reply: text,
      proposal: toolUse ? toProposal(body.mode, toolUse.name, toolUse.input) : null,
    }
    return jsonResponse(response)
  } catch (err) {
    // 본문/개인정보는 남기지 않는다(CLAUDE.md §6).
    console.error('chat error:', err instanceof Error ? err.message : 'unknown')
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

/**
 * SSE 스트리밍 응답. text 델타를 그대로 흘려보내고, 스트림이 끝나면 최종 reply(트림본)와
 * proposal을 `done`으로 한 번 닫는다. 프록시 버퍼링을 피해 답변이 즉시 보이게 한다.
 */
function streamResponse(
  mode: SessionMode,
  args: { system: SystemBlock[]; messages: ChatTurn[]; tool: ToolDef },
): Response {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: ChatStreamEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`))
      try {
        let reply = ''
        let toolUse: { name: string; input: Record<string, unknown> } | null = null
        for await (const ev of streamLLM(args)) {
          if (ev.type === 'text') {
            reply += ev.text
            send({ type: 'delta', text: ev.text })
          } else if (ev.type === 'final') {
            reply = ev.result.text // 트림본으로 확정
            toolUse = ev.result.toolUse
          }
        }
        const proposal = toolUse ? toProposal(mode, toolUse.name, toolUse.input) : null
        send({ type: 'done', reply, proposal })
      } catch (err) {
        // 본문/개인정보는 남기지 않는다(CLAUDE.md §6).
        console.error('chat stream error:', err instanceof Error ? err.message : 'unknown')
        send({ type: 'error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: {
      ...corsHeaders,
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    },
  })
}

/** 툴 호출 결과를 타입 안전한 proposal로 변환 (DB 커밋은 클라이언트 확인 후). */
function toProposal(
  mode: SessionMode,
  name: string,
  input: Record<string, unknown>,
): ChatProposal | null {
  if (mode === 'write' && name === 'create_feedback') {
    return {
      kind: 'create_feedback',
      title: String(input.title ?? ''),
      situation: String(input.situation ?? ''),
      root_cause: String(input.root_cause ?? ''),
      category: String(input.category ?? ''),
      importance: (input.importance as Importance) ?? 'mid',
      tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
      takeaways: Array.isArray(input.takeaways)
        ? input.takeaways.map((t) => ({ text: String((t as { text?: unknown })?.text ?? '') }))
        : [],
    }
  }
  if (mode === 'retrospective' && name === 'update_feedback') {
    const updates = input.takeaway_updates
    return {
      kind: 'update_feedback',
      feedback_id: String(input.feedback_id ?? ''),
      internalized: typeof input.internalized === 'boolean' ? input.internalized : undefined,
      takeaway_updates: Array.isArray(updates)
        ? updates.map((u) => {
            const item = u as { takeaway_id?: unknown; text?: unknown; done?: unknown }
            return {
              takeaway_id: item.takeaway_id ? String(item.takeaway_id) : undefined,
              text: item.text !== undefined ? String(item.text) : undefined,
              done: typeof item.done === 'boolean' ? item.done : undefined,
            }
          })
        : undefined,
    }
  }
  return null
}
