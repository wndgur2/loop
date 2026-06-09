import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ComposerInput } from '@/components/ui';

/**
 * Shared chat input at the bottom of the feedback/retrospective tabs.
 * Focusing opens the keyboard; sending enters the corresponding chat (write/retrospective) and passes the first message.
 */
export function TabComposer({
  mode,
  placeholder,
}: {
  mode: 'write' | 'reflect';
  placeholder: string;
}) {
  const router = useRouter();
  const [text, setText] = useState('');

  function send() {
    const v = text.trim();
    if (!v) return;
    setText('');
    router.push({ pathname: '/chat/[mode]', params: { mode, initial: v } });
  }

  return (
    <ComposerInput value={text} onChangeText={setText} onSend={send} placeholder={placeholder} />
  );
}
