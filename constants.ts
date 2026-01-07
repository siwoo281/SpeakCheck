import { Exercise, ChecklistItem, NoteSection } from './types';

// 운동 데이터: 근육 이완(Muscle)과 발음 훈련(Diction)으로 구분
export const INITIAL_EXERCISES: Exercise[] = [
  // [Category: Muscle (근육 이완)]
  {
    id: '1',
    title: '혀 회전 (Tongue Circle)',
    subtitle: '입을 다문 채 혀로 치아 바깥쪽을 따라 360도로 입안을 천천히 핥아줍니다. (왼쪽/오른쪽 번갈아)',
    category: 'muscle',
    duration: 60,
    timeLeft: 60,
    isActive: false,
    isLocked: false,
  },
  {
    id: '2',
    title: "라이언 포즈 (Lion's Breath)",
    subtitle: "혀를 턱 끝까지 닿도록 길게 내밀며 눈을 크게 뜨고 '하-' 소리와 함께 숨을 내뱉습니다.",
    category: 'muscle',
    duration: 30,
    timeLeft: 30,
    isActive: false,
    isLocked: false,
  },
  {
    id: '3',
    title: '똑딱 시계 (Clock Sound)',
    subtitle: "혀를 입천장에 찼다가 내리며 경쾌하게 '똑딱똑딱' 시계 소리를 냅니다.",
    category: 'muscle',
    duration: 45,
    timeLeft: 45,
    isActive: false,
    isLocked: false,
  },
  {
    id: '10',
    title: '입술 트릴 (Lip Trill)',
    subtitle: "입술을 가볍게 붙인 상태에서 숨을 내뱉으며 '브르르르' 소리를 냅니다. 입술과 얼굴 근육을 이완시키고 호흡 조절 능력을 향상시킵니다.",
    category: 'muscle',
    duration: 40,
    timeLeft: 40,
    isActive: false,
    isLocked: false,
  },
  // [Category: Diction (발음 훈련)]
  {
    id: '4',
    title: '잰말놀이 (Tongue Twisters)',
    subtitle: `간장공장 공장장은 강 공장장이고 된장공장 공장장은 공 공장장이다

저기 있는 저분이 박 법학박사이시고 여기 있는 이분이 백 법학박사이시다

저기 가는 저 상 장사가 새 상 장사냐 헌 상 장사냐

중앙청 창살 쌍 창살 시청 창살 외 창살

한양 양장점 옆 한영 양장점 한영 양장점 옆 한양 양장점

저기 있는 말뚝이 말 맬 말뚝이냐 말 못 맬 말뚝이냐

김해 찹쌀 촌 찹쌀

멍멍이네 꿀꿀이는 멍멍해도 꿀꿀하고 꿀꿀이네 멍멍이는 꿀꿀해도 멍멍하네`,
    category: 'diction',
    duration: 120, // 넉넉하게 120초
    timeLeft: 120,
    isActive: false,
    isLocked: false,
  },
  {
    id: '5',
    title: '크레시아 발음법 (Crescia Method)',
    subtitle: `로얄 막파 싸리톨

쥬피탈 캄파 큐을와

셀레우 아파쿠사

푸랜 마테푸 슈멘헤워제

파라클레세오스 쏘테라이스

플레로사이 아프스톨론`,
    category: 'diction',
    duration: 120,
    timeLeft: 120,
    isActive: false,
    isLocked: false,
  },
  // [Category: Breathing (호흡/이완)]
  {
    id: '6',
    title: '복식호흡 (Diaphragmatic Breathing)',
    subtitle: '배를 부풀리며 깊게 숨을 들이마시고, 천천히 내쉬세요.\n횡경막을 사용한 호흡으로 산소 흡수를 늘리고 목소리의 안정성을 높입니다.',
    category: 'breathing',
    duration: 60,
    timeLeft: 60,
    isActive: false,
    isLocked: false,
  },
  {
    id: '7',
    title: '4-7-8 호흡법',
    subtitle: '4초 들이쉬기 → 7초 멈추기 → 8초 내쉬기\n신경계를 진정시키고 극심한 긴장을 빠르게 완화하는 데 매우 효과적입니다.',
    category: 'breathing',
    duration: 76,
    timeLeft: 76,
    isActive: false,
    isLocked: false,
  },
  {
    id: '8',
    title: '숄더 롤 (Shoulder Roll)',
    subtitle: '어깨를 원형으로 천천히 돌리기 (앞/뒤)\n목과 어깨의 긴장을 풀어 발표 시 자세를 개선합니다.',
    category: 'breathing',
    duration: 45,
    timeLeft: 45,
    isActive: false,
    isLocked: false,
  },
  // [Category: Mental (멘탈 케어)]
  {
    id: '9',
    title: '박스 호흡 (Box Breathing)',
    subtitle: '4초간 마시고, 4초간 멈추고, 4초간 내뱉고, 4초간 멈춥니다. 긴장을 낮추고 집중력을 높이세요.',
    category: 'mental',
    duration: 120,
    timeLeft: 120,
    isActive: false,
    isLocked: false,
  },
];

// 체크리스트 데이터 (한국어 번역)
export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: '1', category: 'Tech Setup', text: '노트북 충전기 연결 확인', completed: false },
  { id: '2', category: 'Tech Setup', text: '방해 금지 모드 설정', completed: false },
  { id: '3', category: 'Tech Setup', text: '슬라이드 클리커 작동 테스트', completed: false },
  { id: '4', category: 'Personal', text: '생수 준비', completed: false },
  { id: '5', category: 'Personal', text: '마이크 음량 테스트 완료', completed: false },
  { id: '6', category: 'Personal', text: '복장 단정함 확인 (지퍼 등) 🤐', completed: false },
  { id: '7', category: 'Mindset', text: '파워 포즈 취하기', meta: '거울 보며 2분', completed: false },
  { id: '8', category: 'Mindset', text: '깊게 심호흡 3번', completed: false },
];

// 발표 노트 데이터 (한국어 번역)
export const INITIAL_NOTES: NoteSection[] = [
  {
    id: '1',
    step: 1,
    title: '도입: 청중 사로잡기 (Hook)',
    points: ['과거의 실패 경험담으로 자연스럽게 시작.', '청중에게 질문 던지기: "이 상황에서 자유로운 분 계신가요?"'],
    isExpanded: false,
  },
  {
    id: '2',
    step: 2,
    title: '문제 제기',
    points: ['현재 시장은 경쟁 과열 상태입니다.', '사용자는 너무 많은 데이터에 피로감을 느낍니다.', '우리의 솔루션이 이 복잡함을 해결합니다.'],
    isExpanded: true,
  },
  {
    id: '3',
    step: 3,
    title: '기술적 해결책',
    points: ['API, 대기 시간을 획기적으로 줄였습니다.', '"Before vs After" 성능 그래프 제시.'],
    isExpanded: false,
  },
  {
    id: '4',
    step: 4,
    title: '마무리기 & 제안 (The Ask)',
    points: ['500만 달러 규모의 기회를 다시 한번 강조.', '마지막 장표에 QR 코드 띄워 바로 연결 유도.'],
    isExpanded: false,
  },
];