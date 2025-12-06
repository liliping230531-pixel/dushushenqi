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
  SummarySection
} from '../types';
import { 
  generateSummary, 
  generateBilingual, 
  generateGoldenSentences,
  generateExercises,
  generateQA,
  generateVocabulary,
  generateActionPlan,
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
  Zap
} from 'lucide-react';

// Classical Ink Lotus for Card Mark
const InkLotusMark = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21c-2-3-4-7-4-10 0-4 2-7 4-7s4 3 4 7c0 3-2 7-4 10z" opacity="0.8"/>
    <path d="M12 21c-4-2-7-6-7-10 0-2 1-4 3-4 1 0 3 2 4 4" opacity="0.6"/>
    <path d="M12 21c4-2 7-6 7-10 0-2-1-4-3-4-1 0-3 2-4 4" opacity="0.6"/>
  </svg>
);

// --- Helper: Simple Markdown Renderer ---
const SimpleMarkdown = ({ text }: { text: string }) => {
    if (!text) return null;
    return (
        <div className="prose prose-stone prose-lg max-w-none text-[#2C2C2C] leading-loose font-serif">
            {text.split('\n').map((line, i) => {
                const cleanLine = line.trim();
                if (!cleanLine) return <br key={i}/>;
                
                if (cleanLine.startsWith('###')) return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-[#463F3A] tracking-tight border-l-4 border-[#984B43] pl-3">{cleanLine.replace(/^###\s*/, '')}</h3>;
                if (cleanLine.startsWith('##')) return <h2 key={i} className="text-2xl font-bold mt-10 mb-5 text-[#2C2C2C] border-b border-[#D1C0A5] pb-2">{cleanLine.replace(/^##\s*/, '')}</h2>;
                if (cleanLine.startsWith('#')) return <h1 key={i} className="text-3xl font-black mt-12 mb-8 text-[#2C2C2C]">{cleanLine.replace(/^#\s*/, '')}</h1>;
                
                if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-4 ml-2 mb-3 items-start group">
                            <span className="text-[#984B43] mt-2 w-1.5 h-1.5 rounded-full bg-[#984B43] shrink-0"></span>
                            <span className="text-[#463F3A]">{cleanLine.replace(/^[-*]\s*/, '')}</span>
                        </div>
                    );
                }

                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className="mb-5 text-justify">
                        {parts.map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={idx} className="text-[#984B43] font-bold bg-[#EBE5CE]/50 px-1 rounded">{part.slice(2, -2)}</strong>;
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
  extraActions 
}: { 
  title: string; 
  icon?: React.ElementType;
  children?: React.ReactNode; 
  loading: boolean;
  onRefresh?: () => void;
  onCopy?: () => void;
  extraActions?: React.ReactNode;
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
      {/* Header Bar - Classical Minimal */}
      <div className="flex items-center justify-between px-10 py-6 shrink-0 bg-[#F7F5F0] border-b border-[#EBE5CE]">
        <div className="flex items-center gap-4">
            {Icon && (
              <div className="text-[#984B43]">
                <Icon size={24} strokeWidth={2}/>
              </div>
            )}
            <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] tracking-widest">{title}</h2>
        </div>
        <div className="flex gap-3 items-center">
          {extraActions}
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              disabled={loading}
              className="group w-10 h-10 flex items-center justify-center bg-[#FDFCF8] rounded-full border border-[#D1C0A5] text-[#7A7067] hover:text-[#984B43] hover:border-[#984B43] transition-all disabled:opacity-50"
              title="刷新"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
          {onCopy && (
            <button 
              onClick={handleCopy} 
              className="w-10 h-10 flex items-center justify-center bg-[#FDFCF8] rounded-full border border-[#D1C0A5] text-[#7A7067] hover:text-[#984B43] hover:border-[#984B43] transition-all"
              title="复制"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar relative bg-[#FDFCF8]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FDFCF8]/80 z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#D1C0A5] border-t-[#984B43] rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                 <p className="text-lg font-serif font-bold text-[#2C2C2C] tracking-widest">正在研读...</p>
              </div>
            </div>
          </div>
        ) : children}
      </div>
    </div>
  );
};

// --- 1. Summary View ---
export const SummaryView = ({ apiKey, text, dataZh, dataEn, onUpdate }: { apiKey: string, text: string, dataZh: SummarySection[] | null, dataEn: SummarySection[] | null, onUpdate: (d: SummarySection[], lang: 'zh' | 'en') => void }) => {
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
    <div className="flex bg-[#EBE5CE] rounded-lg p-1">
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'zh' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'en' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>EN</button>
    </div>
  );

  const displayData = lang === 'zh' ? dataZh : dataEn;

  return (
    <FeatureWrapper 
      title="精读摘要" 
      icon={Feather}
      loading={loading} 
      onRefresh={fetchSummary}
      extraActions={LangToggle}
    >
      <div className="max-w-6xl mx-auto py-8">
          {!displayData || displayData.length === 0 ? (
             <div className="text-[#B0A496] italic font-serif text-center py-20">正在生成...</div>
          ) : (
             <div className="space-y-8">
                {displayData.map((section, idx) => (
                    <div 
                      key={idx} 
                      className="group bg-[#F7F5F0] rounded-xl border border-[#D1C0A5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Left: Title & Number */}
                        <div className="md:w-1/4 bg-[#EBE5CE] p-8 border-b md:border-b-0 md:border-r border-[#D1C0A5] flex flex-col justify-center relative">
                            <div className="absolute top-4 left-6 text-6xl font-black text-[#D1C0A5]/40 font-serif select-none">
                                {String(idx + 1).padStart(2, '0')}
                            </div>
                            <h3 className="text-xl font-bold text-[#2C2C2C] font-serif leading-tight relative z-10 mt-4">
                                {section.title}
                            </h3>
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 p-8 text-[#2C2C2C] leading-loose text-lg text-justify font-serif">
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
export const BilingualView = ({ apiKey, text, data, onUpdate }: { apiKey: string, text: string, data: BilingualSegment[], onUpdate: (d: BilingualSegment[]) => void }) => {
  const [loading, setLoading] = useState(false);
  const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const CHUNK_SIZE = 2500;

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
    if (loadingAudioId !== null || playingIndex !== null) return;
    setLoadingAudioId(index);
    try {
        const audioData = await generateTTS(apiKey, text, 'Kore');
        if (audioData) {
          setLoadingAudioId(null);
          setPlayingIndex(index);
          await playPcmAudio(audioData).promise;
          setPlayingIndex(null);
        } else {
          setLoadingAudioId(null);
        }
    } catch (e) {
        console.error("TTS Error", e);
        setLoadingAudioId(null);
        setPlayingIndex(null);
    }
  };

  return (
    <FeatureWrapper title="沉浸双语" icon={GraduationCap} loading={loading} onRefresh={() => { setChunkIndex(0); fetchChunk(0, false); }}>
      <div className="space-y-6 max-w-[1600px] mx-auto py-6">
        {data.map((seg, i) => {
          const isPlaying = playingIndex === i;
          const isLoading = loadingAudioId === i;
          return (
            <div key={i} className={`flex flex-col xl:flex-row gap-6 items-stretch transition-all duration-700 ${isPlaying ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}>
               
               {/* English/Original */}
               <div className={`flex-1 p-8 rounded-lg border relative transition-all duration-500 group ${isPlaying ? 'bg-[#2C2C2C] border-[#2C2C2C] shadow-lg text-[#F7F5F0]' : 'bg-[#F7F5F0] border-[#EBE5CE] shadow-sm text-[#463F3A]'}`}>
                  <div className="flex justify-between items-start mb-4">
                      <div className="text-xs font-bold tracking-[0.2em] uppercase opacity-50">Original</div>
                      <button 
                          onClick={() => handlePlay(seg.original, i)}
                          className={`p-2 rounded-full transition-all duration-300 ${isPlaying ? 'bg-[#F7F5F0] text-[#2C2C2C]' : 'text-[#B0A496] hover:text-[#984B43]'}`}
                      >
                          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      </button>
                  </div>
                  <p className="leading-[1.8] text-lg font-serif text-justify">
                      {seg.original}
                  </p>
               </div>
               
               {/* Chinese/Translation */}
               <div className={`flex-1 p-8 rounded-lg border relative transition-all duration-500 ${isPlaying ? 'bg-[#EBE5CE] border-[#D1C0A5]' : 'bg-[#FDFCF8] border-[#EBE5CE] shadow-sm'}`}>
                   <div className="mb-4">
                      <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#984B43] opacity-60">Translation</div>
                   </div>
                   <p className="leading-[1.8] text-lg font-serif text-justify text-[#2C2C2C]">
                      {seg.translation}
                   </p>
               </div>
            </div>
          );
        })}
        {data.length === 0 && <div className="text-center text-[#B0A496] py-10 font-serif">暂无内容，请刷新生成。</div>}
      </div>
      
      {text.length > (chunkIndex + 1) * CHUNK_SIZE && (
          <div className="mt-8 flex justify-center pb-8">
            <button 
                onClick={loadMore}
                disabled={loading}
                className="group flex items-center gap-3 px-8 py-3 bg-[#F7F5F0] text-[#463F3A] font-bold font-serif rounded-full shadow border border-[#D1C0A5] hover:border-[#984B43]"
            >
                {loading ? <RefreshCw size={18} className="animate-spin"/> : <ArrowDown size={18} />}
                生成下一章内容
            </button>
          </div>
      )}
    </FeatureWrapper>
  );
};

// --- 4. Golden Sentences (Updated: Classical Themes) ---

const CARD_THEMES = [
  {
    id: 'ink-classic',
    name: "Ink Classic",
    bgClass: "bg-[#F7F5F0] text-[#2C2C2C]",
    bgElement: (
       <>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-50"></div>
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#2C2C2C]"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#2C2C2C]"></div>
       </>
    ),
    containerStyle: "font-serif",
    quoteStyle: "text-3xl leading-relaxed font-bold text-[#2C2C2C]",
    transStyle: "text-[#5D7265] mt-8 text-sm tracking-widest font-serif",
    accentColor: "text-[#984B43]"
  },
  {
    id: 'cinnabar-seal',
    name: "Cinnabar",
    bgClass: "bg-[#984B43] text-[#F7F5F0]",
    bgElement: (
        <>
           <div className="absolute inset-0 border-8 border-[#F7F5F0]/20 m-4"></div>
        </>
    ),
    containerStyle: "font-serif",
    quoteStyle: "text-3xl leading-relaxed font-bold text-[#F7F5F0]",
    transStyle: "text-[#EBE5CE] mt-8 text-sm tracking-widest font-serif opacity-80",
    accentColor: "text-[#F7F5F0]"
  },
  {
    id: 'bamboo-forest',
    name: "Bamboo",
    bgClass: "bg-[#5D7265] text-[#F7F5F0]",
    bgElement: (
        <>
            <div className="absolute right-[-20%] top-0 h-full w-1/2 bg-[#4A5D52] skew-x-12 opacity-50"></div>
        </>
    ),
    containerStyle: "font-serif",
    quoteStyle: "text-3xl font-bold leading-relaxed tracking-wide text-[#F7F5F0]",
    transStyle: "text-[#D1C0A5] mt-8 text-sm tracking-widest font-serif",
    accentColor: "text-[#D1C0A5]"
  }
];

export const GoldenSentencesView = ({ apiKey, text, data, onUpdate }: { apiKey: string, text: string, data: GoldenSentence[], onUpdate: (d: GoldenSentence[]) => void }) => {
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

  return (
    <FeatureWrapper title="金句卡片" icon={Star} loading={loading} onRefresh={fetchData}>
      {/* 1. List View */}
      <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
        {data.length === 0 && <div className="text-center text-[#B0A496] font-serif">暂无金句，请刷新生成。</div>}
        {data.map((s, i) => (
            <div key={i} className="group bg-[#F7F5F0] p-8 rounded-xl border border-[#D1C0A5] hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="flex gap-6 items-start relative z-10">
                    <div className="text-6xl font-serif text-[#EBE5CE] leading-none">“</div>
                    <div className="flex-1 pt-2">
                        <p className="text-xl font-serif text-[#2C2C2C] leading-relaxed font-bold">{s.sentence}</p>
                        <div className="mt-4 pt-4 border-t border-[#EBE5CE] flex justify-between items-center">
                            <p className="text-[#5D7265] text-sm font-serif">{s.translation}</p>
                            
                            <div className="flex gap-2">
                                <button onClick={() => handlePlay(s.sentence)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#EBE5CE] text-[#B0A496] hover:text-[#2C2C2C]" title="Play">
                                    <Volume2 size={16} />
                                </button>
                                
                                <button 
                                    onMouseEnter={() => handleMouseEnter(s, i)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => setActiveCard({item: s, index: i})}
                                    className="px-4 py-1 bg-[#984B43] text-[#F7F5F0] rounded text-xs font-serif font-bold hover:bg-[#7D3C35] flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C2C]/90 backdrop-blur-sm p-4" onClick={() => setActiveCard(null)}>
            <div className="relative h-[85vh] aspect-[9/16] max-w-md w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                
                {(() => {
                   const theme = CARD_THEMES[activeCard.index % CARD_THEMES.length];
                   return (
                     <div ref={cardRef} className={`relative w-full h-full overflow-hidden rounded-xl shadow-2xl flex flex-col items-center justify-center text-center p-8 md:p-12 ${theme.bgClass} ${theme.containerStyle}`}>
                        {/* Background */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            {theme.bgElement}
                        </div>

                        {/* Top Right Lotus Mark */}
                        <div className={`absolute top-8 right-8 ${theme.accentColor} opacity-90`}>
                             <InkLotusMark size={32} />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full justify-between py-12">
                             <div className={`opacity-60 flex justify-center ${theme.accentColor}`}>
                                <Quote size={32} className="fill-current rotate-180"/>
                             </div>

                             <div className="flex-1 flex flex-col justify-center">
                                <h3 className={theme.quoteStyle}>
                                    {activeCard.item.sentence}
                                </h3>
                                <div className={theme.transStyle}>
                                    {activeCard.item.translation}
                                </div>
                             </div>

                             <div className="flex items-center justify-center gap-2 opacity-60 text-[10px] uppercase tracking-[0.4em] font-bold">
                                <span>Reading Artifact</span>
                             </div>
                        </div>
                     </div>
                   );
                })()}

                {/* External Actions */}
                <div className="absolute -right-16 top-0 bottom-0 flex flex-col justify-center gap-4">
                     <button 
                        onClick={() => setActiveCard(null)} 
                        className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                     >
                        <X size={18}/>
                     </button>
                     <button 
                        onClick={() => {
                            const nextIndex = activeCard.index + 1;
                            setActiveCard({...activeCard, index: nextIndex});
                        }}
                        className="w-10 h-10 rounded-full bg-[#EBE5CE] text-[#2C2C2C] flex items-center justify-center hover:scale-110 shadow-lg"
                        title="Change Theme"
                     >
                        <Palette size={18}/>
                     </button>
                     <button 
                        onClick={handleDownload}
                        className="w-10 h-10 rounded-full bg-[#984B43] text-white flex items-center justify-center shadow-lg hover:bg-[#7D3C35] hover:scale-110" 
                        title="Download Image"
                     >
                        <Download size={18}/>
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
    onUpdate 
}: { 
    apiKey: string, 
    text: string, 
    type: 'EXERCISE' | 'QA', 
    data: any[],
    onUpdate: (d: any[]) => void 
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
    <div className="flex bg-[#EBE5CE] rounded-lg p-1">
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'zh' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'en' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>EN</button>
    </div>
  );

  return (
    <FeatureWrapper 
      title={type === 'EXERCISE' ? '课后练习' : '答疑解惑'} 
      icon={type === 'EXERCISE' ? Check : MessageSquare}
      loading={loading} 
      onRefresh={fetchData}
      extraActions={LangToggle}
    >
      <div className="space-y-8 max-w-5xl mx-auto pb-20 pt-8">
        
        {/* Score Header */}
        {type === 'EXERCISE' && submitted && (
            <div className="bg-[#463F3A] text-[#F7F5F0] p-6 rounded-xl shadow-xl flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-serif font-bold mb-1">测试结果</h3>
                    <p className="opacity-60 text-sm">Review your performance</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black font-serif">{calculateScore()}</div>
                    <div className="text-xs opacity-40 uppercase tracking-[0.3em] font-bold">Score</div>
                </div>
            </div>
        )}

        {data.length === 0 && <div className="text-center text-[#B0A496] py-12 font-serif">暂无内容，请刷新生成。</div>}
        
        {data.map((item, i) => (
           <div key={i} className="bg-[#F7F5F0] rounded-xl p-8 shadow-sm border border-[#D1C0A5] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] font-serif text-[#463F3A] text-8xl font-black pointer-events-none">
                {i+1}
              </div>

              {type === 'EXERCISE' ? (
                <>
                  <div className="flex gap-4 mb-6 relative z-10">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold font-serif shrink-0 border ${submitted ? (userAnswers[i] === item.correctLetter ? 'bg-[#5D7265] text-white border-[#5D7265]' : 'bg-[#984B43] text-white border-[#984B43]') : 'bg-[#EBE5CE] text-[#463F3A] border-[#D1C0A5]'}`}>
                        {i+1}
                    </span> 
                    <p className="font-bold text-[#2C2C2C] text-lg leading-relaxed font-serif pt-1">{item.question}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pl-12 relative z-10">
                    {(item.options || []).map((opt: string, idx: number) => {
                      const letter = String.fromCharCode(65+idx);
                      const isSelected = userAnswers[i] === letter;
                      const isCorrect = item.correctLetter === letter;
                      
                      let bgClass = "bg-[#FDFCF8] border-[#D1C0A5] hover:border-[#984B43]";
                      if (submitted) {
                          if (isCorrect) bgClass = "bg-[#5D7265]/10 border-[#5D7265] text-[#5D7265]";
                          else if (isSelected && !isCorrect) bgClass = "bg-[#984B43]/10 border-[#984B43] text-[#984B43]";
                          else bgClass = "opacity-50 border-[#EBE5CE]";
                      } else if (isSelected) {
                          bgClass = "bg-[#463F3A] border-[#463F3A] text-[#F7F5F0]";
                      }

                      return (
                        <div 
                            key={idx} 
                            onClick={() => !submitted && setUserAnswers(prev => ({...prev, [i]: letter}))}
                            className={`p-4 rounded-lg text-base border transition-all flex items-center gap-3 cursor-pointer font-serif ${bgClass}`}
                        >
                            <span className="font-bold text-sm opacity-60">{letter}.</span>
                            {opt}
                        </div>
                      );
                    })}
                  </div>
                  
                  {submitted && (
                      <div className="ml-12 mt-4 p-4 bg-[#EBE5CE]/30 text-[#5D7265] rounded-lg border border-[#D1C0A5] text-base leading-relaxed font-serif">
                        <strong className="block mb-1 text-[#463F3A] text-xs uppercase tracking-wider">解析</strong>
                        {item.explanation}
                      </div>
                  )}
                </>
              ) : (
                /* QA View - Simplified */
                <>
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-[#463F3A] text-[#F7F5F0] flex items-center justify-center font-bold font-serif shrink-0">问</div>
                    <div className="pt-1">
                        <p className="font-bold text-[#2C2C2C] text-lg leading-relaxed font-serif">{item.question}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 items-start relative z-10">
                     <div className="w-8 h-8 rounded-lg bg-[#EBE5CE] text-[#463F3A] flex items-center justify-center font-bold font-serif shrink-0">答</div>
                     <div className="bg-[#FDFCF8] p-6 rounded-xl rounded-tl-none border border-[#EBE5CE] text-[#2C2C2C] leading-loose text-base w-full font-serif shadow-sm">
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
                    className="bg-[#984B43] text-[#F7F5F0] px-12 py-3 rounded-full font-bold font-serif text-lg shadow-lg hover:bg-[#7D3C35] transition-all"
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
export const VocabView = ({ apiKey, text, data, onUpdate }: { apiKey: string, text: string, data: VocabItem[], onUpdate: (d: VocabItem[]) => void }) => {
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

  return (
    <FeatureWrapper title="核心词汇" icon={GraduationCap} loading={loading} onRefresh={fetchData}>
      <div className="bg-[#FDFCF8] rounded-xl shadow-sm border border-[#D1C0A5] overflow-hidden mx-auto max-w-6xl mt-4">
        <table className="w-full text-left text-[#463F3A] font-serif">
          <thead className="bg-[#EBE5CE] text-[#7A7067] font-bold uppercase tracking-widest text-xs border-b border-[#D1C0A5]">
            <tr>
              <th className="px-8 py-4">Word</th>
              <th className="px-6 py-4">IPA</th>
              <th className="px-6 py-4">Pos</th>
              <th className="px-6 py-4">Meaning</th>
              <th className="px-6 py-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE5CE]">
            {data.map((v, i) => (
              <tr key={i} className="hover:bg-[#F7F5F0] transition-colors group">
                <td className="px-8 py-4 font-bold text-[#2C2C2C] text-lg">{v.word}</td>
                <td className="px-6 py-4 font-mono text-[#5D7265] text-sm">{v.ipa}</td>
                <td className="px-6 py-4 italic text-[#7A7067] text-sm">{v.pos}</td>
                <td className="px-6 py-4 text-[#2C2C2C] leading-relaxed max-w-md">{v.meaning}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handlePlay(v.word)} className="p-2 rounded-full text-[#B0A496] hover:text-[#984B43] hover:bg-[#FDFCF8] transition-all">
                    <Volume2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
                <tr><td colSpan={5} className="text-center py-20 text-[#B0A496] italic">暂无词汇，请刷新生成。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </FeatureWrapper>
  );
};

// --- 8. Action Plan ---
export const ActionPlanView = ({ apiKey, text, data, onUpdate }: { apiKey: string, text: string, data: string | null, onUpdate: (d: string) => void }) => {
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
    <div className="flex bg-[#EBE5CE] rounded-lg p-1">
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'zh' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'en' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>EN</button>
    </div>
  );

  return (
    <FeatureWrapper title="行动计划" icon={Check} loading={loading} onRefresh={fetchData} extraActions={LangToggle}>
       <div className="bg-[#FDFCF8] p-10 rounded-xl shadow-sm border border-[#D1C0A5] max-w-5xl mx-auto mt-4 font-serif">
         {data ? <SimpleMarkdown text={data} /> : <div className="text-[#B0A496] italic text-center py-10">暂无计划，请刷新生成...</div>}
      </div>
    </FeatureWrapper>
  );
};

// --- 9. Review View (Cleaned Headers) ---
export const ReviewView = ({ apiKey, text, data, onUpdate }: { apiKey: string, text: string, data: string | null, onUpdate: (d: string) => void }) => {
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
        className="bg-[#EBE5CE] text-[#463F3A] text-sm rounded px-3 py-1 border border-[#D1C0A5] focus:ring-1 focus:ring-[#984B43] outline-none font-serif"
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
       <div className="flex bg-[#EBE5CE] rounded-lg p-1">
        <button onClick={() => setLang('zh')} className={`px-3 py-1 rounded text-xs font-bold font-serif transition-all ${lang === 'zh' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>中</button>
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded text-xs font-bold font-serif transition-all ${lang === 'en' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>En</button>
       </div>
    </div>
  );

  return (
    <FeatureWrapper 
      title="深度书评" 
      icon={Feather}
      loading={loading} 
      onRefresh={fetchData} 
      extraActions={Controls}
    >
      {!data && !loading ? (
        <div className="flex flex-col items-center justify-center h-full text-[#B0A496] min-h-[400px]">
           <Feather size={48} className="mb-4 opacity-20 text-[#463F3A]" />
           <p className="font-serif">请选择一种风格，点击“刷新”生成书评。</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-[#FDFCF8] p-12 rounded-xl shadow-sm border border-[#D1C0A5] relative overflow-hidden mt-4">
           {/* Removed redundant header text here */}
           
           <div className="relative z-10">
                <SimpleMarkdown text={data || ''} />
           </div>
           
           <div className="mt-16 pt-8 border-t border-[#EBE5CE] flex justify-center text-[#B0A496]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D1C0A5]"></div>
           </div>
        </div>
      )}
    </FeatureWrapper>
  );
};

// --- 10. Podcast View (Cleaned Headers) ---
export const PodcastView = ({ apiKey, text, data, onUpdate }: { apiKey: string, text: string, data: PodcastScriptLine[], onUpdate: (d: PodcastScriptLine[]) => void }) => {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const audioControllerRef = useRef<AudioController | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await generatePodcastScript(apiKey, text, lang);
      onUpdate(res);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

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
    <div className="flex bg-[#EBE5CE] rounded-lg p-1">
        <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'zh' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>中文</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1 rounded text-sm font-bold font-serif transition-all ${lang === 'en' ? 'bg-[#FDFCF8] shadow text-[#2C2C2C]' : 'text-[#7A7067]'}`}>EN</button>
    </div>
  );

  return (
    <FeatureWrapper 
      title="AI 播客" 
      icon={Volume2}
      loading={loading} 
      onRefresh={fetchData}
      extraActions={LangToggle}
    >
      <div className="flex flex-col h-full bg-[#FDFCF8] rounded-xl shadow-sm border border-[#D1C0A5] overflow-hidden relative mt-4">
         
         {/* Top Control Bar */}
         <div className="p-6 border-b border-[#EBE5CE] flex flex-col md:flex-row items-center justify-between gap-6 bg-[#F7F5F0]">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.length > 0 ? 'bg-[#463F3A] text-[#F7F5F0]' : 'bg-[#EBE5CE] text-[#B0A496]'}`}>
                    <Mic size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-[#2C2C2C] text-lg font-serif">Deep Dive Podcast</h3>
                </div>
            </div>

            <div className="flex gap-4">
                {data.length === 0 ? (
                    <button 
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-[#984B43] text-white rounded-full font-serif font-bold shadow hover:bg-[#7D3C35] transition-all"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>}
                        生成脚本
                    </button>
                ) : (
                    <button 
                        onClick={togglePause}
                        className={`group flex items-center gap-3 px-6 py-2 rounded-full font-bold font-serif shadow transition-all ${isPlaying ? 'bg-[#463F3A] text-[#F7F5F0]' : 'bg-[#984B43] text-[#F7F5F0] hover:bg-[#7D3C35]'}`}
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
         <div className="flex-1 space-y-6 overflow-y-auto px-10 py-10 custom-scrollbar bg-[#FDFCF8]">
            {data.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-[#B0A496] opacity-60">
                    <Mic size={48} className="mb-4" strokeWidth={1}/>
                    <p className="text-lg font-serif">点击上方按钮，开始生成播客。</p>
                </div>
            )}

            {data.map((line, i) => (
                <div key={i} className={`flex gap-4 ${line.speaker === 'Guest' ? 'flex-row-reverse' : ''} transition-all duration-500 ${playingLine !== null && playingLine !== i ? 'opacity-30 blur-[1px]' : 'opacity-100 scale-100'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[#F7F5F0] text-sm shrink-0 shadow ${line.speaker === 'Host' ? 'bg-[#463F3A]' : 'bg-[#984B43]'}`}>
                        {line.speaker === 'Host' ? 'H' : 'G'}
                    </div>
                    <div className={`p-6 rounded-xl max-w-[80%] text-lg leading-relaxed shadow-sm border font-serif ${line.speaker === 'Host' ? 'bg-[#F7F5F0] text-[#2C2C2C] rounded-tl-none border-[#EBE5CE]' : 'bg-[#EBE5CE] text-[#463F3A] rounded-tr-none border-[#D1C0A5]'}`}>
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