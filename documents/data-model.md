# Loop — 데이터 모델

작성일: 2026-05-31 · 최종 수정: 2026-06-07 · 상태: Draft v0.3
관련: [PRD.md](PRD.md) · [feature-spec.md](feature-spec.md) · [ai-coaching-spec.md](ai-coaching-spec.md) · [../CLAUDE.md](../CLAUDE.md)

> 모든 코드 작업의 공통 기반. 새 엔티티/필드를 추가하기 전에 이 문서를 먼저 갱신하세요.
> DB는 snake_case, 앱(TypeScript)은 camelCase로 매핑합니다.
> 피드백의 정본 형태는 [feature-spec.md](feature-spec.md)의 Canonical Template입니다.

---

## 1. 엔티티 한눈에

```
profiles (1) ──< goals (최종 목표, MVP 1개) ──< sub_goals (하위 목표, 다중)
                                                     │
                                                     │  category = sub_goal (필수)
                                                     ▼
profiles (1) ──< feedbacks ──< takeaways
                     │
                     └── sub_goal_id ──▶ sub_goals   (단수 FK, NOT NULL)

profiles (1) ──< coaching_sessions ──< coaching_messages
                       │  mode: write | retrospective  (같은 채팅 엔진, 모드당 툴 1개)
                       │  컨텍스트는 둘 다 전체 피드백 (회고는 sub_goal 스코프 아님)
                       │  write : 툴 `피드백 생성` → feedbacks 1건 생성
                       └─ retro : 툴 `회고`(피드백 수정) → internalized/done/다짐 갱신
```

- **하위 목표(sub_goal)** 가 피드백의 **category** 역할을 한다. 고정 분류 enum은 없다.
- **모든 피드백은 반드시 하나의 하위 목표에 속한다**(`sub_goal_id` NOT NULL). 미분류는 없다.
- **작성·회고는 같은 채팅 엔진**이며 컨텍스트는 둘 다 **전체 피드백**, 모드당 툴 1개([feature-spec.md] "코칭 채팅 구조").
- **하나의 작성(write) 세션**이 대화를 거쳐 툴 `피드백 생성`으로 **하나의 피드백**이 된다.
- 피드백은 여러 **Takeaway**(실천항목)를 가지며 각 항목의 실행(done)을 추적한다.
- **회고(retrospective) 세션**은 **전체 피드백을 컨텍스트**로 되짚어(하위목표 스코프 아님) 툴 `회고`로 `internalized`/Takeaway `done`/다짐 텍스트를 갱신한다(새 피드백 생성은 범위 밖).

---

## 2. 테이블 정의

### profiles
사용자 프로필. `auth.users`(Supabase Auth)와 1:1.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | = `auth.users.id` |
| `display_name` | text | |
| `is_premium` | boolean | 구독 여부 (기본 false, 구독은 v1.1) |
| `created_at` | timestamptz | |

### goals — 최종 목표
사용자의 커리어 최종 목표. **MVP는 1인 1개**(스키마는 다중 허용, 앱에서 제약).

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK→profiles) | |
| `title` | text | 예: "Product Owner 달성" |
| `description` | text | nullable |
| `is_active` | boolean | MVP에선 활성 1개 |
| `created_at` | timestamptz | |

### sub_goals — 하위 목표 (= category)
최종 목표를 구성하는 영역. 피드백의 분류 축으로 쓰인다. **AI 추천 + 직접 추가**.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `goal_id` | uuid (FK→goals) | |
| `name` | text | 예: collaborating, engineering, product planning |
| `source` | text (enum) | `ai_suggested \| user_added` |
| `sort_order` | int | 표시 순서 (기본 0) |
| `created_at` | timestamptz | |

### feedbacks
회고 1건 = Canonical Template 1건. 코칭 세션의 결과물 또는 직접 생성.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK→profiles) | |
| `session_id` | uuid (FK→coaching_sessions) | nullable (직접 생성 시 null) |
| `title` | text | 템플릿 `# {title}` |
| `situation` | text | 템플릿 `## Feedback` (상황 설명) |
| `root_cause` | text | 템플릿 `## Root cause` |
| `sub_goal_id` | uuid (FK→sub_goals) | **category. NOT NULL** — 반드시 하나의 하위목표 |
| `importance` | text (enum) | `high \| mid \| low` |
| `tags` | text[] | 자유 태그 |
| `internalized` | boolean | **내재화 여부** (기본 false) |
| `internalized_at` | timestamptz | nullable |
| `created_at` | timestamptz | 템플릿 `created_at` |

### takeaways
피드백의 실천항목(미래 행동/마음가짐). **개별 실행(done) 추적**.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `feedback_id` | uuid (FK→feedbacks) | |
| `text` | text | 템플릿 `## Takeaways` 항목 |
| `done` | boolean | 실행 완료 (기본 false) |
| `done_at` | timestamptz | nullable |
| `sort_order` | int | 표시 순서 (기본 0) |
| `created_at` | timestamptz | |

### coaching_sessions
AI 대화 세션. **작성/회고 모드** 구분.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK→profiles) | |
| `mode` | text (enum) | `write \| retrospective` |
| `sub_goal_id` | uuid (FK→sub_goals) | nullable. (구 스코프 필드) 회고는 더 이상 하위목표로 스코프하지 않아 보통 null — "영역 통째" 카드 진입 시 참고용으로만 채울 수 있음 |
| `status` | text (enum) | `active \| completed \| abandoned` |
| `created_at` | timestamptz | |
| `completed_at` | timestamptz | nullable |

### coaching_messages
세션 내 메시지(사용자/AI). 프롬프트 컨텍스트 구성에 사용.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `session_id` | uuid (FK→coaching_sessions) | |
| `role` | text (enum) | `user \| assistant` |
| `content` | text | |
| `created_at` | timestamptz | |

> 회고는 sub_goal로 스코프하지 않고 **전체 피드백을 대상**으로 한다(컨텍스트에 전부 주입). 한 세션이 실제로 어떤 피드백의 상태를 바꿨는지 감사 추적이 필요하면 `retrospective_targets(session_id, feedback_id)` 조인 테이블을 추가한다(MVP 필요 시).

---

## 3. 핵심 enum 값

- **category**: 고정 enum 없음 — 사용자의 `sub_goals` 중 **하나(필수)**(`feedbacks.sub_goal_id`, NOT NULL).
- **importance**: `high` · `mid` · `low`
- **sub_goals.source**: `ai_suggested` · `user_added`
- **session.mode**: `write` · `retrospective`
- **session.status**: `active` · `completed` · `abandoned`
- **message.role**: `user` · `assistant`

---

## 4. 상태 전이

**Feedback 내재화**
```
created (internalized=false)
   │  사용자가 "내재화 완료" 표시 (수동; 회고에서 갱신 유도)
   ▼
internalized=true, internalized_at=now()
```
> ⚠️ 내재화 판정을 *수동*으로 둘지 *모든 takeaway done 시 자동*으로 둘지 미확정([feature-spec.md] F7). 현재 스키마는 둘 다 지원(수동 boolean + 항목 done).

**Takeaway**
```
done=false  ──(실행)──▶  done=true, done_at=now()
```

**Coaching Session**
```
active ──(write 완료)──────────▶ completed  (feedback 1건 생성, sub_goal 배정)
active ──(retrospective 완료)──▶ completed  (전체 피드백 중 대상 피드백 internalized/done/다짐 갱신)
   └──(이탈)────────────────────▶ abandoned
```

---

## 5. 파생 지표 (대시보드)

- **내재화율** = 내재화 피드백 / 전체 피드백 〔PRD §8〕 — 하위목표별로도 산출.
- **Takeaway 실행률** = done 항목 / 전체 takeaways 〔PRD §8〕
- **하위 목표(category)별** 피드백 분포 — 목표 영역 쏠림
- importance별 분포, 시간 추이(작성/내재화), 태그 빈도

---

## 6. 보안 (RLS) — 필수

**모든 사용자 데이터 테이블에 Row Level Security 활성화.** 기본 정책: `user_id = auth.uid()` 인 행만 select/insert/update/delete.

- 자식 테이블(`sub_goals`, `takeaways`, `coaching_messages`)은 부모를 통해 소유권 확인(부모의 `user_id = auth.uid()`를 EXISTS로).
- 마이그레이션 작성 시 RLS 정책을 **테이블과 같은 커밋**에 포함하세요. → `supabase-migration` 스킬이 강제합니다.
- 위협 모델 상세는 `threat-model.md`(예정) 참조.
