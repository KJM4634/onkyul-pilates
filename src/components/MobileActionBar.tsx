"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/data/site";

/** 모바일 하단 고정 바: 전화 · 오시는 길 · 예약 (예약 페이지에서는 숨김) */
export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/booking")) return null;

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden />
      <nav
        aria-label="빠른 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        <div className="flex items-center gap-2">
          <a
            href={`tel:${SITE.phone.replace(/-/g, "")}`}
            className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-white text-[10px] text-ink-soft"
          >
            <span className="text-base" aria-hidden>
              ☎
            </span>
            전화
          </a>
          <Link
            href="/location"
            className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-white text-[10px] text-ink-soft"
          >
            <span className="text-base" aria-hidden>
              ⌖
            </span>
            위치
          </Link>
          <Link
            href="/booking"
            className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-sage-deep text-sm font-medium text-cream shadow-lg shadow-sage-deep/20"
          >
            수업 예약하기
          </Link>
        </div>
      </nav>
    </>
  );
}
