// @loop/ui — Loop design system.
// Tokens + cross-platform UI primitives, derived from the demo/ "ordered warmth" handoff.

// ── Tokens ────────────────────────────────────────────────────────────────
export {
  LoopColors,
  LoopSpace,
  LoopRadius,
  LoopType,
  LoopFont,
  LoopShadow,
  LoopMotion,
  type LoopColor,
} from './tokens/theme';

// ── Foundations ───────────────────────────────────────────────────────────
export { Icon, type IconName } from './components/icon';
export { LoopText, type LoopTextProps } from './components/text';
export { LoopMark } from './components/loop-mark';
export { PressScale, usePressScale } from './components/press-scale';

// ── Layout primitives ─────────────────────────────────────────────────────
export { Box, Row, Column, Stack, Spacer, Divider } from './components/layout';

// ── Actions ───────────────────────────────────────────────────────────────
export { Button, IconButton } from './components/button';

// ── Surfaces & containers ─────────────────────────────────────────────────
export { Card } from './components/card';
export { Screen } from './components/screen';
export { HeaderAction, ScreenHeader } from './components/screen-header';
export { TabHeader } from './components/tab-header';
export { SectionLabel } from './components/section-label';
export { ListItem } from './components/list-item';
export { Accordion } from './components/accordion';

// ── Selection & input ─────────────────────────────────────────────────────
export { Checkbox } from './components/checkbox';
export { Chip } from './components/chip';
export { SelectChip } from './components/select-chip';
export { TextField } from './components/text-field';
export { ComposerInput } from './components/composer';
export { Switch } from './components/switch';
export { Radio, RadioGroup } from './components/radio';
export { Slider } from './components/slider';
export { SegmentedControl } from './components/segmented-control';
export { SearchBar } from './components/search-bar';
export { Stepper } from './components/stepper';

// ── Data display ──────────────────────────────────────────────────────────
export { Avatar } from './components/avatar';
export { Badge } from './components/badge';
export { Tag } from './components/tag';
export { Stat } from './components/stat';

// ── Indicators ────────────────────────────────────────────────────────────
export { ProgressBar } from './components/progress-bar';
export { Ring } from './components/ring';
export { ImportanceDots, type Importance } from './components/importance-dots';
export { Skeleton } from './components/skeleton';
export { Spinner } from './components/spinner';

// ── Feedback & overlays ───────────────────────────────────────────────────
export { ConfirmDialog } from './components/confirm-dialog';
export { EmptyState } from './components/empty-state';
export { Banner } from './components/banner';
export { ToastProvider, useToast } from './components/toast';
export { Dialog } from './components/dialog';
export { BottomSheet } from './components/bottom-sheet';
export { Tooltip } from './components/tooltip';
