import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { formatSessionDate, seoulDateKey, seoulTime } from "@/lib/datetime";
import { formatPhone, UUID_RE } from "@/lib/validation";
import { cancelBooking, setSessionCancelled, updateSession } from "../../actions";
import { AdminShell, AdminSkeleton } from "../../_components/AdminShell";
import { ConfirmSubmit, CopyRoster, SessionForm } from "../../_components/client";

export const metadata: Metadata = { title: "수업 상세" };

type Booking = { id: string; name: string; phone: string; status: string; created_at: string };

export default function SessionDetailPage(props: PageProps<"/admin/sessions/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Detail params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Detail({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/sessions/[id]">["params"];
  searchParams: PageProps<"/admin/sessions/[id]">["searchParams"];
}) {
  const admin = await requireAdmin();
  await connection(); // 지난 수업 판별에 현재 시각 사용
  const { id } = await params;
  const saved = (await searchParams).saved === "1";
  if (!UUID_RE.test(id)) notFound();

  const [{ data: session }, { data: bookingRows }] = await Promise.all([
    admin.supabase
      .from("class_sessions")
      .select("id,title,instructor,start_at,duration_min,capacity,is_cancelled")
      .eq("id", id)
      .maybeSingle(),
    admin.supabase.from("bookings").select("id,name,phone,status,created_at").eq("session_id", id).order("created_at"),
  ]);
  if (!session) notFound();

  const bookings = (bookingRows ?? []) as Booking[];
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const isPast = new Date(session.start_at) < new Date();
  const roster = [
    `${session.title} · ${formatSessionDate(session.start_at)} · ${session.instructor}`,
    ...confirmed.map((b, i) => `${i + 1}. ${b.name} ${formatPhone(b.phone)}`),
  ].join("\n");

  return (
    <AdminShell email={admin.email}>
      <Link href="/admin" className="text-sm text-ink-soft hover:text-ink">
        ← 목록으로
      </Link>

      {saved && (
        <p role="status" className="mt-4 rounded-xl bg-sage-soft px-4 py-3 text-sm text-sage-deep">
          ✓ 수업이 등록되었어요.
        </p>
      )}

      {/* 수업 요약 */}
      <div className="mt-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={`font-serif text-2xl ${session.is_cancelled ? "line-through opacity-60" : ""}`}>
                {session.title}
              </h1>
              {session.is_cancelled && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">수업 취소됨</span>
              )}
              {isPast && (
                <span className="rounded-full bg-cream-deep px-2 py-0.5 text-xs text-ink-soft">지난 수업</span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {formatSessionDate(session.start_at)} · {session.duration_min}분 · {session.instructor}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-medium tabular-nums">
              {confirmed.length}
              <span className="text-base text-ink-soft">/{session.capacity}</span>
            </p>
            <p className="text-xs text-ink-soft">확정 예약</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream-deep" aria-hidden>
          <div
            className={`h-full rounded-full ${confirmed.length >= session.capacity ? "bg-ink" : "bg-sage"}`}
            style={{ width: `${Math.min(100, (confirmed.length / session.capacity) * 100)}%` }}
          />
        </div>
      </div>

      {/* 예약자 명단 */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">예약자 명단</h2>
          {confirmed.length > 0 && <CopyRoster text={roster} />}
        </div>
        {confirmed.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center text-sm text-ink-soft">
            아직 예약자가 없어요.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {confirmed.map((b, i) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-soft text-xs font-medium text-sage-deep">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{b.name}</p>
                  <a href={`tel:${b.phone}`} className="text-sm text-ink-soft tabular-nums hover:text-sage-deep">
                    {formatPhone(b.phone)}
                  </a>
                </div>
                <span className="hidden text-xs text-ink-soft sm:block">
                  {seoulDateKey(b.created_at).slice(5).replace("-", "/")} {seoulTime(b.created_at)} 예약
                </span>
                <form action={cancelBooking}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <ConfirmSubmit
                    message={`${b.name}님의 예약을 취소할까요? 취소하면 자리가 다시 열립니다.`}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    예약 취소
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}

        {cancelled.length > 0 && (
          <details className="mt-3 rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm">
            <summary className="cursor-pointer text-ink-soft">취소된 예약 {cancelled.length}건</summary>
            <ul className="mt-2 space-y-1 text-ink-soft">
              {cancelled.map((b) => (
                <li key={b.id} className="line-through">
                  {b.name} · {formatPhone(b.phone)}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* 수업 수정 */}
      <section className="mt-10 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-medium">수업 정보 수정</h2>
        <SessionForm
          action={updateSession}
          submitLabel="변경 사항 저장"
          defaults={{
            id: session.id,
            title: session.title,
            instructor: session.instructor,
            date: seoulDateKey(session.start_at),
            time: seoulTime(session.start_at),
            duration_min: session.duration_min,
            capacity: session.capacity,
          }}
        />
      </section>

      {/* 수업 취소/복구 */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50/40 p-5 sm:p-6">
        <div>
          <h2 className="font-medium">{session.is_cancelled ? "수업 복구" : "수업 취소"}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {session.is_cancelled
              ? "다시 시간표에 노출하고 예약을 받습니다."
              : "시간표에서 숨기고 새 예약을 막습니다. 기존 예약자에게는 별도로 연락해 주세요."}
          </p>
        </div>
        <form action={setSessionCancelled}>
          <input type="hidden" name="id" value={session.id} />
          <input type="hidden" name="cancelled" value={session.is_cancelled ? "false" : "true"} />
          <ConfirmSubmit
            message={
              session.is_cancelled
                ? "이 수업을 복구할까요?"
                : `이 수업을 취소할까요? 예약자 ${confirmed.length}명에게 따로 안내가 필요해요.`
            }
            className={`h-10 rounded-xl px-4 text-sm font-medium ${
              session.is_cancelled ? "bg-ink text-cream" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {session.is_cancelled ? "수업 복구" : "수업 취소"}
          </ConfirmSubmit>
        </form>
      </section>
    </AdminShell>
  );
}
