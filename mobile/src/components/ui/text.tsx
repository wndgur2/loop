import { Text, type TextProps, type TextStyle } from 'react-native';

import { LoopColors, type LoopColor, LoopType } from '@/constants/loop-theme';

type Variant = keyof typeof LoopType;

export type LoopTextProps = TextProps & {
  variant?: Variant;
  color?: LoopColor | string;
};

/** Loop 타입 스케일을 적용하는 텍스트. variant=토큰, color=LoopColors 키 또는 임의 색. */
export function LoopText({ variant = 'body', color = 'ink', style, ...rest }: LoopTextProps) {
  const resolved = (LoopColors as Record<string, string>)[color] ?? color;
  return <Text style={[LoopType[variant] as TextStyle, { color: resolved }, style]} {...rest} />;
}
