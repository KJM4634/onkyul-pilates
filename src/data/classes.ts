// 수업 종류·가격 (가상 가격). 실제 예약 가능한 일정은 블록 2에서 DB(class_sessions)로 관리.

import { PHOTOS, type Photo } from "./images";

export type ClassType = {
  id: "group" | "private" | "trial";
  photo: Photo;
  fromPrice: string;
  name: string;
  summary: string;
  capacity: string;
  duration: string;
  level: string;
  points: string[];
};

export const CLASS_TYPES: ClassType[] = [
  {
    id: "group",
    photo: PHOTOS.reformerArch,
    fromPrice: "회당 30,000원~",
    name: "그룹 기구 수업",
    summary: "리포머·체어를 활용해 최대 6인이 함께하는 정규 수업입니다.",
    capacity: "최대 6인",
    duration: "50분",
    level: "입문 ~ 중급",
    points: ["수준별 반 편성", "주 2~3회 권장", "개인 체형 피드백"],
  },
  {
    id: "private",
    photo: PHOTOS.reformerLegs,
    fromPrice: "회당 70,000원~",
    name: "1:1 개인 레슨",
    summary: "강사와 1:1로 진행하며 목표와 체형에 맞춰 프로그램을 설계합니다.",
    capacity: "1인",
    duration: "50분",
    level: "전 레벨",
    points: ["체형 분석 리포트", "통증·재활 맞춤", "원하는 시간 예약"],
  },
  {
    id: "trial",
    photo: PHOTOS.mat,
    fromPrice: "20,000원",
    name: "체험 수업",
    summary: "처음 오신 분을 위한 1회 체험. 상담과 간단한 체형 체크가 포함됩니다.",
    capacity: "최대 4인",
    duration: "60분 (상담 10분 포함)",
    level: "처음 오신 분",
    points: ["1인 1회 한정", "운동복 대여 가능", "등록 시 체험비 차감"],
  },
];

export type PriceRow = { label: string; price: number; note?: string };
export type PriceGroup = { classId: ClassType["id"]; title: string; rows: PriceRow[] };

export const PRICES: PriceGroup[] = [
  {
    classId: "group",
    title: "그룹 기구 수업",
    rows: [
      { label: "8회 (2개월)", price: 320000, note: "회당 40,000원" },
      { label: "16회 (3개월)", price: 560000, note: "회당 35,000원" },
      { label: "24회 (4개월)", price: 720000, note: "회당 30,000원" },
    ],
  },
  {
    classId: "private",
    title: "1:1 개인 레슨",
    rows: [
      { label: "1회", price: 90000 },
      { label: "10회", price: 800000, note: "회당 80,000원" },
      { label: "20회", price: 1400000, note: "회당 70,000원" },
    ],
  },
  {
    classId: "trial",
    title: "체험 수업",
    rows: [
      { label: "그룹 체험 1회", price: 20000, note: "등록 시 차감" },
      { label: "1:1 체험 1회", price: 50000, note: "등록 시 차감" },
    ],
  },
];

export const PRICE_NOTES = [
  "모든 가격은 부가세 포함, 포트폴리오용 예시 금액입니다.",
  "수강권 기간 내 사용하지 않은 횟수는 연장 신청이 가능합니다(1회).",
  "수업 시작 4시간 전까지 취소하지 않으면 1회 차감됩니다.",
];

// 주간 정규 시간표 (미리보기용 고정 데이터)
export type WeeklySlot = { day: string; times: string[] };

export const WEEKLY_TIMETABLE: WeeklySlot[] = [
  { day: "월", times: ["07:00", "10:00", "19:00", "20:10"] },
  { day: "화", times: ["07:00", "12:00", "19:00", "20:10"] },
  { day: "수", times: ["07:00", "10:00", "19:00", "20:10"] },
  { day: "목", times: ["07:00", "12:00", "19:00", "20:10"] },
  { day: "금", times: ["07:00", "10:00", "19:00"] },
  { day: "토", times: ["10:00", "11:10", "13:00"] },
];

export const formatPrice = (won: number) => `${won.toLocaleString("ko-KR")}원`;
