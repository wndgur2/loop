import { memo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

import { Icon, type IconName } from './icon';
import { LoopText } from './text';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Styled confirmation dialog — a themed replacement for native Alert.alert,
 * which can't be styled on Android. Centered card over a dimmed scrim.
 */
export const ConfirmDialog = memo(function ConfirmDialog({
  visible,
  title,
  message,
  icon,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onCancel}>
        {/* Stop scrim taps from closing when interacting with the card itself. */}
        <Pressable style={styles.card} onPress={() => {}}>
          {icon && (
            <View style={styles.iconWrap}>
              <Icon name={icon} size={22} color={LoopColors.warmDeep} />
            </View>
          )}
          <LoopText variant="heading2" style={styles.title}>
            {title}
          </LoopText>
          {!!message && (
            <LoopText variant="body" color="ink3" style={styles.message}>
              {message}
            </LoopText>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [styles.btn, styles.cancelBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <LoopText variant="label" color="ink2">
                {cancelLabel}
              </LoopText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                styles.confirmBtn,
                { opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
              ]}
            >
              <LoopText variant="label" color="white">
                {confirmLabel}
              </LoopText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

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
    maxWidth: 340,
    backgroundColor: LoopColors.surface,
    borderRadius: LoopRadius['3xl'],
    padding: 24,
    alignItems: 'center',
    ...LoopShadow.strong,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.warmSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: LoopRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: LoopColors.fill },
  confirmBtn: { backgroundColor: LoopColors.warm },
});
