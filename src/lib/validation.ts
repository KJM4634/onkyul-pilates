// 서버 액션에서 사용하는 입력 검증 (DB 함수에서도 한 번 더 검증함)

export const PHONE_RE = /^01[016789]\d{7,8}$/;

export const normalizePhone = (v: string) => v.replace(/\D/g, "");

export function formatPhone(digits: string) {
  const d = normalizePhone(digits);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type FieldErrors = Partial<Record<string, string>>;

export function validateBooking(form: FormData) {
  const sessionId = String(form.get("sessionId") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  const agreed = form.get("agreed") === "on";

  const errors: FieldErrors = {};
  if (!UUID_RE.test(sessionId)) errors.sessionId = "수업을 다시 선택해 주세요.";
  if (name.length < 1 || name.length > 20) errors.name = "이름을 1~20자로 입력해 주세요.";
  else if (/[<>{}]/.test(name)) errors.name = "이름에 사용할 수 없는 문자가 있어요.";
  if (!PHONE_RE.test(phone)) errors.phone = "휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)";
  if (!agreed) errors.agreed = "개인정보 수집·이용에 동의해 주세요.";

  return { data: { sessionId, name, phone, agreed }, errors, ok: Object.keys(errors).length === 0 };
}

/** 관리자 수업 등록·수정 폼 */
export function validateSessionForm(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const instructor = String(form.get("instructor") ?? "").trim();
  const date = String(form.get("date") ?? "");
  const time = String(form.get("time") ?? "");
  const duration = Number(form.get("duration_min"));
  const capacity = Number(form.get("capacity"));

  const errors: FieldErrors = {};
  if (title.length < 1 || title.length > 50) errors.title = "수업명을 1~50자로 입력해 주세요.";
  if (instructor.length < 1 || instructor.length > 20) errors.instructor = "강사를 선택해 주세요.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "날짜를 선택해 주세요.";
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "시간을 선택해 주세요.";
  if (!Number.isInteger(duration) || duration < 10 || duration > 240)
    errors.duration_min = "10~240분 사이로 입력해 주세요.";
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) errors.capacity = "정원은 1~30명이에요.";

  // 서울 시간(UTC+9, 서머타임 없음) 기준으로 저장
  const startAt = errors.date || errors.time ? "" : new Date(`${date}T${time}:00+09:00`).toISOString();

  return {
    data: { title, instructor, start_at: startAt, duration_min: duration, capacity },
    errors,
    ok: Object.keys(errors).length === 0,
  };
}
