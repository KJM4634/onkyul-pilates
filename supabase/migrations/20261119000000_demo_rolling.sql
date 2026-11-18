-- =====================================================================
-- 온결 필라테스: 데모 시간표 자동 유지 + 지난 데이터 자동 파기
--   1) run_demo_maintenance(): 지난 데이터 삭제 + 앞으로 14일치 수업 생성
--   2) ensure_demo_sessions(): 조회 시점 안전장치 (14일치가 이미 있으면 즉시 종료)
--   3) pg_cron: 매일 03:00(KST)에 run_demo_maintenance() 실행
-- 20261118000000_booking.sql 실행 후, 이 파일 전체를 SQL Editor에서 실행하세요.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 생성 완료 날짜 기록
--    "그 날짜는 이미 만들었음"을 기록해, 관리자가 시간을 옮기거나 취소한 수업을
--    생성기가 다시 만들어 내지 않게 합니다.
-- ---------------------------------------------------------------------

create table if not exists public.demo_generated_days (
  day        date primary key,
  created_at timestamptz not null default now()
);

-- 내부 관리용 테이블: 정책 없음 + 권한 회수 → API로 조회·변경 불가
alter table public.demo_generated_days enable row level security;
revoke all on public.demo_generated_days from anon, authenticated;

-- 이미 seed.sql 등으로 수업이 있는 날짜는 생성된 것으로 표시 (중복 생성 방지)
insert into public.demo_generated_days (day)
select distinct (start_at at time zone 'Asia/Seoul')::date
from public.class_sessions
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 2. 유지 작업 본체 (cron 전용 — API로 호출 불가)
-- ---------------------------------------------------------------------

create or replace function public.run_demo_maintenance()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_day   date;
  v_slot  record;
  v_sid   uuid;
  v_idx   integer;
  v_fill  integer;
begin
  -- 동시에 여러 번 호출돼도 한 번에 하나만 실행 (cron + 방문자 동시 호출 대비)
  perform pg_advisory_xact_lock(hashtext('onkyul_demo_maintenance'));

  -- (1) 개인정보 파기: 수업 종료 3일 지난 수업 삭제 → 연결된 예약(이름·연락처)도 함께 삭제(cascade)
  delete from public.class_sessions
  where start_at + make_interval(mins => duration_min) < now() - interval '3 days';

  delete from public.demo_generated_days where day < v_today - 30;

  -- (2) 오늘부터 14일 중 아직 만들지 않은 날짜만 정규 시간표대로 생성
  for v_day in select (v_today + g)::date from generate_series(0, 13) as g loop
    continue when exists (select 1 from public.demo_generated_days where day = v_day);

    v_idx := 0;
    for v_slot in
      select s.*
      from (
        values
          -- isodow: 1=월 … 6=토 (일요일 휴무)
          (1, time '07:00', '모닝 리포머',     '한서윤', 6, 50),
          (1, time '10:00', '바른자세 리포머', '정지우', 6, 50),
          (1, time '19:00', '코어 리포머',     '한서윤', 6, 50),
          (1, time '20:10', '릴렉스 매트',     '윤하영', 6, 50),
          (2, time '07:00', '모닝 리포머',     '한서윤', 6, 50),
          (2, time '12:00', '런치 매트',       '윤하영', 6, 50),
          (2, time '19:00', '코어 리포머',     '정지우', 6, 50),
          (2, time '20:10', '릴렉스 매트',     '윤하영', 6, 50),
          (3, time '07:00', '모닝 리포머',     '한서윤', 6, 50),
          (3, time '10:00', '바른자세 리포머', '정지우', 6, 50),
          (3, time '19:00', '코어 리포머',     '한서윤', 6, 50),
          (3, time '20:10', '릴렉스 매트',     '윤하영', 6, 50),
          (4, time '07:00', '모닝 리포머',     '한서윤', 6, 50),
          (4, time '12:00', '런치 매트',       '윤하영', 6, 50),
          (4, time '19:00', '코어 리포머',     '정지우', 6, 50),
          (4, time '20:10', '릴렉스 매트',     '윤하영', 6, 50),
          (5, time '07:00', '모닝 리포머',     '한서윤', 6, 50),
          (5, time '10:00', '바른자세 리포머', '정지우', 6, 50),
          (5, time '19:00', '코어 리포머',     '한서윤', 6, 50),
          (6, time '10:00', '체험 수업',       '정지우', 4, 60),
          (6, time '11:10', '주말 리포머',     '한서윤', 6, 50),
          (6, time '13:00', '재활 리포머',     '정지우', 6, 50)
      ) as s(dow, t, title, instructor, capacity, duration)
      where s.dow = extract(isodow from v_day)
      order by s.t
    loop
      v_idx := v_idx + 1;

      insert into public.class_sessions (title, instructor, start_at, duration_min, capacity)
      values (v_slot.title, v_slot.instructor, (v_day + v_slot.t) at time zone 'Asia/Seoul', v_slot.duration, v_slot.capacity)
      returning id into v_sid;

      -- 데모용 가상 예약: 시간표에 '마감'·'마감 임박'이 항상 보이도록
      --   토요일 체험 수업·수요일 19시 = 마감, 그 외 19시 = 1자리 남음, 나머지 = 0~3명
      v_fill := case
        when v_slot.title = '체험 수업' then v_slot.capacity
        when v_slot.t = time '19:00' and extract(isodow from v_day) = 3 then v_slot.capacity
        when v_slot.t = time '19:00' then v_slot.capacity - 1
        else (extract(doy from v_day)::integer + v_idx) % 4
      end;

      insert into public.bookings (session_id, name, phone, agreed_at)
      select v_sid, '데모회원' || n, '0100000' || lpad(n::text, 4, '0'), now()
      from generate_series(1, v_fill) as n;
    end loop;

    insert into public.demo_generated_days (day) values (v_day);
  end loop;
end;
$$;

-- cron(postgres 권한)만 실행. 외부 API로는 호출 불가
revoke all on function public.run_demo_maintenance() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. 조회 시점 안전장치
--    시간표를 불러오기 직전에 호출. 14일째 날짜가 이미 있으면 바로 끝나므로 평소 비용은 조회 1번.
--    cron이 실행되지 않은 날(프로젝트 일시정지 후 재개 등)에만 실제 생성·정리가 일어남.
-- ---------------------------------------------------------------------

create or replace function public.ensure_demo_sessions()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.demo_generated_days
    where day = (now() at time zone 'Asia/Seoul')::date + 13
  ) then
    return;
  end if;
  perform public.run_demo_maintenance();
end;
$$;

revoke all on function public.ensure_demo_sessions() from public;
grant execute on function public.ensure_demo_sessions() to anon, authenticated;

-- 지금 바로 한 번 실행해 14일치를 채움
select public.run_demo_maintenance();

-- ---------------------------------------------------------------------
-- 4. pg_cron: 매일 18:00 UTC = 03:00 KST
--    (오류가 나면 Dashboard → Integrations → Cron 에서 확장을 켠 뒤 아래 두 줄만 다시 실행)
-- ---------------------------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'onkyul-demo-maintenance',          -- 같은 이름으로 다시 실행하면 기존 작업을 덮어씀
  '0 18 * * *',
  $$select public.run_demo_maintenance()$$
);
