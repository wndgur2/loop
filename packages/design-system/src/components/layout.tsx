import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { LoopColors, type LoopColor } from '../tokens/theme';

function resolveColor(color: LoopColor | string): string {
  return (LoopColors as Record<string, string>)[color] ?? color;
}

type StackProps = ViewProps & {
  /** Gap between children (px). */
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
  children?: ReactNode;
};

/** Vertical flex container. The default layout primitive. */
export function Column({ gap, align, justify, wrap, flex, style, ...rest }: StackProps) {
  return (
    <View
      style={[
        { flexDirection: 'column', gap, alignItems: align, justifyContent: justify, flex },
        wrap && styles.wrap,
        style,
      ]}
      {...rest}
    />
  );
}

/** Horizontal flex container — items centered on the cross axis by default. */
export function Row({ gap, align = 'center', justify, wrap, flex, style, ...rest }: StackProps) {
  return (
    <View
      style={[
        { flexDirection: 'row', gap, alignItems: align, justifyContent: justify, flex },
        wrap && styles.wrap,
        style,
      ]}
      {...rest}
    />
  );
}

/** Direction-agnostic flex container (defaults to a column). */
export function Stack({ style, ...rest }: StackProps & { direction?: 'row' | 'column' }) {
  const { direction = 'column', ...props } = rest as StackProps & { direction?: 'row' | 'column' };
  return direction === 'row' ? (
    <Row style={style} {...props} />
  ) : (
    <Column style={style} {...props} />
  );
}

type BoxProps = ViewProps & {
  /** Padding (all sides). */
  p?: number;
  px?: number;
  py?: number;
  bg?: LoopColor | string;
  radius?: number;
  flex?: number;
  /** Hairline border in the neutral line color. */
  border?: boolean;
  children?: ReactNode;
};

/** Styled View with the common spacing/surface shorthands. */
export function Box({ p, px, py, bg, radius, flex, border, style, ...rest }: BoxProps) {
  return (
    <View
      style={[
        {
          padding: p,
          paddingHorizontal: px,
          paddingVertical: py,
          backgroundColor: bg ? resolveColor(bg) : undefined,
          borderRadius: radius,
          flex,
        },
        border && styles.border,
        style,
      ]}
      {...rest}
    />
  );
}

/** Flexible space — fills available room (`flex: 1`) or a fixed square `size`. */
export function Spacer({ size }: { size?: number }) {
  return <View style={size != null ? { width: size, height: size } : styles.flex} />;
}

type DividerProps = {
  direction?: 'horizontal' | 'vertical';
  color?: string;
  /** Left/right (horizontal) or top/bottom (vertical) inset in px. */
  inset?: number;
  style?: ViewStyle;
};

/** Hairline separator. */
export function Divider({
  direction = 'horizontal',
  color = LoopColors.line,
  inset = 0,
  style,
}: DividerProps) {
  const isH = direction === 'horizontal';
  return (
    <View
      style={[
        isH
          ? { height: StyleSheet.hairlineWidth, marginHorizontal: inset, alignSelf: 'stretch' }
          : { width: StyleSheet.hairlineWidth, marginVertical: inset, alignSelf: 'stretch' },
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexWrap: 'wrap' },
  border: { borderWidth: 1, borderColor: LoopColors.line },
});
