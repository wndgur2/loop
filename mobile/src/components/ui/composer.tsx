import { Pressable, TextInput, View } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

import { Icon } from './icon';
import { LoopText } from './text';

const SHELL = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  backgroundColor: LoopColors.surface,
  borderWidth: 1,
  borderColor: LoopColors.line,
  borderRadius: LoopRadius.full,
  paddingVertical: 7,
  paddingLeft: 18,
  paddingRight: 7,
  ...LoopShadow.strong,
};

const SEND = {
  width: 38,
  height: 38,
  borderRadius: LoopRadius.full,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

/**
 * 입장용 컴포저 — 입력처럼 보이지만 누르면 채팅으로 진입(home/reflect 하단).
 * demo .lp-composer 의 entry 형태.
 */
export function ComposerEntry({ placeholder, onPress }: { placeholder: string; onPress: () => void }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <Pressable onPress={onPress} style={({ pressed }) => [SHELL, { opacity: pressed ? 0.92 : 1 }]}>
        <Icon name="sparkle" size={19} color={LoopColors.warm} />
        <LoopText variant="body" color="ink4" style={{ flex: 1 }} numberOfLines={1}>
          {placeholder}
        </LoopText>
        <View style={[SEND, { backgroundColor: LoopColors.warm }]}>
          <Icon name="send" size={20} color={LoopColors.white} />
        </View>
      </Pressable>
    </View>
  );
}

/** 라이브 입력 컴포저 — 채팅 화면 하단. value/onChangeText/onSend 제어. */
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
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <View style={SHELL}>
        <Icon name="sparkle" size={19} color={LoopColors.warm} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LoopColors.ink4}
          multiline
          editable={!disabled}
          onSubmitEditing={() => canSend && onSend()}
          style={{ flex: 1, fontSize: 14.5, fontWeight: '500', color: LoopColors.ink, maxHeight: 96, paddingTop: 0 }}
        />
        <Pressable
          onPress={() => canSend && onSend()}
          disabled={!canSend}
          style={[SEND, { backgroundColor: canSend ? LoopColors.warm : LoopColors.warmSoft2 }]}
        >
          <Icon name="send" size={20} color={canSend ? LoopColors.white : LoopColors.warmDeep} />
        </Pressable>
      </View>
    </View>
  );
}
