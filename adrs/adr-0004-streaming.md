# ADR 0004 — Loopi 응답 스트리밍 (SSE)

작성일: 2026-06-08 · 상태: 채택(Accepted)
관련: [adr-0002](adr-0002-backend-structure.md) · [loopi-spec.md](../documents/loopi-spec.md) · [CLAUDE.md](../CLAUDE.md) §6

## 맥락

Loopi 답변은 한 번에 JSON(`{reply, proposal}`)으로 돌아와, 사용자는 모델이 끝까지 생성할 때까지 빈 화면(스피너)만 봤다. 대화형 회고에선 첫 글자가 빨리 보이는 체감 지연이 품질에 직결된다. 모든 AI 호출은 Edge Function 경유라는 전제(§6)는 유지한다.

## 결정

1. **프로바이더 계약을 `complete()` → `stream()`으로 통일.** 어댑터(anthropic/openai/gemini)는 `AsyncGenerator<LLMStreamEvent>`를 구현한다 — text 델타를 도착하는 대로 `{type:'text'}`로 흘리고, 끝에 누적 결과를 `{type:'final', result}`로 한 번 낸다. 비-스트리밍 `callLLM()`은 이 스트림을 소진해 만든다(evals 등 비대화 경로 유지).
2. **툴 입력(proposal)은 `final`에서만 완성.** Anthropic `input_json_delta`/OpenAI `function.arguments`는 부분 JSON으로 쪼개져 와, 끝에서 합쳐 파싱(`safeJson`)한다. 조용한 변경 금지 원칙(§6)대로 proposal은 여전히 클라이언트 확인 후 커밋.
3. **SSE 파싱을 한 곳에 집중**(`llm/types.ts`의 `sseData`). 세 프로바이더가 모두 `text/event-stream`을 쓰므로 청크 경계가 이벤트/JSON 중간을 갈라도 안전하게 재조립한다(`stream: true`, Gemini는 `:streamGenerateContent?alt=sse`). **이벤트 구분자는 프로바이더마다 다르다** — Gemini는 CRLF(`\r\n\r\n`), Anthropic/OpenAI는 LF(`\n\n`). 둘 다 받도록 경계 `/\r\n\r\n|\n\n|\r\r/`·줄분리 `/\r\n|\n|\r/`로 처리한다(아래 버그). 클라이언트 파서도 동일 규칙을 복제.
4. **Edge Function은 `stream:true` 요청에 SSE로 응답.** `delta`(텍스트)를 흘리다 `done`(트림된 reply + proposal)으로 닫는다. 기본 JSON 경로는 그대로 유지(하위호환).
5. **클라이언트는 `expo/fetch`로 직접 스트리밍.** supabase-js `functions.invoke`는 스트리밍 본문을 노출하지 않아, Edge Function URL로 직접 POST(`apikey` + 사용자 JWT)하고 `ReadableStream`을 읽는다(RN native는 `expo/fetch`, web은 곧 브라우저 native fetch라 둘 다 스트리밍 지원). 채팅 화면은 빈 말풍선을 먼저 띄우고 델타를 누적, `done`의 reply로 확정한다. 응답이 `text/event-stream`이 아니면(구버전 함수·프록시) **JSON `{reply, proposal}`으로 폴백**해 빈 말풍선 대신 답을 보여준다.

## 라이브 검증으로 잡은 버그 (2026-06-08, 로컬 gemini)

> 운영은 anthropic, 로컬 `supabase/functions/.env`는 `LLM_PROVIDER=gemini`. 로컬 채팅에서 **응답이 아예 안 옴**.

1. **CRLF 구분자 미처리 (핵심).** `sseData`가 이벤트를 `\n\n`(LF)로만 분리했는데, **Gemini SSE는 `\r\n\r\n`(CRLF)** 를 쓴다(`od -c`로 확인). → 스트림에서 이벤트를 **한 건도** 못 잘라 텍스트·툴 모두 빈 채 `{reply:"", proposal:null}`만 반환. Anthropic/OpenAI는 LF라 우연히 안 걸렸고, 초기 단위테스트도 `\n\n`만 써 놓쳤다. **→ 경계/줄분리를 CRLF·LF 모두 처리하도록 수정.** 디버깅 경로: 함수 200 정상 → 유효 토큰도 빈 `done` → 어댑터 Deno 격리도 0 deltas → raw fetch는 텍스트 정상 → `sseData` 통과 시 0건 → `od -c`로 구분자 `\r\n\r\n` 확인.
2. **env는 원인 아님(레드헤링).** `mobile/.env`가 운영을 가리켜 구버전(JSON) 함수가 응답하던 건 별개로 [loopi.ts](../mobile/src/lib/loopi.ts) JSON 폴백으로 방어. `GEMINI_MODEL` 값의 인라인 주석(`# stable…`)도 dotenv가 떼고 읽어 무해.

## 검증

- `mobile`: `typecheck` / `lint` 통과. `supabase/functions`: `deno check` 통과.
- `sseData` 회귀: CRLF/LF/무구분자 + 바이트 7개씩 분할(경계 갈림)에도 페이로드 정확 복원.
- **Gemini 어댑터 격리 실행**(실제 API): 수정 전 0 deltas → 수정 후 4 deltas/124자.
- **함수 E2E**(로컬 스택 + 유효 JWT): `data: {"type":"delta","text":"회의"}` … 토큰 단위 스트리밍 확인.
- 로컬 환경 분리는 `mobile/.env.local`(127.0.0.1) 우선 로드로([.env.example](../mobile/.env.example) 컨벤션). 운영 배포 시 `chat` 함수 재배포 + 원격 secret 필요.
