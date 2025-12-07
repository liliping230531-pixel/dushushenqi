import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { 
  SummaryView, 
  BilingualView, 
  GoldenSentencesView,
  QuizView,
  VocabView,
  ActionPlanView,
  ReviewView,
  PodcastView,
  BeginnerGuideView
} from './components/FeatureViews';
import { FeatureType, AnalysisData, ThemeId, ThemeConfig } from './types';
import { 
  generateSummary, 
  generateBilingual, 
  generateGoldenSentences, 
  generateVocabulary, 
  generateActionPlan, 
  generateReview,
  generateExercises, 
  generateQA, 
  generatePodcastScript,
  generateBeginnerGuide
} from './services/geminiService';
import { FileText, UploadCloud, Sparkles, Zap, Check, ArrowRight, X, Palette, ChevronDown, Download, Paintbrush, PlusCircle } from 'lucide-react';

// --- THEME DEFINITIONS ---
const THEMES: Record<ThemeId, ThemeConfig> = {
  song: {
    id: 'song',
    name: '宋韵雅集 (Song Dynasty)',
    bgBody: 'bg-[#F9F7F2]',
    bgPanel: 'bg-[#F9F7F2]',
    bgSidebar: 'bg-[#4A6E8A]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#2C3E50]',
    textSecondary: 'text-[#8E6E53]',
    accent: 'text-[#A63737]',
    border: 'border-[#D4C4A9]',
    fontMain: 'font-serif',
    radius: 'rounded-[1.5rem]',
    shadow: 'shadow-2xl',
    textureOverlay: "url('https://www.transparenttextures.com/patterns/rice-paper.png')",
    buttonStyle: 'bg-[#4A6E8A] text-[#F9F7F2] hover:bg-[#344E63]'
  },
  candy: {
    id: 'candy',
    name: '糖果梦境 (Sweet Dreams)',
    bgBody: 'bg-[#FFF0F5]',
    bgPanel: 'bg-[#FFFFFF]',
    bgSidebar: 'bg-[#FFB7B2]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#5D5C61]',
    textSecondary: 'text-[#FF69B4]',
    accent: 'text-[#FF9AA2]',
    border: 'border-[#FFDAC1]',
    fontMain: 'font-sans',
    radius: 'rounded-3xl',
    shadow: 'shadow-lg shadow-pink-100',
    textureOverlay: 'none',
    buttonStyle: 'bg-[#FFB7B2] text-white hover:bg-[#FF9AA2]'
  },
  forest: {
    id: 'forest',
    name: '森之呼吸 (Fresh Forest)',
    bgBody: 'bg-[#F0FFF4]',
    bgPanel: 'bg-[#FFFFFF]',
    bgSidebar: 'bg-[#38A169]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#22543D]',
    textSecondary: 'text-[#48BB78]',
    accent: 'text-[#2F855A]',
    border: 'border-[#9AE6B4]',
    fontMain: 'font-sans',
    radius: 'rounded-2xl',
    shadow: 'shadow-lg shadow-green-100',
    textureOverlay: "url('https://www.transparenttextures.com/patterns/cubes.png')",
    buttonStyle: 'bg-[#38A169] text-white hover:bg-[#2F855A]'
  },
  sunset: {
    id: 'sunset',
    name: '落日余晖 (Warm Sunset)',
    bgBody: 'bg-[#FFF5F5]',
    bgPanel: 'bg-[#FFFFFF]',
    bgSidebar: 'bg-[#ED8936]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#7B341E]',
    textSecondary: 'text-[#DD6B20]',
    accent: 'text-[#C05621]',
    border: 'border-[#FBD38D]',
    fontMain: 'font-serif',
    radius: 'rounded-xl',
    shadow: 'shadow-lg shadow-orange-100',
    textureOverlay: 'none',
    buttonStyle: 'bg-[#ED8936] text-white hover:bg-[#DD6B20]'
  },
  ocean: {
    id: 'ocean',
    name: '深海静谧 (Deep Ocean)',
    bgBody: 'bg-[#EBF8FF]',
    bgPanel: 'bg-[#FFFFFF]',
    bgSidebar: 'bg-[#3182CE]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#2A4365]',
    textSecondary: 'text-[#63B3ED]',
    accent: 'text-[#2B6CB0]',
    border: 'border-[#BEE3F8]',
    fontMain: 'font-sans',
    radius: 'rounded-xl',
    shadow: 'shadow-lg shadow-blue-100',
    textureOverlay: 'none',
    buttonStyle: 'bg-[#3182CE] text-white hover:bg-[#2B6CB0]'
  },
  modern: {
    id: 'modern',
    name: '现代极简 (Modern Minimal)',
    bgBody: 'bg-[#FAFAFA]',
    bgPanel: 'bg-[#FFFFFF]',
    bgSidebar: 'bg-[#18181B]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#18181B]',
    textSecondary: 'text-[#71717A]',
    accent: 'text-[#000000]',
    border: 'border-[#E4E4E7]',
    fontMain: 'font-sans',
    radius: 'rounded-lg',
    shadow: 'shadow-sm',
    textureOverlay: 'none',
    buttonStyle: 'bg-[#18181B] text-white hover:bg-[#27272A]'
  },
  cyber: {
    id: 'cyber',
    name: '霓虹赛博 (Cyberpunk)',
    bgBody: 'bg-[#09090b]',
    bgPanel: 'bg-[#18181b]',
    bgSidebar: 'bg-[#27272a]',
    bgCard: 'bg-[#000000]',
    textMain: 'text-[#e4e4e7]',
    textSecondary: 'text-[#22d3ee]',
    accent: 'text-[#f472b6]',
    border: 'border-[#22d3ee]/30',
    fontMain: 'font-mono',
    radius: 'rounded-none',
    shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    textureOverlay: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
    buttonStyle: 'bg-[#22d3ee] text-black font-bold hover:shadow-[0_0_15px_#22d3ee] transition-shadow'
  },
  journal: {
    id: 'journal',
    name: '手账暖调 (Cozy Journal)',
    bgBody: 'bg-[#FFFDF5]',
    bgPanel: 'bg-[#FFFDF5]',
    bgSidebar: 'bg-[#D69E2E]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#5F370E]',
    textSecondary: 'text-[#975A16]',
    accent: 'text-[#B7791F]',
    border: 'border-[#F6E05E]',
    fontMain: 'font-serif',
    radius: 'rounded-2xl',
    shadow: 'shadow-[4px_4px_0px_rgba(214,158,46,0.2)]',
    textureOverlay: "url('https://www.transparenttextures.com/patterns/notebook.png')",
    buttonStyle: 'bg-[#D69E2E] text-white hover:bg-[#B7791F]'
  },
  magazine: {
    id: 'magazine',
    name: '杂志新中式 (New Chinese)',
    bgBody: 'bg-[#F2F2F2]',
    bgPanel: 'bg-[#F2F2F2]',
    bgSidebar: 'bg-[#9B2C2C]',
    bgCard: 'bg-[#FFFFFF]',
    textMain: 'text-[#1A202C]',
    textSecondary: 'text-[#9B2C2C]',
    accent: 'text-[#C53030]',
    border: 'border-[#CBD5E0]',
    fontMain: 'font-serif',
    radius: 'rounded-none',
    shadow: 'shadow-xl',
    textureOverlay: "url('https://www.transparenttextures.com/patterns/cubes.png')",
    buttonStyle: 'bg-[#9B2C2C] text-white hover:bg-[#742A2A]'
  }
};

export const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [currentFeature, setCurrentFeature] = useState<FeatureType>(FeatureType.SUMMARY);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  
  // Theme State
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('song');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const theme = THEMES[currentThemeId];

  // Centralized Data State
  const [data, setData] = useState<AnalysisData>({
      summaryZh: [],
      summaryEn: [],
      bilingual: [],
      goldenSentences: [],
      exercises: [],
      qa: [],
      vocabulary: [],
      actionPlan: null,
      review: null,
      beginnerGuide: null,
      podcastScript: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawText(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
      readFile(file);
    } else {
        alert("请拖入 .txt 格式文件");
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setLoadingStep('初始化引擎...');
    
    try {
        setLoadingStep('正在凝练章节精华...');
        const [summaryZh, summaryEn, goldenSentences, vocabulary] = await Promise.all([
            generateSummary(apiKey, rawText, 'zh'),
            generateSummary(apiKey, rawText, 'en'),
            generateGoldenSentences(apiKey, rawText),
            generateVocabulary(apiKey, rawText)
        ]);
        
        setLoadingStep('正在构建行动指南...');
        const [actionPlan, review, beginnerGuide] = await Promise.all([
            generateActionPlan(apiKey, rawText),
            generateReview(apiKey, rawText, 'Standard', 'zh'),
            generateBeginnerGuide(apiKey, rawText, 'zh')
        ]);

        setLoadingStep('正在生成深度互动内容...');
        const [exercises, qa, bilingual] = await Promise.all([
            generateExercises(apiKey, rawText, 'zh'),
            generateQA(apiKey, rawText, 'zh'),
            generateBilingual(apiKey, rawText.slice(0, 2500))
        ]);

        setData({ 
            summaryZh, 
            summaryEn, 
            goldenSentences, 
            vocabulary, 
            actionPlan, 
            review, 
            exercises, 
            qa, 
            bilingual, 
            beginnerGuide, 
            podcastScript: [] 
        });

        setAnalysisStarted(true);

    } catch (e) {
        console.error("Analysis Failed", e);
        alert("分析部分失败，请重试。");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setRawText('');
    setFileName('');
    setAnalysisStarted(false);
    setData({
      summaryZh: [], 
      summaryEn: [], 
      bilingual: [], 
      goldenSentences: [], 
      exercises: [], 
      qa: [], 
      vocabulary: [], 
      actionPlan: null, 
      review: null, 
      beginnerGuide: null, 
      podcastScript: []
    });
  };

  const handleExport = () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${fileName || '读书笔记'} - AI Analysis Report</title>
            <style>
                body { font-family: 'Georgia', serif; line-height: 1.6; max-width: 800px; margin: 40px auto; color: #333; padding: 20px; }
                h1, h2, h3 { color: #2c3e50; }
                h1 { border-bottom: 2px solid #eee; padding-bottom: 20px; text-align: center; }
                h2 { margin-top: 40px; border-left: 5px solid #4A6E8A; padding-left: 15px; }
                blockquote { background: #f9f9f9; border-left: 10px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px; font-style: italic; }
                .section { margin-bottom: 30px; }
                .vocab-item { margin-bottom: 10px; }
                .meta { color: #888; font-size: 0.9em; text-align: center; }
            </style>
        </head>
        <body>
            <h1>${fileName || '读书笔记'}</h1>
            <p class="meta">Generated by 读书神器 AI Reader</p>

            <div class="section">
                <h2>精读摘要</h2>
                ${data.summaryZh.map(s => `<h3>${s.title}</h3><p>${s.content}</p>`).join('')}
            </div>

            <div class="section">
                <h2>新手拆解</h2>
                <div>${data.beginnerGuide ? data.beginnerGuide.replace(/\n/g, '<br/>') : '暂无'}</div>
            </div>

            <div class="section">
                <h2>金句卡片</h2>
                ${data.goldenSentences.map(s => `<blockquote>${s.sentence}<br/><small>${s.translation}</small></blockquote>`).join('')}
            </div>

            <div class="section">
                <h2>核心词汇</h2>
                ${data.vocabulary.map(v => `<div class="vocab-item"><strong>${v.word}</strong> /${v.ipa}/ (${v.pos}): ${v.meaning}</div>`).join('')}
            </div>

            <div class="section">
                <h2>行动计划</h2>
                <div>${data.actionPlan ? data.actionPlan.replace(/\n/g, '<br/>') : '暂无'}</div>
            </div>
            
             <div class="section">
                <h2>深度书评</h2>
                <div>${data.review ? data.review.replace(/\n/g, '<br/>') : '暂无'}</div>
            </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName || 'report'}-analysis.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const renderContent = () => {
    // 1. Initial / Upload State
    if (!analysisStarted && !isAnalyzing) {
       return (
        <div className={`h-full flex flex-col items-center justify-center p-8 relative z-10 w-full max-w-4xl mx-auto ${theme.fontMain}`}>
            
            {/* Hero Section - Reduced bottom margin to pull input up */}
            <div className={`text-center mb-6 relative animate-in fade-in duration-1000 slide-in-from-bottom-4`}>
                 <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${theme.buttonStyle} border-4 border-white/20`}>
                    <span className="text-3xl font-bold">书</span>
                 </div>
                 <h1 className={`text-5xl font-bold ${theme.textMain} tracking-tight mb-2`}>
                    读书<span className={theme.accent}>神器</span>
                 </h1>
                 <div className={`flex items-center justify-center gap-4 ${theme.textSecondary} font-medium tracking-[0.3em] uppercase text-xs opacity-70`}>
                    <span className="w-8 h-[1px] bg-current"></span>
                    沉浸式深度阅读
                    <span className="w-8 h-[1px] bg-current"></span>
                 </div>
            </div>

            {/* Upload Card - Adjusted for better visibility of button */}
            <div 
                className={`w-full flex-1 max-h-[60vh] flex flex-col ${theme.bgCard} ${theme.radius} border-2 ${theme.border} ${theme.shadow} transition-all duration-500 relative group overflow-hidden ${isDragging ? 'scale-[1.01]' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <div className="relative z-10 flex flex-col h-full p-8">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                         <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 ${theme.radius} flex items-center justify-center transition-all duration-500 border ${theme.border} ${rawText ? theme.buttonStyle : 'bg-transparent ' + theme.textMain}`}>
                                {rawText ? <Check size={24}/> : <UploadCloud size={24} strokeWidth={1.5} />}
                             </div>
                             <div>
                                 <h3 className={`text-xl font-bold ${theme.textMain}`}>
                                    {rawText ? (fileName || "文稿已就绪") : "导入书籍"}
                                 </h3>
                                 <p className={`${theme.textSecondary} text-xs`}>
                                    {rawText ? `${(rawText.length / 1000).toFixed(1)}k 字` : "支持 .txt 格式 · 拖拽或上传"}
                                 </p>
                             </div>
                         </div>

                         {!rawText && (
                             <label className={`px-4 py-2 ${theme.textMain} border ${theme.border} ${theme.radius} font-bold hover:opacity-70 transition-all cursor-pointer shadow-sm flex items-center gap-2 text-sm`}>
                                <FileText size={16}/>
                                <span>选择文件</span>
                                <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                             </label>
                         )}
                    </div>

                    {/* Textarea Area - Height adjusted to be flexible but allow button space */}
                    <div className={`flex-1 ${theme.bgBody} ${theme.radius} border ${theme.border} overflow-hidden relative shadow-inner mb-6`}>
                        <textarea 
                            className={`w-full h-full p-6 text-base ${theme.textMain} bg-transparent border-none focus:ring-0 resize-none leading-loose outline-none placeholder:opacity-40`}
                            placeholder="请在此粘贴文章内容..."
                            value={rawText}
                            onChange={(e) => { setRawText(e.target.value); if(e.target.value) setFileName("文稿内容"); }}
                        ></textarea>
                        
                        {rawText && (
                            <button 
                                onClick={() => { setRawText(''); setFileName(''); }}
                                className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 ${theme.textSecondary}`}
                            >
                                <X size={18}/>
                            </button>
                        )}
                    </div>

                    {/* Action Footer - Clearly visible */}
                    <div className={`flex justify-end shrink-0 transition-all duration-500 ${rawText ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                         <button 
                            onClick={startAnalysis}
                            disabled={!rawText}
                            className={`group relative inline-flex items-center gap-3 px-10 py-4 ${theme.buttonStyle} ${theme.radius} font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
                         >
                            <span className="relative z-10 flex items-center gap-2">
                                <Zap size={20} className="fill-current"/>
                                开始研读
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                            </span>
                         </button>
                    </div>

                </div>
            </div>
        </div>
       );
    }

    // 2. Loading State
    if (isAnalyzing) {
        return (
            <div className={`h-full flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000 relative w-full ${theme.fontMain}`}>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-16">
                         <div className={`w-32 h-32 rounded-full border ${theme.border} opacity-30`}></div>
                         <div className={`absolute inset-0 w-32 h-32 rounded-full border-[4px] border-t-transparent animate-spin-slow ${theme.border} border-t-current`}></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-4xl ${theme.accent} font-bold`}>读</span>
                         </div>
                    </div>
                    <h2 className={`text-4xl font-bold ${theme.textMain} mb-6 tracking-tight`}>正在深度研读</h2>
                    <div className={`px-8 py-2 rounded-full border ${theme.border} ${theme.bgCard}`}>
                        <p className={`${theme.textMain} font-bold animate-pulse tracking-wide text-sm`}>{loadingStep}</p>
                    </div>
                 </div>
            </div>
        );
    }
  };

  // 3. Main Dashboard State
  const renderFeature = () => {
        // Pass theme to features
        const props = { 
            apiKey, 
            text: rawText, 
            theme // Pass the theme config
        };

        switch (currentFeature) {
            case FeatureType.SUMMARY: return <SummaryView {...props} dataZh={data.summaryZh} dataEn={data.summaryEn} onUpdate={(d, lang) => setData(prev => ({...prev, [lang === 'zh' ? 'summaryZh' : 'summaryEn']: d}))} />;
            case FeatureType.BILINGUAL: return <BilingualView {...props} data={data.bilingual} onUpdate={(d) => setData(prev => ({...prev, bilingual: d}))} />;
            case FeatureType.GOLDEN_SENTENCES: return <GoldenSentencesView {...props} data={data.goldenSentences} onUpdate={(d) => setData(prev => ({...prev, goldenSentences: d}))} />;
            case FeatureType.EXERCISES: return <QuizView {...props} type="EXERCISE" data={data.exercises} onUpdate={(d) => setData(prev => ({...prev, exercises: d}))} />;
            case FeatureType.QA: return <QuizView {...props} type="QA" data={data.qa} onUpdate={(d) => setData(prev => ({...prev, qa: d}))} />;
            case FeatureType.VOCABULARY: return <VocabView {...props} data={data.vocabulary} onUpdate={(d) => setData(prev => ({...prev, vocabulary: d}))} />;
            case FeatureType.ACTION_PLAN: return <ActionPlanView {...props} data={data.actionPlan} onUpdate={(d) => setData(prev => ({...prev, actionPlan: d}))} />;
            case FeatureType.BEGINNER_GUIDE: return <BeginnerGuideView {...props} data={data.beginnerGuide} onUpdate={(d) => setData(prev => ({...prev, beginnerGuide: d}))} />;
            case FeatureType.BOOK_REVIEW: return <ReviewView {...props} data={data.review} onUpdate={(d) => setData(prev => ({...prev, review: d}))} />;
            case FeatureType.PODCAST: return <PodcastView {...props} data={data.podcastScript} onUpdate={(d) => setData(prev => ({...prev, podcastScript: d}))} />;
            default: return null;
        }
    };

    return (
        <div className={`flex h-screen w-full ${theme.bgBody} ${theme.fontMain} ${theme.textMain} overflow-hidden relative p-4 gap-6 transition-colors duration-500`}>
          {/* Background Texture Overlay */}
          <div className="fixed inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: theme.textureOverlay }}></div>

          {/* Theme Switcher - Absolute Top Left */}
          <div className="absolute top-6 left-6 z-50">
             <div className="relative">
                <button 
                   onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                   className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-12 group ${theme.bgCard} border ${theme.border}`}
                   title="切换风格"
                >
                   <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <Paintbrush size={18} className={`${theme.textSecondary} relative z-10 group-hover:text-white transition-colors`} />
                </button>

                {isThemeMenuOpen && (
                    <div className={`absolute top-full left-0 mt-2 w-48 ${theme.bgCard} ${theme.border} border shadow-xl ${theme.radius} overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 max-h-[60vh] overflow-y-auto custom-scrollbar z-50`}>
                        {Object.values(THEMES).map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setCurrentThemeId(t.id); setIsThemeMenuOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-xs font-bold flex items-center gap-2 hover:bg-black/5 ${currentThemeId === t.id ? theme.textSecondary : theme.textMain}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${t.id === currentThemeId ? 'bg-current' : 'border border-current'}`}></div>
                                {t.name}
                            </button>
                        ))}
                    </div>
                )}
             </div>
          </div>

          {analysisStarted ? (
              <>
                 <Sidebar 
                    currentFeature={currentFeature} 
                    onSelect={setCurrentFeature} 
                    hasFile={!!rawText}
                    theme={theme}
                 />
                 <div className={`flex-1 h-full min-w-0 animate-in slide-in-from-right-4 duration-700 ${theme.shadow} ${theme.radius} ${theme.bgPanel} border ${theme.border} overflow-hidden relative flex flex-col`}>
                     {/* Dashboard Header - Minimal */}
                     <div className={`h-16 px-10 flex items-center justify-between shrink-0 border-b ${theme.border} z-20 ${theme.bgCard}`}>
                        {/* Left Spacer */}
                        <div className="flex-1"></div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                           <button 
                              onClick={handleExport}
                              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border ${theme.border} hover:bg-black/5 transition-all ${theme.textMain}`}
                              title="Export Report"
                           >
                              <Download size={14} />
                              导出报告
                           </button>
                           
                           {/* Read New Book Button */}
                           <button 
                              onClick={handleReset}
                              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border ${theme.border} ${theme.buttonStyle} shadow-sm hover:scale-105 transition-all`}
                              title="Read New Book"
                           >
                              <PlusCircle size={14} />
                              读新书
                           </button>
                        </div>
                     </div>
                     {/* Feature Content */}
                     <div className="flex-1 overflow-hidden relative">
                        {renderFeature()}
                     </div>
                 </div>
              </>
          ) : (
              <div className="w-full h-full flex items-center justify-center relative z-10">
                 {renderContent()}
              </div>
          )}
        </div>
    );
};