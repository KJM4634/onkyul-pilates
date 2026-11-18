import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DemoNotice, PageHeader, Section } from "@/components/ui";
import { addDaysToKey, seoulDateKey, seoulMidnightIso } from "@/lib/datetime";
import { createPublicClient } from "@/lib/supabase/public";
import { BookingFlow } from "./BookingFlow";
import type { AvailableSession } from "./types";

export const metadata: Metadata = {
  title: "수업 예약",
  description: "주간 시간표에서 남은 자리를 확인하고 바로 예약하세요.",
};

export default function BookingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="수업 예약"
        description="원하는 날짜와 시간을 고르고, 이름과 연락처만 입력하면 예약이 완료됩니다."
      />
      <Section className="pt-8 sm:pt-12">
        <div className="mb-8">
          <DemoNotice />
        </div>
        <Suspense fallback={<BookingSkeleton />}>
          <BookingLoader />
        </Suspense>
      </Section>
    </>
  );
}

async function BookingLoader() {
  await connection(); // 요청 시점마다 최신 남은 자리 조회

  const todayKey = seoulDateKey(new Date());
  const supabase = createPublicClient();
  if (!supabase) {
    return (
      <Notice title="예약 시스템 연결 준비 중이에요">
        잠시 후 다시 방문하시거나 전화로 예약해 주세요. (운영자: Supabase 환경변수를 설정해 주세요)
      </Notice>
    );
  }

  // 데모 시간표 안전장치: 앞으로 14일치가 비어 있으면 DB가 채움 (평소엔 즉시 종료)
  const ensured = await supabase.rpc("ensure_demo_sessions");
  if (ensured.error) console.error("ensure_demo_sessions failed:", ensured.error.message);

  const { data, error } = await supabase.rpc("get_session_availability", {
    p_from: new Date().toISOString(),
    p_to: seoulMidnightIso(addDaysToKey(todayKey, 14)),
  });

  if (error) {
    console.error("get_session_availability failed:", error.message);
    return (
      <Notice title="시간표를 불러오지 못했어요">
        잠시 후 새로고침해 주세요. 문제가 계속되면 전화로 문의해 주세요.
      </Notice>
    );
  }

  return <BookingFlow sessions={(data ?? []) as AvailableSession[]} todayKey={todayKey} />;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-sand-deep bg-white/50 p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-ink-soft">{children}</p>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div aria-busy="true" aria-label="시간표 불러오는 중" className="animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-full bg-cream-deep" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-cream-deep" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-cream-deep" />
      ))}
    </div>
  );
}
