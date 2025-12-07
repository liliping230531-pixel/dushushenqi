import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { 
  BilingualSegment, 
  Exercise, 
  GoldenSentence, 
  QAItem, 
  VocabItem, 
  PodcastScriptLine, 
  ReviewStyle,
  SummarySection
} from "../types";

const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

// Robust JSON parsing helper
const cleanAndParseJson = <T>(text: string, fallback: T): T => {
  if (!text) return fallback;
  let cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    let fixed = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
       fixed = fixed.replace(/}\s*{/g, '}, {');
       try { return JSON.parse(fixed); } 
       catch (e3) { 
         console.error("JSON Parse Failed", e3); 
         return fallback; 
       }
    }
  }
};

export const generateSummary = async (apiKey: string, text: string, lang: 'zh' | 'en' = 'zh'): Promise<SummarySection[]> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'zh' 
    ? "对以下文本进行深度拆解摘要。请按逻辑或章节将其分为 3-5 个关键部分。不要返回纯文本，必须返回JSON数组：[{ \"title\": \"部分标题\", \"content\": \"详细的摘要内容\" }]"
    : "Deeply summarize the following text. Break it down into 3-5 logical sections. Do not return plain text, strictly return a JSON array: [{ \"title\": \"Section Title\", \"content\": \"Detailed summary content\" }]";
    
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Text: ${text.slice(0, 30000)}`,
    config: { responseMimeType: 'application/json' }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateBilingual = async (apiKey: string, text: string): Promise<BilingualSegment[]> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Translate the text paragraph by paragraph into Chinese. 
    Strictly Output a JSON array of objects: [{ "original": "Original text paragraph", "translation": "Chinese translation" }]. 
    Ensure the translation is accurate and elegant. 
    Do not summarize, translate fully. 
    Text: ${text.slice(0, 4000)}`,
    config: { 
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            translation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateGoldenSentences = async (apiKey: string, text: string): Promise<GoldenSentence[]> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract 5 profound, artistic, or philosophically significant "Golden Sentences" from the text. 
    Avoid simple or functional sentences.
    Important: If the text is in Chinese, convert Traditional Chinese to Simplified Chinese for both the extraction and translation fields.
    Return JSON array: [{ "sentence": "...", "translation": "Meaning or translation (Simplified Chinese)...", "id": "1" }]. Text: ${text.slice(0, 15000)}`,
    config: { responseMimeType: 'application/json' }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateExercises = async (apiKey: string, text: string, lang: 'en' | 'zh'): Promise<Exercise[]> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'en' 
    ? "Generate 5 multiple choice questions based on the text. JSON Array."
    : "根据文本生成5道选择题。返回 JSON 数组。";
    
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Return format: [{ "question": "...", "options": ["A. x", "B. y", "C. z", "D. w"], "correctLetter": "A", "answer": "Content of correct answer", "explanation": "Detailed explanation" }]. Text: ${text.slice(0, 10000)}`,
    config: { responseMimeType: 'application/json' }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateQA = async (apiKey: string, text: string, lang: 'en' | 'zh'): Promise<QAItem[]> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'en'
    ? "Generate 5 Q&A pairs. Questions < 30 chars. Answers < 200 chars. Focus on 'Why' and 'How'."
    : "根据文本生成5个深度问答。要求：1. 问题必须精简，严格控制在30字以内。2. 答案言简意赅，严格控制在200字以内。";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Return JSON: [{ "question": "...", "answer": "Detailed answer..." }]. Text: ${text.slice(0, 10000)}`,
    config: { responseMimeType: 'application/json' }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateVocabulary = async (apiKey: string, text: string): Promise<VocabItem[]> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract 10 advanced, rare, or domain-specific words from the text. 
    EXCLUDE common words (CEFR A1-B2 level). Focus on C1/C2 words or specialized terminology.
    Return JSON: [{ "word": "...", "ipa": "...", "pos": "...", "meaning": "Chinese meaning" }]. Text: ${text.slice(0, 5000)}`,
    config: { responseMimeType: 'application/json' }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateActionPlan = async (apiKey: string, text: string, lang: 'en' | 'zh' = 'zh'): Promise<string> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'en'
    ? "Create a practical 7-day action plan based on the principles in this text. Go STRAIGHT to Day 1. No intro, no summary, no fluff."
    : "根据文中的原则制定一个切实可行的7天行动计划。直接列出计划（Day 1...），不要写任何前言、总结或多余的废话。";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Use Markdown format. Text: ${text.slice(0, 10000)}`,
  });
  return response.text || "";
};

export const generateBeginnerGuide = async (apiKey: string, text: string, lang: 'en' | 'zh' = 'zh'): Promise<string> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'en'
    ? "Explain the core concepts and logic of this text in the simplest terms possible, like telling a story to a beginner or a 5-year-old. Use simple analogies and avoid jargon."
    : "请用最通俗易懂的语言，像给新手或5岁孩子讲故事一样，拆解这篇文章的核心概念和逻辑。使用简单的比喻，避免专业术语。";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Use Markdown format. Text: ${text.slice(0, 10000)}`,
  });
  return response.text || "";
};

export const generateReview = async (apiKey: string, text: string, style: ReviewStyle, lang: 'en' | 'zh'): Promise<string> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'en' 
    ? `Write a beautiful book review (Strictly UNDER 800 words) in the style of ${style}.`
    : `写一篇排版优美的深度书评（严格控制在800字以内），风格模仿：${style}。`;
    
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Use Markdown format. Text context: ${text.slice(0, 10000)}`,
  });
  return response.text || "";
};

export const generatePodcastScript = async (apiKey: string, text: string, lang: 'en' | 'zh'): Promise<PodcastScriptLine[]> => {
  const ai = getAI(apiKey);
  const prompt = lang === 'en'
    ? "Generate a humorous, ambitious podcast dialogue between a Host and a Guest summarizing this text."
    : "生成一段幽默、有抱负的播客对话（主持人与嘉宾），总结这段文本。";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} Return JSON: [{ "speaker": "Host" | "Guest", "text": "..." }]. Text: ${text.slice(0, 10000)}`,
    config: { responseMimeType: 'application/json' }
  });
  return cleanAndParseJson(response.text || "[]", []);
};

export const generateTTS = async (apiKey: string, text: string, voiceName: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon' = 'Kore'): Promise<string | undefined> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};