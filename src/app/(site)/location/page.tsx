import type { Metadata } from "next";
import { ButtonLink, Card, PageHeader, Section, reveal } from "@/components/ui";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "오시는 길",
  description: `${SITE.name} 위치와 교통편, 주차, 운영 시간 안내. ${SITE.addressShort}.`,
};

// API 키가 필요 없는 구글 지도 임베드 (가상 매장이므로 성수역 기준으로 표시)
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent("성수역")}&z=16&output=embed`;

export default function LocationPage() {
  return (
    <>
      <PageHeader eyebrow="Location" title="오시는 길" description={SITE.addressShort} />
      <Section className="pt-10 sm:pt-14">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div {...reveal()}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-cream-deep md:aspect-auto md:h-full md:min-h-[420px]">
              <iframe
                src={MAP_EMBED}
                title="스튜디오 위치 지도 (성수역 인근)"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[40%]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-sage-deep text-cream">
              <h2 className="text-sm text-cream/70">주소</h2>
              <p className="mt-1 text-lg font-medium">{SITE.address}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href={SITE.mapUrl} target="_blank" rel="noopener noreferrer" variant="light">
                  네이버 지도 ↗
                </ButtonLink>
                <ButtonLink href={`tel:${SITE.phone.replace(/-/g, "")}`} variant="ghost">
                  전화하기
                </ButtonLink>
              </div>
            </Card>
            <Card>
              <h2 className="text-sm text-ink-soft">교통·주차</h2>
              <dl className="mt-3 space-y-3">
                {SITE.transit.map((t) => (
                  <div key={t.type} className="flex gap-4">
                    <dt className="w-14 shrink-0 font-medium text-sage-deep">{t.type}</dt>
                    <dd className="text-ink-soft">{t.detail}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card>
              <h2 className="text-sm text-ink-soft">운영 시간</h2>
              <dl className="mt-3 space-y-2">
                {SITE.hours.map((h) => (
                  <div key={h.label} className="flex justify-between gap-4">
                    <dt>{h.label}</dt>
                    <dd className="font-medium tabular-nums">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
