import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/** 로그인 세션(쿠키)을 사용하는 서버 클라이언트 — 관리자 페이지·서버 액션용 */
export async function createSessionClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트 렌더 중에는 쿠키를 쓸 수 없음 — 세션 갱신은 proxy.ts가 담당
        }
      },
    },
  });
}
