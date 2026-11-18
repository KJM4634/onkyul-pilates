import Link from "next/link";
import { signOut } from "../actions";

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif">온결</span>
            <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-medium text-cream">ADMIN</span>
          </Link>
          <div className="flex items-center gap-1 text-sm sm:gap-3">
            <Link href="/" className="hidden rounded-lg px-2 py-1.5 text-ink-soft hover:bg-cream sm:block">
              사이트 보기 ↗
            </Link>
            {email && <span className="hidden max-w-40 truncate text-xs text-ink-soft md:block">{email}</span>}
            <form action={signOut}>
              <button type="submit" className="rounded-lg px-2 py-1.5 text-ink-soft hover:bg-cream hover:text-ink">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}

export function AdminSkeleton() {
  return (
    <>
      <div className="h-14 border-b border-line bg-white" />
      <main
        className="mx-auto w-full max-w-5xl flex-1 animate-pulse space-y-4 px-4 py-6 sm:px-6 sm:py-10"
        aria-busy="true"
      >
        <div className="h-8 w-48 rounded-lg bg-cream-deep" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-cream-deep" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-cream-deep" />
        ))}
      </main>
    </>
  );
}
