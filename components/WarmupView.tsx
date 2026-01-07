import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Lock, RotateCcw, Dumbbell, Mic, Brain } from 'lucide-react';
import { Exercise, UserCondition } from '../types';

interface WarmupViewProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  userCondition: UserCondition | null;
  setUserCondition: React.Dispatch<React.SetStateAction<UserCondition | null>>;
}

const WarmupView: React.FC<WarmupViewProps> = ({ exercises, setExercises, userCondition, setUserCondition }) => {

  const recommendationDetailsRef = useRef<HTMLDivElement | null>(null);
  const exercisesListRef = useRef<HTMLDivElement | null>(null);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    // Check if any exercise is active
    const activeExerciseIndex = exercises.findIndex(e => e.isActive);

    if (activeExerciseIndex !== -1) {
      interval = setInterval(() => {
        setExercises(prev => {
          const newExercises = [...prev];
          const current = newExercises[activeExerciseIndex];

          if (current.timeLeft > 0) {
            current.timeLeft -= 1;
          } else {
            current.isActive = false; // Stop when done
          }
          return newExercises;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [exercises, setExercises]);

  const toggleTimer = (id: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === id) {
        // Toggle this one
        return { ...ex, isActive: !ex.isActive };
      }
      // Pause others if specific one is clicked
      return { ...ex, isActive: false };
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate overall readiness for the circular chart
  const totalDuration = exercises.reduce((acc, curr) => acc + curr.duration, 0);
  const totalTimeLeft = exercises.reduce((acc, curr) => acc + curr.timeLeft, 0);
  const percentComplete = Math.round(((totalDuration - totalTimeLeft) / totalDuration) * 100);

  // SVG Calculation for Circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentComplete / 100) * circumference;

  // Box Breathing 애니메이션 상태 계산 (4초 주기: Inhale -> Hold -> Exhale -> Hold)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [isMentalActive, setIsMentalActive] = useState(false);

  // 4-7-8 Breathing 애니메이션 상태 (3단계: Inhale -> Hold -> Exhale)
  const [breath478Phase, setBreath478Phase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [is478Active, setIs478Active] = useState(false);

  // SOS 긴급 진정 모드 상태
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosTimeLeft, setSosTimeLeft] = useState(60);
  const [sosPhase, setSosPhase] = useState<'breath' | 'relax'>('breath');

  // Mental exercise 활성 상태 추적
  useEffect(() => {
    const mentalActive = exercises.some(ex => ex.category === 'mental' && ex.isActive);
    setIsMentalActive(mentalActive);

    if (!mentalActive) {
      setBreathPhase('inhale'); // 비활성화 시 초기화
    }
  }, [exercises]);

  // 4-7-8 exercise 활성 상태 추적
  useEffect(() => {
    const breathing478Active = exercises.some(ex => ex.id === '7' && ex.isActive);
    setIs478Active(breathing478Active);

    if (!breathing478Active) {
      setBreath478Phase('inhale'); // 비활성화 시 초기화
    }
  }, [exercises]);

  // Phase 자동 변경 (mental이 활성화된 경우에만)
  useEffect(() => {
    if (!isMentalActive) return;

    // 4초마다 phase 변경
    const phaseInterval = setInterval(() => {
      setBreathPhase(current => {
        if (current === 'inhale') return 'hold1';
        if (current === 'hold1') return 'exhale';
        if (current === 'exhale') return 'hold2';
        return 'inhale';
      });
    }, 4000);

    return () => clearInterval(phaseInterval);
  }, [isMentalActive]);

  // 4-7-8 Phase 자동 변경 (4초 들이쉬기 → 7초 멈추기 → 8초 내쉬기)
  useEffect(() => {
    if (!is478Active) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const cycleTo478Phase = (nextPhase: 'inhale' | 'hold' | 'exhale', delay: number) => {
      timeoutId = setTimeout(() => {
        setBreath478Phase(nextPhase);
      }, delay);
    };

    // 현재 phase에 따라 다음 phase로 전환
    if (breath478Phase === 'inhale') {
      cycleTo478Phase('hold', 4000); // 4초 후
    } else if (breath478Phase === 'hold') {
      cycleTo478Phase('exhale', 7000); // 7초 후
    } else if (breath478Phase === 'exhale') {
      cycleTo478Phase('inhale', 8000); // 8초 후
    }

    return () => clearTimeout(timeoutId);
  }, [is478Active, breath478Phase]);

  // SOS 모드 타이머 로직 및 스크롤 방지
  useEffect(() => {
    if (!isSOSActive) return;

    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';

    const sosTimer = setInterval(() => {
      setSosTimeLeft(prev => {
        if (prev <= 1) {
          setIsSOSActive(false);
          setSosTimeLeft(60);
          setSosPhase('breath');
          return 60;
        }

        // 30초 지점에서 breath -> relax 전환 (30초가 되기 전에 전환)
        if (prev === 30) {
          setSosPhase('relax');
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(sosTimer);
      // 스크롤 복원
      document.body.style.overflow = '';
    };
  }, [isSOSActive]);

  const startSOSMode = () => {
    // 다른 모든 운동 중지
    setExercises(prev => prev.map(ex => ({ ...ex, isActive: false })));
    setIsSOSActive(true);
    setSosTimeLeft(60);
    setSosPhase('breath');
  };

  const stopSOSMode = () => {
    setIsSOSActive(false);
    setSosTimeLeft(60);
    setSosPhase('breath');
  };

  const getSOSInstructions = () => {
    if (sosPhase === 'breath') {
      const remaining = sosTimeLeft - 30;
      if (remaining > 20) return '깊게 천천히 숨을 들이마시고...';
      if (remaining > 10) return '천천히 내쉬세요...';
      return '계속 깊게 호흡하세요...';
    } else {
      if (sosTimeLeft > 20) return '어깨를 천천히 돌리세요...';
      if (sosTimeLeft > 10) return '목 근육을 풀어주세요...';
      return '거의 끝났어요, 차분해지고 있어요...';
    }
  };

  const getBreathPhaseText = () => {
    switch (breathPhase) {
      case 'inhale': return '마시세요';
      case 'hold1': return '멈추세요';
      case 'exhale': return '내쉬세요';
      case 'hold2': return '멈추세요';
    }
  };

  const get478PhaseText = () => {
    switch (breath478Phase) {
      case 'inhale': return '마시세요 (4초)';
      case 'hold': return '멈추세요 (7초)';
      case 'exhale': return '내쉬세요 (8초)';
    }
  };

  // 컨디션별 추천 운동 가져오기
  const getRecommendedExercises = (condition: UserCondition): string[] => {
    switch (condition) {
      case 'very-nervous':
        return ['9', '7']; // 박스 호흡, 4-7-8 호흡로 급속 진정
      case 'nervous':
        return ['6', '7', '10']; // 복식호흡, 4-7-8, 입술 트릴
      case 'normal':
        return ['1', '2', '4', '6']; // 기본 근육 + 발음 + 호흡
      case 'calm':
        return ['4', '5', '8']; // 발음 훈련 중심
      case 'confident':
        return ['4', '5']; // 고급 발음 훈련만
      default:
        return [];
    }
  };

  const applyRecommendation = () => {
    if (!userCondition) return;

    setExercises(prev => prev.map(ex => ({
      ...ex,
      isActive: false, // 모든 비활성화
      timeLeft: ex.duration // 시간 초기화
    })));

    setShowRecommendedOnly(true);

    // 추천 운동 목록의 첫 번째 운동으로 자동 스크롤
    setTimeout(() => {
      exercisesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // 컨디션 선택 시: 추천 영역으로 자동 스크롤 + 추천-only 해제(새 컨디션에 대해 다시 적용)
  useEffect(() => {
    setShowRecommendedOnly(false);
    if (!userCondition) return;

    requestAnimationFrame(() => {
      recommendationDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [userCondition]);

  const getConditionText = (condition: UserCondition): string => {
    switch (condition) {
      case 'very-nervous': return '매우 긴장됨 😰';
      case 'nervous': return '긴장됨 😅';
      case 'normal': return '보통 🙂';
      case 'calm': return '차분함 😌';
      case 'confident': return '자신만만 😎';
    }
  };

  // Box Breathing 전용 렌더링
  const renderBoxBreathingCard = (ex: Exercise) => {
    return (
      <article
        key={ex.id}
        className={`
          relative w-full rounded-2xl p-[1px] overflow-hidden transition-all duration-300
          ${ex.isActive ? 'shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]' : 'shadow-none'}
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-teal-start to-teal-end opacity-${ex.isActive ? '100' : '0'} transition-opacity duration-300`} />

        <div className={`
          relative h-full w-full rounded-[15px] p-5 flex flex-col gap-4 transition-colors
          ${ex.isActive ? 'bg-[#1a1a1a]' : 'bg-[#1E1E1E] border border-white/5 hover:bg-[#252525]'}
        `}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {ex.isActive && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-300 tracking-wide border border-teal-500/20">
                    진행 중
                  </span>
                )}
                <span className="text-gray-400 text-xs font-mono">
                  {ex.timeLeft === 0 ? '완료' : `남은 시간: ${formatTime(ex.timeLeft)}`}
                </span>
              </div>
              <h4 className={`font-bold leading-tight ${ex.isActive ? 'text-white' : 'text-gray-200'} text-base`}>
                {ex.title}
              </h4>
              <p className="text-gray-400 mt-2 leading-normal text-sm line-clamp-2">
                {ex.subtitle}
              </p>
            </div>

            <button
              onClick={() => toggleTimer(ex.id)}
              className={`
                flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95
                ${ex.isActive
                  ? 'bg-gradient-to-r from-teal-start to-teal-end text-black shadow-lg shadow-teal-500/20'
                  : 'bg-white/5 text-white hover:bg-white/10'}
              `}
            >
              {ex.isActive ? <Pause size={24} fill="currentColor" /> : (ex.timeLeft === 0 ? <RotateCcw size={22} /> : <Play size={24} fill="currentColor" />)}
            </button>
          </div>

          {/* 박스 호흡 시각적 가이드 */}
          {ex.isActive && (
            <div className="flex flex-col items-center justify-center py-8 gap-6">
              {/* 원형 오브젝트: 4초 주기로 크기 변화 */}
              <div className="relative flex items-center justify-center w-40 h-40">
                <div
                  className={`
                    absolute rounded-full bg-gradient-to-br from-teal-start/30 to-teal-end/30 border-2 border-teal-start
                    transition-all ease-in-out shadow-[0_0_20px_rgba(45,212,191,0.4)]
                    ${breathPhase === 'inhale' ? 'w-32 h-32 duration-[4000ms]' : ''}
                    ${breathPhase === 'hold1' ? 'w-32 h-32 duration-0' : ''}
                    ${breathPhase === 'exhale' ? 'w-16 h-16 duration-[4000ms]' : ''}
                    ${breathPhase === 'hold2' ? 'w-16 h-16 duration-0' : ''}
                  `}
                />
                <span className="relative z-10 text-white font-bold text-xl drop-shadow-lg">
                  {getBreathPhaseText()}
                </span>
              </div>

              {/* 진행 표시 - 현재 phase 강조 */}
              <div className="flex gap-3">
                {[
                  { phase: 'inhale', label: '흡입' },
                  { phase: 'hold1', label: '멈춤' },
                  { phase: 'exhale', label: '호출' },
                  { phase: 'hold2', label: '멈춤' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${breathPhase === item.phase
                          ? 'bg-teal-start scale-125 shadow-[0_0_10px_rgba(45,212,191,0.8)]'
                          : 'bg-white/20 scale-100'
                        }`}
                    />
                    <span className={`text-[9px] font-medium transition-colors duration-300 ${breathPhase === item.phase ? 'text-teal-300' : 'text-gray-600'
                      }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full flex flex-col gap-2 mt-2">
            {ex.isActive && (
              <div className="flex justify-between items-end text-xs text-gray-400 animate-pulse">
                <span>진행률</span>
                <span className="text-teal-start font-medium">
                  {Math.round(((ex.duration - ex.timeLeft) / ex.duration) * 100)}%
                </span>
              </div>
            )}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-start to-teal-end rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((ex.duration - ex.timeLeft) / ex.duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </article>
    );
  };

  // 4-7-8 Breathing 전용 렌더링
  const render478BreathingCard = (ex: Exercise) => {
    return (
      <article
        key={ex.id}
        className={`
          relative w-full rounded-2xl p-[1px] overflow-hidden transition-all duration-300
          ${ex.isActive ? 'shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]' : 'shadow-none'}
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-teal-start to-teal-end opacity-${ex.isActive ? '100' : '0'} transition-opacity duration-300`} />

        <div className={`
          relative h-full w-full rounded-[15px] p-5 flex flex-col gap-4 transition-colors
          ${ex.isActive ? 'bg-[#1a1a1a]' : 'bg-[#1E1E1E] border border-white/5 hover:bg-[#252525]'}
        `}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {ex.isActive && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-300 tracking-wide border border-teal-500/20">
                    진행 중
                  </span>
                )}
                <span className="text-gray-400 text-xs font-mono">
                  {ex.timeLeft === 0 ? '완료' : `남은 시간: ${formatTime(ex.timeLeft)}`}
                </span>
              </div>
              <h4 className={`font-bold leading-tight ${ex.isActive ? 'text-white' : 'text-gray-200'} text-base`}>
                {ex.title}
              </h4>
              <p className="text-gray-400 mt-2 leading-normal text-sm line-clamp-2">
                {ex.subtitle}
              </p>
            </div>

            <button
              onClick={() => toggleTimer(ex.id)}
              className={`
                flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95
                ${ex.isActive
                  ? 'bg-gradient-to-r from-teal-start to-teal-end text-black shadow-lg shadow-teal-500/20'
                  : 'bg-white/5 text-white hover:bg-white/10'}
              `}
            >
              {ex.isActive ? <Pause size={24} fill="currentColor" /> : (ex.timeLeft === 0 ? <RotateCcw size={22} /> : <Play size={24} fill="currentColor" />)}
            </button>
          </div>

          {/* 4-7-8 호흡 시각적 가이드 */}
          {ex.isActive && (
            <div className="flex flex-col items-center justify-center py-8 gap-6">
              {/* 원형 오브젝트: 가변 시간으로 크기 변화 */}
              <div className="relative flex items-center justify-center w-40 h-40">
                <div
                  className={`
                    absolute rounded-full bg-gradient-to-br from-teal-start/30 to-teal-end/30 border-2 border-teal-start
                    transition-all ease-in-out shadow-[0_0_20px_rgba(45,212,191,0.4)]
                    ${breath478Phase === 'inhale' ? 'w-32 h-32 duration-[4000ms]' : ''}
                    ${breath478Phase === 'hold' ? 'w-32 h-32 duration-0' : ''}
                    ${breath478Phase === 'exhale' ? 'w-16 h-16 duration-[8000ms]' : ''}
                  `}
                />
                <span className="relative z-10 text-white font-bold text-lg drop-shadow-lg text-center">
                  {get478PhaseText()}
                </span>
              </div>

              {/* 진행 표시 - 현재 phase 강조 (3단계) */}
              <div className="flex gap-4">
                {[
                  { phase: 'inhale', label: '흡입 4초' },
                  { phase: 'hold', label: '멈춤 7초' },
                  { phase: 'exhale', label: '호출 8초' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${breath478Phase === item.phase
                          ? 'bg-teal-start scale-125 shadow-[0_0_10px_rgba(45,212,191,0.8)]'
                          : 'bg-white/20 scale-100'
                        }`}
                    />
                    <span className={`text-[9px] font-medium transition-colors duration-300 ${breath478Phase === item.phase ? 'text-teal-300' : 'text-gray-600'
                      }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full flex flex-col gap-2 mt-2">
            {ex.isActive && (
              <div className="flex justify-between items-end text-xs text-gray-400 animate-pulse">
                <span>진행률</span>
                <span className="text-teal-start font-medium">
                  {Math.round(((ex.duration - ex.timeLeft) / ex.duration) * 100)}%
                </span>
              </div>
            )}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-start to-teal-end rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((ex.duration - ex.timeLeft) / ex.duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderExerciseCard = (ex: Exercise) => {
    const isDiction = ex.category === 'diction';
    const isRecommended = userCondition ? getRecommendedExercises(userCondition).includes(ex.id) : false;

    return (
      <article
        key={ex.id}
        className={`
          relative w-full rounded-2xl p-[1px] overflow-hidden transition-all duration-300
          ${ex.isActive ? 'shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]' : 'shadow-none'}
          ${isRecommended ? 'ring-2 ring-teal-500/30' : ''}
        `}
      >
        {/* 추천 마크 */}
        {isRecommended && (
          <div className="absolute top-2 right-2 z-20 bg-teal-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            추천
          </div>
        )}
        {/* Active Gradient Border Background */}
        <div className={`absolute inset-0 bg-gradient-to-br from-teal-start to-teal-end opacity-${ex.isActive ? '100' : '0'} transition-opacity duration-300`} />

        {/* Inner Card Content */}
        <div className={`
          relative h-full w-full rounded-[15px] p-5 flex flex-col gap-4 transition-colors
          ${ex.isActive ? 'bg-[#1a1a1a]' : 'bg-[#1E1E1E] border border-white/5 hover:bg-[#252525]'}
        `}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {ex.isActive && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-300 tracking-wide border border-teal-500/20">
                    진행 중
                  </span>
                )}
                <span className="text-gray-400 text-xs font-mono">
                  {ex.timeLeft === 0 ? '완료' : `남은 시간: ${formatTime(ex.timeLeft)}`}
                </span>
              </div>
              <h4 className={`font-bold leading-tight truncate ${ex.isActive ? 'text-white' : 'text-gray-200'} ${isDiction ? 'text-lg' : 'text-base'}`}>
                {ex.title}
              </h4>
              <p className={`
                text-gray-400 mt-2
                ${isDiction
                  ? 'whitespace-pre-wrap leading-loose text-base font-medium'
                  : 'leading-normal text-sm line-clamp-2'}
              `}>
                {ex.subtitle}
              </p>
            </div>

            {ex.isLocked ? (
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-gray-600">
                <Lock size={20} />
              </div>
            ) : (
              <button
                onClick={() => toggleTimer(ex.id)}
                className={`
                  flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95
                  ${ex.isActive
                    ? 'bg-gradient-to-r from-teal-start to-teal-end text-black shadow-lg shadow-teal-500/20'
                    : 'bg-white/5 text-white hover:bg-white/10'}
                `}
              >
                {ex.isActive ? <Pause size={24} fill="currentColor" /> : (ex.timeLeft === 0 ? <RotateCcw size={22} /> : <Play size={24} fill="currentColor" />)}
              </button>
            )}
          </div>

          {/* Progress Bar within Card */}
          {!ex.isLocked && (
            <div className="w-full flex flex-col gap-2 mt-2">
              {ex.isActive && (
                <div className="flex justify-between items-end text-xs text-gray-400 animate-pulse">
                  <span>진행률</span>
                  <span className="text-teal-start font-medium">
                    {Math.round(((ex.duration - ex.timeLeft) / ex.duration) * 100)}%
                  </span>
                </div>
              )}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-start to-teal-end rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((ex.duration - ex.timeLeft) / ex.duration) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </article>
    );
  };

  // Filter exercises by category (optionally recommended only)
  const recommendedIdSet = showRecommendedOnly && userCondition
    ? new Set(getRecommendedExercises(userCondition))
    : null;

  const filterByRecommendation = (list: Exercise[]) =>
    recommendedIdSet ? list.filter(ex => recommendedIdSet.has(ex.id)) : list;

  const muscleExercises = filterByRecommendation(exercises.filter(ex => ex.category === 'muscle'));
  const dictionExercises = filterByRecommendation(exercises.filter(ex => ex.category === 'diction'));
  const breathingExercises = filterByRecommendation(exercises.filter(ex => ex.category === 'breathing'));
  const mentalExercises = filterByRecommendation(exercises.filter(ex => ex.category === 'mental'));

  return (
    <div className="flex flex-col pb-24 animate-in fade-in duration-500">
      {/* SOS 긴급 진정 모드 */}
      {isSOSActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-3xl p-8 border border-red-500/30 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold text-white">SOS 긴급 진정</h2>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              <div className="text-4xl font-bold text-red-400 tabular-nums">
                {sosTimeLeft}초
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000"
                  style={{ width: `${((60 - sosTimeLeft) / 60) * 100}%` }}
                />
              </div>

              <div className="text-center">
                <p className="text-white text-lg font-semibold mb-2">
                  {sosPhase === 'breath' ? '🫁 호흡 진정 (30초)' : '💆‍♂️ 근육 이완 (30초)'}
                </p>
                <p className="text-gray-300 text-base leading-relaxed">
                  {getSOSInstructions()}
                </p>
              </div>

              <button
                onClick={stopSOSMode}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-colors border border-white/20"
              >
                중지
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Quick Action (Top) */}
      <section className="px-5 pt-6 max-w-md mx-auto w-full">
        <button
          onClick={startSOSMode}
          className="w-full group relative px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 border border-red-400/50 animate-pulse"
        >
          <span className="flex items-center justify-center gap-2">
            🚨 SOS 긴급진정 (60초)
          </span>
        </button>
      </section>

      {/* 컨디션 선택 및 추천 시스템 (Entry) */}
      <section className="px-5 mt-4 mb-8 max-w-md mx-auto w-full">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            🧘‍♂️ 오늘 컨디션은?
          </h3>
          <p className="text-gray-400 text-xs mb-4">
            현재 상태를 선택하면 맞춤 루틴을 추천해요.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {[
              {
                value: 'very-nervous',
                label: '매우 긴장됨',
                emoji: '😰',
                color: 'from-red-600 to-red-500',
                desc: '심박이 빠르고 손이 떨림 — 가장 빠른 진정 루틴',
              },
              {
                value: 'nervous',
                label: '긴장됨',
                emoji: '😅',
                color: 'from-orange-600 to-orange-500',
                desc: '목이 굳고 호흡이 얕음 — 호흡 + 발성 워밍업',
              },
              {
                value: 'normal',
                label: '보통',
                emoji: '🙂',
                color: 'from-blue-600 to-blue-500',
                desc: '루틴대로 천천히 — 근육/발음/호흡 기본 세트',
              },
              {
                value: 'calm',
                label: '차분함',
                emoji: '😌',
                color: 'from-green-600 to-green-500',
                desc: '이미 안정적 — 발음/속도 컨트롤 중심',
              },
              {
                value: 'confident',
                label: '자신만만',
                emoji: '😎',
                color: 'from-purple-600 to-purple-500',
                desc: '컨디션 최상 — 고급 발음만 빠르게 점검',
              },
            ].map((condition) => {
              const isSelected = userCondition === (condition.value as UserCondition);
              return (
                <button
                  key={condition.value}
                  onClick={() => setUserCondition(condition.value as UserCondition)}
                  className={`w-full p-3 rounded-xl text-white font-medium transition-all bg-gradient-to-r ${condition.color} ${isSelected ? 'ring-2 ring-white/30' : 'opacity-90 hover:opacity-100'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{condition.emoji}</span>
                      <span className="font-semibold">{condition.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
                        선택됨
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/85 mt-1 leading-snug">
                    {condition.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <div ref={recommendationDetailsRef} />

          {userCondition && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between p-3 bg-teal-500/10 rounded-xl border border-teal-500/30">
                <span className="text-white font-medium">{getConditionText(userCondition)}</span>
                <button
                  onClick={() => setUserCondition(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  초기화
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  <span className="text-teal-300 font-semibold">{getConditionText(userCondition)}</span> 상태에 맞는 맞춤 운동:
                </p>

                <div className="text-sm text-gray-400">
                  {getRecommendedExercises(userCondition).map(id => {
                    const exercise = exercises.find(ex => ex.id === id);
                    return exercise ? (
                      <div key={id} className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        {exercise.title}
                      </div>
                    ) : null;
                  })}
                </div>

                <button
                  onClick={applyRecommendation}
                  className="w-full bg-gradient-to-r from-teal-start to-teal-end text-black font-semibold py-2.5 rounded-xl hover:shadow-lg transition-all"
                >
                  추천 운동 준비하기
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Header / Readiness Circle */}
      <section className="flex flex-col items-center justify-center py-8">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle
              className="text-white/5"
              cx="100"
              cy="100"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Gradient Defs */}
            <defs>
              <linearGradient id="tealGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#99F6E4" />
              </linearGradient>
            </defs>
            {/* Progress Circle */}
            <circle
              className="drop-shadow-[0_0_10px_rgba(45,212,191,0.3)] transition-all duration-1000 ease-out"
              cx="100"
              cy="100"
              fill="transparent"
              r={radius}
              stroke="url(#tealGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold text-white tracking-tighter tabular-nums">
              {percentComplete}%
            </span>
            <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-teal-start to-teal-end font-bold uppercase tracking-wider mt-1">
              준비 상태
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-gray-400 text-sm font-medium">목소리가 깨어나고 있습니다.</p>
        </div>
      </section>

      {/* Exercises List */}
      <section ref={exercisesListRef} className="px-5 flex flex-col gap-8 max-w-md mx-auto w-full">

        {/* Muscle Category Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 mb-1">
            <Dumbbell size={18} className="text-teal-500" />
            <h3 className="text-gray-100 text-base font-bold">💪 근육 이완 (Muscle Relaxation)</h3>
          </div>
          {muscleExercises.map(renderExerciseCard)}
        </div>

        {/* Diction Category Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 mb-1">
            <Mic size={18} className="text-teal-500" />
            <h3 className="text-gray-100 text-base font-bold">🎙️ 발음 훈련 (Diction Training)</h3>
          </div>
          {dictionExercises.map(renderExerciseCard)}
        </div>

        {/* Breathing Category Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="text-xl">🫁</span>
            <h3 className="text-gray-100 text-base font-bold">호흡 & 이완 (Breathing & Relaxation)</h3>
          </div>
          {breathingExercises.map(ex => {
            // 4-7-8 호흡법은 전용 카드 렌더링
            if (ex.id === '7') {
              return render478BreathingCard(ex);
            }
            return renderExerciseCard(ex);
          })}
        </div>

        {/* Mental Care Category Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 mb-1">
            <Brain size={18} className="text-teal-500" />
            <h3 className="text-gray-100 text-base font-bold">🧠 멘탈 케어 (Mental Warmup)</h3>
          </div>
          {mentalExercises.map(renderBoxBreathingCard)}
        </div>

      </section>
    </div>
  );
};

export default WarmupView;