import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | 온결 관리자" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-[#f4f1ea]">{children}</div>;
}
