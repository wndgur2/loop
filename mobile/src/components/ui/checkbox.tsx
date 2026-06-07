import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LoopColors } from '@/constants/loop-theme';

import { Icon } from './icon';

/** Takeaway 체크박스 — done이면 green fill. demo .lp-check 이식. */
export const Checkbox = memo(function Checkbox({ done, onPress }: { done: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View
        style={[
          styles.box,
          done ? styles.done : styles.idle,
        ]}
      >
        {done && <Icon name="check-sm" size={14} color={LoopColors.white} />}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: { borderColor: LoopColors.line, backgroundColor: 'transparent' },
  done: { borderColor: LoopColors.good, backgroundColor: LoopColors.good },
});
