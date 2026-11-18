"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS, SITE } from "@/data/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // 페이지 이동 시 모바일 메뉴 닫기
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg">{SITE.name}</span>
          <span className="hidden text-[10px] tracking-[0.2em] text-ink-soft sm:inline">{SITE.nameEn}</span>
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                {item.href === "/booking" ? (
                  <Link
                    href={item.href}
                    className="rounded-full bg-sage-deep px-4 py-2 text-cream transition-colors hover:bg-ink"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={
                      isActive(item.href)
                        ? "font-medium text-sage-deep"
                        : "text-ink-soft transition-colors hover:text-ink"
                    }
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 h-px w-5 bg-ink transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span className={`absolute top-1.5 left-0 h-px w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span
              className={`absolute left-0 h-px w-5 bg-ink transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="모바일 메뉴" className="border-t border-line bg-cream md:hidden">
          <ul className="px-5 py-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block py-3 text-base ${isActive(item.href) ? "font-medium text-sage-deep" : "text-ink"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="block py-3 text-base text-ink">
                문의
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/** Suspense fallback용 정적 헤더 (usePathname 없이) */
export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-cream/90">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-5 sm:px-8">
        <span className="font-serif text-lg">{SITE.name}</span>
      </div>
    </header>
  );
}
