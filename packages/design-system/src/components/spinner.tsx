import { ActivityIndicator } from 'react-native';

import { LoopColors } from '../tokens/theme';

type SpinnerProps = {
  size?: 'small' | 'large' | number;
  color?: string;
};

/** Loading spinner — warm accent by default. */
export function Spinner({ size = 'small', color = LoopColors.warm }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} />;
}
