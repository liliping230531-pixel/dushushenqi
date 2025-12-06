export enum FeatureType {
  SUMMARY = 'SUMMARY',
  BILINGUAL = 'BILINGUAL',
  GOLDEN_SENTENCES = 'GOLDEN_SENTENCES',
  EXERCISES = 'EXERCISES',
  QA = 'QA',
  VOCABULARY = 'VOCABULARY',
  ACTION_PLAN = 'ACTION_PLAN',
  BOOK_REVIEW = 'BOOK_REVIEW',
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
  podcastScript: PodcastScriptLine[];
}