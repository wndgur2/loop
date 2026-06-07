# Edge Functions

모든 Claude API 호출은 **반드시 이 디렉토리의 Edge Function을 경유**한다.
Anthropic 키·Supabase service_role 키는 클라이언트에 두지 않는다(CLAUDE.md §6).

## 예정 구조

```
functions/
└── coaching/            # AI 코칭 (작성·회고 공통 엔진, 모드당 툴 1개)
    ├── index.ts         # 핸들러 (모드: write | retrospective)
    └── prompts/         # 시스템 프롬프트 — 버전 관리 (ai-coaching-spec.md 단일 진실원)
```

- 프롬프트는 이 폴더 안에 모아 버전 관리한다(임의로 흩뜨리지 않음 — CLAUDE.md §8).
- 작성 모드 툴 = `피드백 생성`, 회고 모드 툴 = `회고`(피드백 수정). 컨텍스트는 둘 다 전체 피드백.
- 품질 평가는 `evals/` + `eval-coaching` 스킬로 회귀 검출.

> 아직 함수 골격은 작성 전. 코칭 함수 추가 시 이 README를 실제 구조로 갱신한다.
