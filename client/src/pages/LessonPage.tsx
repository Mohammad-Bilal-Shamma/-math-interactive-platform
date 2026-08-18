import { ArrowLeft, BookOpenCheck, CheckCircle2, ChevronLeft, CircleHelp, ListChecks } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LearningShell } from "@/components/LearningShell";
import { LessonRecap } from "@/components/LessonRecap";
import { MathFormula } from "@/components/MathFormula";
import { QuestionPanel } from "@/components/QuestionPanel";
import { UnitCompletionCelebration } from "@/components/UnitCompletionCelebration";
import { shouldCelebrateUnitCompletion } from "@shared/completionCelebration";
import { learningUnits } from "@shared/learningContent";
import { trpc } from "@/lib/trpc";

export default function LessonPage() {
  const params = useParams<{ unitSlug: string; lessonId: string }>();
  const unit = learningUnits.find(item => item.slug === params.unitSlug);
  const lesson = unit?.lessons.find(item => item.id === params.lessonId);
  const { isAuthenticated } = useAuth();
  const { data: progress } = trpc.learning.progress.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const markCompleted = trpc.learning.recordLessonProgress.useMutation();
  const { mutate: recordReview } = trpc.learning.recordLessonProgress.useMutation();
  const [showCelebration, setShowCelebration] = useState(() =>
    import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("celebrate"),
  );

  if (!unit || !lesson) return <LearningShell><div className="empty-state page-width"><h1>لم نعثر على هذا الدرس.</h1><Link href="/">العودة للرئيسية</Link></div></LearningShell>;
  const questions = unit.questions.filter(question => question.lessonId === lesson.id);
  const isCompleted = progress?.lessons.some(item => item.lessonId === lesson.id && item.isCompleted === 1) ?? false;
  const currentIndex = unit.lessons.findIndex(item => item.id === lesson.id);
  const nextLesson = unit.lessons[currentIndex + 1];
  const shouldCelebrate = useMemo(
    () => shouldCelebrateUnitCompletion({
      lessonIds: unit.lessons.map(item => item.id),
      completedLessonIds: progress?.lessons.filter(item => item.unitId === unit.id && item.isCompleted === 1).map(item => item.lessonId) ?? [],
      currentLessonId: lesson.id,
      persistenceSucceeded: true,
    }),
    [lesson.id, progress?.lessons, unit.id, unit.lessons],
  );

  useEffect(() => {
    if (isAuthenticated) {
      recordReview({ unitId: unit.id, lessonId: lesson.id, isCompleted: false });
    }
  }, [isAuthenticated, lesson.id, recordReview, unit.id]);

  const completeLesson = () => {
    if (isAuthenticated) markCompleted.mutate(
      { unitId: unit.id, lessonId: lesson.id, isCompleted: true },
      { onSuccess: () => { utils.learning.progress.invalidate(); if (shouldCelebrate) setShowCelebration(true); } },
    );
  };

  return (
    <LearningShell>
      {showCelebration && <UnitCompletionCelebration unitTitle={unit.title} unitHref={`/units/${unit.slug}`} onDismiss={() => setShowCelebration(false)} />}
      <section className="lesson-banner page-width">
        <Link href={`/units/${unit.slug}`} className="back-link"><ChevronLeft size={17} /> {unit.title}</Link>
        <div className="lesson-banner__meta"><span>{lesson.kicker}</span><span>الوحدة ٠{unit.order}</span></div>
        <h1>{lesson.title}</h1>
        <p>{lesson.overview}</p>
      </section>
      <div className="lesson-layout page-width">
        <aside className="lesson-sidecard"><span>في هذا الدرس</span><ol><li><a href="#recap">الملخص</a></li><li><a href="#concept">المفهوم</a></li><li><a href="#formulas">القوانين</a></li><li><a href="#example">مثال محلول</a></li><li><a href="#practice">تطبيق تفاعلي</a></li></ol><div className="lesson-sidecard__progress"><small>حالة الدرس</small><strong>{isCompleted ? "مكتمل" : "قيد الدراسة"}</strong></div></aside>
        <article className="lesson-article">
          <LessonRecap recap={lesson.recap} />
          <section id="concept" className="lesson-section"><div className="section-title"><BookOpenCheck size={19} /><span>الفكرة الأساسية</span></div>{lesson.explanation.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
          <section className="goals-panel"><ListChecks size={20} /><div><strong>ستتمكن بعد هذا الدرس من:</strong><ul>{lesson.learningGoals.map(goal => <li key={goal}>{goal}</li>)}</ul></div></section>
          <section id="formulas" className="lesson-section"><div className="section-title"><CircleHelp size={19} /><span>قوانين تحتاجها</span></div><div className="formula-stack">{lesson.formulas.map(formula => <div className="formula-card" key={formula.label}><span>{formula.label}</span><MathFormula latex={formula.latex} /></div>)}</div></section>
          <section id="example" className="example-panel"><div className="example-panel__head"><span className="eyebrow">مثال محلول من الملف</span><h2>{lesson.example.title}</h2><p>{lesson.example.prompt}</p></div><div className="example-steps">{lesson.example.steps.map(step => <div className="example-step" key={step.label}><span>{step.label}</span><div><p>{step.text}</p>{step.latex && <MathFormula latex={step.latex} />}</div></div>)}</div><div className="example-result"><CheckCircle2 size={19} /><div><strong>{lesson.example.result}</strong>{lesson.example.resultLatex && <MathFormula latex={lesson.example.resultLatex} display={false} />}</div></div></section>
          <section id="practice">{questions.map(question => <QuestionPanel key={question.id} unitId={unit.id} question={question} />)}</section>
          <section className="lesson-complete"><div><span className="eyebrow">ثبت ما تعلمته</span><h2>{isCompleted ? "أكملت هذا الدرس بالفعل" : "أنهيت الدرس؟"}</h2><p>{isAuthenticated ? "سيُحفظ الإكمال في حسابك ويظهر في صفحة النتائج." : "يمكنك متابعة المحتوى الآن، ثم سجّل الدخول لاحقًا لحفظ تقدمك."}</p></div><button className="primary-button" type="button" onClick={completeLesson} disabled={isCompleted || markCompleted.isPending}>{isCompleted ? <><CheckCircle2 size={17} /> تم الإكمال</> : "علّم الدرس كمكتمل"}</button></section>
          {nextLesson && <Link href={`/units/${unit.slug}/lessons/${nextLesson.id}`} className="next-lesson">الدرس التالي: <strong>{nextLesson.title}</strong><ArrowLeft size={17} /></Link>}
        </article>
      </div>
    </LearningShell>
  );
}
