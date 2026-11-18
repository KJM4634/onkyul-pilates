"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { INSTRUCTORS } from "@/data/instructors";
import type { FormState } from "../actions";

/** 확인 창을 띄운 뒤 제출하는 버튼 (예약 취소·수업 취소 등) */
export function ConfirmSubmit({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={`${className ?? ""} disabled:opacity-50`}
    >
      {pending ? "처리 중…" : children}
    </button>
  );
}

/** 예약자 명단을 클립보드로 복사 */
export function CopyRoster({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.prompt("복사해서 사용하세요", text);
        }
      }}
      className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs hover:bg-cream"
    >
      {copied ? "✓ 복사됨" : "명단 복사"}
    </button>
  );
}

const TITLE_SUGGESTIONS = [
  "모닝 리포머",
  "바른자세 리포머",
  "코어 리포머",
  "릴렉스 매트",
  "런치 매트",
  "주말 리포머",
  "재활 리포머",
  "체험 수업",
];

export type SessionDefaults = {
  id?: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration_min: number;
  capacity: number;
};

const initial: FormState = { status: "idle" };

export function SessionForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  defaults: SessionDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const fe = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="수업명" error={fe.title}>
          <input
            name="title"
            defaultValue={defaults.title}
            list="title-suggestions"
            maxLength={50}
            required
            className={cls(fe.title)}
          />
          <datalist id="title-suggestions">
            {TITLE_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </AdminField>
        <AdminField label="강사" error={fe.instructor}>
          <select name="instructor" defaultValue={defaults.instructor} className={cls(fe.instructor)}>
            {INSTRUCTORS.map((i) => (
              <option key={i.id} value={i.name}>
                {i.name} ({i.role})
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="날짜" error={fe.date}>
          <input type="date" name="date" defaultValue={defaults.date} required className={cls(fe.date)} />
        </AdminField>
        <AdminField label="시작 시간" error={fe.time}>
          <input type="time" name="time" defaultValue={defaults.time} step={600} required className={cls(fe.time)} />
        </AdminField>
        <AdminField label="수업 시간(분)" error={fe.duration_min}>
          <input
            type="number"
            name="duration_min"
            defaultValue={defaults.duration_min}
            min={10}
            max={240}
            step={5}
            className={cls(fe.duration_min)}
          />
        </AdminField>
        <AdminField label="정원(명)" error={fe.capacity}>
          <input
            type="number"
            name="capacity"
            defaultValue={defaults.capacity}
            min={1}
            max={30}
            className={cls(fe.capacity)}
          />
        </AdminField>
      </div>

      {state.status !== "idle" && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm ${state.status === "ok" ? "bg-sage-soft text-sage-deep" : "bg-red-50 text-red-700"}`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-ink px-6 text-sm font-medium text-cream hover:bg-sage-deep disabled:opacity-60 sm:w-auto"
      >
        {pending ? "저장 중…" : submitLabel}
      </button>
    </form>
  );
}

const cls = (err?: string) =>
  `h-11 w-full rounded-xl border bg-white px-3 text-base outline-none focus:border-sage-deep ${err ? "border-red-400" : "border-line"}`;

function AdminField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

/** 로그인 폼 */
export function LoginForm({ action }: { action: (prev: FormState, form: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">이메일</span>
        <input type="email" name="email" autoComplete="username" required className={cls()} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">비밀번호</span>
        <input type="password" name="password" autoComplete="current-password" required className={cls()} />
      </label>
      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-ink text-sm font-medium text-cream hover:bg-sage-deep disabled:opacity-60"
      >
        {pending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
