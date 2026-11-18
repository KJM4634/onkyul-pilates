import { Suspense } from "react";
import { MobileActionBar } from "@/components/MobileActionBar";
import { RevealObserver } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader, SiteHeaderFallback } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Suspense fallback={null}>
        <MobileActionBar />
      </Suspense>
      <RevealObserver />
    </>
  );
}
