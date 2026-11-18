"use server";

import { refresh } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { validateBooking } from "@/lib/validation";
import type { BookingState } from "./types";

const RPC_ERRORS: Record<string, string> = {
  CONSENT_REQUIRED: "개인정보 수집·이용에 동의해 주세요.",
  INVALID_NAME: "이름을 다시 확인해 주세요.",
  INVALID_PHONE: "휴대폰 번호를 다시 확인해 주세요.",
  SESSION_NOT_FOUND: "수업을 찾을 수 없어요. 시간표를 새로고침해 주세요.",
  SESSION_CLOSED: "예약이 마감되었거나 취소된 수업이에요.",
  SESSION_FULL: "아쉽게도 방금 정원이 모두 찼어요. 다른 시간을 선택해 주세요.",
  ALREADY_BOOKED: "이미 같은 연락처로 예약된 수업이에요.",
  TOO_MANY_BOOKINGS: "한 연락처로는 예정된 수업을 최대 4개까지 예약할 수 있어요. 추가 예약은 전화로 문의해 주세요.",
};

export async function createBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  // 스팸 봇 방지용 숨김 필드 (사람은 비워둠)
  if (String(form.get("website") ?? "") !== "") {
    return { status: "error", message: "요청을 처리할 수 없어요." };
  }

  const { data, errors, ok } = validateBooking(form);
  if (!ok) {
    return { status: "error", message: "입력 내용을 확인해 주세요.", fieldErrors: errors };
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return { status: "error", message: "예약 시스템이 아직 연결되지 않았어요. 잠시 후 다시 시도해 주세요." };
  }

  const { data: bookingId, error } = await supabase.rpc("create_booking", {
    p_session_id: data.sessionId,
    p_name: data.name,
    p_phone: data.phone,
    p_agreed: data.agreed,
  });

  if (error || typeof bookingId !== "string") {
    const message = (error && RPC_ERRORS[error.message]) ?? "예약 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
    if (error && !RPC_ERRORS[error.message]) console.error("create_booking failed:", error.message);
    refresh(); // 남은 자리 최신화
    return { status: "error", message };
  }

  refresh();
  return { status: "success", bookingId, name: data.name };
}
