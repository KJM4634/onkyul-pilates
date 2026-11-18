-- =====================================================================
-- 온결 필라테스: 예약 기능 스키마
-- 테이블 3개 + RLS + 예약 생성 RPC + 남은 자리 조회 함수
-- Supabase SQL Editor에서 이 파일 전체를 한 번에 실행하세요.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 테이블
-- ---------------------------------------------------------------------

create table public.class_sessions (
  id           uuid primary key default gen_random_uuid(),
  title        text        not null check (char_length(title) between 1 and 50),
  instructor   text        not null check (char_length(instructor) between 1 and 20),
  start_at     timestamptz not null,
  duration_min integer     not null check (duration_min between 10 and 240),
  capacity     integer     not null check (capacity between 1 and 30),
  is_cancelled boolean     not null default false,
  created_at   timestamptz not null default now()
);

create index class_sessions_start_at_idx on public.class_sessions (start_at);

create table public.bookings (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid        not null references public.class_sessions (id) on delete cascade,
  name       text        not null check (char_length(name) between 1 and 20),
  phone      text        not null check (phone ~ '^01[016789][0-9]{7,8}$'),  -- 숫자만 저장
  status     text        not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  agreed_at  timestamptz not null,  -- 개인정보 수집·이용 동의 시각 (동의 증빙)
  created_at timestamptz not null default now()
);

create index bookings_session_id_idx on public.bookings (session_id);

-- 같은 수업에 같은 연락처로 중복 확정 예약 방지 (취소된 예약은 제외)
create unique index bookings_one_per_phone_idx
  on public.bookings (session_id, phone)
  where status = 'confirmed';

-- 연락처별 예약 수 확인용 (도배 방지 체크)
create index bookings_phone_idx on public.bookings (phone) where status = 'confirmed';

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. 관리자 판별 함수
--    security definer: admins 테이블 RLS를 우회해 자기 자신을 조회 (정책 재귀 방지)
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 3. RLS
--    정책이 하나도 없는 동작(역할 × 명령)은 기본적으로 모두 거부됩니다.
-- ---------------------------------------------------------------------

alter table public.class_sessions enable row level security;
alter table public.bookings       enable row level security;
alter table public.admins         enable row level security;

-- [class_sessions]
-- 누구나 수업 일정 조회 가능. (막는 것: 없음 — 대신 아래 정책이 없는 쓰기는 전부 차단)
create policy "class_sessions: 누구나 조회"
  on public.class_sessions for select
  to anon, authenticated
  using (true);

-- 관리자만 수업 등록. 막는 것: 비로그인·일반 로그인 사용자가 가짜 수업을 만드는 것
create policy "class_sessions: 관리자만 등록"
  on public.class_sessions for insert
  to authenticated
  with check (public.is_admin());

-- 관리자만 수업 수정·취소. 막는 것: 외부인이 정원·시간을 바꾸거나 수업을 취소시키는 것
create policy "class_sessions: 관리자만 수정"
  on public.class_sessions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 관리자만 수업 삭제. 막는 것: 외부인이 수업(과 연결된 예약)을 지우는 것
create policy "class_sessions: 관리자만 삭제"
  on public.class_sessions for delete
  to authenticated
  using (public.is_admin());

-- [bookings]
-- insert 정책 없음 → 테이블에 직접 insert 불가. 예약은 오직 create_booking() RPC로만 생성.
--   막는 것: 정원 체크·입력 검증을 건너뛴 직접 insert

-- 관리자만 예약자 명단 조회. 막는 것: 비로그인·일반 사용자가 남의 이름·연락처를 읽는 것
create policy "bookings: 관리자만 조회"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

-- 관리자만 예약 상태 변경(취소 처리). 막는 것: 외부인이 남의 예약을 취소·변조하는 것
create policy "bookings: 관리자만 수정"
  on public.bookings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- delete 정책 없음 → 예약 기록은 삭제하지 않고 status='cancelled'로만 처리.
--   막는 것: 관리자 포함 누구든 API로 예약 기록을 지워 흔적을 없애는 것

-- [admins]
-- 로그인 사용자는 "내가 관리자인지"만 확인 가능. 막는 것: 관리자 목록(다른 user_id) 열람
create policy "admins: 본인 행만 조회"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- insert/update/delete 정책 없음 → API로 관리자 추가 불가, SQL Editor(대시보드)에서만 추가.
--   막는 것: 일반 사용자가 스스로 admins에 자기 자신을 넣어 권한 상승하는 것

-- 방어 심화: 비로그인 역할은 bookings/admins 테이블 권한 자체를 회수 (RLS가 실수로 풀려도 차단)
revoke all on public.bookings from anon;
revoke all on public.admins   from anon;

-- ---------------------------------------------------------------------
-- 4. 예약 생성 RPC (예약을 만드는 유일한 경로)
--    - security definer: bookings에 insert 정책이 없어도 함수 내부에서만 insert 가능
--    - 수업 행을 FOR UPDATE로 잠가 같은 수업에 대한 동시 예약을 한 줄로 세움
--      → 잠금 → 확정 예약 수 세기 → insert 가 한 트랜잭션 안에서 끝나므로 정원 초과 불가
--    - 실패 시 예외 메시지(코드)를 프론트에서 한국어 안내로 변환
-- ---------------------------------------------------------------------

create or replace function public.create_booking(
  p_session_id uuid,
  p_name       text,
  p_phone      text,
  p_agreed     boolean
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_name       text := btrim(coalesce(p_name, ''));
  v_phone      text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_session    public.class_sessions%rowtype;
  v_confirmed  integer;
  v_active     integer;
  v_booking_id uuid;
begin
  -- 입력 검증 (프론트/서버 액션과 별개로 DB에서 한 번 더)
  if p_agreed is not true then
    raise exception 'CONSENT_REQUIRED';
  end if;
  if char_length(v_name) not between 1 and 20 then
    raise exception 'INVALID_NAME';
  end if;
  if v_phone !~ '^01[016789][0-9]{7,8}$' then
    raise exception 'INVALID_PHONE';
  end if;

  -- 도배 방지: 같은 연락처로 잡을 수 있는 앞으로의 확정 예약은 최대 4건
  --   (anon 키로 RPC를 반복 호출해 가짜 예약으로 정원을 채우는 공격 완화)
  select count(*) into v_active
  from public.bookings b
  join public.class_sessions s on s.id = b.session_id
  where b.phone = v_phone and b.status = 'confirmed' and s.start_at > now();

  if v_active >= 4 then
    raise exception 'TOO_MANY_BOOKINGS';
  end if;

  -- 수업 행 잠금: 같은 수업을 예약하려는 다른 트랜잭션은 여기서 대기
  select * into v_session
  from public.class_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'SESSION_NOT_FOUND';
  end if;
  if v_session.is_cancelled or v_session.start_at <= now() then
    raise exception 'SESSION_CLOSED';
  end if;

  select count(*) into v_confirmed
  from public.bookings
  where session_id = p_session_id and status = 'confirmed';

  if v_confirmed >= v_session.capacity then
    raise exception 'SESSION_FULL';
  end if;

  begin
    insert into public.bookings (session_id, name, phone, agreed_at)
    values (p_session_id, v_name, v_phone, now())
    returning id into v_booking_id;
  exception when unique_violation then
    raise exception 'ALREADY_BOOKED';
  end;

  return v_booking_id;
end;
$$;

revoke all on function public.create_booking(uuid, text, text, boolean) from public;
grant execute on function public.create_booking(uuid, text, text, boolean) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. 남은 자리 조회 함수 (개인정보 없이 숫자만 반환)
--    security definer로 bookings를 세기만 하고, 이름·연락처는 반환하지 않음
--    조회 기간은 최대 31일로 제한
-- ---------------------------------------------------------------------

create or replace function public.get_session_availability(
  p_from timestamptz,
  p_to   timestamptz
)
returns table (
  id           uuid,
  title        text,
  instructor   text,
  start_at     timestamptz,
  duration_min integer,
  capacity     integer,
  remaining    integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    s.title,
    s.instructor,
    s.start_at,
    s.duration_min,
    s.capacity,
    greatest(s.capacity - count(b.id)::integer, 0) as remaining
  from public.class_sessions s
  left join public.bookings b
    on b.session_id = s.id and b.status = 'confirmed'
  where s.is_cancelled = false
    and s.start_at >= p_from
    and s.start_at <  least(p_to, p_from + interval '31 days')
  group by s.id
  order by s.start_at;
$$;

revoke all on function public.get_session_availability(timestamptz, timestamptz) from public;
grant execute on function public.get_session_availability(timestamptz, timestamptz) to anon, authenticated;
