import type { Metadata } from "next";
import { ClassTypeCard, PriceTable, WeeklyTimetable } from "@/components/studio";
import { CtaBanner, PageHeader, Section, SectionHeading } from "@/components/ui";
import { CLASS_TYPES, PRICE_NOTES, PRICES, WEEKLY_TIMETABLE } from "@/data/classes";
import { PHOTOS } from "@/data/images";

export const metadata: Metadata = {
  title: "수업·가격",
  description: "그룹 기구 수업, 1:1 개인 레슨, 체험 수업 안내와 가격표.",
};

export default function ClassesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Classes & Price"
        title="수업·가격 안내"
        description="그룹, 1:1, 체험 수업 중 목적에 맞는 과정을 선택하세요."
        photo={PHOTOS.reformerLegs}
      />

      <Section>
        <SectionHeading eyebrow="Programs" title="수업 종류" />
        <div className="grid gap-5 md:grid-cols-3">
          {CLASS_TYPES.map((c, i) => (
            <ClassTypeCard key={c.id} item={c} index={i} />
          ))}
        </div>
      </Section>

      <Section tone="soft" id="price">
        <SectionHeading eyebrow="Price" title="가격표" />
        <div className="grid gap-5 md:grid-cols-3 md:items-start">
          {PRICES.map((g, i) => (
            <PriceTable key={g.classId} group={g} index={i} highlight={g.classId === "group"} />
          ))}
        </div>
        <ul className="mt-6 space-y-1 text-sm text-ink-soft">
          {PRICE_NOTES.map((n) => (
            <li key={n}>※ {n}</li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Timetable"
          title="정규 그룹 수업 시간표"
          description="각 수업 50분 · 실제 예약 가능 일정과 남은 자리는 예약 페이지에서 확인하세요."
        />
        <WeeklyTimetable slots={WEEKLY_TIMETABLE} />
      </Section>

      <CtaBanner />
    </>
  );
}
