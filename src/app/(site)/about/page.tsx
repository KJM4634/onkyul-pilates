import type { Metadata } from "next";
import { CtaBanner, PageHeader, PhotoBox, Section, SectionHeading, reveal } from "@/components/ui";
import { PHOTOS } from "@/data/images";
import { SITE, STATS, STRENGTHS } from "@/data/site";

export const metadata: Metadata = {
  title: "스튜디오 소개",
  description: `${SITE.name}의 철학과 공간을 소개합니다. 소수정예 기구 필라테스, 체형 분석 맞춤 수업.`,
};

const SPACES = [
  { label: "리포머 룸", desc: "리포머 6대를 갖춘 그룹 수업 공간", photo: PHOTOS.reformerArch },
  { label: "프라이빗 룸", desc: "1:1 레슨 전용 독립 공간", photo: PHOTOS.reformerLegs },
  { label: "소도구 라운지", desc: "상담·휴식 공간, 탈의실·샤워실 완비", photo: PHOTOS.equipment },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="결을 따라 움직이는 곳"
        description="온결(溫結)은 '따뜻하게 맺다'는 뜻을 담았습니다. 몸이 가진 고유한 결을 존중하며, 무리 없이 오래 가는 운동을 지향합니다."
        photo={PHOTOS.heroStudio}
      />

      <Section>
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div {...reveal()}>
            <PhotoBox photo={PHOTOS.reformerPlank} className="aspect-[4/3]" />
          </div>
          <div>
            <SectionHeading eyebrow="Philosophy" title="빠른 변화보다 바른 변화" />
            <div className="space-y-4 leading-relaxed text-ink-soft" {...reveal(100)}>
              <p>
                많은 분들이 통증이나 자세 고민으로 필라테스를 시작합니다. 온결은 무리한 동작보다 호흡과 정렬을 먼저
                익히는 것에서 출발합니다.
              </p>
              <p>
                소수정예로 운영하는 이유도 같습니다. 강사가 한 분 한 분의 움직임을 놓치지 않을 때, 운동은 비로소 내 몸에
                맞는 운동이 됩니다.
              </p>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-3" {...reveal(200)}>
              {STATS.slice(0, 2).map((s) => (
                <div key={s.label} className="rounded-2xl bg-cream-deep p-4">
                  <dd className="font-serif text-3xl text-sage-deep">
                    {s.value}
                    <span className="text-base">{s.unit}</span>
                  </dd>
                  <dt className="mt-1 text-xs text-ink-soft">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading eyebrow="Our Promise" title="온결의 약속" align="center" />
        <ul className="grid gap-5 md:grid-cols-3">
          {STRENGTHS.map((s, i) => (
            <li key={s.title} className="rounded-3xl bg-cream p-7" {...reveal(i * 120)}>
              <span className="font-serif text-4xl text-sand-deep">0{i + 1}</span>
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Space"
          title="공간 둘러보기"
          description="자연광이 드는 차분한 공간에서 운동에만 집중하세요."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {SPACES.map((s, i) => (
            <figure key={s.label} className="group" {...reveal(i * 120)}>
              <div className="overflow-hidden rounded-3xl">
                <PhotoBox
                  photo={s.photo}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[4/5] rounded-none transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="mt-4">
                <p className="font-medium">{s.label}</p>
                <p className="text-sm text-ink-soft">{s.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
