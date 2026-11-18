"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { addDaysToKey, formatSessionDate, parseDateKey, seoulDateKey, seoulTime } from "@/lib/datetime";
import { DemoNotice } from "@/components/ui";
import { formatPhone } from "@/lib/validation";
import { createBooking } from "./actions";
import type { AvailableSession, BookingState } from "./types";

type Done = { bookingId: string; name: string; session: AvailableSession };

export function BookingFlow({ sessions, todayKey }: { sessions: AvailableSession[]; todayKey: string }) {
  const [selected, setSelected] = useState<AvailableSession | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const step = done ? 3 : selected ? 2 : 1;

  // 서버에서 남은 자리가 갱신되면 선택된 수업 정보도 최신으로
  const liveSelected = selected ? (sessions.find((s) => s.id === selected.id) ?? selected) : null;

  const go = (fn: () => void) => {
    fn();
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      <Stepper step={step} />

      {step === 1 && <Timetable sessions={sessions} todayKey={todayKey} onSelect={(s) => go(() => setSelected(s))} />}

      {step === 2 && liveSelected && (
        <BookingForm
          key={liveSelected.id}
          session={liveSelected}
          onBack={() => go(() => setSelected(null))}
          onSuccess={(bookingId, name) => go(() => setDone({ bookingId, name, session: liveSelected }))}
        />
      )}

      {step === 3 && done && (
        <Complete
          done={done}
          onAgain={() =>
            go(() => {
              setDone(null);
              setSelected(null);
            })
          }
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stepper({ step }: { step: number }) {
  const steps = ["수업 선택", "정보 입력", "예약 완료"];
  return (
    <ol className="mb-8 flex items-center gap-2 text-xs sm:text-sm" aria-label="예약 단계">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "current" : "todo";
        return (
          <li
            key={label}
            className="flex flex-1 items-center gap-2"
            aria-current={state === "current" ? "step" : undefined}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                state === "todo" ? "bg-cream-deep text-ink-soft" : "bg-sage-deep text-cream"
              }`}
            >
              {state === "done" ? "✓" : n}
            </span>
            <span className={state === "todo" ? "text-ink-soft" : "font-medium"}>{label}</span>
            {n < steps.length && <span className="h-px flex-1 bg-line" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */

function Timetable({
  sessions,
  todayKey,
  onSelect,
}: {
  sessions: AvailableSession[];
  todayKey: string;
  onSelect: (s: AvailableSession) => void;
}) {
  const byDay = useMemo(() => {
    const map = new Map<string, AvailableSession[]>();
    for (const s of sessions) {
      const key = seoulDateKey(s.start_at);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [sessions]);

  const allDays = useMemo(() => Array.from({ length: 14 }, (_, i) => addDaysToKey(todayKey, i)), [todayKey]);
  const firstOpenDay = allDays.find((d) => (byDay.get(d) ?? []).some((s) => s.remaining > 0)) ?? todayKey;

  const [week, setWeek] = useState(allDays.indexOf(firstOpenDay) >= 7 ? 1 : 0);
  const [day, setDay] = useState(firstOpenDay);
  const weekDays = allDays.slice(week * 7, week * 7 + 7);

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sand-deep bg-white/50 p-8 text-center">
        <p className="font-medium">현재 예약 가능한 수업이 없어요</p>
        <p className="mt-2 text-sm text-ink-soft">새 일정이 곧 열릴 예정이에요. 전화로 문의해 주세요.</p>
      </div>
    );
  }

  const changeWeek = (w: number) => {
    setWeek(w);
    const days = allDays.slice(w * 7, w * 7 + 7);
    setDay(days.find((d) => byDay.has(d)) ?? days[0]);
  };

  const range = `${parseDateKey(weekDays[0]).month}.${parseDateKey(weekDays[0]).day} – ${parseDateKey(weekDays[6]).month}.${parseDateKey(weekDays[6]).day}`;

  return (
    <div>
      {/* 주 전환 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-cream-deep p-1 text-sm" role="tablist" aria-label="주 선택">
          {["이번 주", "다음 주"].map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={week === i}
              onClick={() => changeWeek(i)}
              className={`rounded-full px-4 py-1.5 transition-all ${week === i ? "bg-white font-medium shadow-sm" : "text-ink-soft"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-soft tabular-nums">{range}</p>
      </div>

      <Legend />

      {/* 모바일: 날짜 칩 + 선택 날짜 목록 */}
      <div className="md:hidden">
        <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="날짜 선택">
          {weekDays.map((key) => {
            const { day: d, weekday, dow } = parseDateKey(key);
            const list = byDay.get(key) ?? [];
            const open = list.some((s) => s.remaining > 0);
            const active = key === day;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${parseDateKey(key).month}월 ${d}일 ${weekday}요일${list.length ? "" : ", 수업 없음"}`}
                onClick={() => setDay(key)}
                className={`flex flex-col items-center rounded-xl py-2 transition-all ${
                  active ? "bg-sage-deep text-cream shadow-md" : "bg-white/70 text-ink"
                } ${list.length === 0 && !active ? "opacity-40" : ""}`}
              >
                <span
                  className={`text-[11px] ${!active && dow === 0 ? "text-red-500" : ""} ${!active && dow === 6 ? "text-sky-600" : ""}`}
                >
                  {weekday}
                </span>
                <span className="text-base font-medium tabular-nums">{d}</span>
                <span
                  aria-hidden
                  className={`mt-0.5 h-1 w-1 rounded-full ${open ? (active ? "bg-cream" : "bg-sage") : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3" role="tabpanel">
          {(byDay.get(day) ?? []).length === 0 ? (
            <p className="rounded-2xl bg-white/50 py-10 text-center text-sm text-ink-soft">이 날은 수업이 없어요.</p>
          ) : (
            (byDay.get(day) ?? []).map((s) => <SessionCard key={s.id} s={s} onSelect={onSelect} />)
          )}
        </div>
      </div>

      {/* PC: 주간 그리드 */}
      <div className="hidden grid-cols-7 gap-2 md:grid">
        {weekDays.map((key) => {
          const { month, day: d, weekday, dow } = parseDateKey(key);
          const list = byDay.get(key) ?? [];
          return (
            <div key={key} className="min-w-0">
              <div
                className={`mb-2 rounded-xl py-2 text-center ${key === todayKey ? "bg-sage-soft" : "bg-cream-deep"}`}
              >
                <p className={`text-xs ${dow === 0 ? "text-red-500" : dow === 6 ? "text-sky-600" : "text-ink-soft"}`}>
                  {weekday}
                </p>
                <p className="font-medium tabular-nums">
                  {month}.{d}
                </p>
              </div>
              <div className="space-y-2">
                {list.length === 0 ? (
                  <p className="py-6 text-center text-xs text-ink-soft/60">휴무</p>
                ) : (
                  list.map((s) => <SessionCard key={s.id} s={s} onSelect={onSelect} compact />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-sage" /> 예약 가능
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> 마감 임박 (2자리 이하)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-ink/25" /> 마감
      </span>
    </div>
  );
}

function SessionCard({
  s,
  onSelect,
  compact = false,
}: {
  s: AvailableSession;
  onSelect: (s: AvailableSession) => void;
  compact?: boolean;
}) {
  const full = s.remaining <= 0;
  const low = !full && s.remaining <= 2;
  const ratio = Math.min(1, (s.capacity - s.remaining) / s.capacity);
  const label = `${seoulTime(s.start_at)} ${s.title}, ${s.instructor} 강사, ${full ? "마감" : `남은 자리 ${s.remaining}석`}`;

  return (
    <button
      type="button"
      disabled={full}
      onClick={() => onSelect(s)}
      aria-label={label}
      className={`group block w-full rounded-2xl border text-left transition-all ${compact ? "p-3" : "p-4"} ${
        full
          ? "cursor-not-allowed border-line bg-cream-deep/60 text-ink-soft"
          : "border-line bg-white hover:-translate-y-0.5 hover:border-sage hover:shadow-lg hover:shadow-sage/10 active:translate-y-0"
      }`}
    >
      <div className={`flex ${compact ? "flex-col gap-1" : "items-center justify-between gap-3"}`}>
        <div className="min-w-0">
          <p className={`font-medium tabular-nums ${compact ? "text-sm" : "text-lg"} ${full ? "" : "text-sage-deep"}`}>
            {seoulTime(s.start_at)}
            {!compact && <span className="ml-2 text-xs font-normal text-ink-soft">{s.duration_min}분</span>}
          </p>
          <p
            className={`truncate ${compact ? "text-xs" : "font-medium"} ${full ? "line-through decoration-ink/30" : ""}`}
          >
            {s.title}
          </p>
          <p className="truncate text-xs text-ink-soft">{s.instructor}</p>
        </div>
        <div className={compact ? "" : "shrink-0 text-right"}>
          {full ? (
            <span className="inline-block rounded-full bg-ink/10 px-2.5 py-1 text-xs font-medium">마감</span>
          ) : (
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                low ? "bg-amber-100 text-amber-800" : "bg-sage-soft text-sage-deep"
              }`}
            >
              {low ? `${s.remaining}자리 남음` : `잔여 ${s.remaining}/${s.capacity}`}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-cream-deep" aria-hidden>
        <div
          className={`h-full rounded-full transition-all ${full ? "bg-ink/25" : low ? "bg-amber-500" : "bg-sage"}`}
          style={{ width: `${Math.max(ratio * 100, 4)}%` }}
        />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */

const initialState: BookingState = { status: "idle" };

function BookingForm({
  session,
  onBack,
  onSuccess,
}: {
  session: AvailableSession;
  onBack: () => void;
  onSuccess: (bookingId: string, name: string) => void;
}) {
  const [state, action, pending] = useActionState(createBooking, initialState);
  // 서버 액션 후 React가 폼을 초기화해도 입력값이 남도록 제어 컴포넌트로 관리
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  // 성공하면 완료 화면으로 전환 (전환 즉시 이 폼은 언마운트됨)
  useEffect(() => {
    if (state.status === "success") onSuccess(state.bookingId, state.name);
  }, [state, onSuccess]);

  const fe = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const full = session.remaining <= 0;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.3fr] md:items-start">
      {/* 선택한 수업 요약 */}
      <div className="rounded-3xl bg-gradient-to-br from-sage-deep to-[#495a43] p-6 text-cream md:sticky md:top-24">
        <p className="text-xs tracking-[0.2em] text-cream/70">SELECTED CLASS</p>
        <p className="mt-3 font-serif text-2xl">{session.title}</p>
        <dl className="mt-5 space-y-2 text-sm">
          <Row label="일시" value={formatSessionDate(session.start_at)} />
          <Row label="소요" value={`${session.duration_min}분`} />
          <Row label="강사" value={session.instructor} />
          <Row label="남은 자리" value={full ? "마감" : `${session.remaining}석 / ${session.capacity}석`} />
        </dl>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-cream/80 underline underline-offset-4 hover:text-cream"
        >
          ← 다른 수업 선택
        </button>
      </div>

      <form action={action} className="space-y-5 rounded-3xl border border-line bg-white p-6" noValidate>
        <DemoNotice compact />
        <input type="hidden" name="sessionId" value={session.id} />
        {/* 봇 방지 숨김 필드 */}
        <div className="hidden" aria-hidden>
          <label>
            웹사이트 <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <Field label="이름" error={fe.name} htmlFor="name">
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={20}
            autoComplete="name"
            placeholder="예: 테스트"
            aria-invalid={!!fe.name}
            className={inputCls(!!fe.name)}
          />
        </Field>

        <Field label="휴대폰 번호" error={fe.phone} htmlFor="phone" hint="예약 확인 연락에만 사용돼요.">
          <input
            id="phone"
            name="phone"
            required
            inputMode="numeric"
            autoComplete="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            maxLength={13}
            aria-invalid={!!fe.phone}
            className={inputCls(!!fe.phone)}
          />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-4">
            <input
              type="checkbox"
              name="agreed"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-sage-deep"
              aria-invalid={!!fe.agreed}
            />
            <span className="text-sm">
              <span className="font-medium">[필수] 개인정보 수집·이용에 동의합니다.</span>
              <details className="mt-2 text-xs text-ink-soft">
                <summary className="cursor-pointer underline underline-offset-2">내용 보기</summary>
                <ul className="mt-2 space-y-1">
                  <li>· 수집 항목: 이름, 휴대폰 번호</li>
                  <li>· 이용 목적: 수업 예약 확인 및 일정 변경 안내</li>
                  <li>· 보유 기간: 수업 종료 3일 후 자동 파기</li>
                  <li>· 동의를 거부할 수 있으나, 거부 시 예약이 불가합니다.</li>
                </ul>
              </details>
            </span>
          </label>
          {fe.agreed && <p className="mt-1.5 text-sm text-red-600">{fe.agreed}</p>}
        </div>

        {state.status === "error" && !state.fieldErrors && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || full}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-sage-deep text-base font-medium text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />}
          {full ? "마감된 수업이에요" : pending ? "예약 중…" : "예약 확정하기"}
        </button>
        <p className="text-center text-xs text-ink-soft">결제는 첫 방문 시 현장에서 진행됩니다.</p>
      </form>
    </div>
  );
}

const inputCls = (err: boolean) =>
  `h-12 w-full rounded-xl border bg-cream/40 px-4 text-base outline-none transition-colors placeholder:text-ink-soft/50 focus:border-sage-deep focus:bg-white ${
    err ? "border-red-400" : "border-line"
  }`;

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-cream/15 pb-2">
      <dt className="text-cream/70">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function toIcsDate(iso: string) {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function downloadIcs(s: AvailableSession) {
  const end = new Date(new Date(s.start_at).getTime() + s.duration_min * 60000).toISOString();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Onkyul Pilates//Booking//KO",
    "BEGIN:VEVENT",
    `UID:${s.id}@onkyul`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(s.start_at)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:온결 필라테스 - ${s.title}`,
    `DESCRIPTION:${s.instructor} 강사`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "onkyul-booking.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function Complete({ done, onAgain }: { done: Done; onAgain: () => void }) {
  const { session } = done;
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="animate-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage-deep text-cream shadow-xl shadow-sage/30">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" className="animate-draw" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-6 font-serif text-2xl" role="status">
        예약이 완료되었어요
      </h2>
      <p className="mt-2 text-ink-soft">{done.name}님, 스튜디오에서 만나요!</p>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 text-left">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">예약번호</dt>
            <dd className="font-mono font-medium">{done.bookingId.slice(0, 8).toUpperCase()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">수업</dt>
            <dd className="text-right font-medium">{session.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">일시</dt>
            <dd className="text-right font-medium">{formatSessionDate(session.start_at)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">강사</dt>
            <dd className="font-medium">{session.instructor}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => downloadIcs(session)}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-full border border-ink/20 text-sm font-medium transition-colors hover:bg-cream"
        >
          📅 내 캘린더에 추가
        </button>
      </div>

      <ul className="mt-6 space-y-1 text-left text-xs text-ink-soft">
        <li>· 수업 10분 전까지 도착해 주세요. 운동복 대여가 가능해요.</li>
        <li>· 변경·취소는 수업 4시간 전까지 전화 또는 카카오톡 채널로 알려주세요.</li>
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onAgain}
          className="h-11 rounded-full bg-sage-deep px-6 text-sm font-medium text-cream hover:bg-ink"
        >
          다른 수업도 예약하기
        </button>
        <Link href="/" className="flex h-11 items-center justify-center rounded-full border border-ink/20 px-6 text-sm">
          홈으로
        </Link>
      </div>
    </div>
  );
}
