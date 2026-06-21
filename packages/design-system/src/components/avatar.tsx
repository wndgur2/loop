import { memo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { LoopColors } from '../tokens/theme';

import { LoopText } from './text';

type AvatarProps = {
  /** Display name — initials are derived from it when no image is given. */
  name?: string;
  /** Remote image URI; takes precedence over initials. */
  uri?: string;
  size?: number;
  tone?: 'warm' | 'neutral';
  style?: StyleProp<ViewStyle>;
};

function initials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

/** Circular avatar — image, or initials over a warm/neutral fill. */
export const Avatar = memo(function Avatar({
  name,
  uri,
  size = 40,
  tone = 'warm',
  style,
}: AvatarProps) {
  const radius = size / 2;
  const isWarm = tone === 'warm';
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          { width: size, height: size, borderRadius: radius },
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius },
        isWarm ? styles.warm : styles.neutral,
        style,
      ]}
    >
      <LoopText
        variant="label"
        color={isWarm ? 'warmDeep' : 'ink2'}
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {initials(name)}
      </LoopText>
    </View>
  );
});

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  warm: { backgroundColor: LoopColors.warmSoft2 },
  neutral: { backgroundColor: LoopColors.fill },
});
