# ADR 0001 — 초기 스캐폴딩 결정

작성일: 2026-06-07 · 상태: 채택(Accepted)

## 맥락

코드가 없던 저장소에 Loop 앱(Android 우선, iOS 동시) 기반을 세웠다. 스택은 [CLAUDE.md](../CLAUDE.md) §2에서 이미 확정(Expo/RN + TS, Supabase, Claude API via Edge Function).

## 결정

1. **플랫폼별 디렉토리 분리** — 앱 코드는 `mobile/`(Expo), 루트에는 문서·공유 백엔드만.
   - `supabase/`(백엔드)·`evals/`(코칭 평가)·`documents/`는 모든 플랫폼 공유 → 루트 유지.
   - 이후 다른 플랫폼(web 등)은 같은 `supabase/`를 쓰는 형제 디렉토리로 추가.
2. **Expo 기본 템플릿(default)** 사용 — Expo Router(파일 기반 라우팅) + TypeScript strict 포함.
   - 버전: Expo SDK 56 / React 19.2 / React Native 0.85 / TypeScript 6.0 (템플릿 핀 버전 유지).
3. **라우터 루트 = `mobile/src/app/`** — 최신 Expo 기본 템플릿 관례. 경로 alias `@/*` → `mobile/src/*`.
   - CLAUDE.md §3의 옛 그림(`app/` 루트)을 실제에 맞게 갱신함.
4. **앱 정체성** — name `Loop`, slug/scheme `loop`, `android.package` = `ios.bundleIdentifier` = **`com.loop.app`**.
   - 패키지명은 변경 비용이 커서 초기에 고정.
5. **인증** — 1차는 이메일/매직링크 전제(소셜은 추후, F1 미결). 스캐폴딩에는 인증 화면 미포함.
6. **Supabase 클라이언트** — `mobile/src/lib/supabase.ts`에 **지연 생성(lazy getter)**. 환경변수(`EXPO_PUBLIC_*`)가 없으면 사용 시점에 명확한 에러. service_role·Anthropic 키는 클라이언트 금지(§6).
7. **서버 상태** — TanStack Query provider를 루트 레이아웃에 배선(`mobile/src/lib/query-client.ts`).
8. **env 분리** — 위치로 노출 경계를 명확히: 클라이언트 공개 값 `mobile/.env.example`(EXPO_PUBLIC_*), 서버 비밀값 `supabase/.env.example`(ANTHROPIC_API_KEY 등).
9. **데모 제거** — 템플릿 예제 화면/컴포넌트는 걷어내고 primitive(themed-text/view, theme, color-scheme hooks)만 유지. 실제 화면은 미작성(요청 범위).
10. **품질 게이트** — `typecheck`(tsc) · `lint`(expo lint, flat config) · `format`(prettier). 스캐폴딩 시점 `mobile/`에서 3개 모두 통과.

## 메모

- `mobile/src/hooks/use-color-scheme.web.ts`는 React Compiler 규칙(`set-state-in-effect`) 회피를 위해 `useSyncExternalStore` 기반 hydration 감지로 재작성.
- `mobile/src/types/database.ts`는 빈 placeholder. 마이그레이션 후 `supabase gen types typescript`로 재생성.
- 네이티브 디렉토리(`mobile/android/`, `mobile/ios/`)는 미생성 — managed workflow. 빌드 시 prebuild/EAS가 생성(`.gitignore`에 포함).

## 다음

CLAUDE.md §10의 ☐ 항목 — Supabase 연결·마이그레이션(RLS), 코칭 Edge Function 골격, 인증/화면.
