# Edge Functions

모든 Claude API 호출은 **반드시 이 디렉토리의 Edge Function을 경유**한다.
Anthropic 키·Supabase service_role 키는 클라이언트에 두지 않는다(CLAUDE.md §6).

## 구조

```
functions/
├── _shared/
│   ├── cors.ts          # CORS 헤더 + jsonResponse 헬퍼
│   ├── client.ts        # 요청 JWT로 사용자 스코프 Supabase 클라이언트(RLS 적용)
│   └── types.ts         # 요청/응답 계약 (ChatRequest/Response, proposal 타입)
└── chat/                # Loopi (작성·회고 공통 엔진, 모드당 툴 1개)
    ├── index.ts         #   핸들러: 인증 → 컨텍스트 로드 → Claude 호출 → proposal 반환
    ├── claude.ts        #   Anthropic Messages API 호출(프롬프트 캐싱, adaptive thinking)
    ├── context.ts       #   컨텍스트 빌드 = 전체 피드백 + 하위목표
    ├── tools.ts         #   모드당 툴 1개 (create_feedback / update_feedback)
    └── prompts/         #   시스템 프롬프트 — import되는 TS 모듈로 버전 관리
        ├── system.ts           # 페르소나 (loopi-spec §2)
        ├── extract.ts          # 작성 흐름 + 구조화 출력 (§3·§4)
        ├── retrospective.ts    # 회고 흐름 (§9)
        └── CHANGELOG.md        # 변경 이력 + eval 점수
```

## 동작

- **컨텍스트 = 전체 피드백 + 하위목표**(두 모드 공통). RLS 클라이언트로 조회 → 자기 데이터만.
- **모드당 툴 1개**: 작성 = `create_feedback`(피드백 1건 생성안) · 회고 = `update_feedback`(내재화/done/다짐 수정안).
- **확인 후 커밋**: 함수는 DB를 직접 바꾸지 않고 `proposal`만 반환한다. 클라이언트가 확인 칩으로 사용자 동의를 받아 RLS mutation으로 반영한다(조용한 변경 금지).
- 기본 모델 `claude-opus-4-8`(secret `CHAT_MODEL`로 오버라이드). 키는 `ANTHROPIC_API_KEY` secret.
- 품질 평가는 `evals/` + `eval-loopi` 스킬로 회귀 검출.

## 로컬 실행

```bash
# 비밀값: supabase/.env.example 복사 → supabase/functions/.env
supabase start
supabase functions serve --env-file supabase/functions/.env
```

## 검증 상태

로컬(Supabase CLI 2.105 · Deno 2.8)에서 검증됨: `deno check` 통과, `supabase functions serve`로 edge-runtime 부팅·인증(`getUser(token)`)·컨텍스트 빌드까지 동작 확인. 실제 Claude 호출은 `ANTHROPIC_API_KEY` secret 설정 후 완결된다.

> 프롬프트는 `prompts/*.ts`(문자열 export)로 둔다 — edge-runtime은 비-import 정적 파일을 번들하지 않아 `readTextFile(.md)`은 런타임에 `path not found`로 실패한다.
