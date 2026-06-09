import { memo } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { LoopColors, type LoopColor, LoopType } from '@/constants/loop-theme';

type Variant = keyof typeof LoopType;

export type LoopTextProps = TextProps & {
  variant?: Variant;
  color?: LoopColor | string;
};

/** Text applying the Loop type scale. variant=token, color=LoopColors key or arbitrary color. */
export const LoopText = memo(function LoopText({ variant = 'body', color = 'ink', style, ...rest }: LoopTextProps) {
  const resolved = (LoopColors as Record<string, string>)[color] ?? color;
  return <Text style={[LoopType[variant] as TextStyle, { color: resolved }, style]} {...rest} />;
});
