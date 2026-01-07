import React from 'react';
import { AudioWaveform, ClipboardCheck, NotebookPen } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const getTabClass = (tab: Tab) =>
    `flex flex-col items-center justify-center gap-1 w-20 h-16 min-h-[44px] transition-colors active:scale-95 ${currentTab === tab ? 'text-teal-start' : 'text-gray-500 hover:text-gray-300'
    }`;

  return (
    <nav className="fixed bottom-0 w-full bg-[#121212]/90 backdrop-blur-md border-t border-white/5 pb-safe pt-2 px-6 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button onClick={() => onTabChange('warmup')} className={getTabClass('warmup')}>
          <AudioWaveform size={24} strokeWidth={currentTab === 'warmup' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">목 풀기</span>
        </button>

        <button onClick={() => onTabChange('checklist')} className={getTabClass('checklist')}>
          <ClipboardCheck size={24} strokeWidth={currentTab === 'checklist' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">체크리스트</span>
        </button>

        <button onClick={() => onTabChange('notes')} className={getTabClass('notes')}>
          <NotebookPen size={24} strokeWidth={currentTab === 'notes' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">발표 노트</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;