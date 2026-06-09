import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { LoopColors, LoopRadius } from '@/constants/loop-theme';

type TextFieldProps = TextInputProps & {
  /** boxed=bordered input on surface (default) · underline=title-style inline edit */
  variant?: 'boxed' | 'underline';
  ref?: React.Ref<TextInput>;
};

/** Standard text input — Loop styling with the placeholder color baked in. */
export function TextField({ variant = 'boxed', style, ...props }: TextFieldProps) {
  return (
    <TextInput
      placeholderTextColor={LoopColors.ink4}
      style={[variant === 'boxed' ? styles.boxed : styles.underline, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  boxed: {
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: LoopRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: LoopColors.ink,
  },
  underline: {
    fontSize: 16,
    fontWeight: '600',
    color: LoopColors.ink,
    borderBottomWidth: 1,
    borderBottomColor: LoopColors.lineSoft,
    paddingVertical: 8,
  },
});
