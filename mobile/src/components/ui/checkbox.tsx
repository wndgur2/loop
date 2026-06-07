import { Pressable, View } from 'react-native';

import { LoopColors } from '@/constants/loop-theme';

import { Icon } from './icon';

/** Takeaway 체크박스 — done이면 green fill. demo .lp-check 이식. */
export function Checkbox({ done, onPress }: { done: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          borderWidth: 1.7,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: done ? LoopColors.good : LoopColors.line,
          backgroundColor: done ? LoopColors.good : 'transparent',
        }}
      >
        {done && <Icon name="check-sm" size={14} color={LoopColors.white} />}
      </View>
    </Pressable>
  );
}
