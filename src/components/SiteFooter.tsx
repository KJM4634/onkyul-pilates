import Link from "next/link";
import { NAV_ITEMS, SITE } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-cream-deep text-sm text-ink-soft">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-base text-ink">{SITE.name}</p>
            <p className="mt-2 leading-relaxed">{SITE.tagline}</p>
          </div>
          <div className="space-y-1">
            <p>{SITE.address}</p>
            <p>
              Tel. {SITE.phone} · {SITE.email}
            </p>
            {SITE.hours.map((h) => (
              <p key={h.label}>
                {h.label} {h.time}
              </p>
            ))}
          </div>
          <nav aria-label="하단 메뉴">
            <ul className="grid grid-cols-2 gap-y-2">
              {[...NAV_ITEMS, { href: "/contact", label: "문의" }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 rounded-lg border border-sand bg-cream px-4 py-3 text-xs leading-relaxed text-ink">
          ※ {SITE.disclaimer}
        </p>
        <p className="mt-4 text-xs">© {SITE.nameEn}. Portfolio demo.</p>
      </div>
    </footer>
  );
}
