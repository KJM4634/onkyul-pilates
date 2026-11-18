import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "온결 필라테스 — 몸의 결을 따라, 온전한 균형으로";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bg = await readFile(join(process.cwd(), "public/images/hero-studio.jpg"), "base64");
const bgSrc = `data:image/jpeg;base64,${bg}`;

const KO_TEXT = "온결 필라테스 몸의 결을 따라, 온전한 균형으로 소수정예 실시간 예약";

/** 한글 글리프만 담긴 서브셋 폰트를 Google Fonts에서 받아옴 (실패 시 영문만 표시) */
async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600&text=${encodeURIComponent(KO_TEXT)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const font = await loadKoreanFont();

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#2f2b26" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgSrc}
        alt=""
        width={1200}
        height={630}
        style={{ position: "absolute", top: 0, left: 0, objectFit: "cover", opacity: 0.55 }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "linear-gradient(to top, rgba(47,43,38,0.95), rgba(47,43,38,0.2))",
          color: "#f8f5ef",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, opacity: 0.8 }}>ONKYUL PILATES</div>
        {font ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, marginTop: 16, fontFamily: "NotoSerifKR" }}>온결 필라테스</div>
            <div style={{ fontSize: 34, marginTop: 12, opacity: 0.85, fontFamily: "NotoSerifKR" }}>
              몸의 결을 따라, 온전한 균형으로
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 72, marginTop: 16 }}>Boutique Pilates Studio</div>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {(font ? ["소수정예", "실시간 예약"] : ["Small Group", "Online Booking"]).map((t) => (
            <div
              key={t}
              style={{
                fontSize: 22,
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(248,245,239,0.4)",
                fontFamily: font ? "NotoSerifKR" : undefined,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size, fonts: font ? [{ name: "NotoSerifKR", data: font, style: "normal", weight: 600 }] : [] },
  );
}
