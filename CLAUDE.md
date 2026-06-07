# CLAUDE.md

이 파일은 이 저장소에서 작업하는 coding agent(Claude Code 등)를 위한 안내서입니다.
사람과 에이전트 모두 작업을 시작하기 전에 이 문서를 먼저 읽습니다.

> 관련 문서: [PRD](documents/PRD.md) · [기능 명세](documents/feature-spec.md) · [브랜딩](documents/branding.md) · [데이터 모델](documents/data-model.md) · [AI 코칭 스펙](documents/ai-coaching-spec.md) · [평가 기준](documents/eval-rubric.md)
> 이 문서는 "무엇을 만드는가"보다 "어떻게 작업하는가"에 집중합니다.

---

## 1. 제품 한 줄 요약

**Loop** — 스스로 남긴 피드백을 AI가 구조화·코칭해 "되돌아보기"를 "목표 달성"으로 연결하는 모바일 앱.

핵심 차별점은 **피드백 → 목표 달성, with AI**입니다. 단순 기록 도구가 아니라:
1. AI가 대화로 상황의 근본 원인과 실천항목을 끌어내고,
2. 피드백을 사용자의 커리어 목표에 정렬해 진척을 추적하며,
3. 미내재화 항목을 적시에 리마인드해 행동으로 잇습니다.

이 세 가지가 무너지면 제품의 의미가 없습니다. 기능을 만들 때 항상 이 가치에 닿는지 확인하세요.

---

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 클라이언트 | **Expo (React Native)** + TypeScript | iOS/Android 동시 지원 |
| 상태/데이터 | TanStack Query + (전역은 최소화) | 서버 상태는 Query로, 로컬 UI 상태만 컴포넌트/Zustand |
| 백엔드 | **Supabase** | Postgres + Auth + Storage + Realtime |
| AI | **Claude API (Anthropic)** | **반드시 서버(Edge Function) 경유** — 키를 클라이언트에 두지 않음 |
| 언어 | TypeScript (strict) | `any` 지양, 타입 우선 |

> 위 스택을 벗어나는 의존성 추가는 임의로 하지 말고, 이유를 먼저 제시하고 합의하세요.

---

## 3. 디렉토리 구조 (목표)

```
loop/
├── CLAUDE.md            # 이 문서
├── documents/           # 제품·브랜드 문서 (PRD, 브랜딩, 데이터 모델, AI 코칭 스펙, 평가 기준)
├── .claude/skills/      # 프로젝트 전용 스킬 (supabase-migration, eval-coaching ...)
├── evals/               # AI 코칭 품질 평가 루프 (시나리오 + 러너)
├── app/                 # Expo Router 화면 (파일 기반 라우팅)
├── src/
│   ├── components/      # 재사용 UI 컴포넌트
│   ├── features/        # 도메인별 묶음 (feedback, goals, dashboard, coaching)
│   ├── lib/             # supabase 클라이언트, api 래퍼, 유틸
│   ├── hooks/           # 공용 훅
│   └── types/           # 공용 타입 정의
├── supabase/
│   ├── migrations/      # DB 스키마 (SQL) — RLS 필수
│   └── functions/       # Edge Functions (Claude 코칭 + 프롬프트 버전관리)
└── docs/                # 설계 결정 기록(ADR), 노트
```

> 구조는 아직 초기 단계입니다. 새 폴더/패턴을 만들기 전에 기존 컨벤션을 먼저 따르고, 큰 구조 변경은 `docs/`에 짧게 근거를 남기세요.

---

## 4. 개발 명령어

> 아직 프로젝트 스캐폴딩 전입니다. 초기화 후 아래를 실제 스크립트에 맞춰 갱신하세요.

```bash
# 의존성 설치
npm install

# 개발 서버 (Expo)
npx expo start

# 타입 체크 / 린트 / 포맷
npm run typecheck
npm run lint
npm run format

# 테스트
npm test

# Supabase 로컬 (DB + Edge Functions)
supabase start
supabase functions serve
```

**작업을 마치기 전 반드시 `typecheck`와 `lint`를 통과시키세요.** 실패하면 그 사실을 그대로 보고하고, 임의로 무시하거나 타입을 우회하지 마세요.

---

## 5. 핵심 도메인 모델 (개념)

코드를 쓸 때 용어를 일관되게 사용하세요. 정본은 [데이터 모델](documents/data-model.md)·[기능 명세](documents/feature-spec.md).

- **Goal (최종 목표)** — 사용자의 커리어 최종 목표(MVP는 1개).
- **Sub-goal (하위 목표)** — 최종 목표를 구성하는 영역. **AI 추천 + 직접 추가**. 피드백의 `category` 역할을 한다.
- **Feedback** — 회고 1건(Canonical Template). `title`, `situation`, `rootCause`, `category`(=하위목표, 필수), `importance`, `tags[]`, `internalized`, `takeaways[]` 보유.
- **Takeaway** — 피드백에서 도출된 미래 행동/마음가짐. 항목별 `done` 추적.
- **Coaching Session** — AI 대화. **작성(write)** = 새 피드백 도출 · **회고(retrospective)** = 하위목표 단위로 기존 피드백 되새김.
- **내재화율** = 내재화 피드백/전체 · **Takeaway 실행률** = done 항목/전체. 핵심 가치 지표이자 대시보드의 중심.

**category = 하위 목표**(고정 enum 없음, 사용자별 동적). 모든 피드백은 반드시 하나의 하위목표에 속한다. `importance`: `high | mid | low`.

---

## 6. 보안 · 프라이버시 (최우선)

자기 성찰 데이터는 **매우 민감**합니다. PRD의 신뢰 전제("내 데이터는 나만 본다")를 코드 수준에서 지킵니다.

- **Claude API 키·Supabase service role 키는 절대 클라이언트에 넣지 않습니다.** 모든 AI 호출은 Supabase Edge Function을 경유합니다.
- 비밀값은 `.env`/Edge Function secret으로 관리하고 **커밋하지 않습니다.** (`.env`는 `.gitignore`에 포함)
- Supabase는 **Row Level Security(RLS)를 모든 사용자 데이터 테이블에 활성화**합니다. 사용자는 자기 데이터만 읽고 씁니다.
- 로그·에러 메시지에 피드백 본문이나 개인정보를 남기지 않습니다.
- 외부로 데이터를 보내는 코드(분석, 서드파티)는 반드시 사전 합의 후 추가합니다.

---

## 7. 코딩 규약

- **TypeScript strict.** `any` 대신 정확한 타입. 외부 데이터는 경계에서 검증(zod 권장).
- **함수형·작은 컴포넌트.** 화면은 얇게, 로직은 `hooks`/`lib`로.
- **서버 상태는 TanStack Query**로 캐싱·동기화. 전역 상태 남발 금지.
- 주변 코드의 네이밍·주석 밀도·관용구를 따르세요. 새 스타일을 도입하지 마세요.
- 사용자 대면 텍스트는 한국어(1차 타깃이 국내 사용자).
- 커밋 메시지는 명확한 한 줄 요약 + 필요 시 본문. 의미 단위로 커밋.

---

## 8. 에이전트 작업 방식

- **PRD의 핵심 가치(2번)에 닿는지** 항상 점검하세요. 단순 CRUD로 끝나면 차별점이 사라집니다.
- 큰 작업은 먼저 계획을 제시하고, 불명확한 요구사항은 추측하지 말고 질문하세요.
- 변경 후에는 `typecheck`/`lint`/관련 테스트로 **실제 검증**하고, 결과를 솔직히 보고하세요. 실패는 실패로 보고합니다.
- AI 코칭 품질이 차별점이므로, **프롬프트는 `supabase/functions` 내에 모아 버전 관리**하고 임의로 흩뜨리지 마세요.
- 되돌리기 어려운 작업(배포, 데이터 삭제, 외부 전송)은 진행 전 확인을 받으세요.
- 설계상 중요한 결정은 `docs/`에 짧게 ADR로 남기세요.

---

## 9. 미결 사항 (작업 시 인지)

PRD 11번 기준으로 아직 확정되지 않음 — 코드에서 하드코딩하지 말고 설정/추상화로 열어두세요.

- 가격대(월 구독 금액), 구독 상품 구성
- 온보딩에서 목표 설정 강제 여부
- 초기 타깃 직군을 PM/PO로 좁힐지

---

## 10. 다음 단계 (환경 조성)

이 저장소는 아직 코드가 없습니다. 권장 초기화 순서:

1. `git init` 및 `.gitignore` 생성
2. Expo + TypeScript 프로젝트 스캐폴딩 (`npx create-expo-app`)
3. ESLint/Prettier/typecheck 스크립트 설정 → 4번 명령어 갱신
4. Supabase 프로젝트 연결 및 초기 마이그레이션(Feedback/Goal 등)
5. Claude API용 Edge Function 골격 + 프롬프트 디렉토리
6. 스캐폴딩 완료 후 이 문서의 명령어·구조 섹션을 실제에 맞게 업데이트
