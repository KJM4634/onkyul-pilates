import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { PHOTOS, type Photo } from "@/data/images";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** 스크롤 등장 효과용 속성 (delay: ms) */
export const reveal = (delay = 0) => ({
  "data-reveal": "",
  style: { "--reveal-delay": `${delay}ms` } as CSSProperties,
});

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({
  className,
  children,
  tone = "default",
  id,
}: {
  className?: string;
  children: ReactNode;
  tone?: "default" | "soft" | "dark";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cx(
        "py-16 sm:py-24",
        tone === "soft" && "bg-cream-deep",
        tone === "dark" && "bg-ink text-cream",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={cx(
        "mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.25em] uppercase",
        light ? "text-cream/70" : "text-sage-deep",
      )}
    >
      <span aria-hidden className={cx("h-px w-6", light ? "bg-cream/50" : "bg-sage")} />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={cx("mb-10 sm:mb-12", align === "center" && "flex flex-col items-center text-center")} {...reveal()}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2 className="font-serif text-[1.75rem] leading-snug sm:text-4xl">{title}</h2>
      {description && (
        <p
          className={cx(
            "mt-4 max-w-xl leading-relaxed",
            light ? "text-cream/75" : "text-ink-soft",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** 하위 페이지 상단 제목 영역 (사진 배경 선택) */
export function PageHeader({
  eyebrow,
  title,
  description,
  photo,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  photo?: Photo;
}) {
  if (!photo) {
    return (
      <div className="border-b border-line bg-cream-deep">
        <Container className="py-14 sm:py-20">
          <div className="animate-fade-up">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-serif text-[2rem] leading-tight sm:text-5xl">{title}</h1>
            {description && <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{description}</p>}
          </div>
        </Container>
      </div>
    );
  }
  return (
    <div className="relative isolate overflow-hidden bg-ink text-cream">
      <Image src={photo.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
      <Container className="pt-28 pb-12 sm:pt-40 sm:pb-16">
        <div className="animate-fade-up">
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h1 className="font-serif text-[2rem] leading-tight sm:text-5xl">{title}</h1>
          {description && <p className="mt-4 max-w-xl leading-relaxed text-cream/80">{description}</p>}
        </div>
      </Container>
    </div>
  );
}

const buttonStyles = {
  primary: "bg-sage-deep text-cream hover:bg-ink shadow-lg shadow-sage-deep/20",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-cream",
  light: "bg-cream text-ink hover:bg-white shadow-lg shadow-black/10",
  ghost: "border border-cream/40 text-cream hover:bg-cream hover:text-ink",
} as const;

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: keyof typeof buttonStyles;
  size?: "md" | "lg";
};

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cx(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        size === "md" ? "h-11 px-6 text-sm" : "h-13 px-8 text-base",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-3xl border border-line bg-white/70 p-6", className)}>{children}</div>;
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">
      {children}
    </span>
  );
}

/** 사진 (next/image, 부모 크기를 채움) */
export function PhotoBox({
  photo,
  className,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
  children,
}: {
  photo: Photo;
  className?: string;
  sizes?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={cx("relative overflow-hidden rounded-3xl bg-cream-deep", className)}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {children}
    </div>
  );
}

export function CtaBanner({
  title = "첫 수업, 가볍게 시작해 보세요",
  description = "체험 수업에서 체형 체크와 상담을 함께 받아보실 수 있어요.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      <Image src={PHOTOS.reformerPlank.src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
      <Container className="flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
        <div {...reveal()}>
          <Eyebrow light>First Class</Eyebrow>
          <h2 className="font-serif text-2xl leading-snug sm:text-3xl">{title}</h2>
          <p className="mt-2 text-cream/80">{description}</p>
        </div>
        <ButtonLink href="/booking" variant="light" size="lg" className="shrink-0">
          수업 예약하기 →
        </ButtonLink>
      </Container>
    </section>
  );
}

/** 포트폴리오 데모 안내 (예약 화면용) */
export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={cx(
        "flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900",
        compact ? "p-3 text-xs" : "p-4 text-sm",
      )}
    >
      <span aria-hidden className={compact ? "text-sm" : "text-base"}>
        ⚠️
      </span>
      <p className="leading-relaxed">
        <strong className="font-medium">포트폴리오용 데모입니다.</strong> 실제로 예약되지 않으니{" "}
        <strong className="font-medium">실제 이름·연락처를 입력하지 마세요.</strong>
        {!compact &&
          " 이름은 '테스트', 번호는 임의의 숫자로 입력해 주세요. 입력된 정보는 수업 종료 3일 후 자동 삭제됩니다."}
      </p>
    </div>
  );
}
