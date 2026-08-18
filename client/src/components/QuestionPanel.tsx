import { Check, ChevronLeft, CircleAlert, Lightbulb, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { gradeQuestion } from "@shared/grading";
import type { GradeResult, LearningQuestion } from "@shared/learningTypes";
import { trpc } from "@/lib/trpc";

type QuestionPanelProps = {
  unitId: string;
  question: LearningQuestion;
};

export function QuestionPanel({ unitId, question }: QuestionPanelProps) {
  const { isAuthenticated } = useAuth();
  const [answer, setAnswer] = useState<unknown>(question.type === "choice" ? "" : question.type === "numeric" ? "" : {});
  const [result, setResult] = useState<GradeResult | null>(null);
  const utils = trpc.useUtils();
  const recordAttempt = trpc.learning.recordQuestionAttempt.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.learning.progress.invalidate(), utils.learning.statistics.invalidate()]);
    },
  });

  const updateRecordAnswer = (id: string, value: string) => {
    setAnswer((current: unknown) => ({ ...(typeof current === "object" && current !== null ? current : {}), [id]: value }));
    setResult(null);
  };

  const handleGrade = () => {
    const grade = gradeQuestion(question, answer);
    setResult(grade);
    if (isAuthenticated) {
      recordAttempt.mutate({
        unitId,
        lessonId: question.lessonId,
        questionId: question.id,
        isCorrect: grade.isCorrect,
        scorePercent: Math.round(grade.score * 100),
        answerJson: JSON.stringify(answer),
      });
    }
  };

  const reset = () => {
    setAnswer(question.type === "choice" ? "" : question.type === "numeric" ? "" : {});
    setResult(null);
  };

  return (
    <section className="question-panel" aria-labelledby={`question-${question.id}`}>
      <div className="question-panel__head">
        <span className="eyebrow">تطبيق تفاعلي</span>
        <span className="question-kind">{question.type === "numeric" ? "إجابة عددية" : question.type === "choice" ? "اختيار من متعدد" : question.type === "table" ? "إكمال جدول" : "حل متعدد الخطوات"}</span>
      </div>
      <h2 id={`question-${question.id}`}>{question.title}</h2>
      <p className="question-prompt">{question.prompt}</p>

      {question.type === "numeric" && (
        <label className="answer-field">
          <span>إجابتك</span>
          <input value={typeof answer === "string" ? answer : ""} onChange={event => { setAnswer(event.target.value); setResult(null); }} inputMode="decimal" placeholder="أدخل قيمة عددية" aria-label="الإجابة العددية" />
        </label>
      )}

      {question.type === "choice" && (
        <div className="choice-list" role="radiogroup" aria-label={question.prompt}>
          {question.options.map(option => {
            const checked = answer === option.id;
            return (
              <button key={option.id} type="button" role="radio" aria-checked={checked} className={`choice-option ${checked ? "choice-option--selected" : ""}`} onClick={() => { setAnswer(option.id); setResult(null); }}>
                <span className="choice-radio" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "table" && (
        <div className="answer-grid" role="group" aria-label="خانات الحل">
          {question.fields.map(field => (
            <label className="answer-field" key={field.id}>
              <span>{field.label}</span>
              <input value={typeof answer === "object" && answer !== null ? String((answer as Record<string, unknown>)[field.id] ?? "") : ""} onChange={event => updateRecordAnswer(field.id, event.target.value)} inputMode="decimal" placeholder="أدخل القيمة" />
            </label>
          ))}
        </div>
      )}

      {question.type === "multiStep" && (
        <div className="step-inputs" role="group" aria-label="خطوات الحل">
          {question.steps.map((step, index) => (
            <label className="step-input" key={step.id}>
              <span className="step-number">{index + 1}</span>
              <span className="step-input__copy"><strong>{step.label}</strong><small>{step.prompt}</small></span>
              <input value={typeof answer === "object" && answer !== null ? String((answer as Record<string, unknown>)[step.id] ?? "") : ""} onChange={event => updateRecordAnswer(step.id, event.target.value)} inputMode="decimal" placeholder="القيمة" />
            </label>
          ))}
        </div>
      )}

      <div className="question-actions">
        <button className="primary-button" type="button" onClick={handleGrade} disabled={recordAttempt.isPending}>
          تحقّق من الحل <ChevronLeft size={17} />
        </button>
        <button className="subtle-button" type="button" onClick={reset}><RotateCcw size={16} /> إعادة المحاولة</button>
      </div>

      {result && (
        <div className={`feedback ${result.isCorrect ? "feedback--correct" : "feedback--wrong"}`} role="status" aria-live="polite">
          <div className="feedback__title">{result.isCorrect ? <Check size={20} /> : <CircleAlert size={20} />}<strong>{result.isCorrect ? "إجابة صحيحة" : "لنراجع الفكرة"}</strong></div>
          <p>{result.message}</p>
          {!result.isCorrect && result.correctStep && <div className="feedback__step"><Lightbulb size={17} /><span><strong>الخطوة الصحيحة:</strong> {result.correctStep}</span></div>}
          {!result.isCorrect && result.stepFeedback && (
            <div className="step-feedback-list">
              {result.stepFeedback.filter(step => !step.isCorrect).map(step => <div key={step.id}><strong>{step.message}</strong><span>{step.correctStep}</span></div>)}
            </div>
          )}
          {!isAuthenticated && <p className="feedback__notice">سيظهر تقدمك بشكل دائم بعد تسجيل الدخول إلى المنصة.</p>}
        </div>
      )}
    </section>
  );
}
