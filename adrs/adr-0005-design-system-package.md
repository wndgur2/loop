# ADR 0005 — 디자인 시스템 패키지 분리 (@loop/ui)

작성일: 2026-06-21 · 상태: 채택(Accepted)
관련: [adr-0001](adr-0001-scaffolding.md) · [adr-0003](adr-0003-mvp-client.md) · [CLAUDE.md](../CLAUDE.md) §3 · [branding.md](../documents/branding.md)

## 맥락

디자인 토큰(`loop-theme.ts`)과 UI 컴포넌트(`mobile/src/components/ui/*`)는 `mobile/` 앱 안에만 있었다. CLAUDE.md §3은 "이후 다른 플랫폼(web)은 같은 백엔드를 공유하는 형제 디렉토리로 추가"를 전제하는데, 디자인 시스템이 앱에 묶여 있으면 두 번째 플랫폼이 토큰/컴포넌트를 공유할 수 없다. 요구는 **(1) 디자인 시스템을 독립 패키지로 분리**하고 **(2) 컴포넌트 커버리지를 넓히는** 것이다.

## 결정

1. **npm workspaces 모노레포.** 루트에 `package.json`(`workspaces: ["mobile", "packages/*"]`)을 두고, 디자인 시스템을 `packages/design-system`(패키지명 **`@loop/ui`**)으로 분리한다. 앱은 `@loop/ui`로 import하고, 미래의 web 앱도 같은 패키지를 공유한다.
2. **빌드 스텝 없이 TS 소스를 그대로 출하.** `@loop/ui`의 `main`/`exports`는 `src/index.ts`를 가리키고, 소비 앱의 Metro가 `babel-preset-expo`로 트랜스파일한다(reanimated worklet 플러그인 포함). Expo 모노레포 권장 패턴(internal package).
3. **Metro 모노레포 설정.** `mobile/metro.config.js`에 `watchFolders=[모노레포 루트]` + `nodeModulesPaths=[앱, 루트]`. tsc는 `mobile/tsconfig.json`의 `@loop/ui` path 매핑으로 해석한다.
4. **앱 경계와 디커플링.** 토큰은 `tokens/theme.ts`로, `ui/*`·`loop-mark`는 `components/*`로 이동. 패키지는 앱 도메인을 모른다 — `ImportanceDots`의 `Importance` 타입은 패키지가 자체 정의하고, 도메인별 스켈레톤 프리셋(`FeedbackListSkeleton` 등)은 제네릭 `Skeleton`만 패키지에 남기고 앱(`mobile/src/components/skeletons.tsx`)으로 되돌렸다. 소비처는 전부 배럴(`@loop/ui`) import라 이동이 기계적이었다(51개 파일).
5. **공유 dev 툴체인·RN 런타임은 루트로 호이스팅 + `overrides`로 버전 고정.** `@loop/ui`의 peerDependencies를 `*`로 두면 npm이 RN 스택의 **최신** 버전을 루트에 따로 설치해, 앱이 고정한 버전과 **중복**된다(아래 문제). 루트 `overrides`로 `react`/`react-native`/`react-native-reanimated`/`-svg`/`-safe-area-context`/`-worklets`를 앱 버전에 고정해 단일 사본으로 dedupe.
6. **컴포넌트 확장(신규 24종).** 레이아웃(Box·Row·Column·Stack·Spacer·Divider) · 폼(Switch·Radio/RadioGroup·Slider·SegmentedControl·SearchBar·Stepper) · 피드백/오버레이(Spinner·Banner·Toast+Provider·Dialog·BottomSheet·Tooltip) · 데이터 표시(Avatar·Badge·Tag·Stat·ListItem·Accordion). 전부 기존 토큰·`PressScale`·`LoopText`·reanimated 관용구를 따른다. `icon`에 `search`·`minus` 글리프 추가.

## 라이브 검증으로 잡은 문제

1. **`*` peer가 RN 스택을 중복시킴 (핵심).** 워크스페이스 설치 후 `tsc`가 *“두 개의 react-native 타입 정체성”* 에러를 쏟아냄 — `@loop/ui`는 루트의 `react-native@0.86.0`(peer `*`가 끌어온 최신)을, 앱은 `mobile/node_modules`의 `0.85.3`을 봤다. reanimated도 4.4.1 vs 4.3.1로 갈려, 런타임 싱글톤 위반 위험까지. **→ 루트 `overrides`로 앱 버전 고정 + 클린 설치(node_modules·lock 제거 후 재설치)** 로 단일 사본 dedupe. 증분 설치로는 안 풀려 클린 설치가 필요했다.
2. **dev 바이너리 미호이스팅.** `tsc`/`eslint`/`@types/react`/`expo`가 `mobile/`에만 있어 패키지의 `typecheck`/`lint`가 `command not found`/모듈 해석 실패. **→ 공유 dev 툴을 루트 devDeps로 올리고, 패키지 tsconfig는 `expo/tsconfig.base` 상속 대신 동일 옵션을 self-contained로 인라인**(루트에 expo 미존재 회피).

## EAS / 배포 영향 (후속 필요)

워크스페이스 전환은 모듈 해석 경로를 바꾼다. EAS는 모노레포를 지원하지만, **다음 릴리스 전 `preview` 프로필로 테스트 빌드를 한 번 돌려** 번들 해석을 확인해야 한다(이 ADR에서는 빌드/배포를 트리거하지 않음).

## 검증

- `@loop/ui`: `typecheck`(tsc) / `lint`(eslint) 통과. `mobile`: `typecheck` / `lint` 통과.
- **web 프리뷰 실측**: 추출 후 sign-in 화면이 `@loop/ui`(LoopMark·LoopText·Button·TextField·토큰)로 정상 렌더. 신규 24종도 임시 갤러리 라우트에서 전부 렌더 확인(콘솔 에러 0) — 검증용 갤러리/가드 예외는 확인 후 제거.
- 단일 사본 확인: `react-native`/`reanimated`/`svg`/`safe-area-context`가 루트 1개로 dedupe(앱 nested 사본 없음).
