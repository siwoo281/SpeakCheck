import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import LandingPage from './components/LandingPage';
import WarmupView from './components/WarmupView';
import ChecklistView from './components/ChecklistView';
import NotesView from './components/NotesView';
import BottomNav from './components/BottomNav';
import { INITIAL_CHECKLIST, INITIAL_EXERCISES, INITIAL_NOTES } from './constants';
import { Tab, Exercise, ChecklistItem, NoteSection, UserCondition } from './types';
import { setupBackButtonHandler, isAndroid } from './androidUtils';

// LocalStorage 키 상수 (SpeakCheck)
const STORAGE_KEYS = {
  SHOW_LANDING: 'speakcheck_showLanding',
  CURRENT_TAB: 'speakcheck_currentTab',
  USER_CONDITION: 'speakcheck_userCondition',
  EXERCISES: 'speakcheck_exercises',
  CHECKLIST: 'speakcheck_checklist',
  NOTES: 'speakcheck_notes',
};

// 기존 키 (마이그레이션/호환 목적)
const LEGACY_KEYS = {
  SHOW_LANDING: 'presentationPro_showLanding',
  CURRENT_TAB: 'presentationPro_currentTab',
  USER_CONDITION: 'presentationPro_userCondition',
  EXERCISES: 'presentationPro_exercises',
  CHECKLIST: 'presentationPro_checklist',
  NOTES: 'presentationPro_notes',
};

const App: React.FC = () => {
  // LocalStorage에서 초기 상태 복원
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    const savedNew = localStorage.getItem(STORAGE_KEYS.SHOW_LANDING);
    const savedLegacy = localStorage.getItem(LEGACY_KEYS.SHOW_LANDING);
    const saved = savedNew ?? savedLegacy;
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [currentTab, setCurrentTab] = useState<Tab>(() => {
    const savedNew = localStorage.getItem(STORAGE_KEYS.CURRENT_TAB);
    const savedLegacy = localStorage.getItem(LEGACY_KEYS.CURRENT_TAB);
    const saved = savedNew ?? savedLegacy;
    return (saved as Tab) || 'warmup';
  });
  
  const [userCondition, setUserCondition] = useState<UserCondition | null>(() => {
    const savedNew = localStorage.getItem(STORAGE_KEYS.USER_CONDITION);
    const savedLegacy = localStorage.getItem(LEGACY_KEYS.USER_CONDITION);
    const saved = savedNew ?? savedLegacy;
    return saved ? (saved as UserCondition) : null;
  });

  // 상태를 상위로 끌어올려 탭 전환 시에도 데이터가 유지되도록 함
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const savedNew = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    const savedLegacy = localStorage.getItem(LEGACY_KEYS.EXERCISES);
    const saved = savedNew ?? savedLegacy;
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    const savedNew = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    const savedLegacy = localStorage.getItem(LEGACY_KEYS.CHECKLIST);
    const saved = savedNew ?? savedLegacy;
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });
  
  const [notes, setNotes] = useState<NoteSection[]>(() => {
    const savedNew = localStorage.getItem(STORAGE_KEYS.NOTES);
    const savedLegacy = localStorage.getItem(LEGACY_KEYS.NOTES);
    const saved = savedNew ?? savedLegacy;
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  // 최초 로드 시 레거시 키를 신규 키로 마이그레이션 후 정리
  useEffect(() => {
    const migrateKey = (newKey: string, legacyKey: string) => {
      const legacyVal = localStorage.getItem(legacyKey);
      if (legacyVal !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, legacyVal);
      }
    };
    migrateKey(STORAGE_KEYS.SHOW_LANDING, LEGACY_KEYS.SHOW_LANDING);
    migrateKey(STORAGE_KEYS.CURRENT_TAB, LEGACY_KEYS.CURRENT_TAB);
    migrateKey(STORAGE_KEYS.USER_CONDITION, LEGACY_KEYS.USER_CONDITION);
    migrateKey(STORAGE_KEYS.EXERCISES, LEGACY_KEYS.EXERCISES);
    migrateKey(STORAGE_KEYS.CHECKLIST, LEGACY_KEYS.CHECKLIST);
    migrateKey(STORAGE_KEYS.NOTES, LEGACY_KEYS.NOTES);

    // 레거시 키 제거
    Object.values(LEGACY_KEYS).forEach((k) => localStorage.removeItem(k));
  }, []);

  // Android 뒤로가기 버튼 핸들링
  useEffect(() => {
    if (!isAndroid()) return;

    setupBackButtonHandler(() => {
      // 랜딩 페이지가 아닐 때만 뒤로가기 처리
      if (!showLanding) {
        // warmup이 아니면 warmup으로 이동
        if (currentTab !== 'warmup') {
          setCurrentTab('warmup');
          return true; // 기본 동작 방지
        }
        // warmup에서 뒤로가기하면 랜딩 페이지로
        setShowLanding(true);
        return true;
      }
      // 랜딩 페이지에서는 앱 종료 (기본 동작)
      return false;
    });
  }, [showLanding, currentTab]);

  // 상태 변경 시 LocalStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOW_LANDING, JSON.stringify(showLanding));
  }, [showLanding]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TAB, currentTab);
  }, [currentTab]);

  useEffect(() => {
    if (userCondition) {
      localStorage.setItem(STORAGE_KEYS.USER_CONDITION, userCondition);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_CONDITION);
    }
  }, [userCondition]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklistItems));
  }, [checklistItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'warmup': return '목 풀기';
      case 'checklist': return '체크리스트';
      case 'notes': return '발표 노트';
    }
  };

  // Show landing page first
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-b border-white/5 shadow-sm px-6 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-white text-xl font-bold leading-tight tracking-tight">
              {getPageTitle()}
            </h1>
            {currentTab === 'warmup' && (
              <p className="text-gray-400 text-xs font-medium">목소리 워밍업 루틴</p>
            )}
          </div>

          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-transparent text-gray-200 transition-colors hover:bg-white/10 active:scale-95">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative w-full" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {currentTab === 'warmup' && (
          <WarmupView 
            exercises={exercises} 
            setExercises={setExercises} 
            userCondition={userCondition}
            setUserCondition={setUserCondition}
          />
        )}
        {currentTab === 'checklist' && (
          <ChecklistView items={checklistItems} setItems={setChecklistItems} />
        )}
        {currentTab === 'notes' && (
          <NotesView notes={notes} setNotes={setNotes} />
        )}
      </main>

      {/* Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;