import React from 'react';
import { FeatureType } from '../types';
import { 
  BookOpen, 
  Languages, 
  PenTool, 
  MessageCircleQuestion, 
  BookA, 
  CalendarCheck, 
  Feather, 
  Mic,
} from 'lucide-react';

// Ink Wash Lotus Icon
const InkLotusIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
     {/* Ink stroke style petals */}
     <path d="M12 20c-1-3-1-6-1-9 0-3 1-5 1-5s1 2 1 5c0 3 0 6-1 9z" fill="currentColor" fillOpacity="0.1"/>
     <path d="M12 11c-2 2-5 3-5 6s3 2 5 2" />
     <path d="M12 11c2 2 5 3 5 6s-3 2-5 2" />
     <path d="M12 14c-4-2-7-6-3-10 2 2 2 5 3 10z" />
     <path d="M12 14c4-2 7-6 3-10-2 2-2 5-3 10z" />
     <path d="M7 16c-3-2-2-5 1-6" />
     <path d="M17 16c3-2 2-5-1-6" />
     <path d="M12 20v2" />
  </svg>
);

interface SidebarProps {
  currentFeature: FeatureType;
  onSelect: (f: FeatureType) => void;
  hasFile: boolean;
}

const features = [
  { id: FeatureType.SUMMARY, label: '精读摘要', icon: BookOpen },
  { id: FeatureType.BILINGUAL, label: '沉浸双语', icon: Languages },
  { id: FeatureType.GOLDEN_SENTENCES, label: '金句卡片', icon: InkLotusIcon },
  { id: FeatureType.EXERCISES, label: '课后练习', icon: PenTool },
  { id: FeatureType.QA, label: '答疑解惑', icon: MessageCircleQuestion },
  { id: FeatureType.VOCABULARY, label: '核心词汇', icon: BookA },
  { id: FeatureType.ACTION_PLAN, label: '行动计划', icon: CalendarCheck },
  { id: FeatureType.BOOK_REVIEW, label: '深度书评', icon: Feather },
  { id: FeatureType.PODCAST, label: 'AI 播客', icon: Mic },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentFeature, onSelect, hasFile }) => {
  return (
    <div className="h-full flex flex-col w-[260px] shrink-0">
      <div className="flex-1 bg-[#463F3A] text-[#F7F5F0] border-r-2 border-[#5C5550] shadow-2xl rounded-[1.5rem] flex flex-col overflow-hidden relative group/sidebar">
        
        {/* Brand Area */}
        <div className="p-8 pb-6 relative z-10 flex flex-col items-center border-b border-[#5C5550]/50">
             <div className="w-16 h-16 bg-[#F7F5F0] rounded-full flex items-center justify-center text-[#984B43] shadow-lg mb-4 border-2 border-[#D1C0A5]">
                <InkLotusIcon size={32} />
             </div>
             <h1 className="font-serif font-bold text-2xl tracking-[0.2em] text-[#F7F5F0]">读书神器</h1>
             <div className="mt-2 text-[10px] text-[#A09588] tracking-widest uppercase">Classical Reader</div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar relative z-10">
          {features.map((item) => {
            const Icon = item.icon;
            const isActive = currentFeature === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                disabled={!hasFile}
                className={`group w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-500 relative overflow-hidden ${
                  isActive 
                    ? 'bg-[#F7F5F0] text-[#463F3A] shadow-md scale-105 font-bold' 
                    : 'text-[#D1C0A5] hover:text-[#F7F5F0] hover:bg-[#5C5550]/50 disabled:opacity-30'
                }`}
              >
                <div className={`relative z-10 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Icon size={18} />
                </div>
                
                <span className="relative z-10 text-base font-serif tracking-widest">
                    {item.label}
                </span>

                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#984B43]"></div>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-6 relative z-10 text-center">
             <div className="text-[10px] uppercase font-bold text-[#7A7067] tracking-widest">
                AI Powered
             </div>
        </div>

        {/* Wood Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
      </div>
    </div>
  );
};