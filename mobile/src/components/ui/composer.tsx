import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

import { Icon } from './icon';
import { PressScale } from './press-scale';

/** Live input composer — shared by tab bottom and chat screen. Controlled via value/onChangeText/onSend. */
export function ComposerInput({
  value,
  onChangeText,
  onSend,
  placeholder = '메시지를 입력하세요',
  disabled,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const canSend = value.trim().length > 0 && !disabled;
  const inputRef = useRef<TextInput>(null);
  return (
    <View style={styles.outer}>
      {/* Tapping anywhere in the shell (icon, padding) focuses the input. */}
      <Pressable style={styles.shell} onPress={() => inputRef.current?.focus()} android_ripple={null}>
        <Icon name="sparkle" size={19} color={LoopColors.warm} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LoopColors.ink4}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={() => canSend && onSend()}
          numberOfLines={1}
          style={styles.input}
        />
        <PressScale
          onPress={() => canSend && onSend()}
          disabled={!canSend}
          haptic
          style={[styles.send, { backgroundColor: canSend ? LoopColors.warm : LoopColors.warmSoft2 }]}
        >
          <Icon name="send" size={20} color={canSend ? LoopColors.white : LoopColors.warmDeep} />
        </PressScale>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 16, paddingTop: 8 },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: LoopRadius.full,
    paddingVertical: 6,
    paddingLeft: 18,
    paddingRight: 6,
    ...LoopShadow.strong,
  },
  // Single-line input — vertically centered with the icon and send button (avoids multiline top-align issue).
  input: { flex: 1, fontSize: 14.5, fontWeight: '500', color: LoopColors.ink, padding: 0, margin: 0 },
  send: { width: 38, height: 38, borderRadius: LoopRadius.full, alignItems: 'center', justifyContent: 'center' },
});
