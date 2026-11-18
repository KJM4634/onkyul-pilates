-- =====================================================================
-- 테이블 접근 권한(GRANT) 명시
--
-- Postgres는 [1] 테이블 GRANT 확인 → [2] RLS 정책 확인 순서로 검사합니다.
-- 새 테이블에 anon/authenticated 권한이 자동 부여되지 않는 프로젝트에서는
-- RLS 정책이 열려 있어도 [1]에서 "permission denied for table" 로 막힙니다.
-- 아래는 앱에 필요한 최소 권한만 부여하며, 실제 행 단위 접근은 기존 RLS 정책이 계속 제한합니다.
-- (service_role에는 일부러 부여하지 않음 — 앱은 publishable/anon 키만 사용)
-- =====================================================================

-- class_sessions: 누구나 조회 / 쓰기는 로그인 사용자에게 열되 RLS가 관리자만 허용
grant select on public.class_sessions to anon, authenticated;
grant insert, update, delete on public.class_sessions to authenticated;

-- bookings: 비로그인 권한 없음(기존 revoke 유지) / 로그인 사용자 조회·수정은 RLS가 관리자만 허용
--   insert·delete는 부여하지 않음 → 예약 생성은 RPC로만, 삭제는 보관기간 자동 파기로만
grant select, update on public.bookings to authenticated;

-- admins: 로그인 사용자 조회만 (RLS가 본인 행만 허용) → 로그인 시 관리자 여부 확인용
grant select on public.admins to authenticated;

-- demo_generated_days: 내부 관리용, 권한 부여 없음
