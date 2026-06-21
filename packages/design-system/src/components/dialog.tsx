import { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '../tokens/theme';

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Tap-scrim-to-close (default true). */
  dismissable?: boolean;
};

/**
 * Generic centered modal card over a dimmed scrim. For confirm/cancel prompts
 * prefer ConfirmDialog; use Dialog when you need custom content in the card.
 */
export function Dialog({ visible, onClose, children, dismissable = true }: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.scrim} onPress={dismissable ? onClose : undefined}>
        {/* Absorb taps inside the card so they don't dismiss. */}
        <Pressable style={styles.card} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(31, 29, 27, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: LoopColors.surface,
    borderRadius: LoopRadius['3xl'],
    padding: 24,
    ...LoopShadow.strong,
  },
});
