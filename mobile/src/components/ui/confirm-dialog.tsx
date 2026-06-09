import { memo } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

import { Icon, type IconName } from './icon';
import { PressScale } from './press-scale';
import { LoopText } from './text';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  confirmLabel: string;
  /** Omit for a single-button info/error dialog (confirm acts as "OK"). */
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
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
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Single-button dialogs dismiss via the confirm (OK) action.
  const dismiss = onCancel ?? onConfirm;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={dismiss}>
        {/* Stop scrim taps from closing when interacting with the card itself. */}
        <Pressable style={styles.card} onPress={() => {}}>
          {icon && (
            <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
              <Icon name={icon} size={22} color={destructive ? LoopColors.danger : LoopColors.warmDeep} />
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
            {cancelLabel && (
              <PressScale onPress={onCancel} disabled={loading} style={[styles.btn, styles.cancelBtn]}>
                <LoopText variant="label" color="ink2">
                  {cancelLabel}
                </LoopText>
              </PressScale>
            )}
            <PressScale
              onPress={onConfirm}
              disabled={loading}
              style={[styles.btn, destructive ? styles.dangerBtn : styles.confirmBtn, loading && styles.btnLoading]}
            >
              {loading ? (
                <ActivityIndicator color={LoopColors.white} size="small" />
              ) : (
                <LoopText variant="label" color="white">
                  {confirmLabel}
                </LoopText>
              )}
            </PressScale>
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
  iconWrapDanger: { backgroundColor: LoopColors.dangerSoft },
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
  btnLoading: { opacity: 0.6 },
  cancelBtn: { backgroundColor: LoopColors.fill },
  confirmBtn: { backgroundColor: LoopColors.warm },
  dangerBtn: { backgroundColor: LoopColors.danger },
});
