# Loopie 프롬프트 변경 이력

프롬프트는 코드처럼 버전 관리한다. 변경 시 `evals`로 회귀 검증하고(`eval-loopie` 스킬), 점수 변화를 여기 남긴다.
정본 의도: [loopie-spec.md](../../../../documents/loopie-spec.md) · 채점: [eval-rubric.md](../../../../documents/eval-rubric.md)

## v0.1 (2026-06-10) — 응답 언어 규칙 명시

- `system.ts`: "Reply in the user's own language" 한 줄을 별도 `# Language` 섹션으로 분리·강화.
  - 가장 최근 사용자 메시지의 언어로 답하고, 대화 중 언어를 바꾸면 따라 바꾸도록 명시.
  - 컨텍스트(피드백·하위목표)가 한국어여도 그 언어에 끌려가지 말고 최신 사용자 메시지를 기준으로 하도록 지시 — 영어로 물어도 한국어로 답하던 문제 수정.
- eval 점수: _미측정_.

## v0 (2026-06-07) — 초안

- `system.ts` (페르소나 §2), `extract.ts` (작성 흐름 §3·§4), `retrospective.ts` (회고 §9) 작성.
  - 프롬프트는 import되는 TS 모듈로 둔다 — edge-runtime이 비-import 파일을 번들하지 않아 `.md` + `readTextFile`은 동작하지 않음(로컬 `supabase functions serve`로 확인).
- eval 점수: _미측정_ (러너 배선 후 baseline 기록 예정).
