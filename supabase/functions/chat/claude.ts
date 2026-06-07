// Anthropic Messages API 호출 (Claude API 레퍼런스 기준).
// 키는 Edge Function secret(ANTHROPIC_API_KEY)에서만 읽는다 — 클라이언트 노출 금지(CLAUDE.md §6).

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export interface SystemBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolDef {
  name: string;
  description: string;
  input_schema: unknown;
}

export interface ClaudeResult {
  text: string;
  toolUse: { name: string; input: Record<string, unknown> } | null;
}

interface AnthropicBlock {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export async function callClaude(args: {
  system: SystemBlock[];
  messages: ChatTurn[];
  tool: ToolDef;
}): Promise<ClaudeResult> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 미설정');
  // 기본 모델은 claude-opus-4-8. 비용/지연 튜닝은 secret(CHAT_MODEL)으로 오버라이드.
  const model = Deno.env.get('CHAT_MODEL') ?? 'claude-opus-4-8';

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: args.system, // 마지막 블록에 cache_control → tools+system 프롬프트 캐싱
      messages: args.messages,
      tools: [args.tool],
      tool_choice: { type: 'auto' },
    }),
  });

  if (!res.ok) {
    // 본문에 민감정보가 없더라도 보수적으로 상태코드만 남긴다(CLAUDE.md §6).
    throw new Error(`Anthropic API ${res.status}`);
  }

  const data = (await res.json()) as { content?: AnthropicBlock[] };
  let text = '';
  let toolUse: ClaudeResult['toolUse'] = null;
  for (const block of data.content ?? []) {
    if (block.type === 'text' && block.text) text += block.text;
    else if (block.type === 'tool_use' && block.name) {
      toolUse = { name: block.name, input: block.input ?? {} };
    }
  }
  return { text: text.trim(), toolUse };
}
