import type { Metadata } from "next";
import { ButtonLink, Card, PageHeader, Section, SectionHeading, reveal } from "@/components/ui";
import { FAQ } from "@/data/faq";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "문의",
  description: `${SITE.name} 상담·문의 안내와 자주 묻는 질문.`,
};

const CHANNELS = [
  { label: "전화", value: SITE.phone, href: `tel:${SITE.phone.replace(/-/g, "")}` },
  { label: "카카오톡 채널", value: SITE.kakaoChannel, href: undefined },
  { label: "이메일", value: SITE.email, href: `mailto:${SITE.email}` },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="문의하기"
        description="수업 상담, 수강권, 대관 등 궁금한 점을 편하게 문의해 주세요."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map((c, i) => (
            <div key={c.label} {...reveal(i * 100)}>
              <Card className="h-full">
                <p className="text-sm text-ink-soft">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="mt-1 block text-lg font-medium break-all hover:text-sage-deep">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg font-medium">{c.value}</p>
                )}
              </Card>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          상담 가능 시간: 평일 10:00 – 20:00 · 수업 중에는 답변이 늦어질 수 있어요. (가상 연락처입니다)
        </p>
      </Section>

      <Section tone="soft">
        <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
        <div className="divide-y divide-line rounded-3xl border border-line bg-cream" {...reveal()}>
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
                <span>{item.q}</span>
                <span aria-hidden className="text-sage-deep transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href="/booking">체험 수업 예약하기</ButtonLink>
        </div>
      </Section>
    </>
  );
}
