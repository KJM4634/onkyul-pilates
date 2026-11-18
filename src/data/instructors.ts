// 강사 정보 (가상 인물)

export type Instructor = {
  id: string;
  name: string;
  role: string;
  specialty: string[];
  career: string[];
  intro: string;
};

export const INSTRUCTORS: Instructor[] = [
  {
    id: "seoyoon",
    name: "한서윤",
    role: "대표 원장",
    specialty: ["기구 필라테스", "체형 교정"],
    career: ["국제 필라테스 지도자 자격 (가상)", "필라테스 지도 경력 10년", "스포츠재활 전공"],
    intro: "작은 습관의 교정이 큰 변화를 만든다고 믿어요. 무리하지 않고 오래 가는 운동을 함께합니다.",
  },
  {
    id: "jiwoo",
    name: "정지우",
    role: "수석 강사",
    specialty: ["재활 필라테스", "통증 관리"],
    career: ["재활 필라테스 과정 수료 (가상)", "병원 연계 운동센터 5년", "물리치료학 학사"],
    intro: "허리·어깨 불편함이 있는 분들도 안심하고 시작할 수 있도록 단계별로 안내합니다.",
  },
  {
    id: "hayoung",
    name: "윤하영",
    role: "강사",
    specialty: ["매트 필라테스", "산전·산후"],
    career: ["산전·산후 필라테스 과정 수료 (가상)", "그룹 수업 지도 4년", "요가 지도자 자격 (가상)"],
    intro: "호흡에서 시작하는 부드러운 움직임으로 몸과 마음의 긴장을 함께 풀어드려요.",
  },
];
