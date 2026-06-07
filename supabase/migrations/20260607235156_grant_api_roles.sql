-- API 롤(anon/authenticated) 테이블 권한 부여.
--
-- 배경: 최초 init 마이그레이션은 RLS와 정책만 정의하고 테이블 GRANT는
-- Supabase 기본 권한에 의존했다. 그러나 라이브 프로젝트에서 anon/authenticated
-- 롤에 SELECT/INSERT/UPDATE/DELETE 와 schema USAGE 가 빠져, RLS 평가 이전에
-- PostgREST 가 42501("permission denied for table ...")로 거부했다.
-- 그 결과 온보딩의 목표 저장 등 모든 클라이언트 읽기/쓰기가 실패했다.
-- (회원가입 시 프로필 생성은 SECURITY DEFINER 트리거라 권한과 무관하게 동작했음.)
--
-- 행 단위 보안은 기존 RLS 정책이 그대로 담당한다. 이 GRANT 는 테이블 레벨
-- 진입 권한만 부여하며, 사용자는 여전히 자기 행만 접근 가능하다.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;

-- 향후 추가되는 테이블에도 동일 권한이 자동 적용되도록 기본 권한 설정.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
