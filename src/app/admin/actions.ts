"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { UUID_RE, validateSessionForm, type FieldErrors } from "@/lib/validation";

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "ok"; message: string };

const NOT_ADMIN: FormState = { status: "error", message: "관리자 권한이 없어요. 다시 로그인해 주세요." };

// 모든 관리자 액션은 페이지 접근 여부와 무관하게 여기서 다시 권한을 확인합니다.
async function adminClient() {
  const check = await checkAdmin();
  return check.status === "admin" ? check.supabase : null;
}

/* ---------------- 로그인 / 로그아웃 ---------------- */

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { status: "error", message: "이메일 형식을 확인해 주세요." };
  }
  if (password.length < 6 || password.length > 72) {
    return { status: "error", message: "비밀번호를 확인해 주세요." };
  }

  const supabase = await createSessionClient();
  if (!supabase) return { status: "error", message: "Supabase 환경변수가 설정되지 않았어요." };

  // [1] Supabase Auth 로그인
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`[admin-login] 1단계(Auth) 실패 code=${error.code} status=${error.status}`);
    if (error.code === "email_not_confirmed") {
      return {
        status: "error",
        message: "이메일 인증이 완료되지 않은 계정이에요. Supabase에서 사용자를 확인(Confirm) 처리해 주세요.",
      };
    }
    return { status: "error", message: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  // [2] 세션 쿠키로 사용자 재확인 + [3] admins 테이블 확인
  const check = await checkAdmin();
  if (check.status !== "admin") {
    console.error(`[admin-login] 2~3단계 실패 status=${check.status}`);
    await supabase.auth.signOut();
    if (check.status === "db-error") {
      return {
        status: "error",
        message: `로그인은 됐지만 관리자 권한을 확인하지 못했어요 (DB 오류 ${check.code}). 테이블 권한(GRANT) 설정을 확인해 주세요.`,
      };
    }
    if (check.status === "anonymous") {
      return { status: "error", message: "로그인 세션을 저장하지 못했어요. 브라우저 쿠키 설정을 확인해 주세요." };
    }
    return { status: "error", message: "관리자로 등록되지 않은 계정이에요." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

/* ---------------- 예약 취소 ---------------- */

export async function cancelBooking(form: FormData): Promise<void> {
  const bookingId = String(form.get("bookingId") ?? "");
  if (!UUID_RE.test(bookingId)) return;
  const supabase = await adminClient();
  if (!supabase) redirect("/admin/login");

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("status", "confirmed");
  if (error) console.error("cancelBooking failed:", error.message);
  refresh();
}

/* ---------------- 수업 등록·수정·취소 ---------------- */

export async function createSession(_prev: FormState, form: FormData): Promise<FormState> {
  const supabase = await adminClient();
  if (!supabase) return NOT_ADMIN;

  const { data, errors, ok } = validateSessionForm(form);
  if (!ok) return { status: "error", message: "입력 내용을 확인해 주세요.", fieldErrors: errors };

  const { data: created, error } = await supabase.from("class_sessions").insert(data).select("id").single();
  if (error || !created) {
    console.error("createSession failed:", error?.message);
    return { status: "error", message: "수업을 저장하지 못했어요." };
  }
  redirect(`/admin/sessions/${created.id}?saved=1`);
}

export async function updateSession(_prev: FormState, form: FormData): Promise<FormState> {
  const supabase = await adminClient();
  if (!supabase) return NOT_ADMIN;

  const id = String(form.get("id") ?? "");
  if (!UUID_RE.test(id)) return { status: "error", message: "잘못된 요청이에요." };

  const { data, errors, ok } = validateSessionForm(form);
  if (!ok) return { status: "error", message: "입력 내용을 확인해 주세요.", fieldErrors: errors };

  // 정원을 현재 확정 예약 수보다 적게 줄이지 못하도록
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", id)
    .eq("status", "confirmed");
  if ((count ?? 0) > data.capacity) {
    return {
      status: "error",
      message: `이미 ${count}명이 예약해서 정원을 ${count}명 미만으로 줄일 수 없어요.`,
      fieldErrors: { capacity: `최소 ${count}명` },
    };
  }

  const { error } = await supabase.from("class_sessions").update(data).eq("id", id);
  if (error) {
    console.error("updateSession failed:", error.message);
    return { status: "error", message: "수업을 수정하지 못했어요." };
  }
  refresh();
  return { status: "ok", message: "저장했어요." };
}

export async function setSessionCancelled(form: FormData): Promise<void> {
  const id = String(form.get("id") ?? "");
  const cancelled = form.get("cancelled") === "true";
  if (!UUID_RE.test(id)) return;
  const supabase = await adminClient();
  if (!supabase) redirect("/admin/login");

  const { error } = await supabase.from("class_sessions").update({ is_cancelled: cancelled }).eq("id", id);
  if (error) console.error("setSessionCancelled failed:", error.message);
  refresh();
}
