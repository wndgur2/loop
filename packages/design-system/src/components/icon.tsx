import { memo } from 'react';
import type { ColorValue } from 'react-native';
import {
  ArrowRight,
  Bell,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ellipsis,
  Flag,
  House,
  type LucideIcon,
  Minus,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Tag,
  Target,
  Trash2,
  Undo2,
  X,
} from 'lucide-react-native';
import { Path, Svg } from 'react-native-svg';

import { LoopColors } from '../tokens/theme';

/**
 * App icons — backed by lucide-react-native, except the `loop` brand mark which
 * stays a hand-tuned custom glyph. The `name` API is unchanged so call sites
 * keep working; size/color props map straight onto the lucide components.
 */
export type IconName =
  | 'home'
  | 'home-fill'
  | 'loop'
  | 'chart'
  | 'settings'
  | 'send'
  | 'plus'
  | 'check'
  | 'check-sm'
  | 'close'
  | 'more'
  | 'edit'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'arrow-right'
  | 'sparkle'
  | 'target'
  | 'flag'
  | 'clock'
  | 'tag'
  | 'bell'
  | 'undo'
  | 'trash'
  | 'search'
  | 'minus';

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
};

// Map each app icon name to a lucide glyph. `home-fill` (active tab) renders the
// same house with a filled body; stroke weights nudge a few glyphs to keep the
// calm, slightly-soft feel of the original set.
const LUCIDE: Record<
  Exclude<IconName, 'loop'>,
  { Comp: LucideIcon; strokeWidth?: number; fill?: boolean }
> = {
  home: { Comp: House },
  'home-fill': { Comp: House, strokeWidth: 1.6, fill: true },
  chart: { Comp: ChartColumn, strokeWidth: 1.9 },
  settings: { Comp: Settings2 },
  send: { Comp: Send, strokeWidth: 1.9 },
  plus: { Comp: Plus, strokeWidth: 2 },
  minus: { Comp: Minus, strokeWidth: 2 },
  search: { Comp: Search, strokeWidth: 1.9 },
  check: { Comp: Check, strokeWidth: 2.2 },
  'check-sm': { Comp: Check, strokeWidth: 2.4 },
  close: { Comp: X, strokeWidth: 2 },
  more: { Comp: Ellipsis },
  edit: { Comp: Pencil },
  'chevron-right': { Comp: ChevronRight, strokeWidth: 2 },
  'chevron-left': { Comp: ChevronLeft, strokeWidth: 2 },
  'chevron-down': { Comp: ChevronDown, strokeWidth: 2 },
  'arrow-right': { Comp: ArrowRight, strokeWidth: 1.9 },
  sparkle: { Comp: Sparkles },
  target: { Comp: Target },
  flag: { Comp: Flag },
  clock: { Comp: Clock },
  tag: { Comp: Tag },
  bell: { Comp: Bell },
  undo: { Comp: Undo2 },
  trash: { Comp: Trash2 },
};

export const Icon = memo(function Icon({ name, size = 24, color = LoopColors.ink }: IconProps) {
  if (name === 'loop') {
    // Brand mark — kept custom, not a lucide glyph.
    return (
      <Svg width={size} height={size} viewBox="0 0 26 25" fill="none">
        <Path
          stroke={color as string}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
          d="M13 3.2c5.1 0 9.3 3.9 9.3 8.8S18.1 20.8 13 20.8c-3.4 0-5.2-1.9-5.2-4.2s1.9-4.1 4.7-4.1c2.6 0 4.3 1.6 4.3 3.6"
        />
      </Svg>
    );
  }

  const { Comp, strokeWidth = 1.8, fill } = LUCIDE[name];
  return (
    <Comp
      size={size}
      color={color as string}
      strokeWidth={strokeWidth}
      fill={fill ? (color as string) : 'none'}
    />
  );
});
