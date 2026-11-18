import type { Metadata } from "next";
import { InstructorCard } from "@/components/studio";
import { CtaBanner, PageHeader, Section } from "@/components/ui";
import { PHOTOS } from "@/data/images";
import { INSTRUCTORS } from "@/data/instructors";

export const metadata: Metadata = {
  title: "강사 소개",
  description: "온결 필라테스의 전문 강사진을 소개합니다.",
};

export default function InstructorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Instructors"
        title="함께할 강사"
        description="자격과 경력을 갖춘 강사들이 수준과 목적에 맞춰 수업을 이끕니다."
        photo={PHOTOS.reformerArch}
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {INSTRUCTORS.map((ins, i) => (
            <InstructorCard key={ins.id} instructor={ins} index={i} />
          ))}
        </div>
      </Section>
      <CtaBanner
        title="원하는 강사의 수업을 찾아보세요"
        description="시간표에서 강사와 수업 시간을 확인하고 예약할 수 있어요."
      />
    </>
  );
}
