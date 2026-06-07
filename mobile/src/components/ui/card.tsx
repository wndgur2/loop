import type { ReactNode } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius, LoopShadow } from '@/constants/loop-theme';

type CardProps = ViewProps & {
  children?: ReactNode;
  radius?: number;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
};

/** 흰 surface 카드 — hairline border + soft shadow. demo .lp-card 이식. */
export function Card({ children, radius = LoopRadius['2xl'], padded = true, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: LoopColors.surface,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: LoopColors.lineSoft,
          padding: padded ? 17 : 0,
        },
        LoopShadow.card,
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
