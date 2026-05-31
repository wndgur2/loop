---
name: supabase-migration
description: Loop 프로젝트의 Supabase 마이그레이션을 작성한다. 테이블/컬럼 추가·변경 시 RLS 정책을 같은 마이그레이션에 강제 포함해 권한 누락을 막는다. "마이그레이션 추가", "테이블 만들기", "스키마 변경", "RLS" 요청 시 사용.
---

# Supabase 마이그레이션 작성

Loop는 민감한 자기성찰 데이터를 다루고 공개 저장소다. **RLS 누락이 가장 위험한 보안 실수**이므로, 이 스킬은 테이블 생성과 RLS 정책을 분리할 수 없게 묶는다.

## 사전 확인
1. [documents/data-model.md](../../../documents/data-model.md)를 읽고 엔티티·enum·소유권 관계를 확인한다. 스키마가 이 문서와 어긋나면 **문서를 먼저 갱신**한다.
2. 변경이 새 enum 값을 요구하면 data-model.md의 3절과 [ai-coaching-spec.md](../../../documents/ai-coaching-spec.md) 출력 스키마를 함께 맞춘다.

## 절차
1. `supabase/migrations/<timestamp>_<설명>.sql` 파일을 만든다.
2. 사용자 데이터 테이블이면 **반드시 같은 파일에**:
   - `alter table <t> enable row level security;`
   - select/insert/update/delete 정책. 기본: `user_id = auth.uid()`.
   - 자식 테이블은 부모를 통해 소유권 확인 (부모의 `user_id = auth.uid()`를 EXISTS 서브쿼리로).
3. FK·인덱스·기본값·`created_at default now()`를 빠뜨리지 않는다.
4. 가능하면 `supabase db reset` 또는 `supabase migration up`으로 로컬 적용을 검증한다.

## 체크리스트 (완료 전 self-check)
- [ ] 새/변경 테이블 모두 RLS 활성화됐다
- [ ] 4개 작업(select/insert/update/delete) 정책이 빠짐없이 있다
- [ ] 자식 테이블 소유권이 부모를 통해 검증된다
- [ ] enum 값이 data-model.md와 일치한다
- [ ] 비밀값/실데이터가 SQL에 하드코딩되지 않았다

## 안티패턴 (하지 말 것)
- RLS 없이 테이블만 만들고 "나중에 추가" — ❌ 절대.
- `using (true)` 같은 전체 허용 정책 — ❌.
- 클라이언트 신뢰(권한 체크를 앱에만 두기) — ❌. DB가 최종 방어선.

> 보안 원칙: [CLAUDE.md](../../../CLAUDE.md) 6절.
