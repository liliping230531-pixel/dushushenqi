
export enum FeatureType {
  SUMMARY = 'SUMMARY',
  BILINGUAL = 'BILINGUAL',
  GOLDEN_SENTENCES = 'GOLDEN_SENTENCES',
  EXERCISES = 'EXERCISES',
  QA = 'QA',
  VOCABULARY = 'VOCABULARY',
  ACTION_PLAN = 'ACTION_PLAN',
  BOOK_REVIEW = 'BOOK_REVIEW',
  BEGINNER_GUIDE = 'BEGINNER_GUIDE',
  PODCAST = 'PODCAST',
}

export interface GoldenSentence {
  sentence: string;
  translation: string;
  id: string;
}

export interface SummarySection {
  title: string;
  content: string;
}

export interface Exercise {
  question: string;
  options: string[];
  answer: string; // The correct answer content or letter
  correctLetter: string; // Explicitly store 'A', 'B', 'C', 'D' for easier matching
  explanation: string;
}

export interface QAItem {
  question: string;
  answer: string;
}

export interface VocabItem {
  word: string;
  ipa: string;
  pos: string; // Part of speech
  meaning: string;
}

export interface BilingualSegment {
  original: string;
  translation: string;
}

export interface PodcastScriptLine {
  speaker: 'Host' | 'Guest';
  text: string;
}

export type ReviewStyle = 
  | 'Standard' 
  | 'Nietzsche' 
  | 'Liu Zongyuan' 
  | 'Hemingway' 
  | 'Sarcastic' 
  | 'Academic' 
  | 'Motivational' 
  | 'Socratic' 
  | 'Poetic' 
  | 'Journalistic';

export interface AppState {
  rawText: string;
  fileName: string;
  apiKey: string | undefined;
}

export interface AnalysisData {
  summaryZh: SummarySection[];
  summaryEn: SummarySection[];
  bilingual: BilingualSegment[];
  goldenSentences: GoldenSentence[];
  exercises: Exercise[];
  qa: QAItem[];
  vocabulary: VocabItem[];
  actionPlan: string | null;
  review: string | null;
  beginnerGuide: string | null;
  podcastScript: PodcastScriptLine[];
}

export type ThemeId = 'song' | 'modern' | 'cyber' | 'journal' | 'magazine' | 'candy' | 'forest' | 'sunset' | 'ocean';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  // Colors (Tailwind classes or hex)
  bgBody: string;
  bgPanel: string;
  bgSidebar: string;
  bgCard: string;
  textMain: string;
  textSecondary: string;
  accent: string;
  border: string;
  // Styles
  fontMain: string; // font-serif, font-sans, font-mono
  radius: string; // rounded-xl, rounded-none
  shadow: string;
  // Specifics
  textureOverlay?: string; // CSS url
  buttonStyle: string;
}