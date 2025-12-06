import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { 
  SummaryView, 
  BilingualView, 
  GoldenSentencesView,
  QuizView,
  VocabView,
  ActionPlanView,
  ReviewView,
  PodcastView
} from './components/FeatureViews';
import { FeatureType, AnalysisData } from './types';
import { 
  generateSummary, 
  generateBilingual, 
  generateGoldenSentences, 
  generateVocabulary, 
  generateActionPlan, 
  generateReview,
  generateExercises,
  generateQA,
  generatePodcastScript
} from './services/geminiService';
import { FileText, UploadCloud, Sparkles, Zap, Check, ArrowRight, X } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [currentFeature, setCurrentFeature] = useState<FeatureType>(FeatureType.SUMMARY);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

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
    setLoadingStep('初始化书香引擎...');
    
    try {
        setLoadingStep('正在凝练章节精华...');
        const [summaryZh, summaryEn, goldenSentences, vocabulary] = await Promise.all([
            generateSummary(apiKey, rawText, 'zh'),
            generateSummary(apiKey, rawText, 'en'),
            generateGoldenSentences(apiKey, rawText),
            generateVocabulary(apiKey, rawText)
        ]);
        
        setLoadingStep('正在构建行动指南...');
        const [actionPlan, review] = await Promise.all([
            generateActionPlan(apiKey, rawText),
            generateReview(apiKey, rawText, 'Standard', 'zh')
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

  const renderContent = () => {
    // 1. Initial / Upload State
    if (!analysisStarted && !isAnalyzing) {
       return (
        <div className="h-full flex flex-col items-center justify-center p-8 relative z-10 w-full max-w-5xl mx-auto">
            
            {/* Classical Hero Section */}
            <div className="text-center mb-10 relative animate-in fade-in duration-1000 slide-in-from-bottom-4">
                 <div className="w-24 h-24 bg-[#984B43] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg text-[#F7F5F0] border-4 border-[#F7F5F0] ring-1 ring-[#984B43]">
                    <span className="font-calligraphy text-4xl">书</span>
                 </div>
                 <h1 className="text-6xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-4">
                    读书<span className="text-[#984B43]">神器</span>
                 </h1>
                 <div className="flex items-center justify-center gap-4 text-[#5D7265] font-serif font-medium tracking-[0.3em] uppercase text-sm">
                    <span className="w-12 h-[1px] bg-[#5D7265]/50"></span>
                    沉浸式深度阅读
                    <span className="w-12 h-[1px] bg-[#5D7265]/50"></span>
                 </div>
            </div>

            {/* Upload Card - Classical Style */}
            <div 
                className={`w-full bg-[#F7F5F0] rounded-[1rem] border-2 border-[#D1C0A5] shadow-[0_8px_30px_rgba(70,63,58,0.08)] transition-all duration-500 relative group overflow-hidden flex flex-col ${isDragging ? 'ring-4 ring-[#984B43]/20 scale-[1.01]' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {/* Inner Border Frame */}
                <div className="absolute inset-2 border border-[#D1C0A5]/50 rounded-[0.5rem] pointer-events-none z-0"></div>
                
                <div className="relative z-10 flex flex-col h-full p-8 md:p-12">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4">
                             <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-500 border border-[#D1C0A5] ${rawText ? 'bg-[#984B43] text-[#F7F5F0]' : 'bg-[#EBE5CE] text-[#463F3A]'}`}>
                                {rawText ? <Check size={28}/> : <UploadCloud size={28} strokeWidth={1.5} />}
                             </div>
                             <div>
                                 <h3 className="text-2xl font-serif font-bold text-[#2C2C2C]">
                                    {rawText ? (fileName || "文稿已就绪") : "导入书籍"}
                                 </h3>
                                 <p className="text-[#7A7067] text-sm font-serif">
                                    {rawText ? `${(rawText.length / 1000).toFixed(1)}k 字` : "支持 .txt 格式 · 拖拽或上传"}
                                 </p>
                             </div>
                         </div>

                         {!rawText && (
                             <label className="px-6 py-3 bg-[#463F3A] text-[#F7F5F0] rounded-lg font-serif font-bold hover:bg-[#2C2C2C] transition-all cursor-pointer shadow-md flex items-center gap-2 text-sm border border-[#2C2C2C]">
                                <FileText size={16}/>
                                <span>选择文件</span>
                                <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                             </label>
                         )}
                    </div>

                    {/* Textarea Area - Classical Paper Style */}
                    <div className="flex-1 bg-[#FDFCF8] rounded-lg border border-[#D1C0A5] overflow-hidden relative min-h-[300px] shadow-inner">
                        <textarea 
                            className="w-full h-full p-8 text-lg text-[#2C2C2C] bg-transparent border-none focus:ring-0 resize-none font-serif leading-loose outline-none placeholder:text-[#B0A496] placeholder:italic"
                            placeholder="请在此粘贴文章内容..."
                            value={rawText}
                            onChange={(e) => { setRawText(e.target.value); if(e.target.value) setFileName("文稿内容"); }}
                        ></textarea>
                        
                        {rawText && (
                            <button 
                                onClick={() => { setRawText(''); setFileName(''); }}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F2EBE0] text-[#B0A496] hover:text-[#984B43] transition-colors"
                            >
                                <X size={20}/>
                            </button>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className={`mt-8 flex justify-end transition-all duration-500 ${rawText ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                         <button 
                            onClick={startAnalysis}
                            disabled={!rawText}
                            className="group relative inline-flex items-center gap-4 px-12 py-4 bg-[#984B43] text-[#F7F5F0] rounded-lg font-serif font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#7D3C35] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                         >
                            <span className="relative z-10 flex items-center gap-3">
                                <Zap size={20} className="fill-[#F7F5F0]"/>
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
            <div className="h-full flex flex-col items-center justify-center p-12 animate-in fade-in duration-1000 relative w-full">
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-16">
                         <div className="w-32 h-32 rounded-full border border-[#D1C0A5]"></div>
                         <div className="absolute inset-0 w-32 h-32 rounded-full border-[4px] border-[#984B43] border-t-transparent animate-spin-slow"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-calligraphy text-4xl text-[#2C2C2C]">读</span>
                         </div>
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-[#2C2C2C] mb-6 tracking-tight">正在深度研读</h2>
                    <div className="bg-[#EBE5CE] px-8 py-2 rounded-full border border-[#D1C0A5]">
                        <p className="text-[#463F3A] font-bold animate-pulse tracking-wide text-sm font-serif">{loadingStep}</p>
                    </div>
                 </div>
            </div>
        );
    }

    // 3. Main Dashboard State
    const renderFeature = () => {
        switch (currentFeature) {
            case FeatureType.SUMMARY: return <SummaryView apiKey={apiKey} text={rawText} dataZh={data.summaryZh} dataEn={data.summaryEn} onUpdate={(d, lang) => setData(prev => ({...prev, [lang === 'zh' ? 'summaryZh' : 'summaryEn']: d}))} />;
            case FeatureType.BILINGUAL: return <BilingualView apiKey={apiKey} text={rawText} data={data.bilingual} onUpdate={(d) => setData(prev => ({...prev, bilingual: d}))} />;
            case FeatureType.GOLDEN_SENTENCES: return <GoldenSentencesView apiKey={apiKey} text={rawText} data={data.goldenSentences} onUpdate={(d) => setData(prev => ({...prev, goldenSentences: d}))} />;
            case FeatureType.EXERCISES: return <QuizView apiKey={apiKey} text={rawText} type="EXERCISE" data={data.exercises} onUpdate={(d) => setData(prev => ({...prev, exercises: d}))} />;
            case FeatureType.QA: return <QuizView apiKey={apiKey} text={rawText} type="QA" data={data.qa} onUpdate={(d) => setData(prev => ({...prev, qa: d}))} />;
            case FeatureType.VOCABULARY: return <VocabView apiKey={apiKey} text={rawText} data={data.vocabulary} onUpdate={(d) => setData(prev => ({...prev, vocabulary: d}))} />;
            case FeatureType.ACTION_PLAN: return <ActionPlanView apiKey={apiKey} text={rawText} data={data.actionPlan} onUpdate={(d) => setData(prev => ({...prev, actionPlan: d}))} />;
            case FeatureType.BOOK_REVIEW: return <ReviewView apiKey={apiKey} text={rawText} data={data.review} onUpdate={(d) => setData(prev => ({...prev, review: d}))} />;
            case FeatureType.PODCAST: return <PodcastView apiKey={apiKey} text={rawText} data={data.podcastScript} onUpdate={(d) => setData(prev => ({...prev, podcastScript: d}))} />;
            default: return null;
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#FDFCF8] rounded-[1.5rem] border-2 border-[#D1C0A5] shadow-[0_8px_30px_rgba(44,44,44,0.05)] overflow-hidden relative">
             {/* Dashboard Header - Minimal */}
             <div className="h-16 px-10 flex items-center justify-end shrink-0 border-b border-[#EBE5CE] z-20 bg-[#F7F5F0]">
                <div className="flex items-center gap-3">
                   <button 
                      onClick={() => { setRawText(''); setFileName(''); setAnalysisStarted(false); setData({summaryZh: [], summaryEn: [], bilingual: [], goldenSentences: [], exercises: [], qa: [], vocabulary: [], actionPlan: null, review: null, podcastScript: []}); }} 
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5CE] hover:text-[#984B43] transition-all text-[#B0A496]"
                      title="Close"
                   >
                      <X size={18} />
                   </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-hidden relative bg-rice-paper">
                 {renderFeature()}
             </div>
        </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#EBE5CE] font-serif text-[#2C2C2C] overflow-hidden relative p-4 gap-6">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-3.png')]"></div>

      {analysisStarted ? (
          <>
             <Sidebar 
                currentFeature={currentFeature} 
                onSelect={setCurrentFeature} 
                hasFile={!!rawText}
             />
             <div className="flex-1 h-full min-w-0 animate-in slide-in-from-right-4 duration-700 shadow-2xl rounded-[1.5rem]">
                {renderContent()}
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

export default App;