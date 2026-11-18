import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { INSTRUCTORS } from "@/data/instructors";
import { requireAdmin } from "@/lib/auth";
import { addDaysToKey, seoulDateKey } from "@/lib/datetime";
import { createSession } from "../../actions";
import { AdminShell, AdminSkeleton } from "../../_components/AdminShell";
import { SessionForm } from "../../_components/client";

export const metadata: Metadata = { title: "수업 등록" };

export default function NewSessionPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewSession />
    </Suspense>
  );
}

async function NewSession() {
  const admin = await requireAdmin();
  await connection();
  const tomorrow = addDaysToKey(seoulDateKey(new Date()), 1);

  return (
    <AdminShell email={admin.email}>
      <Link href="/admin" className="text-sm text-ink-soft hover:text-ink">
        ← 목록으로
      </Link>
      <h1 className="mt-4 font-serif text-2xl">새 수업 등록</h1>
      <p className="mt-1 text-sm text-ink-soft">등록하면 예약 페이지 시간표에 바로 표시됩니다.</p>
      <div className="mt-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <SessionForm
          action={createSession}
          submitLabel="수업 등록"
          defaults={{
            title: "",
            instructor: INSTRUCTORS[0].name,
            date: tomorrow,
            time: "19:00",
            duration_min: 50,
            capacity: 6,
          }}
        />
      </div>
    </AdminShell>
  );
}
