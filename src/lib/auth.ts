import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";

type SessionClient = NonNullable<Awaited<ReturnType<typeof createSessionClient>>>;

export type AdminCheck =
  | { status: "no-env" }
  | { status: "anonymous" }
  | { status: "forbidden"; email: string | null; supabase: SessionClient }
  | { status: "db-error"; email: string | null; code: string; supabase: SessionClient }
  | { status: "admin"; email: string | null; userId: string; supabase: SessionClient };

/**
 * 서버에서 관리자 여부 판정.
 * - getUser(): Supabase Auth 서버에 토큰을 검증 요청 (쿠키 위조 방지, getSession()은 사용하지 않음)
 * - admins 테이블 조회: RLS상 본인 행만 보이므로 행이 있으면 관리자
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createSessionClient();
  if (!supabase) return { status: "no-env" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) {
    // 조회 자체가 실패 = "관리자 아님"이 아니라 DB 권한/설정 문제 (예: 42501 permission denied)
    console.error(`[admin-check] admins 조회 실패 code=${error.code} message=${error.message}`);
    return { status: "db-error", email: user.email ?? null, code: error.code ?? "unknown", supabase };
  }
  if (!data) return { status: "forbidden", email: user.email ?? null, supabase };

  return { status: "admin", email: user.email ?? null, userId: user.id, supabase };
}

/** 페이지용: 비로그인 → 로그인 페이지로, 권한 없음 → 안내 페이지로 */
export async function requireAdmin() {
  const result = await checkAdmin();
  if (result.status === "admin") return result;
  if (result.status === "forbidden" || result.status === "db-error") redirect("/admin/forbidden");
  redirect("/admin/login");
}
