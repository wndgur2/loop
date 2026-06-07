import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

import { Icon } from './icon';

/** 라이브 입력 컴포저 — 탭 하단·채팅 화면 공통. value/onChangeText/onSend 제어. */
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
  return (
    <View style={styles.outer}>
      <View style={styles.shell}>
        <Icon name="sparkle" size={19} color={LoopColors.warm} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LoopColors.ink4}
          multiline
          editable={!disabled}
          onSubmitEditing={() => canSend && onSend()}
          style={styles.input}
        />
        <Pressable
          onPress={() => canSend && onSend()}
          disabled={!canSend}
          style={[styles.send, { backgroundColor: canSend ? LoopColors.warm : LoopColors.warmSoft2 }]}
        >
          <Icon name="send" size={20} color={canSend ? LoopColors.white : LoopColors.warmDeep} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 16, paddingTop: 8 },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: LoopRadius.full,
    paddingVertical: 7,
    paddingLeft: 18,
    paddingRight: 7,
    ...LoopShadow.strong,
  },
  input: { flex: 1, fontSize: 14.5, fontWeight: '500', color: LoopColors.ink, maxHeight: 96, paddingTop: 0 },
  send: { width: 38, height: 38, borderRadius: LoopRadius.full, alignItems: 'center', justifyContent: 'center' },
});
