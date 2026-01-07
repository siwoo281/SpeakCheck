import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowRight, CheckCircle2, Timer, Mic as MicIcon, Square, Trash2 } from 'lucide-react';
import { NoteSection } from '../types';

interface NotesViewProps {
  notes: NoteSection[];
  setNotes: React.Dispatch<React.SetStateAction<NoteSection[]>>;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, setNotes }) => {
  const [showRehearsalTools, setShowRehearsalTools] = useState(false);

  // 타이머 상태
  const [targetMinutes, setTargetMinutes] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 녹음 상태
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingPermission, setRecordingPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 브라우저 전사(Web Speech API) 상태 (무료, 환경 의존)
  const recognitionRef = useRef<any>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const transcriptRef = useRef<string>('');
  const [transcriptionUnsupported, setTranscriptionUnsupported] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // 음성 분석 상태
  const recordingStartTimeRef = useRef<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    duration: number;
    avgWordsPerMinute: number;
    feedback: string[];
  } | null>(null);

  // 구간별 타이밍 상태
  const [sectionTimers, setSectionTimers] = useState<{ [key: string]: number }>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sectionTargetTimes, setSectionTargetTimes] = useState<{ [key: string]: number }>({});
  const [showTimingSetup, setShowTimingSetup] = useState(false);

  // 컴포넌트 언마운트 시 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      try {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
    };
  }, []);

  // 타이머 로직
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // 구간별 타이머 로직
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (activeSectionId) {
      interval = setInterval(() => {
        setSectionTimers(prev => ({
          ...prev,
          [activeSectionId]: (prev[activeSectionId] || 0) + 1
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeSectionId]);

  const startSectionTimer = (sectionId: string) => {
    // 다른 구간 중지
    setActiveSectionId(sectionId);
    if (!sectionTimers[sectionId]) {
      setSectionTimers(prev => ({ ...prev, [sectionId]: 0 }));
    }
  };

  const stopSectionTimer = () => {
    setActiveSectionId(null);
  };

  const resetSectionTimer = (sectionId: string) => {
    setSectionTimers(prev => ({ ...prev, [sectionId]: 0 }));
  };

  const setSectionTarget = (sectionId: string, minutes: number) => {
    setSectionTargetTimes(prev => ({ ...prev, [sectionId]: minutes * 60 }));
  };

  const getSectionTimerColor = (sectionId: string) => {
    const elapsed = sectionTimers[sectionId] || 0;
    const target = sectionTargetTimes[sectionId];

    if (!target) return 'text-gray-400';

    const percentage = (elapsed / target) * 100;

    if (percentage <= 80) return 'text-teal-400';
    if (percentage <= 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatSectionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimeLeft(targetMinutes * 60);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(0);
  };

  // 타이머 색상 계산 (초록 -> 노랑 -> 빨강)
  const getTimerColor = () => {
    if (!isTimerRunning || timeLeft === 0) return 'bg-white/5 border-white/10';

    const totalSeconds = targetMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;

    if (percentage > 20) return 'bg-teal-500/10 border-teal-500/30';
    if (percentage > 0) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getTimerTextColor = () => {
    if (!isTimerRunning || timeLeft === 0) return 'text-gray-400';

    const totalSeconds = targetMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;

    if (percentage > 20) return 'text-teal-start';
    if (percentage > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 녹음 기능
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecordingPermission('granted');

      // 브라우저 호환성을 위해 mimeType 체크
      const options = { mimeType: 'audio/webm' };
      let mediaRecorder: MediaRecorder;

      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // webm을 지원하지 않는 경우 기본값 사용
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setTranscript('');
      setInterimTranscript('');
      transcriptRef.current = '';
      setTranscriptionError(null);
      const startTime = Date.now();
      recordingStartTimeRef.current = startTime;

      // 가능한 경우 브라우저 전사 시작(Chrome 계열에서 주로 동작)
      const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) {
        setTranscriptionUnsupported(true);
      } else {
        setTranscriptionUnsupported(false);
        try {
          const recognition = new SpeechRecognitionCtor();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'ko-KR';

          recognition.onresult = (event: any) => {
            // 중복 누적을 피하기 위해 전체 results를 기반으로 매번 재구성
            const results: any[] = Array.from(event.results ?? []);
            const finalParts: string[] = [];
            const interimParts: string[] = [];

            for (const result of results) {
              const text = (result?.[0]?.transcript ?? '').trim();
              if (!text) continue;
              if (result.isFinal) finalParts.push(text);
              else interimParts.push(text);
            }

            const finalText = finalParts.join(' ').trim();
            const interimText = interimParts.join(' ').trim();

            transcriptRef.current = finalText;
            setTranscript(finalText);
            setInterimTranscript(interimText);
          };

          recognition.onerror = (e: any) => {
            // 환경/권한/네트워크에 따라 실패할 수 있음 → 사용자에게 짧게 안내하고 fallback
            const code = e?.error as string | undefined;
            if (code === 'not-allowed' || code === 'service-not-allowed') {
              setTranscriptionError('전사가 차단되었습니다. (브라우저/OS 권한 또는 정책)');
            } else if (code === 'no-speech') {
              setTranscriptionError('전사: 음성이 감지되지 않았습니다.');
            } else if (code === 'network') {
              setTranscriptionError('전사: 네트워크 문제로 중단되었습니다.');
            } else {
              setTranscriptionError('전사: 환경 문제로 중단되었습니다.');
            }
            setIsTranscribing(false);
          };

          recognition.onend = () => {
            setIsTranscribing(false);
            setInterimTranscript('');
            // 녹음 중이면 전사 자동 재시작 (긴 녹음 시 중단 방지)
            if (mediaRecorderRef.current?.state === 'recording') {
              try {
                recognition.start();
                setIsTranscribing(true);
              } catch {}
            }
          };

          recognitionRef.current = recognition;
          setIsTranscribing(true);
          recognition.start();
        } catch {
          setTranscriptionError('전사: 시작에 실패했습니다.');
          setIsTranscribing(false);
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // 녹음 시간 계산
        const start = recordingStartTimeRef.current;
        const duration = start ? (Date.now() - start) / 1000 : 0;

        // 수집된 청크로 오디오 Blob 생성
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm'
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // 기본 분석 수행
        performBasicAnalysis(duration, transcriptRef.current);

        // 전사 종료
        try {
          recognitionRef.current?.stop?.();
        } catch {
          // ignore
        }

        // 스트림 정리
        stream.getTracks().forEach(track => track.stop());
      };

      // timeslice를 100ms로 설정하여 데이터를 주기적으로 수집
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (error) {
      // 녹음 권한 거부 또는 디바이스 오류
      setRecordingPermission('denied');
    }
  };

  const performBasicAnalysis = (duration: number, transcriptText: string) => {
    const feedback: string[] = [];

    if (duration < 1) {
      feedback.push('녹음 시간이 너무 짧아 속도를 계산하기 어렵습니다.');
      feedback.push('정확한 말하기 속도 분석(단어/분)을 하려면 음성→텍스트(전사)가 필요합니다.');
      setAnalysisResults({
        duration,
        avgWordsPerMinute: 0,
        feedback
      });
      return;
    }

    const minutes = duration / 60;
    const normalizedTranscript = transcriptText.trim();
    const wordCount = normalizedTranscript
      ? normalizedTranscript.split(/\s+/).filter(Boolean).length
      : 0;

    // 너무 짧게 잡힌 전사(잡음/짧은 단어)로 속도 판정이 오해를 만들 수 있어 최소 어절 수를 요구
    const MIN_WORDS_FOR_SPEED_FEEDBACK = 10;

    // 전사 결과가 있으면 전사 기반 WPM, 없으면 추정치 fallback
    const wordsPerMinute = wordCount > 0 ? Math.round(wordCount / minutes) : 150;
    if (wordCount > 0) {
      feedback.push(`전사 기반으로 계산했습니다. (공백 기준 어절 수: ${wordCount})`);
    } else {
      feedback.push('전사 결과가 없어 평균 150단어/분을 기준으로 추정합니다.');
      if (transcriptionUnsupported) {
        feedback.push('현재 브라우저에서 전사 기능(Web Speech API)을 지원하지 않는 것 같습니다.');
      }
    }

    // 녹음 시간 분석
    if (duration < 30) {
      feedback.push('너무 짧습니다. 더 긴 내용으로 연습해보세요.');
    } else if (duration > 300) {
      feedback.push('제한 시간을 고려하여 내용을 압축해보세요.');
    }

    // 전사 기반 + 충분한 어절 수인 경우에만 속도 피드백 제공
    if (wordCount > 0 && wordCount < MIN_WORDS_FOR_SPEED_FEEDBACK) {
      feedback.push('말한 내용이 충분히 감지되지 않아 속도 판정을 생략합니다.');
    }

    if (wordCount >= MIN_WORDS_FOR_SPEED_FEEDBACK) {
      if (wordsPerMinute > 180) {
        feedback.push('말하기 속도가 빠른 편입니다. 좀 더 천천히 말해보세요.');
      } else if (wordsPerMinute < 120) {
        feedback.push('말하기 속도가 느린 편입니다. 조금 더 템포를 올려보세요.');
      } else {
        feedback.push('적절한 말하기 속도입니다!');
      }
    }

    setAnalysisResults({
      duration,
      avgWordsPerMinute: wordsPerMinute,
      feedback
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
    setIsTranscribing(false);
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    setAnalysisResults(null);
    recordingStartTimeRef.current = null;
    setTranscript('');
    transcriptRef.current = '';
    setInterimTranscript('');
    setIsTranscribing(false);
    setTranscriptionUnsupported(false);
    setTranscriptionError(null);
  };
  const toggleNote = (id: string) => {
    setNotes(prev => prev.map(note => ({
      ...note,
      // If we want exclusive expansion (accordion style):
      isExpanded: note.id === id ? !note.isExpanded : false
      // If we want multiple allowed:
      // isExpanded: note.id === id ? !note.isExpanded : note.isExpanded
    })));
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-32 max-w-md mx-auto w-full animate-in slide-in-from-right-8 duration-500">

      {/* 리허설 도구 토글 섹션 */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-4 bg-[#121212]/95 backdrop-blur-xl border-b border-white/5 mb-4">
        <button
          onClick={() => setShowRehearsalTools(!showRehearsalTools)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <Timer size={20} className="text-teal-start" />
            <span className="text-white font-semibold">리허설 도구</span>
          </div>
          <ChevronRight
            size={20}
            className={`text-gray-400 transition-transform duration-300 ${showRehearsalTools ? 'rotate-90' : ''}`}
          />
        </button>

        {/* 리허설 도구 컨텐츠 */}
        {showRehearsalTools && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
            {/* 스마트 타이머 */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${getTimerColor()}`}>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Timer size={16} />
                발표 타이머
              </h3>

              {!isTimerRunning && timeLeft === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={targetMinutes}
                      onChange={(e) => setTargetMinutes(Number(e.target.value))}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-start/50 text-base"
                    />
                    <span className="text-gray-400 text-sm">분</span>
                  </div>
                  <button
                    onClick={startTimer}
                    className="w-full bg-gradient-to-r from-teal-start to-teal-end text-black font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all"
                  >
                    타이머 시작
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`text-4xl font-bold tabular-nums ${getTimerTextColor()}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={stopTimer}
                      className="flex-1 bg-white/10 text-white font-medium py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      일시정지
                    </button>
                    <button
                      onClick={resetTimer}
                      className="flex-1 bg-white/10 text-white font-medium py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 간편 녹음기 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MicIcon size={16} />
                음성 녹음
              </h3>

              {recordingPermission === 'denied' && (
                <p className="text-red-400 text-sm mb-3">
                  마이크 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.
                </p>
              )}

              {!isRecording && !audioURL && (
                <button
                  onClick={startRecording}
                  className="w-full bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-2.5 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[44px]"
                >
                  <MicIcon size={18} />
                  녹음 시작
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="w-full bg-red-500 text-white font-semibold py-2.5 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 animate-pulse active:scale-95 min-h-[44px]"
                >
                  <Square size={18} fill="currentColor" />
                  녹음 중지
                </button>
              )}

              {isRecording && (
                <>
                  <p className="mt-2 text-xs text-gray-400">
                    {transcriptionUnsupported
                      ? '전사: 미지원(권장: Chrome). 전사 없이 속도는 추정치로 표시됩니다.'
                      : transcriptionError
                        ? transcriptionError
                        : isTranscribing
                          ? '전사: 진행 중 (브라우저 기능이라 환경에 따라 차이가 있어요)'
                          : '전사: 준비됨'}
                  </p>
                  {/* 실시간 전사 표시 (녹음 중일 때만) */}
                  {interimTranscript.trim().length > 0 && (
                    <div className="mt-2 p-2 bg-black/30 rounded border border-white/5">
                      <p className="text-gray-400 text-xs mb-1">전사(실시간)</p>
                      <p className="text-gray-300 text-xs whitespace-pre-wrap break-words">
                        {interimTranscript}
                      </p>
                    </div>
                  )}
                </>
              )}

              {audioURL && (
                <div className="space-y-3">
                  <audio controls className="w-full" src={audioURL} />

                  {/* 분석 결과 */}
                  {analysisResults && (
                    <div className="p-3 bg-black/20 rounded-lg space-y-2">
                      <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                        📊 음성 분석 결과
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">녹음 시간:</span>
                          <span className="text-white ml-1">{Math.round(analysisResults.duration)}초</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{analysisResults.avgWordsPerMinute === 150 ? '추정 속도' : '계산 속도'}:</span>
                          <span className="text-white ml-1">{analysisResults.avgWordsPerMinute}어절/분</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {analysisResults.feedback.map((feedback, idx) => (
                          <p key={idx} className="text-teal-300 text-xs">• {feedback}</p>
                        ))}
                      </div>

                      {transcript.trim().length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-gray-400 text-xs mb-1">전사 텍스트</p>
                          <p className="text-gray-200 text-xs whitespace-pre-wrap break-words">
                            {transcript}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={deleteRecording}
                      className="flex-1 bg-white/10 text-gray-400 font-medium py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      삭제
                    </button>
                    <button
                      onClick={() => {
                        deleteRecording();
                        startRecording();
                      }}
                      className="flex-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 font-medium py-2 rounded-lg hover:bg-teal-500/30 transition-colors"
                    >
                      다시 녹음
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 구간별 타이밍 연습 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  📈 구간별 타이밍 연습
                </h3>
                <button
                  onClick={() => setShowTimingSetup(!showTimingSetup)}
                  className="text-teal-400 text-sm hover:text-teal-300"
                >
                  {showTimingSetup ? '완료' : '설정'}
                </button>
              </div>

              {showTimingSetup && (
                <div className="mb-4 p-3 bg-black/20 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">각 구간의 목표 시간을 설정하세요 (분):</p>
                  <div className="space-y-2">
                    {notes.map(note => (
                      <div key={note.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20 truncate">{note.title}</span>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          placeholder="분"
                          className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                          onChange={(e) => setSectionTarget(note.id, Number(e.target.value))}
                        />
                        <span className="text-gray-500 text-xs">분</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSectionId ? (
                <div className="text-center space-y-3">
                  <div className={`text-2xl font-bold tabular-nums ${getSectionTimerColor(activeSectionId)}`}>
                    {formatSectionTime(sectionTimers[activeSectionId] || 0)}
                  </div>
                  <button
                    onClick={stopSectionTimer}
                    className="w-full bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    구간 종료
                  </button>
                </div>
              ) : (
                <div className="text-gray-400 text-sm text-center py-3">
                  아래 발표 노트에서 구간별 시간 측정을 시작하세요
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Intro block for Notes */}
      <div className="mb-4">
        <div className="flex gap-6 justify-between items-end mb-2">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">준비 단계</p>
          <p className="text-teal-start text-sm font-bold">초안 v3</p>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">핵심 포인트</h2>
      </div>

      {notes.map((note) => (
        <div
          key={note.id}
          className={`
            group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 shadow-lg
            ${note.isExpanded
              ? 'bg-[#1a1a1a] border-teal-500/30'
              : 'bg-surface border-white/5 hover:border-white/10'}
          `}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleNote(note.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleNote(note.id);
              }
            }}
            className="flex items-center justify-between gap-4 p-5 w-full text-left bg-transparent transition-colors hover:bg-white/5 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all
                ${note.isExpanded
                  ? 'bg-gradient-to-br from-teal-start to-teal-end text-black shadow-glow'
                  : 'bg-white/5 text-gray-400'}
              `}>
                {note.step}
              </span>
              <div className="flex-1">
                <p className={`text-lg font-bold leading-normal transition-colors ${note.isExpanded ? 'text-teal-start' : 'text-gray-200'}`}>
                  {note.title}
                </p>
                {/* 구간 타이머 정보 */}
                {(sectionTimers[note.id] > 0 || sectionTargetTimes[note.id]) && (
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    {sectionTimers[note.id] > 0 && (
                      <span className={getSectionTimerColor(note.id)}>
                        {formatSectionTime(sectionTimers[note.id])}
                      </span>
                    )}
                    {sectionTargetTimes[note.id] && (
                      <span className="text-gray-500">
                        / {Math.floor(sectionTargetTimes[note.id] / 60)}분
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 구간 타이머 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeSectionId === note.id) {
                    stopSectionTimer();
                  } else {
                    startSectionTimer(note.id);
                  }
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90 min-h-[44px]
                  ${activeSectionId === note.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30'}
                `}
              >
                {activeSectionId === note.id ? '중지' : '시작'}
              </button>
              <ChevronRight
                size={24}
                className={`text-gray-500 transition-transform duration-300 ${note.isExpanded ? 'rotate-90 text-teal-start' : ''}`}
              />
            </div>
          </div>

          <div
            className={`
              grid transition-[grid-template-rows] duration-300 ease-out
              ${note.isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
            `}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-6 pt-0 pl-16">
                {/* 구간 리셋 버튼 */}
                {sectionTimers[note.id] > 0 && (
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => resetSectionTimer(note.id)}
                      className="text-gray-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
                    >
                      시간 리셋
                    </button>
                  </div>
                )}
                <ul className="flex flex-col gap-4">
                  {note.points.map((point, idx) => (
                    <li key={idx} className="text-gray-300 text-lg font-medium leading-snug flex gap-3">
                      {/* Logic to highlight specific keywords or structure could go here */}
                      {point.includes('Our solution') ? (
                        <div className="text-white text-xl font-bold flex gap-3 items-center pt-2">
                          <ArrowRight className="text-teal-end" size={24} />
                          <span className="bg-gradient-to-r from-teal-500/10 to-transparent pl-2 pr-4 py-1 rounded-r-lg border-l-4 border-teal-500">
                            {point}
                          </span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 size={20} className="text-teal-start mt-1 flex-shrink-0 opacity-70" />
                          <span>{point}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesView;