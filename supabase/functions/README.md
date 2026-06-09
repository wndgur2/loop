# Edge Functions

모든 LLM API 호출은 **반드시 이 디렉토리의 Edge Function을 경유**한다.
LLM 키(Anthropic/OpenAI/Gemini)·Supabase service_role 키는 클라이언트에 두지 않는다(CLAUDE.md §6).

## 구조

```
functions/
├── _shared/
│   ├── cors.ts          # CORS 헤더 + jsonResponse 헬퍼
│   ├── client.ts        # 요청 JWT로 사용자 스코프 Supabase 클라이언트(RLS 적용)
│   └── types.ts         # 요청/응답 계약 (ChatRequest/Response, proposal 타입)
└── chat/                # Loopi (작성·회고 공통 엔진, 모드당 툴 1개)
    ├── index.ts         #   핸들러: 인증 → 컨텍스트 로드 → LLM 호출 → proposal 반환
    ├── llm/             #   LLM 어댑터 (프로바이더 무관 인터페이스)
    │   ├── index.ts     #     getProvider/callLLM — LLM_PROVIDER env로 선택
    │   ├── types.ts     #     공용 계약 (SystemBlock/ChatTurn/ToolDef/LLMResult)
    │   ├── anthropic.ts #     Anthropic Messages API (프롬프트 캐싱, adaptive thinking)
    │   ├── openai.ts    #     OpenAI Chat Completions (function calling)
    │   └── gemini.ts    #     Gemini generateContent (function calling)
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
- **LLM 프로바이더는 `LLM_PROVIDER` secret으로 선택**: `gemini`(기본) · `anthropic` · `openai`. 어댑터는 `llm/`에 격리되어 호출부(`index.ts`)는 프로바이더를 모른다. 고른 프로바이더의 키만 설정한다(`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY`).
- **모델도 env로 선택**: 우선순위 `{PROVIDER}_MODEL`(`ANTHROPIC_MODEL`/`OPENAI_MODEL`/`GEMINI_MODEL`) → 공통 `CHAT_MODEL` → 기본값. 기본값: anthropic `claude-opus-4-8` · openai `gpt-5.4` · gemini `gemini-3.5-flash`. 프로바이더별 가능한 모델 목록은 [.env.example](../.env.example) 참고(공식 문서 기준).
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
