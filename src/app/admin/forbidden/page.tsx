import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { checkAdmin } from "@/lib/auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "접근 권한 없음" };

export default function ForbiddenPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 text-center">
      <div className="max-w-sm">
        <p className="text-4xl" aria-hidden>
          🔒
        </p>
        <h1 className="mt-4 font-serif text-2xl">접근 권한이 없어요</h1>
        <Suspense fallback={<p className="mt-2 text-sm text-ink-soft">확인 중…</p>}>
          <Detail />
        </Suspense>
        <form action={signOut} className="mt-6">
          <button type="submit" className="h-11 rounded-xl bg-ink px-6 text-sm text-cream">
            다른 계정으로 로그인
          </button>
        </form>
      </div>
    </main>
  );
}

async function Detail() {
  const check = await checkAdmin();
  if (check.status === "admin") redirect("/admin");
  if (check.status === "db-error") {
    return (
      <p className="mt-2 text-sm text-ink-soft">
        {check.email} 계정의 관리자 권한을 확인하는 중 DB 오류가 발생했어요 (코드 {check.code}). 테이블 권한 설정을
        확인해 주세요.
      </p>
    );
  }
  if (check.status !== "forbidden") redirect("/admin/login");
  return <p className="mt-2 text-sm text-ink-soft">{check.email} 계정은 관리자로 등록되어 있지 않아요.</p>;
}
