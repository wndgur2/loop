# ADR 0006 — 결제/구독 (RevenueCat IAP · Free/Pro · Loopie 사용량 게이팅)

작성일: 2026-06-21 · 상태: 채택(Accepted)
관련: [adr-0002](adr-0002-backend-structure.md) · [adr-0004](adr-0004-streaming.md) · [CLAUDE.md](../CLAUDE.md) §6·§9 · [data-model.md](../documents/data-model.md) · [PRD.md](../documents/PRD.md) §11

## 맥락

Loop은 수익화가 필요하다(CLAUDE.md §9 — 가격·상품 구성 미결). Expo 모바일 + 디지털 구독은 스토어 정책상 **인앱결제(IAP)가 사실상 필수**다. 자기성찰 데이터는 매우 민감하고(§6), 결제 상태는 위조 시 곧바로 무료로 프리미엄을 쓰는 보안 문제가 된다. 요구: **(1) 결제 수단 선택, (2) 무엇을 팔지, (3) 무엇을 게이트할지, (4) 위조 불가능한 신뢰 모델**.

## 결정

1. **RevenueCat 인앱결제.** `react-native-purchases`로 App Store / Play 결제를 추상화한다(영수증 검증·엔티틀먼트·크로스플랫폼을 한 번에). 어댑터처럼 호출부는 스토어를 모른다(`mobile/src/lib/purchases.ts`).
2. **상품 = Free + Pro 월 구독(단일 티어).** 가격은 **하드코딩하지 않고** RevenueCat offering에서 런타임 취득(§9 미결 존중).
3. **게이트 대상 = Loopie AI 대화만.** 작성(write)·회고(retrospective) 두 모드 모두 `chat` Edge Function(LLM 호출 = 실제 원가)을 타므로 카운트한다. 그 외(직접 작성·조회·목표·인사이트 등)는 DB CRUD라 원가가 ~0 → **전원 무료**. 가장 비싼 자원을 게이트해 가치·원가를 일치시킨다(PRD 핵심가치 = AI 차별점).
4. **사용량 = 주간 리셋.** `usage_counters`(사용자·주별 1행, 월요일 UTC 시작). 무료 = `LOOPIE_FREE_WEEKLY_LIMIT`(기본 30), **Pro = 무료 × `LOOPIE_PRO_LIMIT_MULTIPLIER`(기본 20)**. Pro도 "통과"가 아니라 **공정사용(fair-use) 고배수 한도**로 비정상 남용만 차단한다("무제한" 마케팅 + 서버 상한). 한도·배수는 env로 연다.
5. **신뢰 모델(핵심): 서버가 진실의 원천.**
   - `subscriptions`·`usage_counters`는 클라이언트에 **읽기(SELECT-own)만** 허용한다. `grant_api_roles`가 신규 테이블에 자동 부여하는 INSERT/UPDATE/DELETE를 마이그레이션에서 **명시적으로 revoke**한다. → 사용자가 자기 구독행을 Pro로 위조하거나 사용량을 리셋해 한도를 우회할 수 없다.
   - 모든 쓰기는 Edge Function의 **service_role 클라이언트**(`createServiceClient`, RLS 우회)로만. 엔티틀먼트는 **RevenueCat 웹훅**(`revenuecat-webhook`)이 `app_user_id`(= Supabase user id) 기준으로 `subscriptions`에 upsert한다(`last_event_id`로 멱등). 사용량은 `chat`이 원자적 RPC `increment_loopie_turns`로 증가한다.
   - 클라이언트 게이팅(페이월 표시)은 UX일 뿐, **실제 차단은 서버**(`chat`이 한도 초과 시 스트림 시작 전 HTTP 402 `quota_exceeded` 반환 → 클라가 페이월로 유도).
6. **네이티브 모듈 가드.** `react-native-purchases`는 네이티브라 web/Expo Go에서 동작 불가 → `lib/purchases`가 `Platform.OS==='web'`·키 미설정 시 전부 no-op(무료 폴백). 덕에 **페이월 UI는 web 프리뷰로 검증 가능**, 실제 구매는 디바이스 dev build 필요.

## 외부 설정 (코드 아님 — 사용자 몫)

App Store Connect/Play Console 구독 상품 생성 → RevenueCat에 상품·엔티틀먼트(`pro`)·offering 등록 → 공개 SDK 키를 `EXPO_PUBLIC_REVENUECAT_API_KEY_*`에 → 웹훅 URL(`<SUPABASE_URL>/functions/v1/revenuecat-webhook`)+`REVENUECAT_WEBHOOK_SECRET` 등록 → 호스팅 프로젝트에 마이그레이션 `db push` + `chat`/웹훅 함수 배포. 이벤트 순서는 best-effort(멱등은 보장, 강한 순서 보장은 추후).

## 검증

- 게이트: 루트 `typecheck`/`lint`(@loop/ui+mobile) 통과. `deno check`(chat·revenuecat-webhook) 통과.
- 마이그레이션: 로컬 적용 후 `authenticated` 롤이 두 테이블에 select 가능·insert/update/delete 불가 확인(권한 회귀 방지). `gen types`로 database.ts 재생성.
- web 프리뷰: 설정 "구독" 섹션·`/paywall` 렌더(무료 폴백·가격 폴백). 한도 차단→페이월은 `LOOPIE_FREE_WEEKLY_LIMIT=1`로 재현.
- 네이티브 구매 흐름은 프리뷰로 검증 불가(네이티브 모듈) — 디바이스 dev build + RevenueCat/스토어 설정 후 실측.

## EAS / 배포 영향

새 네이티브 의존성(`react-native-purchases`) 추가는 **새 dev/preview build가 필요**하다(JS OTA로는 안 됨). adr-0005의 워크스페이스 경고와 함께 다음 릴리스 전 `eas build --profile preview`로 모듈 해석·네이티브 링크를 한 번 확인한다(이 ADR에서 빌드는 트리거하지 않음).
