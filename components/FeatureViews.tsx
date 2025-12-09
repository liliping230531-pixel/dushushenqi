import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  FeatureType, 
  GoldenSentence, 
  Exercise, 
  QAItem, 
  VocabItem, 
  BilingualSegment, 
  ReviewStyle,
  PodcastScriptLine, 
  SummarySection,
  ThemeConfig
} from '../types';
import { 
  generateSummary, 
  generateBilingual, 
  generateGoldenSentences, 
  generateExercises,
  generateQA,
  generateVocabulary,
  generateActionPlan,
  generateBeginnerGuide,
  generateReview,
  generatePodcastScript,
  generateTTS
} from '../services/geminiService';
import { playPcmAudio, AudioController } from '../utils/audioUtils';
import { 
  Play, 
  Pause,
  RefreshCw, 
  Share2, 
  Check, 
  Volume2,
  Star,
  Feather,
  Lightbulb,
  GraduationCap,
  MessageSquare,
  ArrowDown,
  Copy,
  Quote,
  X,
  Loader2,
  Download,
  Palette,
  Mic,
  Zap,
  BookOpen,
  Baby // Imported for Beginner Guide (icon used in Sidebar but referenced here for consistency if needed, though view icon is prop)
} from 'lucide-react';

// --- Visual Components ---

// Enhanced Floral Pattern Component for Cards
const FloralPatterns = ({ className = "" }) => (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden rounded-xl ${className}`}>
        {/* Top Left Vine & Leaves */}
        <svg className="absolute top-0 left-0 w-64 h-64 opacity-20 text-current transform -translate-x-12 -translate-y-12" viewBox="0 0 200 200" fill="currentColor">
             <path d="M50,150 Q50,50 150,50" fill="none" stroke="currentColor" strokeWidth="1.5"/>
             <path d="M150,50 Q180,50 190,20" fill="none" stroke="currentColor" strokeWidth="1.5"/>
             <circle cx="50" cy="150" r="3" />
             <path d="M50,100 Q30,120 20,140" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             <ellipse cx="20" cy="140" rx="4" ry="8" transform="rotate(-30 20 140)"/>
             <path d="M100,50 Q120,30 140,20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             <ellipse cx="140" cy="20" rx="4" ry="8" transform="rotate(60 140 20)"/>
             <path d="M80,50 C60,50 50,60 40,80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
        </svg>
        
        {/* Bottom Right Lush Leaves */}
        <svg className="absolute bottom-0 right-0 w-80 h-80 opacity-15 text-current transform translate-x-16 translate-y-16 rotate-180" viewBox="0 0 300 300" fill="currentColor">
             <path d="M150,300 C150,200 200,150 300,150" fill="none" stroke="currentColor" strokeWidth="2"/>
             <path d="M150,300 Q120,250 100,280" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             <ellipse cx="100" cy="280" rx="12" ry="24" transform="rotate(-20 100 280)"/>
             <path d="M200,200 Q230,180 260,190" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             <ellipse cx="260" cy="190" rx="12" ry="24" transform="rotate(80 260 190)"/>
             <circle cx="300" cy="150" r="4" />
             <circle cx="180" cy="220" r="2" />
             <circle cx="220" cy="180" r="3" />
        </svg>

        {/* Decorative Border Frame */}
        <div className="absolute inset-4 border border-current opacity-20 rounded-lg"></div>
        <div className="absolute inset-6 border border-current opacity-10 rounded-lg"></div>
    </div>
);

// Helper for bold parsing to avoid repetition
const parseBold = (text: string, theme: ThemeConfig) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className={`font-bold ${theme.accent} opacity-100 px-1`}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

// Helper: Improved Simple Markdown Renderer
const SimpleMarkdown = ({ text, theme }: { text: string, theme: ThemeConfig }) => {
    if (!text) return null;
    return (
        <div className={`prose max-w-none ${theme.textMain} leading-loose ${theme.fontMain}`}>
            {text.split('\n').map((line, i) => {
                const cleanLine = line.trim();
                if (!cleanLine) return <br key={i} className="mb-2"/>;
                
                // Headers
                if (cleanLine.startsWith('###')) {
                    return (
                        <h3 key={i} className={`text-xl font-bold mt-8 mb-4 ${theme.textSecondary} tracking-tight flex items-center gap-2`}>
                            {theme.id !== 'modern' && <span className={`w-1.5 h-6 rounded-full ${theme.bgSidebar} opacity-70`}></span>}
                            {cleanLine.replace(/^###\s*/, '')}
                        </h3>
                    );
                }
                if (cleanLine.startsWith('##')) {
                    return (
                        <h2 key={i} className={`text-2xl font-bold mt-10 mb-6 ${theme.textMain} border-b ${theme.border} pb-3`}>
                            {cleanLine.replace(/^##\s*/, '')}
                        </h2>
                    );
                }
                if (cleanLine.startsWith('#')) {
                    return (
                        <h1 key={i} className={`text-3xl font-black mt-12 mb-8 ${theme.textMain} text-center`}>
                            {cleanLine.replace(/^#\s*/, '')}
                        </h1>
                    );
                }

                // Blockquote
                if (cleanLine.startsWith('> ')) {
                     return (
                         <div key={i} className={`pl-6 border-l-4 ${theme.border} ${theme.textSecondary} italic mb-6 py-2 bg-black/5 rounded-r-lg`}>
                             {cleanLine.replace(/^>\s*/, '')}
                         </div>
                     )
                }
                
                // Bullet List
                if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-3 ml-2 mb-3 items-start group">
                            <span className={`mt-2.5 w-1.5 h-1.5 rounded-full ${theme.id === 'cyber' ? 'bg-[#00F0FF]' : 'bg-current'} shrink-0 text-current opacity-60`}></span>
                            <span className="opacity-90 leading-relaxed">{parseBold(cleanLine.replace(/^[-*]\s*/, ''), theme)}</span>
                        </div>
                    );
                }

                // Numbered List
                const numMatch = cleanLine.match(/^(\d+)\.\s+(.*)/);
                if (numMatch) {
                    return (
                        <div key={i} className="flex gap-3 ml-2 mb-3 items-start group">
                            <span className={`font-bold ${theme.textSecondary} shrink-0 min-w-[1.5rem] text-right`}>{numMatch[1]}.</span>
                            <span className="opacity-90 leading-relaxed">{parseBold(numMatch[2], theme)}</span>
                        </div>
                    )
                }

                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className="mb-4 text-justify leading-8">
                        {parts.map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={idx} className={`font-bold ${theme.accent} opacity-90 px-1 rounded`}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

// --- Shared Helper for Layout ---
const FeatureWrapper = ({ 
  title, 
  icon: Icon,
  children, 
  loading, 
  onRefresh, 
  onCopy,
  extraActions,
  theme
}: { 
  title: string; 
  icon?: React.ElementType;
  children?: React.ReactNode; 
  loading: boolean;
  onRefresh?: () => void;
  onCopy?: () => void;
  extraActions?: React.ReactNode;
  theme: ThemeConfig;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header Bar */}
      <div className={`flex items-center justify-between px-10 py-6 shrink-0 ${theme.bgCard} border-b ${theme.border}`}>
        <div className="flex items-center gap-4">
            {Icon && (
              <div className={`${theme.accent}`}>
                <Icon size={24} strokeWidth={2}/>
              </div>
            )}
            <h2 className={`text-2xl font-bold ${theme.textMain} tracking-widest`}>{title}</h2>
        </div>
        <div className="flex gap-3 items-center">
          {extraActions}
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              disabled={loading}
              className={`group w-10 h-10 flex items-center justify-center ${theme.bgBody} rounded-full border ${theme.border} ${theme.textSecondary} hover:text-current hover:border-current transition-all disabled:opacity-50`}
              title="刷新"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
          {onCopy && (
            <button 
              onClick={handleCopy} 
              className={`w-10 h-10 flex items-center justify-center ${theme.bgBody} rounded-full border ${theme.border} ${theme.textSecondary} hover:text-current hover:border-current transition-all`}
              title="复制"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar relative ${theme.bgPanel}`}>
        {loading ? (
          <div className={`absolute inset-0 flex items-center justify-center ${theme.bgPanel}/80 z-20 backdrop-blur-sm`}>
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-16 h-16 border-4 ${theme.border} border-t-current rounded-full animate-spin ${theme.textSecondary}`}></div>
              </div>
              <div className="text-center">
                 <p className={`text-lg font-bold ${theme.textMain} tracking-widest`}>AI 正在研读...</p>
              </div>
            </div>
          </div>
        ) : children}
      </div>
    </div>
  );
};

// --- 1. Summary View ---
export const SummaryView = ({ apiKey, text, dataZh, dataEn, onUpdate, theme }: { apiKey: string, text: string, dataZh: SummarySection[] | null, dataEn: SummarySection[] | null, onUpdate: (d: SummarySection[], lang: 'zh' | 'en') => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await generateSummary(apiKey, text, lang);
      onUpdate(res, lang);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const LangToggle = (
    <div className={`flex ${theme.bgBody} rounded-lg p-1 border ${theme.border}`}>
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'zh' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'en' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>EN</button>
    </div>
  );

  const displayData = lang === 'zh' ? dataZh : dataEn;
  
  const handleCopy = () => {
      if(!displayData) return;
      const text = displayData.map(s => `## ${s.title}\n${s.content}`).join('\n\n');
      navigator.clipboard.writeText(text);
  };

  return (
    <FeatureWrapper 
      title="精读摘要" 
      icon={Feather}
      loading={loading} 
      onRefresh={fetchSummary}
      onCopy={handleCopy}
      extraActions={LangToggle}
      theme={theme}
    >
      <div className="max-w-6xl mx-auto py-8">
          {!displayData || displayData.length === 0 ? (
             <div className={`${theme.textSecondary} italic text-center py-20 opacity-60`}>正在生成...</div>
          ) : (
             <div className="space-y-8">
                {displayData.map((section, idx) => (
                    <div 
                      key={idx} 
                      className={`group ${theme.bgCard} ${theme.radius} border ${theme.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row`}
                    >
                        {/* Left: Title & Number */}
                        <div className={`md:w-1/4 ${theme.bgBody} p-8 border-b md:border-b-0 md:border-r ${theme.border} flex flex-col justify-center relative`}>
                            <div className={`absolute top-4 left-6 text-6xl font-black ${theme.textSecondary} opacity-10 select-none`}>
                                {String(idx + 1).padStart(2, '0')}
                            </div>
                            <h3 className={`text-xl font-bold ${theme.textMain} leading-tight relative z-10 mt-4`}>
                                {section.title}
                            </h3>
                        </div>

                        {/* Right: Content */}
                        <div className={`flex-1 p-8 ${theme.textMain} leading-loose text-lg text-justify`}>
                            {section.content}
                        </div>
                    </div>
                ))}
             </div>
          )}
      </div>
    </FeatureWrapper>
  );
};


// --- 3. Bilingual Reading ---
export const BilingualView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: BilingualSegment[], onUpdate: (d: BilingualSegment[]) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const CHUNK_SIZE = 2000;
  const activeRef = useRef<HTMLDivElement>(null);
  const audioControllerRef = useRef<AudioController | null>(null);

  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  const fetchChunk = async (idx: number, append: boolean = false) => {
    setLoading(true);
    try {
      const start = idx * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = text.slice(start, end);
      if (!chunk) return; 
      const res = await generateBilingual(apiKey, chunk);
      if (append) onUpdate([...data, ...res]);
      else onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const loadMore = () => {
    const nextIdx = chunkIndex + 1;
    setChunkIndex(nextIdx);
    fetchChunk(nextIdx, true);
  };

  const handlePlay = async (text: string, index: number) => {
    // Stop current audio if playing
    if (audioControllerRef.current) {
        audioControllerRef.current.stop();
        audioControllerRef.current = null;
        setPlayingIndex(null);
    }

    // Toggle off if clicking same
    if (playingIndex === index) {
        return;
    }

    setLoadingAudioId(index);
    try {
        const audioData = await generateTTS(apiKey, text, 'Kore');
        if (audioData) {
          setLoadingAudioId(null);
          setPlayingIndex(index);
          const controller = playPcmAudio(audioData);
          audioControllerRef.current = controller;
          await controller.promise;
          // Only clear if we are still the playing index (didn't switch)
          setPlayingIndex((prev) => prev === index ? null : prev);
          audioControllerRef.current = null;
        } else {
          setLoadingAudioId(null);
        }
    } catch (e) {
        console.error("TTS Error", e);
        setLoadingAudioId(null);
        setPlayingIndex(null);
    }
  };

  useEffect(() => {
    if (playingIndex !== null && activeRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [playingIndex]);
  
  const handleCopy = () => {
      const txt = data.map(s => `${s.original}\n${s.translation}`).join('\n\n');
      navigator.clipboard.writeText(txt);
  };

  return (
    <FeatureWrapper 
        title="沉浸双语" 
        icon={GraduationCap} 
        loading={loading} 
        onRefresh={() => { setChunkIndex(0); fetchChunk(0, false); }} 
        onCopy={handleCopy}
        theme={theme}
    >
      <div className="space-y-6 max-w-[1600px] mx-auto py-6">
        {data.map((seg, i) => {
          const isPlaying = playingIndex === i;
          const isLoading = loadingAudioId === i;
          return (
            <div 
                key={i} 
                ref={isPlaying ? activeRef : null}
                className={`flex flex-col xl:flex-row gap-6 items-stretch transition-all duration-700 ${isPlaying ? 'opacity-100 scale-[1.02]' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'}`}
            >
               
               {/* English/Original */}
               <div className={`flex-1 p-8 rounded-lg border relative transition-all duration-500 group ${isPlaying ? `${theme.buttonStyle} border-transparent shadow-xl ring-2 ring-offset-4 ring-offset-[${theme.bgPanel}] ring-current` : `${theme.bgCard} ${theme.border} shadow-sm ${theme.textMain}`}`}>
                  <div className="flex justify-between items-start mb-4">
                      <div className="text-xs font-bold tracking-[0.2em] uppercase opacity-50">Original</div>
                      <button 
                          onClick={() => handlePlay(seg.original, i)}
                          className={`p-2 rounded-full transition-all duration-300 ${isPlaying ? 'bg-white/20 text-white animate-pulse' : `${theme.textSecondary} hover:text-current hover:bg-black/5`}`}
                      >
                          {isLoading ? <Loader2 size={16} className="animate-spin" /> : isPlaying ? <Pause size={16} className="fill-current"/> : <Volume2 size={16} />}
                      </button>
                  </div>
                  <p className="leading-[1.8] text-lg text-justify">
                      {seg.original}
                  </p>
               </div>
               
               {/* Chinese/Translation */}
               <div className={`flex-1 p-8 rounded-lg border relative transition-all duration-500 ${isPlaying ? `${theme.bgBody} ${theme.border} ring-1 ring-current/20` : `${theme.bgPanel} border-transparent shadow-sm`}`}>
                   <div className="mb-4">
                      <div className={`text-xs font-bold tracking-[0.2em] uppercase ${theme.textSecondary} opacity-80`}>Translation</div>
                   </div>
                   <p className={`leading-[1.8] text-lg text-justify ${theme.textMain}`}>
                      {seg.translation}
                   </p>
               </div>
            </div>
          );
        })}
        {data.length === 0 && <div className={`text-center ${theme.textSecondary} py-10 opacity-60`}>暂无内容，请刷新生成。</div>}
      </div>
      
      {text.length > (chunkIndex + 1) * CHUNK_SIZE && (
          <div className="mt-12 flex justify-center pb-12">
            <button 
                onClick={loadMore}
                disabled={loading}
                className={`group flex items-center gap-3 px-10 py-4 ${theme.buttonStyle} ${theme.radius} font-bold shadow-lg hover:scale-105 transition-all`}
            >
                {loading ? <RefreshCw size={20} className="animate-spin"/> : <BookOpen size={20} />}
                生成下一章
            </button>
          </div>
      )}
    </FeatureWrapper>
  );
};

// --- 4. Golden Sentences (Rich Colors, Floral, No "Reading Artifact") ---

// Updated Theme Colors for Golden Cards - BRIGHTER & VIBRANT
const RICH_CARD_THEMES = [
  {
    id: 'sunset-glow',
    bgClass: "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]",
    textClass: "text-[#5D5C61]",
    accentClass: "text-white",
    subtextClass: "text-[#5D5C61]/80",
    darkText: true
  },
  {
    id: 'ocean-breeze',
    bgClass: "bg-gradient-to-br from-[#84fab0] to-[#8fd3f4]",
    textClass: "text-[#005C97]",
    accentClass: "text-white",
    subtextClass: "text-[#005C97]/80",
    darkText: true
  },
  {
    id: 'lavender-dream',
    bgClass: "bg-gradient-to-br from-[#a18cd1] to-[#fbc2eb]",
    textClass: "text-white",
    accentClass: "text-[#FFF0F5]",
    subtextClass: "text-white/80",
    darkText: false
  },
  {
    id: 'morning-mist',
    bgClass: "bg-gradient-to-br from-[#cfd9df] to-[#e2ebf0]",
    textClass: "text-[#4A4A4A]",
    accentClass: "text-[#767676]",
    subtextClass: "text-[#4A4A4A]/70",
    darkText: true
  },
   {
    id: 'citrus-splash',
    bgClass: "bg-gradient-to-br from-[#f6d365] to-[#fda085]",
    textClass: "text-[#6D3807]",
    accentClass: "text-white",
    subtextClass: "text-[#6D3807]/80",
    darkText: true
  }
];

export const GoldenSentencesView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: GoldenSentence[], onUpdate: (d: GoldenSentence[]) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<{item: GoldenSentence, index: number} | null>(null);
  const hoverTimeoutRef = useRef<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await generateGoldenSentences(apiKey, text);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handlePlay = async (txt: string) => {
      const audio = await generateTTS(apiKey, txt, 'Zephyr');
      if (audio) await playPcmAudio(audio).promise;
  };

  const handleMouseEnter = (s: GoldenSentence, i: number) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
          setActiveCard({ item: s, index: i });
      }, 300);
  };

  const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
        const canvas = await html2canvas(cardRef.current, {
            scale: 2, 
            useCORS: true,
            backgroundColor: null
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `golden-card-${Date.now()}.png`;
        link.click();
    } catch (e) {
        console.error("Download failed", e);
        alert("图片生成失败，请重试。");
    }
  };
  
  const handleCopy = () => {
      const txt = data.map(s => `${s.sentence}\n${s.translation}`).join('\n\n');
      navigator.clipboard.writeText(txt);
  };

  return (
    <FeatureWrapper title="金句卡片" icon={Star} loading={loading} onRefresh={fetchData} onCopy={handleCopy} theme={theme}>
      {/* 1. List View */}
      <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
        {data.length === 0 && <div className={`text-center ${theme.textSecondary} opacity-60`}>暂无金句，请刷新生成。</div>}
        {data.map((s, i) => (
            <div key={i} className={`group ${theme.bgCard} p-8 rounded-xl border ${theme.border} hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                <div className="flex gap-6 items-start relative z-10">
                    <div className={`text-6xl font-serif ${theme.textSecondary} opacity-20 leading-none`}>“</div>
                    <div className="flex-1 pt-2">
                        <p className={`text-xl font-bold ${theme.textMain} leading-relaxed`}>{s.sentence}</p>
                        <div className={`mt-4 pt-4 border-t ${theme.border} flex justify-between items-center`}>
                            <p className={`${theme.textSecondary} text-sm font-serif`}>{s.translation}</p>
                            
                            <div className="flex gap-2">
                                <button onClick={() => handlePlay(s.sentence)} className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 ${theme.textSecondary} hover:text-current`} title="Play">
                                    <Volume2 size={16} />
                                </button>
                                
                                <button 
                                    onMouseEnter={() => handleMouseEnter(s, i)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => setActiveCard({item: s, index: i})}
                                    className={`px-4 py-1 ${theme.buttonStyle} rounded text-xs font-bold flex items-center gap-2`}
                                >
                                    <Share2 size={12} /> 生成卡片
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* 2. Modal Overlay */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setActiveCard(null)}>
            <div className="relative h-[85vh] aspect-[9/16] max-w-md w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                
                {(() => {
                   const cardTheme = RICH_CARD_THEMES[activeCard.index % RICH_CARD_THEMES.length];
                   return (
                     <div ref={cardRef} className={`relative w-full h-full overflow-hidden rounded-xl shadow-2xl flex flex-col items-center justify-center text-center p-8 md:p-12 ${cardTheme.bgClass} animate-in zoom-in-95 duration-500`}>
                        {/* Floral Decoration */}
                        <div className={`absolute inset-0 pointer-events-none z-0 ${cardTheme.accentClass} opacity-30`}>
                            <FloralPatterns />
                        </div>

                        {/* Top Right Mark (Abstract) */}
                        <div className={`absolute top-8 right-8 ${cardTheme.accentClass} opacity-60`}>
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9L22 9L16 14L18 21L12 17L6 21L8 14L2 9L9.5 9L12 2Z" fillOpacity="0.8"/></svg>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full justify-between py-12">
                             <div className={`opacity-60 flex justify-center ${cardTheme.accentClass}`}>
                                <Quote size={40} className="fill-current rotate-180 drop-shadow-sm"/>
                             </div>

                             <div className="flex-1 flex flex-col justify-center gap-8">
                                <h3 className={`text-2xl md:text-3xl leading-relaxed font-bold font-serif ${cardTheme.textClass} drop-shadow-sm`}>
                                    {activeCard.item.sentence}
                                </h3>
                                
                                <div className="flex items-center gap-4 justify-center opacity-60">
                                   <div className={`h-[1px] w-12 ${cardTheme.accentClass} bg-current`}></div>
                                   <div className={`w-2 h-2 rounded-full ${cardTheme.accentClass} bg-current`}></div>
                                   <div className={`h-[1px] w-12 ${cardTheme.accentClass} bg-current`}></div>
                                </div>

                                <div className={`${cardTheme.subtextClass} text-sm md:text-base font-serif leading-relaxed px-4`}>
                                    {activeCard.item.translation}
                                </div>
                             </div>

                             {/* Abstract Footer Decoration (No text) */}
                             <div className="flex items-center justify-center gap-2 opacity-60">
                                <div className={`w-1 h-1 rounded-full ${cardTheme.accentClass} bg-current`}></div>
                                <div className={`w-1 h-1 rounded-full ${cardTheme.accentClass} bg-current`}></div>
                                <div className={`w-1 h-1 rounded-full ${cardTheme.accentClass} bg-current`}></div>
                             </div>
                        </div>
                     </div>
                   );
                })()}

                {/* External Actions */}
                <div className="absolute -right-20 top-0 bottom-0 flex flex-col justify-center gap-6">
                     <button 
                        onClick={() => setActiveCard(null)} 
                        className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:rotate-90 transition-all duration-300 backdrop-blur-sm border border-white/10"
                     >
                        <X size={20}/>
                     </button>
                     <button 
                        onClick={() => {
                            const nextIndex = activeCard.index + 1;
                            setActiveCard({...activeCard, index: nextIndex});
                        }}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-xl transition-all duration-300"
                        title="Switch Theme"
                     >
                        <Palette size={20}/>
                     </button>
                     <button 
                        onClick={handleDownload}
                        className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:bg-emerald-400 hover:scale-110 transition-all duration-300" 
                        title="Download Image"
                     >
                        <Download size={20}/>
                     </button>
                </div>
            </div>
        </div>
      )}
    </FeatureWrapper>
  );
};

// --- 5 & 6. Quiz & QA (Exam Mode) ---
export const QuizView = ({ 
    apiKey, 
    text, 
    type, 
    data, 
    onUpdate,
    theme
}: { 
    apiKey: string, 
    text: string, 
    type: 'EXERCISE' | 'QA', 
    data: any[],
    onUpdate: (d: any[]) => void,
    theme: ThemeConfig
}) => {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  // Exam Mode State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset exam state when data changes
  useEffect(() => {
    setUserAnswers({});
    setSubmitted(false);
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (type === 'EXERCISE') {
        const res = await generateExercises(apiKey, text, lang);
        onUpdate(res);
      } else {
        const res = await generateQA(apiKey, text, lang);
        onUpdate(res);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const calculateScore = () => {
     let correct = 0;
     data.forEach((item, i) => {
        const selected = userAnswers[i];
        if (selected && item.correctLetter && selected === item.correctLetter) correct++;
     });
     return Math.round((correct / data.length) * 100);
  };

  const LangToggle = (
    <div className={`flex ${theme.bgBody} rounded-lg p-1 border ${theme.border}`}>
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'zh' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'en' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>EN</button>
    </div>
  );
  
  const handleCopy = () => {
      const txt = data.map((item, i) => {
          if (type === 'EXERCISE') {
              return `${i+1}. ${item.question}\n${item.options.join('\n')}\nAnswer: ${item.correctLetter}\nExplanation: ${item.explanation}`;
          } else {
              return `Q: ${item.question}\nA: ${item.answer}`;
          }
      }).join('\n\n');
      navigator.clipboard.writeText(txt);
  };

  return (
    <FeatureWrapper 
      title={type === 'EXERCISE' ? '课后练习' : '答疑解惑'} 
      icon={type === 'EXERCISE' ? Check : MessageSquare}
      loading={loading} 
      onRefresh={fetchData}
      onCopy={handleCopy}
      extraActions={LangToggle}
      theme={theme}
    >
      <div className="space-y-8 max-w-5xl mx-auto pb-20 pt-8">
        
        {/* Score Header */}
        {type === 'EXERCISE' && submitted && (
            <div className={`${theme.bgSidebar} text-white p-6 rounded-xl shadow-xl flex items-center justify-between mb-8`}>
                <div>
                    <h3 className="text-2xl font-bold mb-1">测试结果</h3>
                    <p className="opacity-60 text-sm">Review your performance</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black">{calculateScore()}</div>
                    <div className="text-xs opacity-40 uppercase tracking-[0.3em] font-bold">Score</div>
                </div>
            </div>
        )}

        {data.length === 0 && <div className={`text-center ${theme.textSecondary} py-12 opacity-60`}>暂无内容，请刷新生成。</div>}
        
        {data.map((item, i) => (
           <div key={i} className={`${theme.bgCard} ${theme.radius} p-8 shadow-sm border ${theme.border} relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 p-6 opacity-[0.05] ${theme.textMain} text-8xl font-black pointer-events-none select-none`}>
                {i+1}
              </div>

              {type === 'EXERCISE' ? (
                <>
                  <div className="flex gap-4 mb-6 relative z-10">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold shrink-0 border ${submitted ? (userAnswers[i] === item.correctLetter ? 'bg-emerald-600 text-white border-transparent' : 'bg-red-500 text-white border-transparent') : `${theme.bgPanel} ${theme.textMain} ${theme.border}`}`}>
                        {i+1}
                    </span> 
                    <p className={`font-bold ${theme.textMain} text-lg leading-relaxed pt-1`}>{item.question}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pl-12 relative z-10">
                    {(item.options || []).map((opt: string, idx: number) => {
                      const letter = String.fromCharCode(65+idx);
                      const isSelected = userAnswers[i] === letter;
                      const isCorrect = item.correctLetter === letter;
                      
                      let bgClass = `${theme.bgPanel} border ${theme.border} hover:border-current`;
                      if (submitted) {
                          if (isCorrect) bgClass = "bg-emerald-50 border-emerald-500 text-emerald-800";
                          else if (isSelected && !isCorrect) bgClass = "bg-red-50 border-red-500 text-red-800";
                          else bgClass = "opacity-50 border-transparent";
                      } else if (isSelected) {
                          bgClass = `${theme.bgSidebar} text-white border-transparent`;
                      }

                      return (
                        <div 
                            key={idx} 
                            onClick={() => !submitted && setUserAnswers(prev => ({...prev, [i]: letter}))}
                            className={`p-4 rounded-lg text-base transition-all flex items-center gap-3 cursor-pointer ${bgClass}`}
                        >
                            <span className="font-bold text-sm opacity-60">{letter}.</span>
                            {opt}
                        </div>
                      );
                    })}
                  </div>
                  
                  {submitted && (
                      <div className={`ml-12 mt-4 p-4 ${theme.bgPanel} ${theme.textSecondary} rounded-lg border ${theme.border} text-base leading-relaxed`}>
                        <strong className={`block mb-1 ${theme.textMain} text-xs uppercase tracking-wider`}>解析</strong>
                        {item.explanation}
                      </div>
                  )}
                </>
              ) : (
                /* QA View - Simplified */
                <>
                  <div className="flex gap-4 items-start relative z-10">
                    <div className={`w-8 h-8 rounded-lg ${theme.bgSidebar} text-white flex items-center justify-center font-bold shrink-0`}>问</div>
                    <div className="pt-1">
                        <p className={`font-bold ${theme.textMain} text-lg leading-relaxed`}>{item.question}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 items-start relative z-10">
                     <div className={`w-8 h-8 rounded-lg ${theme.bgPanel} ${theme.textSecondary} flex items-center justify-center font-bold shrink-0`}>答</div>
                     <div className={`${theme.bgPanel} p-6 rounded-xl rounded-tl-none border ${theme.border} ${theme.textMain} leading-loose text-base w-full shadow-sm`}>
                        {item.answer}
                     </div>
                  </div>
                </>
              )}
           </div>
        ))}

        {type === 'EXERCISE' && data.length > 0 && !submitted && (
            <div className="flex justify-center pt-8">
                <button 
                    onClick={() => setSubmitted(true)}
                    className={`${theme.buttonStyle} px-12 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all`}
                >
                    提交答案
                </button>
            </div>
        )}
      </div>
    </FeatureWrapper>
  );
};

// --- 7. Vocabulary View ---
export const VocabView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: VocabItem[], onUpdate: (d: VocabItem[]) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await generateVocabulary(apiKey, text);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handlePlay = async (word: string) => {
    const audio = await generateTTS(apiKey, word, 'Puck');
    if (audio) await playPcmAudio(audio).promise;
  };
  
  const handleCopy = () => {
      const txt = data.map(v => `${v.word} /${v.ipa}/ (${v.pos})\n${v.meaning}`).join('\n\n');
      navigator.clipboard.writeText(txt);
  };

  return (
    <FeatureWrapper title="核心词汇" icon={GraduationCap} loading={loading} onRefresh={fetchData} onCopy={handleCopy} theme={theme}>
      <div className={`${theme.bgCard} rounded-xl shadow-sm border ${theme.border} overflow-hidden mx-auto max-w-6xl mt-4`}>
        <table className={`w-full text-left ${theme.textMain}`}>
          <thead className={`${theme.bgPanel} ${theme.textSecondary} font-bold uppercase tracking-widest text-xs border-b ${theme.border}`}>
            <tr>
              <th className="px-8 py-4">Word</th>
              <th className="px-6 py-4">IPA</th>
              <th className="px-6 py-4">Pos</th>
              <th className="px-6 py-4">Meaning</th>
              <th className="px-6 py-4 w-16"></th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.border}`}>
            {data.map((v, i) => (
              <tr key={i} className={`hover:${theme.bgPanel} transition-colors group`}>
                <td className="px-8 py-4 font-bold text-lg">{v.word}</td>
                <td className={`px-6 py-4 font-mono ${theme.accent} text-sm opacity-80`}>{v.ipa}</td>
                <td className={`px-6 py-4 italic ${theme.textSecondary} text-sm`}>{v.pos}</td>
                <td className="px-6 py-4 leading-relaxed max-w-md">{v.meaning}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handlePlay(v.word)} className={`p-2 rounded-full ${theme.textSecondary} hover:text-current hover:bg-black/5 transition-all`}>
                    <Volume2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
                <tr><td colSpan={5} className={`text-center py-20 ${theme.textSecondary} italic opacity-60`}>暂无词汇，请刷新生成。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </FeatureWrapper>
  );
};

// --- 8. Action Plan ---
export const ActionPlanView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: string | null, onUpdate: (d: string) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await generateActionPlan(apiKey, text, lang);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const LangToggle = (
    <div className={`flex ${theme.bgBody} rounded-lg p-1 border ${theme.border}`}>
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'zh' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'en' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>EN</button>
    </div>
  );
  
  const handleCopy = () => {
      if(data) navigator.clipboard.writeText(data);
  };

  return (
    <FeatureWrapper title="行动计划" icon={Check} loading={loading} onRefresh={fetchData} onCopy={handleCopy} extraActions={LangToggle} theme={theme}>
       <div className={`${theme.bgCard} p-10 rounded-xl shadow-sm border ${theme.border} max-w-5xl mx-auto mt-4 min-h-[50vh]`}>
         {data ? <SimpleMarkdown text={data} theme={theme} /> : <div className={`${theme.textSecondary} italic text-center py-10 opacity-60`}>暂无计划，请刷新生成...</div>}
      </div>
    </FeatureWrapper>
  );
};

// --- 9. Beginner Guide View (New) ---
export const BeginnerGuideView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: string | null, onUpdate: (d: string) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await generateBeginnerGuide(apiKey, text, lang);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const LangToggle = (
    <div className={`flex ${theme.bgBody} rounded-lg p-1 border ${theme.border}`}>
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'zh' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'en' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>EN</button>
    </div>
  );
  
  const handleCopy = () => {
      if(data) navigator.clipboard.writeText(data);
  };

  return (
    <FeatureWrapper title="新手拆解" icon={Baby} loading={loading} onRefresh={fetchData} onCopy={handleCopy} extraActions={LangToggle} theme={theme}>
       <div className={`${theme.bgCard} p-10 rounded-xl shadow-sm border ${theme.border} max-w-5xl mx-auto mt-4 min-h-[50vh]`}>
         {data ? <SimpleMarkdown text={data} theme={theme} /> : <div className={`${theme.textSecondary} italic text-center py-10 opacity-60`}>暂无内容，请刷新生成...</div>}
      </div>
    </FeatureWrapper>
  );
};

// --- 10. Review View (Cleaned Headers) ---
export const ReviewView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: string | null, onUpdate: (d: string) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<ReviewStyle>('Standard');
  const [lang, setLang] = useState<'en' | 'zh'>('zh');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await generateReview(apiKey, text, style, lang);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const Controls = (
    <div className="flex gap-3">
      <select 
        value={style} 
        onChange={(e) => setStyle(e.target.value as ReviewStyle)}
        className={`${theme.bgBody} ${theme.textMain} text-sm rounded px-3 py-1 border ${theme.border} focus:ring-1 focus:ring-current outline-none`}
      >
        <option value="Standard">标准风格</option>
        <option value="Nietzsche">尼采哲学式</option>
        <option value="Liu Zongyuan">柳宗元古文式</option>
        <option value="Hemingway">海明威极简式</option>
        <option value="Sarcastic">鲁迅犀利式</option>
        <option value="Academic">学术严谨式</option>
        <option value="Motivational">热血励志式</option>
        <option value="Socratic">苏格拉底反问式</option>
        <option value="Poetic">散文诗歌式</option>
        <option value="Journalistic">新闻纪实式</option>
      </select>
       <div className={`flex ${theme.bgBody} rounded-lg p-1 border ${theme.border}`}>
        <button onClick={() => setLang('zh')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'zh' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>中</button>
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'en' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>En</button>
       </div>
    </div>
  );
  
  const handleCopy = () => {
      if(data) navigator.clipboard.writeText(data);
  };

  return (
    <FeatureWrapper 
      title="深度书评" 
      icon={Feather}
      loading={loading} 
      onRefresh={fetchData} 
      onCopy={handleCopy}
      extraActions={Controls}
      theme={theme}
    >
      {!data && !loading ? (
        <div className={`flex flex-col items-center justify-center h-full ${theme.textSecondary} min-h-[400px]`}>
           <Feather size={48} className="mb-4 opacity-20" />
           <p>请选择一种风格，点击“刷新”生成书评。</p>
        </div>
      ) : (
        <div className={`max-w-4xl mx-auto ${theme.bgCard} p-12 rounded-xl shadow-sm border ${theme.border} relative overflow-hidden mt-4`}>
           <div className="relative z-10">
                <SimpleMarkdown text={data || ''} theme={theme} />
           </div>
           
           <div className={`mt-16 pt-8 border-t ${theme.border} flex justify-center ${theme.textSecondary}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
           </div>
        </div>
      )}
    </FeatureWrapper>
  );
};

// --- 11. Podcast View (Cleaned Headers) ---
export const PodcastView = ({ apiKey, text, data, onUpdate, theme }: { apiKey: string, text: string, data: PodcastScriptLine[], onUpdate: (d: PodcastScriptLine[]) => void, theme: ThemeConfig }) => {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const [autoPlayTrigger, setAutoPlayTrigger] = useState(false);
  const audioControllerRef = useRef<AudioController | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setAutoPlayTrigger(true); // Set trigger for auto-play
    try {
      const res = await generatePodcastScript(apiKey, text, lang);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // Auto-play effect
  useEffect(() => {
    if (!loading && data.length > 0 && autoPlayTrigger && !isPlaying) {
      playFullPodcast();
      setAutoPlayTrigger(false);
    }
  }, [loading, data, autoPlayTrigger]);

  const playFullPodcast = async () => {
    setIsPlaying(true);
    if (audioControllerRef.current && playingLine !== null) {
        await audioControllerRef.current.resume();
        return;
    }

    for (let i = playingLine || 0; i < data.length; i++) {
        if (!isPlaying && i > (playingLine || 0)) break; 

        setPlayingLine(i);
        const voice = data[i].speaker === 'Host' ? 'Fenrir' : 'Kore';
        const audio = await generateTTS(apiKey, data[i].text, voice);
        
        if (audio) {
             const controller = playPcmAudio(audio);
             audioControllerRef.current = controller;
             await controller.promise;
        }
    }
    setPlayingLine(null);
    setIsPlaying(false);
    audioControllerRef.current = null;
  };

  const togglePause = async () => {
      if (isPlaying) {
          await audioControllerRef.current?.pause();
          setIsPlaying(false);
      } else {
          // Resume
          if (audioControllerRef.current) {
              await audioControllerRef.current.resume();
              setIsPlaying(true);
          } else {
              playFullPodcast();
          }
      }
  };

  const LangToggle = (
    <div className={`flex ${theme.bgBody} rounded-lg p-1 border ${theme.border}`}>
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'zh' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold transition-all ${lang === 'en' ? `${theme.bgCard} shadow ${theme.textMain}` : `${theme.textSecondary} opacity-60`}`}>EN</button>
    </div>
  );

  return (
    <FeatureWrapper 
      title="AI 播客" 
      icon={Volume2}
      loading={loading} 
      onRefresh={fetchData}
      extraActions={LangToggle}
      theme={theme}
    >
      <div className={`flex flex-col h-full ${theme.bgCard} rounded-xl shadow-sm border ${theme.border} overflow-hidden relative mt-4`}>
         
         {/* Top Control Bar */}
         <div className={`p-6 border-b ${theme.border} flex flex-col md:flex-row items-center justify-between gap-6 ${theme.bgPanel}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.length > 0 ? theme.buttonStyle : `${theme.bgBody} ${theme.textSecondary}`}`}>
                    <Mic size={20} />
                </div>
                <div>
                   <h3 className={`font-bold ${theme.textMain} text-lg`}>Deep Dive Podcast</h3>
                </div>
            </div>

            <div className="flex gap-4">
                {data.length === 0 ? (
                    <button 
                        onClick={fetchData}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2 ${theme.buttonStyle} rounded-full font-bold shadow hover:opacity-90 transition-all`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>}
                        生成脚本
                    </button>
                ) : (
                    <button 
                        onClick={togglePause}
                        className={`group flex items-center gap-3 px-6 py-2 rounded-full font-bold shadow transition-all ${isPlaying ? `${theme.bgSidebar} text-white` : theme.buttonStyle}`}
                    >
                        {isPlaying ? (
                            <><Pause size={16} className="fill-current" /> 暂停</>
                        ) : (
                            <><Play size={16} className="fill-current" /> 播放</>
                        )}
                    </button>
                )}
            </div>
         </div>

         {/* Content Area */}
         <div className={`flex-1 space-y-6 overflow-y-auto px-10 py-10 custom-scrollbar ${theme.bgCard}`}>
            {data.length === 0 && !loading && (
                <div className={`h-full flex flex-col items-center justify-center ${theme.textSecondary} opacity-60`}>
                    <Mic size={48} className="mb-4" strokeWidth={1}/>
                    <p className="text-lg">点击上方按钮，开始生成播客。</p>
                </div>
            )}

            {data.map((line, i) => (
                <div key={i} className={`flex gap-4 ${line.speaker === 'Guest' ? 'flex-row-reverse' : ''} transition-all duration-500 ${playingLine !== null && playingLine !== i ? 'opacity-30 blur-[1px]' : 'opacity-100 scale-100'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0 shadow ${line.speaker === 'Host' ? theme.bgSidebar : theme.accent}`}>
                        {line.speaker === 'Host' ? 'H' : 'G'}
                    </div>
                    <div className={`p-6 rounded-xl max-w-[80%] text-lg leading-relaxed shadow-sm border ${line.speaker === 'Host' ? `${theme.bgPanel} ${theme.textMain} rounded-tl-none ${theme.border}` : `${theme.bgBody} ${theme.textMain} rounded-tr-none ${theme.border}`}`}>
                        <div className="font-bold text-[10px] opacity-40 mb-2 uppercase tracking-wider flex items-center gap-2">
                          {line.speaker === 'Host' ? 'Host' : 'Guest'}
                          {playingLine === i && isPlaying && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>}
                        </div>
                        <p>{line.text}</p>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </FeatureWrapper>
  );
};