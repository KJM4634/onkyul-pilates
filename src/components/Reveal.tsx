"use client";

import { useEffect } from "react";

/**
 * [data-reveal] 요소가 화면에 들어오면 부드럽게 나타나게 합니다.
 * JS가 실행된 뒤에만 html에 js-reveal 클래스를 붙이므로, JS가 없어도 내용은 항상 보입니다.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const observeAll = () =>
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
    observeAll();

    // 페이지 이동으로 새로 렌더된 요소도 감지
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
