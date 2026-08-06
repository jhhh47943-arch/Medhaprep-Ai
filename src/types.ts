export type ExamBoard = 
  | "WBCHSE (Class 11-12)" 
  | "WBBSE (Class 9-10)" 
  | "JEE Mains" 
  | "NEET UG" 
  | "WBJEE" 
  | "CBSE / ICSE" 
  | "Custom / Other";

export type QuestionType = "MCQ" | "Short Answer" | "True/False" | "Numerical" | "Matching" | "Assertion-Reason";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type LanguageMode = "English" | "Bengali" | "Bilingual";

export interface Question {
  id: string;
  type: QuestionType | string;
  question: string;
  difficulty?: DifficultyLevel | string;
  options: string[];
  correctAnswer: string; // "0", "1", "2", "3" or text for short answer
  solution: string;
  pyqTag?: string | null;
}

export interface QuizTest {
  id: string;
  title: string;
  description?: string;
  board: string;
  subject: string;
  topic: string;
  targetClass?: string;
  difficulty: string;
  timerMinutes: number; // 0 for unlimited
  createdAt: string;
  questions: Question[];
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  board: string;
  subject: string;
  topic: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>; // questionId -> chosenOption or typed answer
  completedAt: string;
}

export interface StudyNoteSection {
  heading: string;
  content: string;
  keyTakeaways?: string[];
}

export interface FormulaOrDef {
  termOrFormula: string;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface PracticeQnA {
  question: string;
  answer: string;
}

export interface ShortTrickItem {
  trickTitle: string;
  conceptOrFormula: string;
  shortcutMethod: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject?: string;
  language: string;
  overview: string;
  sections: StudyNoteSection[];
  keyFormulaeAndDefs?: FormulaOrDef[];
  shortTricks?: ShortTrickItem[];
  shortRevisionPoints?: string[];
  flashcards?: Flashcard[];
  practiceQuestions?: PracticeQnA[];
  createdAt: string;
}

export interface VivaQuestionData {
  vivaQuestion: string;
  vivaQuestionBengali?: string;
  keyPointsExpected: string[];
  hint?: string;
}

export interface VivaEvaluation {
  scoreOutOf100: number;
  conceptualAccuracyRating: string;
  clarityAndFluencyScore: number;
  detailedFeedback: string;
  missingConcepts: string[];
  suggestedModelAnswerEnglish: string;
  suggestedModelAnswerBengali: string;
}

export type GeminiModelType = 
  | "gemini-3.5-flash"
  | "gemini-3.6-flash" 
  | "gemini-3.1-pro-preview" 
  | "gemini-flash-latest" 
  | "gemini-3.1-flash-lite";

export interface AppSettings {
  customApiKey: string;
  quizApiKey?: string;
  preferredLanguage: LanguageMode;
  autoReadVoiceQuestions: boolean;
  voiceCompanionModel?: GeminiModelType;
  testGeneratorModel?: GeminiModelType;
  notesGeneratorModel?: GeminiModelType;
}
