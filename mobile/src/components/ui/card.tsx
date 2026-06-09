import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

type CardProps = ViewProps & {
  children?: ReactNode;
  radius?: number;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
};

/** White surface card — hairline border + soft shadow. Ported from demo .lp-card. */
export const Card = memo(function Card({ children, radius = LoopRadius['2xl'], padded = true, style, ...rest }: CardProps) {
  return (
    <View style={[styles.base, { borderRadius: radius, padding: padded ? 17 : 0 }, style as ViewStyle]} {...rest}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.lineSoft,
    ...LoopShadow.card,
  },
});
