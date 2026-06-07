import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ComposerInput } from '@/components/ui';

/**
 * 피드백·회고 탭 하단 공통 채팅 input.
 * 포커스하면 키보드가 열리고, 전송하면 해당 채팅방(작성/회고)으로 진입하며 첫 메시지를 넘긴다.
 */
export function TabComposer({ mode, placeholder }: { mode: 'write' | 'reflect'; placeholder: string }) {
  const router = useRouter();
  const [text, setText] = useState('');

  function send() {
    const v = text.trim();
    if (!v) return;
    setText('');
    router.push({ pathname: '/chat/[mode]', params: { mode, initial: v } });
  }

  return <ComposerInput value={text} onChangeText={setText} onSend={send} placeholder={placeholder} />;
}
