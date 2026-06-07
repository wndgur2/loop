# ADR 0003 — MVP 클라이언트 (4탭 + 피드백 작성·조회 + Loopi 채팅)

작성일: 2026-06-07 · 상태: 채택(Accepted)
관련: [feature-spec.md](../documents/feature-spec.md) · [data-model.md](../documents/data-model.md) · [adr-0002](adr-0002-backend-structure.md)

## 맥락

ADR-0002의 백엔드(스키마·Edge Function) 위에 Expo 모바일 클라이언트 MVP를 올렸다. 범위: **4개 탭(피드백·회고·대시보드·설정) + 피드백 작성·조회 + Loopi 대화(작성/회고)**. 디자인 정본은 `demo/`(Claude Design handoff)의 "정돈된 따뜻함" 방향.

## 결정

### 데이터·런타임
1. **로컬 Supabase로 실제 배선**. `supabase start`로 스택을 띄우고 마이그레이션을 적용한 뒤 `supabase gen types`로 `mobile/src/types/database.ts`를 재생성(placeholder 대체). `mobile/.env`에 로컬 URL/anon key.
2. **DB↔앱 경계는 `types/models.ts` 한 곳**에서 매핑(snake_case Row → camelCase 도메인). 서버 상태는 전부 **TanStack Query**(`features/*/queries.ts`), 전역 상태는 두지 않음(`useAuth`만 Context).
3. **인증 게이팅은 루트 레이아웃의 리다이렉트 컨트롤러**(`app/_layout.tsx`): 세션 없음→`/sign-in`, 세션·목표 없음→`/onboarding`, 그 외→`(tabs)`. 세션은 AsyncStorage 영속.

### UI 시스템
4. **`react-native-svg` 추가**(Expo 호환 버전). 진척 링(내재화율 모티프)·아이콘 세트가 모두 벡터라 필수. demo의 `loop-icons.js`·`loop.css`를 `components/ui/*`와 `constants/loop-theme.ts`로 이식. 라이트 모드 우선.
5. **공유 프리미티브**(`components/ui`): `Ring·Card·Chip·ImportanceDots·Checkbox·Button·Composer·Icon·Screen·LoopText`. 화면은 얇게, 표현은 프리미티브로.

### Loopi 채팅(작성·회고)
6. **확인 칩 커밋 패턴**(CLAUDE.md §6): Edge Function이 돌려준 `proposal`을 채팅에 카드로 띄우고, 사용자가 [이대로 저장]/[반영하기]를 누를 때만 RLS mutation으로 반영. 작성=`create_feedback`→피드백 생성, 회고=`update_feedback`→내재화/실천 done/다짐 갱신.
7. **세션 영속은 best-effort**: 첫 전송에 `chat_sessions` 생성·메시지 저장. 실패해도 대화를 막지 않음. 컨텍스트(전체 피드백)는 함수가 DB에서 직접 빌드하므로 클라이언트는 메시지 배열만 전송.
8. **AI 추천 자리(온보딩 하위목표)는 정적 fallback**. 전용 추천 함수는 v1.1.

### 직접 생성
9. **F6 "직접 생성"**: 피드백 홈 헤더의 [직접 작성]에서 Canonical Template 폼으로 AI 없이 작성/수정. `feedback/new.tsx`가 신규·편집(`?id`) 겸용.

## 검증 (로컬, 실측 — Expo web 프리뷰)

`typecheck`·`lint` 통과. 로컬 Supabase에 실제 가입한 사용자로 web 프리뷰에서 전 흐름을 구동:

- **가입 → 온보딩(목표·하위목표) → 탭 진입** 라우팅 동작. 가입 시 `profiles` 트리거로 `display_name`까지 반영(설정 화면에서 확인).
- **직접 작성 → 저장(RLS, user_id) → 상세** 이동. **실천항목 done 토글**, **내재화 표시/해제**가 DB에 반영되고 홈 링(0→100%)·카드 배지·대시보드 지표가 라이브 갱신.
- **대시보드**(내재화율·실행률·하위목표/중요도 분포·태그 빈도), **회고 추천 카드**(열린 고리로 "오늘의 되새김" 생성), **설정**(계정·목표·하위목표 관리) 모두 실데이터로 렌더.
- **Loopi 채팅**: Edge Function이 스택에서 서빙됨(인증 게이트 401 확인). 실제 AI 응답은 `ANTHROPIC_API_KEY`(로컬 `supabase/functions/.env`) 설정 시 완결.

## 남은 한계 / 다음

- 다크 모드는 라이트 우선으로 미적용(토큰은 light만). 음성 입력·검색·기간 필터는 비범위(feature-spec 남은 결정).
- 회고 추천 랭킹 가중치는 기본값(미내재화·importance·오래됨)만 — 추후 튜닝.
- 테스트 러너(jest-expo) 미도입 — 다음 단계.
- 운영 배포 시 Anthropic 키는 `supabase secrets set`, 클라이언트 `.env`는 운영 Supabase 값으로.
