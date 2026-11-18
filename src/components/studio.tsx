import Image from "next/image";
import type { ClassType, PriceGroup, WeeklySlot } from "@/data/classes";
import { formatPrice } from "@/data/classes";
import type { Instructor } from "@/data/instructors";
import { Tag, cx, reveal } from "./ui";

const MONO_TONES = [
  "from-[#c9d3c2] via-[#a9b8a0] to-[#7f9077]",
  "from-[#eadfcd] via-[#d6c3a5] to-[#b9a385]",
  "from-[#e3e0d8] via-[#c8c1b4] to-[#9d9486]",
];

export function InstructorCard({
  instructor,
  index = 0,
  compact = false,
}: {
  instructor: Instructor;
  index?: number;
  compact?: boolean;
}) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10"
      {...reveal(index * 120)}
    >
      {/* 가상 강사이므로 실존 인물 사진 대신 모노그램 사용 */}
      <div
        className={cx(
          "relative flex aspect-[5/4] items-end overflow-hidden bg-gradient-to-br p-6",
          MONO_TONES[index % MONO_TONES.length],
        )}
      >
        <span
          aria-hidden
          className="absolute -top-6 -right-2 font-serif text-[9rem] leading-none text-white/35 transition-transform duration-700 group-hover:scale-110"
        >
          {instructor.name.slice(1, 2)}
        </span>
        <div className="relative">
          <p className="text-xs tracking-[0.2em] text-ink/60">{instructor.role}</p>
          <h3 className="mt-1 font-serif text-3xl text-ink">{instructor.name}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          {instructor.specialty.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
        <p className="mt-4 leading-relaxed text-ink-soft">“{instructor.intro}”</p>
        {!compact && (
          <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm text-ink-soft">
            {instructor.career.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden className="text-sage">
                  —
                </span>
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ClassTypeCard({ item, index = 0 }: { item: ClassType; index?: number }) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10"
      {...reveal(index * 120)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.photo.src}
          alt={item.photo.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium backdrop-blur">
          {item.capacity}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl">{item.name}</h3>
          <p className="shrink-0 text-sm font-medium text-sage-deep">{item.fromPrice}</p>
        </div>
        <p className="mt-2 leading-relaxed text-ink-soft">{item.summary}</p>
        <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-cream px-3 py-2">
            <dt className="text-xs text-ink-soft">시간</dt>
            <dd className="font-medium">{item.duration}</dd>
          </div>
          <div className="rounded-2xl bg-cream px-3 py-2">
            <dt className="text-xs text-ink-soft">대상</dt>
            <dd className="font-medium">{item.level}</dd>
          </div>
        </dl>
        <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
          {item.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span aria-hidden className="text-sage">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function PriceTable({
  group,
  index = 0,
  highlight = false,
}: {
  group: PriceGroup;
  index?: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-3xl border",
        highlight
          ? "border-sage-deep bg-sage-deep text-cream shadow-2xl shadow-sage-deep/25"
          : "border-line bg-white/80",
      )}
      {...reveal(index * 120)}
    >
      {highlight && (
        <span className="absolute top-5 right-5 rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-sage-deep">
          BEST
        </span>
      )}
      <h3 className={cx("px-6 pt-6 pb-4 font-serif text-xl", highlight ? "" : "border-b border-line")}>
        {group.title}
      </h3>
      <table className="w-full text-sm">
        <caption className="sr-only">{group.title} 가격표</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">수강권</th>
            <th scope="col">가격</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => (
            <tr key={row.label} className={cx("border-b last:border-0", highlight ? "border-cream/15" : "border-line")}>
              <th scope="row" className="px-6 py-4 text-left font-normal">
                {row.label}
                {row.note && (
                  <span className={cx("mt-0.5 block text-xs", highlight ? "text-cream/70" : "text-ink-soft")}>
                    {row.note}
                  </span>
                )}
              </th>
              <td className="px-6 py-4 text-right text-base font-medium whitespace-nowrap tabular-nums">
                {formatPrice(row.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WeeklyTimetable({ slots }: { slots: WeeklySlot[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" {...reveal()}>
      {slots.map((slot) => (
        <div key={slot.day} className="rounded-2xl border border-line bg-white/70 p-3 text-center">
          <p className={cx("font-medium", slot.day === "토" ? "text-sky-700" : "text-sage-deep")}>{slot.day}</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft tabular-nums">
            {slot.times.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
