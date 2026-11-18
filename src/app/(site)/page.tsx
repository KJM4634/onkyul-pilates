import Image from "next/image";
import Link from "next/link";
import { ClassTypeCard, InstructorCard } from "@/components/studio";
import { ButtonLink, Container, CtaBanner, Eyebrow, PhotoBox, Section, SectionHeading, reveal } from "@/components/ui";
import { CLASS_TYPES } from "@/data/classes";
import { PHOTOS } from "@/data/images";
import { INSTRUCTORS } from "@/data/instructors";
import { BOOKING_STEPS, MARQUEE_WORDS, SITE, STATS, STRENGTHS, TESTIMONIALS } from "@/data/site";

export default function HomePage() {
  return (
    <>
      {/* ───────── 히어로 ───────── */}
      <section className="relative isolate -mt-px flex min-h-[min(calc(100svh-4rem),860px)] items-end overflow-hidden bg-ink text-cream">
        <Image
          src={PHOTOS.heroStudio.src}
          alt={PHOTOS.heroStudio.alt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[30%_center] motion-safe:animate-hero-zoom"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div
          aria-hidden
          className="absolute -top-20 -right-20 -z-10 h-80 w-80 rounded-full bg-sage/40 blur-3xl motion-safe:animate-float"
        />

        <Container className="pt-24 pb-14 sm:pb-20">
          <div className="max-w-2xl">
            <p className="animate-fade-up text-xs font-medium tracking-[0.35em] text-cream/75">{SITE.nameEn}</p>
            <h1 className="mt-5 animate-fade-up font-serif text-[2.6rem] leading-[1.15] [animation-delay:120ms] sm:text-7xl">
              몸의 결을 따라,
              <br />
              <span className="bg-gradient-to-r from-cream via-sand to-sage-soft bg-clip-text text-transparent">
                온전한 균형으로
              </span>
            </h1>
            <p className="mt-6 max-w-md animate-fade-up leading-relaxed text-cream/80 [animation-delay:240ms]">
              {SITE.description}
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:360ms] sm:flex-row">
              <ButtonLink href="/booking" variant="light" size="lg">
                수업 예약하기 →
              </ButtonLink>
              <ButtonLink href="/classes" variant="ghost" size="lg">
                수업·가격 보기
              </ButtonLink>
            </div>
          </div>

          {/* 유리 카드 */}
          <div className="mt-12 grid animate-fade-up grid-cols-3 gap-px overflow-hidden rounded-2xl border border-cream/15 bg-cream/10 backdrop-blur-md [animation-delay:480ms] sm:max-w-xl">
            {[
              { k: "체험 수업", v: "20,000원" },
              { k: "정원", v: "최대 6인" },
              { k: "위치", v: "성수역 5분" },
            ].map((x) => (
              <div key={x.k} className="bg-ink/20 px-4 py-3">
                <p className="text-[11px] text-cream/60">{x.k}</p>
                <p className="mt-0.5 text-sm font-medium sm:text-base">{x.v}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 마키 ───────── */}
      <div className="overflow-hidden border-b border-line bg-cream-deep py-4" aria-hidden>
        <div className="flex w-max motion-safe:animate-marquee">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-8 pr-8 font-serif text-lg whitespace-nowrap text-ink/70">
              {w}
              <span className="text-sand-deep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ───────── 강점 3가지 ───────── */}
      <Section>
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="relative" {...reveal()}>
            <PhotoBox photo={PHOTOS.reformerLegs} className="aspect-[4/5]" />
            <div className="absolute -right-3 -bottom-6 rounded-2xl bg-white p-5 shadow-2xl shadow-ink/10 sm:-right-8">
              <p className="font-serif text-4xl text-sage-deep">
                6<span className="text-lg">인</span>
              </p>
              <p className="mt-1 text-xs text-ink-soft">최대 정원, 소수정예</p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Why Onkyul"
              title={
                <>
                  온결이
                  <br className="sm:hidden" /> 다른 이유
                </>
              }
              description="빠른 변화보다 바른 변화를 위해, 우리는 세 가지를 지킵니다."
            />
            <ol className="space-y-4">
              {STRENGTHS.map((s, i) => (
                <li
                  key={s.title}
                  className="flex gap-5 rounded-3xl border border-line bg-white/70 p-5 transition-colors hover:border-sage"
                  {...reveal(i * 120)}
                >
                  <span className="shrink-0 font-serif text-3xl leading-none whitespace-nowrap text-sand-deep">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{s.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink-soft">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ───────── 숫자 ───────── */}
      <section className="bg-sage-deep text-cream">
        <Container className="grid grid-cols-2 gap-y-8 py-14 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center" {...reveal(i * 100)}>
              <p className="font-serif text-5xl">
                {s.value}
                <span className="ml-0.5 text-xl text-cream/70">{s.unit}</span>
              </p>
              <p className="mt-2 text-sm text-cream/75">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* ───────── 수업 미리보기 ───────── */}
      <Section tone="soft">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Classes"
            title="나에게 맞는 수업"
            description="처음이라면 체험 수업부터, 목표가 분명하다면 1:1 레슨으로."
          />
          <Link href="/classes" className="mb-10 text-sm font-medium text-sage-deep sm:mb-12" {...reveal()}>
            가격표 전체 보기 →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CLASS_TYPES.map((c, i) => (
            <ClassTypeCard key={c.id} item={c} index={i} />
          ))}
        </div>
      </Section>

      {/* ───────── 예약 3단계 ───────── */}
      <Section>
        <SectionHeading
          eyebrow="Easy Booking"
          title="예약은 1분이면 충분해요"
          description="회원가입도, 전화 대기도 필요 없어요. 실시간 남은 자리를 보고 바로 예약하세요."
          align="center"
        />
        <ol className="relative grid gap-5 md:grid-cols-3">
          <span
            aria-hidden
            className="absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-sage/0 via-sage to-sage/0 md:block"
          />
          {BOOKING_STEPS.map((s, i) => (
            <li key={s.title} className="relative text-center" {...reveal(i * 150)}>
              <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sage bg-cream font-serif text-2xl text-sage-deep shadow-lg shadow-sage/10">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-ink-soft">{s.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center" {...reveal()}>
          <ButtonLink href="/booking" size="lg">
            지금 시간표 보기
          </ButtonLink>
        </div>
      </Section>

      {/* ───────── 강사 ───────── */}
      <Section tone="soft">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Instructors" title="함께할 강사" />
          <Link href="/instructors" className="mb-10 text-sm font-medium text-sage-deep sm:mb-12" {...reveal()}>
            강사 자세히 보기 →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {INSTRUCTORS.map((ins, i) => (
            <InstructorCard key={ins.id} instructor={ins} index={i} compact />
          ))}
        </div>
      </Section>

      {/* ───────── 후기 ───────── */}
      <Section tone="dark" className="relative overflow-hidden">
        <SectionHeading eyebrow="Voices" title="회원들의 이야기" light />
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-3xl border border-cream/10 bg-cream/5 p-6 backdrop-blur"
              {...reveal(i * 120)}
            >
              <span aria-hidden className="font-serif text-5xl leading-none text-sand">
                “
              </span>
              <blockquote className="mt-2 flex-1 leading-relaxed text-cream/85">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-cream/10 pt-4 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-xs">
                  {t.name[0]}
                </span>
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-xs text-cream/60">{t.meta}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-xs text-cream/50">※ 포트폴리오용 예시 후기입니다.</p>
      </Section>

      {/* ───────── 위치 요약 ───────── */}
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div {...reveal()}>
            <Eyebrow>Visit</Eyebrow>
            <h2 className="font-serif text-[1.75rem] leading-snug sm:text-4xl">성수역에서 걸어서 5분</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{SITE.address}</p>
            <dl className="mt-6 space-y-2 text-sm">
              {SITE.hours.map((h) => (
                <div key={h.label} className="flex max-w-xs justify-between border-b border-line pb-2">
                  <dt className="text-ink-soft">{h.label}</dt>
                  <dd className="font-medium">{h.time}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/location" variant="outline">
                오시는 길
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                문의하기
              </ButtonLink>
            </div>
          </div>
          <div {...reveal(150)}>
            <PhotoBox photo={PHOTOS.equipment} className="aspect-[4/3] md:aspect-[5/4]" />
          </div>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
