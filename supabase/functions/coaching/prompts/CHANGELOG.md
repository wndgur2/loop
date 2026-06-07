# 코칭 프롬프트 변경 이력

프롬프트는 코드처럼 버전 관리한다. 변경 시 `evals`로 회귀 검증하고(`eval-coaching` 스킬), 점수 변화를 여기 남긴다.
정본 의도: [ai-coaching-spec.md](../../../../documents/ai-coaching-spec.md) · 채점: [eval-rubric.md](../../../../documents/eval-rubric.md)

## v0 (2026-06-07) — 초안

- `system.ts` (페르소나 §2), `extract.ts` (작성 흐름 §3·§4), `retrospective.ts` (회고 §9) 작성.
  - 프롬프트는 import되는 TS 모듈로 둔다 — edge-runtime이 비-import 파일을 번들하지 않아 `.md` + `readTextFile`은 동작하지 않음(로컬 `supabase functions serve`로 확인).
- eval 점수: _미측정_ (러너 배선 후 baseline 기록 예정).
