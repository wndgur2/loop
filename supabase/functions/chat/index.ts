// Loopie Edge Function — shared engine for write and retrospective modes, one tool per mode.
// Canonical source: documents/loopie-spec.md · contract: ../_shared/types.ts
// All AI calls go through this function (CLAUDE.md §6). Changes (create/update) are not committed here;
// it only returns a proposal — the client applies it after getting user consent via a confirmation chip.

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/client.ts";
import type {
  ChatProposal,
  ChatRequest,
  ChatResponse,
  ChatStreamEvent,
  Importance,
  QuotaExceededError,
  SessionMode,
} from "../_shared/types.ts";
import { buildContext } from "./context.ts";
import { enforceLoopieQuota } from "./quota.ts";
import { toolForMode } from "./tools.ts";
import {
  callLLM,
  streamLLM,
  type ChatTurn,
  type SystemBlock,
  type ToolDef,
} from "./llm/index.ts";
// Prompts are version-controlled as imported modules (loopie-spec §5).
// edge-runtime does not bundle non-imported static files, so readTextFile(.md) is not used.
import { SYSTEM } from "./prompts/system.ts";
import { EXTRACT } from "./prompts/extract.ts";
import { RETROSPECTIVE } from "./prompts/retrospective.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    // User-scoped client (RLS applied) + auth check.
    // getUser() is session-based, so in an Edge Function the header token must be passed explicitly.
    const token = (req.headers.get("Authorization") ?? "").replace(
      /^Bearer\s+/i,
      "",
    );
    const supabase = createUserClient(req);
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return jsonResponse({ error: "unauthorized" }, 401);

    const body = (await req.json().catch(() => null)) as ChatRequest | null;
    if (!body || (body.mode !== "write" && body.mode !== "retrospective")) {
      return jsonResponse({ error: "invalid_mode" }, 400);
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: "invalid_messages" }, 400);
    }

    // Loopie usage gating (weekly). Counts this call server-side with a service-role client so the
    // user can't tamper with their plan or counter (CLAUDE.md §6). Pro gets a much higher fair-use
    // limit; free gets the base limit. Both write/retrospective modes count (both are LLM calls).
    const quota = await enforceLoopieQuota(createServiceClient(), user.id);
    if (!quota.allowed) {
      const quotaBody: QuotaExceededError = {
        error: "quota_exceeded",
        plan: quota.plan,
        limit: quota.limit,
        used: quota.used,
        resetAt: quota.resetAt,
      };
      return jsonResponse(quotaBody, 402);
    }

    // Context = full feedback + sub-goals (common to both modes)
    const context = await buildContext(supabase);
    const modePrompt = body.mode === "write" ? EXTRACT : RETROSPECTIVE;

    const system: SystemBlock[] = [
      { type: "text", text: `${SYSTEM}\n\n${modePrompt}` }, // stable per mode
      { type: "text", text: context, cache_control: { type: "ephemeral" } }, // large and stable within a session → cache
    ];
    const messages = body.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const tool = toolForMode(body.mode);

    // Streaming: stream the answer text token by token, then close with the proposal at the end.
    if (body.stream) {
      return streamResponse(body.mode, { system, messages, tool });
    }

    const { text, toolUse } = await callLLM({ system, messages, tool });

    const response: ChatResponse = {
      reply: text,
      proposal: toolUse
        ? toProposal(body.mode, toolUse.name, toolUse.input)
        : null,
    };
    return jsonResponse(response);
  } catch (err) {
    // Do not log message bodies or personal data (CLAUDE.md §6).
    console.error(
      "chat error:",
      err instanceof Error ? err.message : "unknown",
    );
    return jsonResponse({ error: "internal_error" }, 500);
  }
});

/**
 * SSE streaming response. Streams text deltas as-is, and when the stream ends, closes once with
 * `done` carrying the final reply (trimmed) and the proposal. Avoids proxy buffering so the answer appears immediately.
 */
function streamResponse(
  mode: SessionMode,
  args: { system: SystemBlock[]; messages: ChatTurn[]; tool: ToolDef },
): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: ChatStreamEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
      try {
        let reply = "";
        let toolUse: { name: string; input: Record<string, unknown> } | null =
          null;
        for await (const ev of streamLLM(args)) {
          if (ev.type === "text") {
            reply += ev.text;
            send({ type: "delta", text: ev.text });
          } else if (ev.type === "final") {
            reply = ev.result.text; // finalize with the trimmed version
            toolUse = ev.result.toolUse;
          }
        }
        const proposal = toolUse
          ? toProposal(mode, toolUse.name, toolUse.input)
          : null;
        send({ type: "done", reply, proposal });
      } catch (err) {
        // Do not log message bodies or personal data (CLAUDE.md §6).
        console.error(
          "chat stream error:",
          err instanceof Error ? err.message : "unknown",
        );
        send({ type: "error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      ...corsHeaders,
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}

/** Converts the tool call result into a type-safe proposal (DB commit happens after client confirmation). */
function toProposal(
  mode: SessionMode,
  name: string,
  input: Record<string, unknown>,
): ChatProposal | null {
  if (mode === "write" && name === "create_feedback") {
    return {
      kind: "create_feedback",
      title: String(input.title ?? ""),
      situation: String(input.situation ?? ""),
      root_cause: String(input.root_cause ?? ""),
      category: String(input.category ?? ""),
      importance: (input.importance as Importance) ?? "mid",
      tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
      takeaways: Array.isArray(input.takeaways)
        ? input.takeaways.map((t) => ({
            text: String((t as { text?: unknown })?.text ?? ""),
          }))
        : [],
    };
  }
  if (mode === "retrospective" && name === "update_feedback") {
    const updates = input.takeaway_updates;
    return {
      kind: "update_feedback",
      feedback_id: String(input.feedback_id ?? ""),
      internalized:
        typeof input.internalized === "boolean"
          ? input.internalized
          : undefined,
      takeaway_updates: Array.isArray(updates)
        ? updates.map((u) => {
            const item = u as {
              takeaway_id?: unknown;
              text?: unknown;
              done?: unknown;
            };
            return {
              takeaway_id: item.takeaway_id
                ? String(item.takeaway_id)
                : undefined,
              text: item.text !== undefined ? String(item.text) : undefined,
              done: typeof item.done === "boolean" ? item.done : undefined,
            };
          })
        : undefined,
    };
  }
  return null;
}
