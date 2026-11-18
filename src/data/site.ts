// 매장 기본 정보 (포트폴리오용 가상 매장 — 실제 정보 아님)

export const SITE = {
  name: "온결 필라테스",
  nameEn: "ONKYUL PILATES",
  tagline: "몸의 결을 따라, 온전한 균형으로",
  description: "소수정예 그룹 수업과 1:1 개인 레슨으로 바른 자세와 단단한 코어를 만드는 동네 필라테스 스튜디오입니다.",
  address: "서울특별시 성동구 성수이로 00, 3층 (가상 주소)",
  addressShort: "성수역 3번 출구 도보 5분",
  phone: "02-000-0000",
  email: "hello@onkyul.example",
  kakaoChannel: "@온결필라테스",
  hours: [
    { label: "평일", time: "07:00 – 22:00" },
    { label: "토요일", time: "09:00 – 16:00" },
    { label: "일요일·공휴일", time: "휴무" },
  ],
  mapUrl: "https://map.naver.com/p/search/" + encodeURIComponent("성수역 3번 출구"),
  transit: [
    { type: "지하철", detail: "2호선 성수역 3번 출구에서 도보 5분" },
    { type: "버스", detail: "성수역 정류장 하차 (간선 000, 지선 0000)" },
    { type: "주차", detail: "건물 내 2시간 무료 주차 (수업 당일 등록 시)" },
  ],
  disclaimer: "포트폴리오용 가상 매장입니다. 실제 영업하지 않으며, 표기된 정보는 모두 예시입니다.",
} as const;

export type NavItem = { href: string; label: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/about", label: "소개" },
  { href: "/instructors", label: "강사" },
  { href: "/classes", label: "수업·가격" },
  { href: "/booking", label: "예약" },
  { href: "/location", label: "오시는 길" },
];

export const STRENGTHS = [
  {
    title: "최대 6인 소수정예",
    description: "한 분 한 분의 정렬을 강사가 직접 확인할 수 있는 인원만 받습니다.",
  },
  {
    title: "자격 갖춘 전문 강사진",
    description: "국제 자격과 재활·산전후 경력을 갖춘 강사가 수준별로 지도합니다.",
  },
  {
    title: "체형 분석 후 맞춤 수업",
    description: "첫 수업에서 자세와 움직임을 분석해 나에게 맞는 프로그램을 제안합니다.",
  },
] as const;

export const STATS = [
  { value: "6", unit: "인", label: "그룹 수업 최대 인원" },
  { value: "10", unit: "년+", label: "대표 원장 지도 경력" },
  { value: "22", unit: "개", label: "주간 정규 수업" },
  { value: "3", unit: "인", label: "전문 강사진" },
] as const;

export const MARQUEE_WORDS = [
  "Reformer",
  "체형 교정",
  "Chair",
  "코어 강화",
  "Cadillac",
  "재활 필라테스",
  "Mat",
  "산전·산후",
  "Breathing",
  "바른 자세",
];

// 포트폴리오용 예시 후기 (실제 회원 후기 아님 — 화면에도 '예시'로 표기)
export const TESTIMONIALS = [
  {
    quote:
      "허리 통증 때문에 시작했는데, 3개월 만에 아침에 일어날 때 몸이 가벼워졌어요. 소수 인원이라 자세를 계속 봐주셔서 좋아요.",
    name: "김○○",
    meta: "그룹 수업 6개월 차",
  },
  {
    quote:
      "출산 후 체형이 많이 무너졌었는데 1:1 레슨으로 천천히 회복하고 있어요. 무리하지 않게 이끌어 주셔서 안심돼요.",
    name: "이○○",
    meta: "1:1 레슨 3개월 차",
  },
  {
    quote:
      "예약이 온라인으로 바로 되고 남은 자리가 보여서 퇴근 후 시간 맞추기가 정말 편해요. 공간도 조용하고 깔끔합니다.",
    name: "박○○",
    meta: "그룹 수업 1년 차",
  },
] as const;

export const BOOKING_STEPS = [
  { title: "시간표에서 선택", description: "날짜별 수업과 남은 자리를 한눈에 보고 원하는 시간을 고르세요." },
  { title: "이름·연락처 입력", description: "회원가입 없이 이름과 연락처만 입력하면 됩니다." },
  { title: "예약 완료", description: "예약번호가 발급되고, 내 캘린더에 바로 추가할 수 있어요." },
] as const;
