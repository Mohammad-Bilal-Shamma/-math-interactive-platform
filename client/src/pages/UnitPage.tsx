import { ArrowLeft, BookOpenText, Check, ChevronLeft, ClipboardCheck, Play } from "lucide-react";
import { Link, useParams } from "wouter";
import { LearningShell } from "@/components/LearningShell";
import { learningUnits } from "@shared/learningContent";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function UnitPage() {
  const params = useParams<{ unitSlug: string }>();
  const unit = learningUnits.find(item => item.slug === params.unitSlug);
  const { isAuthenticated } = useAuth();
  const { data: progress } = trpc.learning.progress.useQuery(undefined, { enabled: isAuthenticated });

  if (!unit) return <LearningShell><div className="empty-state page-width"><h1>لم نعثر على هذه الوحدة.</h1><Link href="/">العودة للرئيسية</Link></div></LearningShell>;
  const completedLessonIds = new Set(progress?.lessons.filter(item => item.isCompleted === 1).map(item => item.lessonId) ?? []);
  const completed = unit.lessons.filter(lesson => completedLessonIds.has(lesson.id)).length;
  const percent = Math.round((completed / unit.lessons.length) * 100);

  return (
    <LearningShell>
      <section className="unit-hero page-width">
        <Link href="/" className="back-link"><ChevronLeft size={17} /> الوحدات</Link>
        <span className="eyebrow">الوحدة ٠{unit.order}</span>
        <h1>{unit.title}</h1>
        <p>{unit.description}</p>
        <div className="unit-hero__progress"><span>تقدمك في هذه الوحدة</span><div className="progress-track"><span style={{ width: `${percent}%` }} /></div><strong>{percent}%</strong></div>
      </section>
      <section className="unit-content page-width">
        <div className="section-heading section-heading--inline"><div><span className="eyebrow">دروس الوحدة</span><h2>تعلم بالترتيب الذي يخدم الفكرة</h2></div><p>كل درس يجمع بين المفهوم، القانون، مثال من ملفاتك، وتمرين تفاعلي قصير.</p></div>
        <div className="lesson-list">
          {unit.lessons.map((lesson, index) => {
            const isComplete = completedLessonIds.has(lesson.id);
            const practiceCount = unit.questions.filter(question => question.lessonId === lesson.id).length;
            return <article key={lesson.id} className={`lesson-row ${isComplete ? "lesson-row--complete" : ""}`}>
              <div className="lesson-row__number">{isComplete ? <Check size={17} /> : `٠${index + 1}`}</div>
              <div className="lesson-row__copy"><span>{lesson.kicker}</span><h3>{lesson.title}</h3><p>{lesson.overview}</p><div><BookOpenText size={15} /> مثال محلول <ClipboardCheck size={15} /> {practiceCount} تطبيق تفاعلي</div></div>
              <Link className="lesson-row__button" href={`/units/${unit.slug}/lessons/${lesson.id}`}>{isComplete ? "مراجعة الدرس" : "ابدأ الدرس"}<ArrowLeft size={17} /></Link>
            </article>;
          })}
        </div>
      </section>
      <section className="unit-review page-width"><Play size={18} /><div><strong>هل تريد مراجعة مثال سابق؟</strong><span>الأمثلة المحلولة متاحة دائمًا ولا تتأثر بحالة إكمال الدرس.</span></div><Link href={`/units/${unit.slug}/lessons/${unit.lessons[0].id}`} className="subtle-button">عرض مثال <ArrowLeft size={16} /></Link></section>
    </LearningShell>
  );
}
