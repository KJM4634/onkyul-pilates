// 모든 날짜 표시는 서울 시간 기준 (서버·브라우저 시간대와 무관하게 동일한 결과)

const TZ = "Asia/Seoul";

/** YYYY-MM-DD (서울 기준) */
export function seoulDateKey(d: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(d),
  );
}

/** HH:mm (서울 기준) */
export function seoulTime(d: Date | string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(d),
  );
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 'YYYY-MM-DD' 키에서 요일·월·일 추출 (시간대 영향 없음) */
export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { year: y, month: m, day: d, dow, weekday: WEEKDAYS[dow] };
}

export function addDaysToKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 서울 기준 날짜 키의 자정 → UTC ISO */
export function seoulMidnightIso(key: string) {
  return new Date(`${key}T00:00:00+09:00`).toISOString();
}

/** 예: 11월 19일 (수) 19:00 */
export function formatSessionDate(iso: string) {
  const { month, day, weekday } = parseDateKey(seoulDateKey(iso));
  return `${month}월 ${day}일 (${weekday}) ${seoulTime(iso)}`;
}
