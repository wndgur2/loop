---
name: eval-loopie
description: Loop의 Loopie 프롬프트 품질을 평가한다. 시나리오 묶음을 Loopie에 돌려 eval-rubric 기준으로 채점하고 직전 버전 대비 회귀를 검출한다. Loopie 프롬프트(supabase/functions/chat/prompts)를 수정했거나 "Loopie 평가", "eval 돌리기", "프롬프트 회귀 확인" 요청 시 사용.
---

# Loopie 품질 평가

Loopie 품질은 Loop의 차별점이다(PRD 리스크 #2). 프롬프트를 바꿨으면 **머지 전 반드시** 이 평가를 거친다.

## 언제 쓰나
- `supabase/functions/chat/prompts/` 의 프롬프트 변경 직후
- 출력 스키마([loopie-spec.md](../../../documents/loopie-spec.md) 4절) 변경 시
- 모델 버전 업그레이드 시 (회귀 안전망)

## 절차
1. 기준 문서를 읽는다: [eval-rubric.md](../../../documents/eval-rubric.md)(채점), [loopie-spec.md](../../../documents/loopie-spec.md)(계약).
2. [evals/scenarios](../../../evals/scenarios/) 전체(또는 지정 `--id`)를 로드한다.
3. 각 시나리오를 Loopie에 통과시켜 transcript + 구조화 출력을 얻는다.
4. 채점:
   - **D1~D4**(근본원인·실천항목·분류·목표정렬): 출력 + 시나리오 `expect` 비교로 자동.
   - **D5~D6**(보이스·효율): LLM-as-judge. 보이스는 [branding.md](../../../documents/branding.md) 기준.
   - **하드 실패** 우선 판정(스키마 위반/평가·훈계/위기신호 무시).
5. 리포트 출력: 시나리오별 점수표 + 차원별 평균 + **직전 버전 대비 델타**.

## 판정 (eval-rubric.md 2절)
- 머지 가능: 평균 ≥ 9/12 **그리고** D1·D2 평균 ≥ 1.5.
- 회귀(직전 대비 하락)면 머지하지 않는다.
- 하드 실패가 1건이라도 있으면 머지하지 않는다.

## 마무리
- 결과 요약을 `supabase/functions/chat/prompts/CHANGELOG.md`에 점수와 함께 기록한다.
- 실제 사용 중 발견한 나쁜 사례는 새 시나리오로 추가해 회귀 셋을 키운다.

> 구현 골격: [evals/runner.ts](../../../evals/runner.ts). 프롬프트 캐싱 등 Claude API 모범사례는 빌트인 `claude-api` 스킬 참조.
