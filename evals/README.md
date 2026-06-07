# evals/ — Loopi 품질 평가 루프

Loop의 차별점은 Loopi 품질이다. 프롬프트는 코드처럼 버전 관리하고, 바꿀 때마다 여기서 회귀를 검증한다.

관련: [loopi-spec.md](../documents/loopi-spec.md) · [eval-rubric.md](../documents/eval-rubric.md) · [feature-spec.md](../documents/feature-spec.md)

## 구성

```
evals/
├── README.md         # 이 문서
├── scenarios/        # 입력 시나리오 (JSON 1건 = 1 케이스)
├── runner.ts         # 시나리오 → Loopi → 구조화 출력 → 채점 → 리포트
└── reports/          # 실행 결과 (gitignore 권장, 요약만 CHANGELOG에)
```

## 시나리오 형식

`scenarios/*.json` — [eval-rubric.md](../documents/eval-rubric.md) 4절의 커버리지를 채운다.

```jsonc
{
  "id": "meeting-no-opinion",
  "mode": "write",                                     // write | retrospective
  "description": "회의에서 의견을 못 냄 — 근본 원인 파고들기 검증",
  "user_turns": ["오늘 회의에서 의견을 못 냈어요."],  // 멀티턴 시 사용자 발화 순서
  "goal_context": {                                    // 최종 목표 + 하위 목표(=category 후보)
    "goal": "Product Owner 달성",
    "sub_goals": ["collaborating", "engineering", "product planning"]
  },
  "expect": {                                          // 자동 채점 기대값 (느슨한 매칭)
    "expected_category": "collaborating",              // 기대 하위목표
    "requires_category": true,                          // 항상 하나의 하위목표 배정(필수)
    "min_takeaways": 2,
    "importance_in": ["mid", "high"]
  }
}
```

> 회고(retrospective) 시나리오는 `sub_goal` + `existing_feedbacks`로 하위목표 단위 되새김을 검증한다. 타입은 [runner.ts](runner.ts)의 `Scenario` 참조.

## 실행 (예정)

> 프로젝트 스캐폴딩 후 실제 배선. 지금은 인터페이스 계약만 고정.

```bash
npm run eval                 # 전체 시나리오
npm run eval -- --id meeting-no-opinion   # 단건
```

또는 `/eval-loopi` 스킬로 실행 — 결과를 [eval-rubric.md](../documents/eval-rubric.md) 기준으로 채점하고, 직전 버전 대비 델타를 리포트한다.

## 채점

- D1~D4(근본원인·Takeaways·분류·하위목표 배정): 구조화 출력 + `expect` 비교로 자동.
- D5~D6(보이스·효율): LLM-as-judge.
- 합격선·하드실패 규칙은 [eval-rubric.md](../documents/eval-rubric.md) 2절.
