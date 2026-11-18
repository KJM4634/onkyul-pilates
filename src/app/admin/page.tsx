import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { addDaysToKey, parseDateKey, seoulDateKey, seoulMidnightIso, seoulTime } from "@/lib/datetime";
import { AdminShell, AdminSkeleton } from "./_components/AdminShell";

export const metadata: Metadata = { title: "대시보드" };

type Row = {
  id: string;
  title: string;
  instructor: string;
  start_at: string;
  duration_min: number;
  capacity: number;
  is_cancelled: boolean;
  bookings: { status: string }[];
};

export default function AdminPage(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const admin = await requireAdmin();
  await connection(); // 아래에서 현재 시각을 쓰므로 요청 시점에만 렌더링
  await admin.supabase.rpc("ensure_demo_sessions"); // 데모 일정 유지 (실패해도 목록 조회는 계속)
  const view = (await searchParams).view === "past" ? "past" : "upcoming";

  const todayKey = seoulDateKey(new Date());
  const todayStart = seoulMidnightIso(todayKey);

  let query = admin.supabase
    .from("class_sessions")
    .select("id,title,instructor,start_at,duration_min,capacity,is_cancelled,bookings(status)");
  query =
    view === "upcoming"
      ? query
          .gte("start_at", todayStart)
          .lt("start_at", seoulMidnightIso(addDaysToKey(todayKey, 21)))
          .order("start_at")
      : query
          .gte("start_at", seoulMidnightIso(addDaysToKey(todayKey, -14)))
          .lt("start_at", todayStart)
          .order("start_at", { ascending: false });

  const { data, error } = await query;
  const rows = ((data ?? []) as Row[]).map((r) => ({
    ...r,
    booked: r.bookings.filter((b) => b.status === "confirmed").length,
  }));

  // 통계
  const weekEnd = seoulMidnightIso(addDaysToKey(todayKey, 7));
  const active = rows.filter((r) => !r.is_cancelled);
  const today = active.filter((r) => seoulDateKey(r.start_at) === todayKey);
  const stats =
    view === "upcoming"
      ? [
          { label: "오늘 수업", value: today.length, unit: "개" },
          { label: "오늘 예약자", value: today.reduce((a, r) => a + r.booked, 0), unit: "명" },
          {
            label: "7일간 예약",
            value: active.filter((r) => r.start_at < weekEnd).reduce((a, r) => a + r.booked, 0),
            unit: "건",
          },
          { label: "마감 수업", value: active.filter((r) => r.booked >= r.capacity).length, unit: "개" },
        ]
      : null;

  // 날짜별 그룹
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = seoulDateKey(r.start_at);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }

  return (
    <AdminShell email={admin.email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">수업 · 예약 현황</h1>
          <p className="mt-1 text-sm text-ink-soft">수업을 눌러 예약자 명단을 확인하고 관리하세요.</p>
        </div>
        <Link
          href="/admin/sessions/new"
          className="flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-medium text-cream hover:bg-sage-deep"
        >
          + 수업 등록
        </Link>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs text-ink-soft">{s.label}</p>
              <p className="mt-1 text-2xl font-medium tabular-nums">
                {s.value}
                <span className="ml-0.5 text-sm font-normal text-ink-soft">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 inline-flex rounded-xl bg-white p-1 text-sm shadow-sm">
        <Link
          href="/admin"
          className={`rounded-lg px-4 py-1.5 ${view === "upcoming" ? "bg-ink text-cream" : "text-ink-soft"}`}
        >
          예정 (3주)
        </Link>
        <Link
          href="/admin?view=past"
          className={`rounded-lg px-4 py-1.5 ${view === "past" ? "bg-ink text-cream" : "text-ink-soft"}`}
        >
          지난 수업 (3일 보관)
        </Link>
      </div>

      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">목록을 불러오지 못했어요.</p>}

      {rows.length === 0 && !error && (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center text-sm text-ink-soft">
          해당 기간에 수업이 없어요.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {[...groups.entries()].map(([key, list]) => {
          const { month, day, weekday } = parseDateKey(key);
          return (
            <section key={key}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
                {month}월 {day}일 ({weekday})
                {key === todayKey && (
                  <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] text-white">오늘</span>
                )}
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                {list.map((r) => {
                  const full = r.booked >= r.capacity;
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/admin/sessions/${r.id}`}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/60 ${r.is_cancelled ? "opacity-50" : ""}`}
                      >
                        <span className="w-12 shrink-0 font-medium tabular-nums">{seoulTime(r.start_at)}</span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-medium ${r.is_cancelled ? "line-through" : ""}`}
                          >
                            {r.title}
                          </span>
                          <span className="block text-xs text-ink-soft">{r.instructor}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          {r.is_cancelled ? (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">수업 취소</span>
                          ) : (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                                full
                                  ? "bg-ink text-cream"
                                  : r.booked > 0
                                    ? "bg-sage-soft text-sage-deep"
                                    : "bg-cream-deep text-ink-soft"
                              }`}
                            >
                              {r.booked}/{r.capacity}
                              {full && " 마감"}
                            </span>
                          )}
                          <span className="h-1 w-16 overflow-hidden rounded-full bg-cream-deep" aria-hidden>
                            <span
                              className={`block h-full ${full ? "bg-ink" : "bg-sage"}`}
                              style={{ width: `${Math.min(100, (r.booked / r.capacity) * 100)}%` }}
                            />
                          </span>
                        </span>
                        <span aria-hidden className="text-ink-soft">
                          ›
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
