# Loop — 데이터 모델

작성일: 2026-05-31 · 상태: Draft v0.1
관련: [PRD-draft.md](PRD-draft.md) · [ai-coaching-spec.md](ai-coaching-spec.md) · [../CLAUDE.md](../CLAUDE.md)

> 모든 코드 작업의 공통 기반. 새 엔티티/필드를 추가하기 전에 이 문서를 먼저 갱신하세요.
> DB는 snake_case, 앱(TypeScript)은 camelCase로 매핑합니다.

---

## 1. 엔티티 한눈에

```
profiles (1) ──< goals (1, MVP) ──< competencies
                                         │
profiles (1) ──< feedbacks ──< action_items
                     │
                     └──< feedback_competencies >── competencies   (다대다)

profiles (1) ──< coaching_sessions ──< coaching_messages
                       │
                       └── (완료 시) feedbacks 1건 생성
```

- **하나의 코칭 세션**이 대화를 거쳐 **하나의 피드백**으로 귀결됩니다.
- 피드백은 여러 **실천항목(action_items)** 을 가지며, 목표의 여러 **역량(competencies)** 에 연결될 수 있습니다.

---

## 2. 테이블 정의

### profiles
사용자 프로필. `auth.users`(Supabase Auth)와 1:1.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | = `auth.users.id` |
| `display_name` | text | |
| `is_premium` | boolean | 구독 여부 (기본 false) |
| `created_at` | timestamptz | |

### goals
사용자의 커리어 목표. **MVP는 1인 1개** (스키마는 다중 허용, 앱에서 제약).

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK→profiles) | |
| `title` | text | 예: "Product Owner 되기" |
| `description` | text | nullable |
| `is_active` | boolean | MVP에선 활성 1개 |
| `created_at` | timestamptz | |

### competencies
목표 하위 역량. 피드백이 어느 역량에 닿는지 연결 대상.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `goal_id` | uuid (FK→goals) | |
| `name` | text | 예: "이해관계자 커뮤니케이션" |
| `created_at` | timestamptz | |

### feedbacks
회고 1건. 코칭 세션의 결과물이자 통계의 단위.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK→profiles) | |
| `session_id` | uuid (FK→coaching_sessions) | nullable (수동 작성 대비) |
| `summary` | text | 상황 한 줄 요약 |
| `body` | text | 사용자가 입력한 원문 |
| `root_cause` | text | AI가 대화로 도출한 근본 원인 |
| `category` | text (enum) | 아래 6번 참조 |
| `importance` | text (enum) | `low \| medium \| high` |
| `tags` | text[] | 자유 태그 |
| `internalized` | boolean | **내재화 여부** (기본 false) |
| `internalized_at` | timestamptz | nullable |
| `created_at` | timestamptz | |

### action_items
피드백에서 도출된 구체적 실천항목. 실행 시 완료 처리.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `feedback_id` | uuid (FK→feedbacks) | |
| `text` | text | 실천 내용 |
| `done` | boolean | 실행 완료 여부 (기본 false) |
| `done_at` | timestamptz | nullable |
| `created_at` | timestamptz | |

### feedback_competencies
피드백 ↔ 역량 다대다 연결.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `feedback_id` | uuid (FK→feedbacks) | PK 복합 |
| `competency_id` | uuid (FK→competencies) | PK 복합 |

### coaching_sessions
AI 코칭 대화 세션.

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK→profiles) | |
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

---

## 3. 핵심 enum 값

- **category**: `collaborating` · `communication` · `execution` · `learning` · `leadership` · `wellbeing`
  - 확정 전 초안. 변경 시 [ai-coaching-spec.md](ai-coaching-spec.md)의 출력 스키마와 **동시에** 맞추세요.
- **importance**: `low` · `medium` · `high`
- **session.status**: `active` · `completed` · `abandoned`

---

## 4. 상태 전이

**Feedback 내재화**
```
created (internalized=false)
   │  사용자가 실천항목을 실행하고 "내재화 완료" 표시
   ▼
internalized=true, internalized_at=now()
```
- 내재화율(핵심 지표) = `count(internalized=true) / count(*)`.

**Action Item**
```
done=false  ──(실행)──▶  done=true, done_at=now()
```

**Coaching Session**
```
active ──(피드백 저장)──▶ completed (feedback 1건 생성)
   └────(이탈)──────────▶ abandoned
```

---

## 5. 파생 지표 (대시보드)

- **내재화율** = 내재화 피드백 / 전체 피드백
- **실천항목 실행률** = done 항목 / 전체 action_items
- 카테고리별·중요도별 분포, 시간 추이, 태그 빈도
- 역량별 피드백 누적(목표 정렬 진척)

---

## 6. 보안 (RLS) — 필수

**모든 사용자 데이터 테이블에 Row Level Security 활성화.** 기본 정책: `user_id = auth.uid()` 인 행만 select/insert/update/delete.

- 자식 테이블(`action_items`, `competencies`, `coaching_messages`, `feedback_competencies`)은 부모를 통해 소유권 확인(부모의 `user_id = auth.uid()`).
- 마이그레이션 작성 시 RLS 정책을 **테이블과 같은 커밋**에 포함하세요. → `supabase-migration` 스킬이 강제합니다.
- 위협 모델 상세는 `threat-model.md`(예정) 참조.
