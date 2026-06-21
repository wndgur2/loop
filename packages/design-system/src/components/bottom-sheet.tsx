import { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoopColors, LoopRadius, LoopShadow } from '../tokens/theme';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/** Slide-up panel anchored to the bottom edge, over a dimmed scrim. */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.scrim} onPress={onClose}>
        <Animated.View entering={SlideInDown.duration(260)} exiting={SlideOutDown.duration(200)}>
          {/* Absorb taps so interacting with the sheet doesn't close it. */}
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            onPress={() => {}}
          >
            <View style={styles.handle} />
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(31, 29, 27, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: LoopColors.surface,
    borderTopLeftRadius: LoopRadius['4xl'],
    borderTopRightRadius: LoopRadius['4xl'],
    paddingTop: 10,
    paddingHorizontal: 22,
    ...LoopShadow.strong,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.line,
    marginBottom: 16,
  },
});
