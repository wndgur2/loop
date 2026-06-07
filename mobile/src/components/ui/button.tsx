import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';

import { LoopColors, LoopRadius } from '@/constants/loop-theme';

import { Icon, type IconName } from './icon';
import { LoopText } from './text';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  style?: ViewStyle;
};

/** 기본 액션 버튼 — primary=warm 채움, secondary=surface+border. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  height = 50,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const fg = isPrimary ? LoopColors.white : LoopColors.ink2;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height,
          borderRadius: LoopRadius.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: 18,
          backgroundColor: isPrimary ? LoopColors.warm : LoopColors.surface,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: LoopColors.line,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={19} color={fg} />}
          <LoopText variant="label" color={fg} style={{ fontWeight: '700', fontSize: 15 }}>
            {label}
          </LoopText>
        </>
      )}
    </Pressable>
  );
}

/** 아이콘만 있는 정사각 버튼 (상세 화면 액션 등). */
export function IconButton({
  icon,
  onPress,
  color = LoopColors.ink3,
  size = 50,
}: {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: LoopRadius.xl,
        borderWidth: 1,
        borderColor: LoopColors.line,
        backgroundColor: LoopColors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View>
        <Icon name={icon} size={22} color={color} />
      </View>
    </Pressable>
  );
}
