# @loop/ui

Loop 디자인 시스템 — 토큰 + 크로스플랫폼 UI 프리미티브. 정본 디자인은 `demo/`("ordered warmth"),
브랜드 가이드는 [branding.md](../../documents/branding.md). 설계 배경은 [adr-0005](../../adrs/adr-0005-design-system-package.md).

`mobile/`(Expo) 앱이 소비하며, 미래의 web 등 형제 플랫폼도 같은 패키지를 공유한다.
빌드 스텝 없이 **TS 소스를 그대로 출하**하고, 소비 앱의 Metro가 트랜스파일한다.

## 사용

```ts
import { Button, Card, LoopText, LoopColors, useToast } from '@loop/ui';
```

토큰만 따로:

```ts
import { LoopColors, LoopType, LoopSpace } from '@loop/ui/tokens';
```

## 구성

```
src/
├── tokens/theme.ts   # LoopColors · LoopFont · LoopType · LoopSpace · LoopRadius · LoopShadow · LoopMotion
├── components/        # 컴포넌트 (1 파일 = 1 컴포넌트군)
└── index.ts           # 공개 배럴 (이 파일에서 export해야 노출됨)
```

### 컴포넌트

- **Foundations** — Icon · LoopText · LoopMark · PressScale
- **Layout** — Box · Row · Column · Stack · Spacer · Divider
- **Actions** — Button · IconButton
- **Surfaces** — Card · Screen · ScreenHeader · TabHeader · SectionLabel · ListItem · Accordion
- **Selection & input** — Checkbox · Chip · SelectChip · TextField · ComposerInput · Switch · Radio/RadioGroup · Slider · SegmentedControl · SearchBar · Stepper
- **Data display** — Avatar · Badge · Tag · Stat
- **Indicators** — ProgressBar · Ring · ImportanceDots · Skeleton · Spinner
- **Feedback & overlays** — ConfirmDialog · EmptyState · Banner · ToastProvider/useToast · Dialog · BottomSheet · Tooltip

## 규약

- 색/간격/타입/모션은 **반드시 `tokens/theme.ts`** 에서. 하드코딩 금지(미세 조정 제외).
- 패키지는 **앱 도메인을 모른다** — `@/...`(앱) import 금지, i18n·쿼리·라우터 의존 금지. 텍스트는 prop으로 받는다.
- 누르는 피드백은 `PressScale`/`usePressScale`, 텍스트는 `LoopText`, 애니메이션은 reanimated(`.get()`/`.set()`).
- 새 컴포넌트 = `components/`에 파일 추가 + `index.ts`에 export.

## 스크립트

```bash
npm run typecheck --workspace @loop/ui   # tsc --noEmit
npm run lint --workspace @loop/ui        # eslint src
# 루트에서 둘 다(앱 포함): npm run typecheck / npm run lint
```

> RN 런타임(react/react-native/reanimated/svg/safe-area-context)·lucide는 **peerDependency** — 소비 앱이 제공한다.
> 버전 중복을 막기 위해 루트 `package.json`의 `overrides`로 앱 버전에 고정돼 있다([adr-0005](../../adrs/adr-0005-design-system-package.md)).
