// 공개 키(URL, anon/publishable key)만 다룹니다. secret·service_role 키는 이 프로젝트에서 사용하지 않습니다.

/** secret 키(sb_secret_…) 또는 service_role JWT인지 판별 */
function isPrivilegedKey(key: string) {
  if (key.startsWith("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: string };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes("your-project-ref")) return null;

  // 관리자 권한 키가 공개 변수에 들어가면 RLS가 무력화되므로 사용을 거부
  if (isPrivilegedKey(anonKey)) {
    console.error(
      "[보안] NEXT_PUBLIC_SUPABASE_ANON_KEY에 secret/service_role 키가 설정되어 있어 연결을 거부했습니다. " +
        "Supabase Dashboard → Project Settings → API Keys의 publishable 키(sb_publishable_…) 또는 legacy anon 키로 바꿔 주세요.",
    );
    return null;
  }
  return { url, anonKey };
}
