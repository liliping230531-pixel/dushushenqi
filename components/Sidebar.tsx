import React from 'react';
import { FeatureType, ThemeConfig } from '../types';
import { 
  BookOpen, 
  Languages, 
  PenTool, 
  MessageCircleQuestion, 
  BookA, 
  CalendarCheck, 
  Feather, 
  Mic,
  Baby, // For Beginner Guide
} from 'lucide-react';

// Theme-aware Lotus Icon
const ThemedLotusIcon = ({ size = 24, className = "" }) => (
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
  theme: ThemeConfig;
}

const features = [
  { id: FeatureType.SUMMARY, label: '精读摘要', icon: BookOpen },
  { id: FeatureType.BEGINNER_GUIDE, label: '新手拆解', icon: Baby }, // Added
  { id: FeatureType.BILINGUAL, label: '沉浸双语', icon: Languages },
  { id: FeatureType.GOLDEN_SENTENCES, label: '金句卡片', icon: ThemedLotusIcon },
  { id: FeatureType.EXERCISES, label: '课后练习', icon: PenTool },
  { id: FeatureType.QA, label: '答疑解惑', icon: MessageCircleQuestion },
  { id: FeatureType.VOCABULARY, label: '核心词汇', icon: BookA },
  { id: FeatureType.ACTION_PLAN, label: '行动计划', icon: CalendarCheck },
  { id: FeatureType.BOOK_REVIEW, label: '深度书评', icon: Feather },
  { id: FeatureType.PODCAST, label: 'AI 播客', icon: Mic },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentFeature, onSelect, hasFile, theme }) => {
  // Determine text color based on background darkness roughly (simplified)
  // For 'modern', 'magazine', 'journal', 'song' we handle specific contrasts in THEMES, 
  // but here sidebar usually needs contrast against bgSidebar.
  
  // Specific logic for Sidebar Text Color based on theme ID
  const isDarkSidebar = theme.id === 'song' || theme.id === 'magazine' || theme.id === 'cyber';
  const textColor = isDarkSidebar ? 'text-white/80' : 'text-slate-600';
  const activeBg = isDarkSidebar ? 'bg-white/10' : 'bg-black/5';
  const activeText = isDarkSidebar ? 'text-white' : 'text-black';

  return (
    <div className="h-full flex flex-col w-[260px] shrink-0">
      <div className={`flex-1 ${theme.bgSidebar} ${theme.border} border-r shadow-2xl ${theme.radius} flex flex-col overflow-hidden relative group/sidebar transition-colors duration-500`}>
        
        {/* Brand Area */}
        <div className={`p-8 pb-6 relative z-10 flex flex-col items-center border-b ${isDarkSidebar ? 'border-white/10' : 'border-black/5'}`}>
             <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4 border-2 ${theme.border} ${theme.bgCard} ${theme.textMain}`}>
                <ThemedLotusIcon size={32} />
             </div>
             <h1 className={`font-bold text-2xl tracking-[0.2em] ${isDarkSidebar ? 'text-white' : theme.textMain}`}>读书神器</h1>
             <div className={`mt-2 text-[10px] tracking-widest uppercase opacity-60 ${isDarkSidebar ? 'text-white' : theme.textSecondary}`}>AI Reader</div>
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
                className={`group w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? `${activeBg} ${activeText} shadow-md scale-105 font-bold` 
                    : `${textColor} hover:bg-black/5 hover:opacity-100 disabled:opacity-30`
                }`}
              >
                <div className={`relative z-10 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Icon size={18} />
                </div>
                
                <span className="relative z-10 text-base tracking-widest">
                    {item.label}
                </span>

                {isActive && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.id === 'cyber' ? 'bg-[#00F0FF]' : 'bg-current'}`}></div>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className={`p-6 relative z-10 text-center text-[10px] uppercase font-bold tracking-widest ${textColor} opacity-50`}>
            AI Powered
        </div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: theme.textureOverlay }}></div>
      </div>
    </div>
  );
};