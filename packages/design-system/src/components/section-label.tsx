import { memo, type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { LoopText } from './text';

/** Eyebrow label above a content section or form field. */
export const SectionLabel = memo(function SectionLabel({
  children,
  first,
  style,
}: {
  children: ReactNode;
  /** First section of the screen — drops the top spacing. */
  first?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={[styles.label, first && styles.first, style]}>
      {children}
    </LoopText>
  );
});

const styles = StyleSheet.create({
  label: { marginTop: 24, marginBottom: 10 },
  first: { marginTop: 4 },
});
