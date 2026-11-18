// 사이트 사진 (Unsplash License — 무료 상업적 사용 가능, 출처는 README에도 기록)
// 파일은 public/images 에 저장되어 있음

export type Photo = { src: string; alt: string; width: number; height: number; credit: string; source: string };

export const PHOTOS = {
  heroStudio: {
    src: "/images/hero-studio.jpg",
    alt: "리포머 기구가 줄지어 놓인 밝은 필라테스 스튜디오",
    width: 1800,
    height: 1161,
    credit: "Maverick Frame",
    source: "https://unsplash.com/photos/GQuXJnv4t60",
  },
  reformerLegs: {
    src: "/images/reformer-1.jpg",
    alt: "리포머 위에서 스트랩을 이용해 다리를 들어 올리는 동작",
    width: 1200,
    height: 1697,
    credit: "ROXANA POPOVICI",
    source: "https://unsplash.com/photos/aY5uOJ2o96g",
  },
  reformerPlank: {
    src: "/images/reformer-2.jpg",
    alt: "리포머 바를 잡고 플랭크 자세를 취하는 회원",
    width: 1200,
    height: 675,
    credit: "ROXANA POPOVICI",
    source: "https://unsplash.com/photos/5JQxj-zc5ng",
  },
  reformerArch: {
    src: "/images/reformer-3.jpg",
    alt: "아치형 거울 앞 리포머에서 한쪽 다리를 높이 드는 동작",
    width: 1200,
    height: 1697,
    credit: "ROXANA POPOVICI",
    source: "https://unsplash.com/photos/cZ0WYsBFHhs",
  },
  equipment: {
    src: "/images/equipment.jpg",
    alt: "나무 벽에 정돈된 짐볼, 링, 스프링 등 소도구",
    width: 1200,
    height: 1800,
    credit: "Caroline Badran",
    source: "https://unsplash.com/photos/m56-PAdMhM0",
  },
  mat: {
    src: "/images/mat.jpg",
    alt: "매트 위에서 숄더 스탠드 자세를 하는 모습",
    width: 1200,
    height: 1680,
    credit: "Nasim Keshmiri",
    source: "https://unsplash.com/photos/twBW7obiOLQ",
  },
} satisfies Record<string, Photo>;
