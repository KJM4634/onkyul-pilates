import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "../actions";
import { LoginForm } from "../_components/client";

export const metadata: Metadata = { title: "로그인" };

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl">온결 필라테스</p>
          <p className="mt-1 text-sm text-ink-soft">관리자 로그인</p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <LoginForm action={signIn} />
        </div>
        <p className="mt-6 text-center text-xs text-ink-soft">
          관리자 계정은 운영자가 별도로 등록합니다.
          <br />
          <Link href="/" className="underline underline-offset-2">
            사이트로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
