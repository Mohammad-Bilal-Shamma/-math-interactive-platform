export type Formula = {
  label: string;
  latex: string;
};

export type ExampleStep = {
  label: string;
  text: string;
  latex?: string;
};

export type SolvedExample = {
  title: string;
  prompt: string;
  result: string;
  resultLatex?: string;
  steps: ExampleStep[];
};

export type LessonRecap = {
  keyIdea: string;
  coreFormula: string;
  masteryTakeaway: string;
};

export type LessonContent = {
  id: string;
  title: string;
  kicker: string;
  overview: string;
  recap: LessonRecap;
  learningGoals: string[];
  explanation: string[];
  formulas: Formula[];
  example: SolvedExample;
};

type QuestionBase = {
  id: string;
  lessonId: string;
  title: string;
  prompt: string;
  explanation: string;
};

export type NumericQuestion = QuestionBase & {
  type: "numeric";
  expectedValue: number;
  tolerance: number;
  correctStep: string;
  wrongHint: string;
};

export type ChoiceQuestion = QuestionBase & {
  type: "choice";
  options: { id: string; label: string }[];
  correctOptionId: string;
  correctStep: string;
  wrongHint: string;
};

export type TableQuestion = QuestionBase & {
  type: "table";
  fields: {
    id: string;
    label: string;
    expectedValue: number;
    tolerance: number;
    suffix?: string;
    correctStep: string;
  }[];
};

export type MultiStepQuestion = QuestionBase & {
  type: "multiStep";
  steps: {
    id: string;
    label: string;
    prompt: string;
    expectedValue: number;
    tolerance: number;
    correctStep: string;
  }[];
};

export type LearningQuestion =
  | NumericQuestion
  | ChoiceQuestion
  | TableQuestion
  | MultiStepQuestion;

export type LearningUnit = {
  id: string;
  slug: string;
  order: number;
  icon: "spark" | "grid" | "orbit" | "integral" | "curve";
  title: string;
  subtitle: string;
  description: string;
  accent: "blue" | "pink" | "ink";
  lessons: LessonContent[];
  questions: LearningQuestion[];
};

export type GradeResult = {
  isCorrect: boolean;
  score: number;
  message: string;
  correctStep?: string;
  expectedAnswer?: string;
  stepFeedback?: {
    id: string;
    isCorrect: boolean;
    message: string;
    correctStep: string;
  }[];
};
