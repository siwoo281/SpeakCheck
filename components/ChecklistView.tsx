import React, { useState } from 'react';
import { Check, RotateCcw, Plus, X, Edit3, Save } from 'lucide-react';
import { ChecklistItem } from '../types';

interface ChecklistViewProps {
  items: ChecklistItem[];
  setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ items, setItems }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Tech Setup' | 'Personal' | 'Mindset'>('Personal');
  const [newItemMeta, setNewItemMeta] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editMeta, setEditMeta] = useState('');

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      category: newItemCategory,
      completed: false,
      meta: newItemMeta.trim() || undefined
    };

    setItems(prev => [...prev, newItem]);
    setNewItemText('');
    setNewItemMeta('');
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditMeta(item.meta || '');
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;

    setItems(prev => prev.map(item =>
      item.id === editingId
        ? { ...item, text: editText.trim(), meta: editMeta.trim() || undefined }
        : item
    ));
    setEditingId(null);
    setEditText('');
    setEditMeta('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditMeta('');
  };

  const resetChecklist = () => {
    setItems(prev => prev.map(item => ({ ...item, completed: false })));
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Stats
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col pb-32 animate-in slide-in-from-right-8 duration-500">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-end mb-2 max-w-md mx-auto">
          <span className="text-sm font-bold text-teal-start">{percentage}% 준비됨</span>
          <span className="text-xs text-gray-500 font-medium tracking-wide">{completedCount}/{totalCount} 완료</span>
        </div>
        <div className="h-2 w-full max-w-md mx-auto bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-start to-teal-end rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(45,212,191,0.3)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 px-4 pt-6 max-w-md mx-auto w-full">
        {/* Add New Item Section */}
        <section>
          <div className="flex justify-between items-center px-3 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
              새 항목 추가
            </h2>
          </div>
          
          {showAddForm ? (
            <div className="bg-surface rounded-xl border border-white/5 p-4 space-y-4">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="체크리스트 항목을 입력하세요..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-start/50 focus:border-transparent text-sm"
                autoFocus
              />
              
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as 'Tech Setup' | 'Personal' | 'Mindset')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-start/50 focus:border-transparent text-sm"
              >
                <option value="Tech Setup">Tech Setup</option>
                <option value="Personal">Personal</option>
                <option value="Mindset">Mindset</option>
              </select>

              <input
                type="text"
                value={newItemMeta}
                onChange={(e) => setNewItemMeta(e.target.value)}
                placeholder="부가 정보 (선택사항)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-start/50 focus:border-transparent text-sm"
              />

              <div className="flex gap-2">
                <button
                  onClick={addItem}
                  className="flex-1 bg-gradient-to-r from-teal-start to-teal-end text-black font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItemText('');
                    setNewItemMeta('');
                  }}
                  className="px-4 bg-white/5 text-gray-400 font-medium py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-400 hover:text-teal-start hover:bg-white/10 hover:border-teal-start/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              새 항목 추가
            </button>
          )}
        </section>

        {/* Existing Categories */}
        {Object.entries(groupedItems).map(([category, categoryItems]: [string, ChecklistItem[]]) => (
          <section key={category}>
            <h2 className="px-3 pb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              {category}
            </h2>
            <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-white/5">
              {categoryItems.map((item) => (
                <div key={item.id} className="group border-b border-white/5 hover:bg-white/5 transition-colors relative">
                  {editingId === item.id ? (
                    /* Edit Mode */
                    <div className="p-4 space-y-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-start/50 focus:border-transparent text-sm"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editMeta}
                        onChange={(e) => setEditMeta(e.target.value)}
                        placeholder="부가 정보 (선택사항)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-start/50 focus:border-transparent text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="flex items-center gap-1.5 bg-teal-start text-black px-3 py-1.5 rounded-lg font-medium text-sm hover:bg-teal-end transition-colors"
                        >
                          <Save size={14} />
                          저장
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <label className="flex items-center gap-4 p-5 cursor-pointer active:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                      />

                      {/* Custom Checkbox UI */}
                      <div className={`
                        relative flex-shrink-0 w-6 h-6 rounded-md border transition-all duration-200 flex items-center justify-center group-active:scale-95
                        ${item.completed
                          ? 'bg-gradient-to-r from-teal-start to-teal-end border-transparent shadow-inner'
                          : 'bg-transparent border-gray-600'}
                      `}>
                        <Check
                          size={16}
                          className={`
                            text-black font-bold transition-all duration-200
                            ${item.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                          `}
                          strokeWidth={4}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <p className={`
                          text-[17px] font-medium transition-colors truncate
                          ${item.completed ? 'line-through text-gray-600' : 'text-gray-200'}
                        `}>
                          {item.text}
                        </p>
                        {item.meta && (
                          <span className={`text-xs mt-0.5 font-medium ${item.completed ? 'hidden' : 'text-teal-500/80'}`}>
                            {item.meta}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            startEdit(item);
                          }}
                          className="p-2 text-gray-500 hover:text-teal-start hover:bg-white/5 rounded-lg transition-colors active:scale-90"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteItem(item.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors active:scale-90"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="flex justify-center mt-4">
          <button
            onClick={resetChecklist}
            className="flex items-center gap-2 text-gray-500 hover:text-teal-start transition-colors px-6 py-3 rounded-full hover:bg-white/5 text-sm font-semibold"
          >
            <RotateCcw size={16} />
            체크리스트 초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistView;