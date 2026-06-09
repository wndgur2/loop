/** Pure operations on the in-memory chat transcript. */
import type { LoopiMessage } from '@/lib/loopi';

/** Append a message (immutable). */
export function appendMessage(
  list: LoopiMessage[],
  role: LoopiMessage['role'],
  content: string,
): LoopiMessage[] {
  return [...list, { role, content }];
}

/** Rewrite the content of the last assistant message — accumulate streaming deltas / finalize. */
export function updateLastAssistant(
  list: LoopiMessage[],
  fn: (prev: string) => string,
): LoopiMessage[] {
  const copy = list.slice();
  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].role === 'assistant') {
      copy[i] = { ...copy[i], content: fn(copy[i].content) };
      break;
    }
  }
  return copy;
}

/** True when the last message is an assistant bubble that already has text (streaming has started). */
export function lastAssistantHasText(list: LoopiMessage[]): boolean {
  const last = list[list.length - 1];
  return last?.role === 'assistant' && last.content.length > 0;
}
