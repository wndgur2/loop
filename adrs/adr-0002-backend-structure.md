# ADR 0002 — 백엔드 구조 (DB + Edge Function API)

작성일: 2026-06-07 · 상태: 채택(Accepted)
관련: [data-model.md](../documents/data-model.md) · [ai-coaching-spec.md](../documents/ai-coaching-spec.md) · [adr-0001](adr-0001-scaffolding.md)

## 맥락

스캐폴딩(ADR-0001) 위에 백엔드 구조를 세웠다. 스키마는 data-model.md에, 코칭 API 계약은 ai-coaching-spec.md에 완전히 명세돼 있어 그대로 구현했다. 백엔드는 루트 `supabase/`에 둔다(플랫폼 공유).

## 결정

### DB (마이그레이션)

1. **초기 마이그레이션 1개**(`migrations/<ts>_init.sql`)에 7개 테이블 + enum + FK + 인덱스 + RLS를 모두 담았다.
2. **고정 enum은 Postgres native enum 타입**으로(`importance`, `sub_goal_source`, `session_mode`, `session_status`, `message_role`) — data-model §3과 1:1. `category`는 동적이라 enum 없이 `feedbacks.sub_goal_id` FK(NOT NULL).
3. **RLS는 모든 사용자 데이터 테이블에 활성화 + 4정책(select/insert/update/delete)**. 자식 테이블(`sub_goals`/`takeaways`/`coaching_messages`)은 부모를 통해 `EXISTS`로 소유권 검증. `supabase-migration` 스킬 체크리스트 준수.
4. **가입 트리거** `handle_new_user()`(SECURITY DEFINER, `search_path=''`)로 `auth.users` insert 시 `profiles` 자동 생성.
5. **하위목표 삭제 보호**: `feedbacks.sub_goal_id`는 `on delete restrict`(연결 피드백 있으면 하위목표 삭제 차단 — feature-spec F3 기본안).
6. `config.toml`을 수기로 두어 `supabase start`가 바로 동작하게 함(CLI 버전차로 안 맞으면 `supabase init` 재생성).

### API (Edge Function)

7. **코칭 함수 1개**(`functions/coaching`)가 작성·회고를 모두 처리. 차이는 *시스템 프롬프트 + 툴(모드당 1개)*뿐. 컨텍스트는 둘 다 전체 피드백(ai-coaching-spec §5).
8. **레이어 분리**: `_shared/`(cors·client·types), `coaching/`(index·claude·context·tools·prompts). 프롬프트는 `prompts/*.md`로 버전 관리(CLAUDE.md §8).
9. **사용자 스코프 클라이언트**: 요청 JWT로 `createClient` → RLS 적용. service_role 키 미사용. Anthropic 키는 secret(`ANTHROPIC_API_KEY`)에서만.
10. **확인 후 커밋**: 함수는 DB를 직접 바꾸지 않고 툴 호출 결과를 `proposal`로 반환. 클라이언트가 확인 칩으로 동의를 받아 RLS mutation으로 반영(조용한 변경 금지, CLAUDE.md §6).
11. **모델·캐싱**: 기본 `claude-opus-4-8`(secret `COACHING_MODEL`로 오버라이드), adaptive thinking, 시스템 프롬프트+컨텍스트에 프롬프트 캐싱(`cache_control`). 헤더 `anthropic-version: 2023-06-01`.

## 검증 (로컬, 실측)

Supabase CLI 2.105 · Deno 2.8 설치 후 로컬 스택으로 검증함:

- **마이그레이션**: `supabase db reset` 클린 적용 성공. 쿼리 확인 — 테이블 7 / RLS 7 / 정책 28(테이블당 4) / enum 5 / 가입 트리거 / `feedbacks.sub_goal_id` NOT NULL.
- **RLS 기능 테스트**: Alice의 goal을 Bob이 조회 시 0건, Bob이 Alice 소유로 insert 시 `row-level security policy` 차단. 트리거: auth.users 생성 → profiles 자동 생성(`display_name` 포함).
- **Edge Function**: `deno check` 통과 + `supabase functions serve`로 실제 edge-runtime에서 부팅·인증·컨텍스트 빌드까지 동작 확인(실제 signup 토큰). Claude 호출 자체는 `ANTHROPIC_API_KEY`가 있어야 완결(배포 시 secret 설정).

**라이브 검증으로 잡은 버그 2건(수정 완료)**:
1. 프롬프트를 `Deno.readTextFile(.md)`로 읽으면 edge-runtime이 비-import 파일을 번들하지 않아 `path not found`. → 프롬프트를 **import되는 TS 모듈**(`prompts/*.ts`, 문자열 export)로 변경.
2. `supabase.auth.getUser()`를 인자 없이 호출하면 Edge Function(세션 없음)에서 항상 null. → **헤더의 토큰을 명시적으로 전달**(`getUser(token)`).

## 남은 한계

- `mobile/src/types/database.ts`는 여전히 빈 placeholder. 운영 프로젝트 연결·마이그레이션 적용 후 `supabase gen types`로 재생성해야 클라이언트 데이터 레이어가 타입화된다.
- 코칭의 실제 Claude 응답/툴 호출 품질은 `ANTHROPIC_API_KEY` 설정 + `evals`로 별도 검증.

## 다음

- Supabase 프로젝트 연결 → 마이그레이션 적용 → 타입 재생성.
- 클라이언트 데이터 접근 레이어(`mobile/src/features/*` 쿼리/뮤테이션 훅) — proposal 확인→커밋 흐름 포함.
- 추천 회고 카드 서버 쿼리(feature-spec F9), 무료/프리미엄 대화량 제한(ai-coaching-spec §6).
