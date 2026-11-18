import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="text-xs tracking-[0.2em] text-sage-deep">404</p>
        <h1 className="mt-2 font-serif text-2xl">페이지를 찾을 수 없어요</h1>
        <Link href="/" className="mt-6 text-sm text-sage-deep underline underline-offset-4">
          홈으로 돌아가기
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
