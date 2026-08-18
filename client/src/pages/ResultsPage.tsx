import { ArrowLeft, BarChart3, BookCheck, CircleGauge, Target } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LearningShell } from "@/components/LearningShell";
import { learningUnits } from "@shared/learningContent";
import { trpc } from "@/lib/trpc";

export default function ResultsPage() {
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.learning.statistics.useQuery(undefined, { enabled: isAuthenticated });
  const completedLessons = stats?.totals.completedLessons ?? 0;
  const totalLessons = stats?.totals.totalLessons ?? learningUnits.reduce((count, unit) => count + unit.lessons.length, 0);
  const completion = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const correct = stats?.totals.correctAnswers ?? 0;
  const attempts = stats?.totals.answeredQuestions ?? 0;
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;

  return (
    <LearningShell>
      <section className="results-hero page-width"><span className="eyebrow">لوحة النتائج</span><h1>راقب تقدّمك، ثم عد إلى الفكرة التي تحتاج مراجعة.</h1><p>{isAuthenticated ? "تتجدد هذه الأرقام عند إكمال الدروس وتسجيل محاولاتك." : "سجّل الدخول لحفظ محاولاتك وعرض إحصاءاتك الشخصية هنا."}</p></section>
      <section className="results-metrics page-width">
        <article><CircleGauge size={21} /><span>التقدم الكلي</span><strong>{completion}%</strong><small>{completedLessons} من {totalLessons} دروس</small></article>
        <article><Target size={21} /><span>دقة الإجابات</span><strong>{accuracy}%</strong><small>{correct} إجابات صحيحة من {attempts}</small></article>
        <article><BookCheck size={21} /><span>المحاولات</span><strong>{attempts}</strong><small>تظهر المحاولات الحديثة في حسابك</small></article>
      </section>
      <section className="results-table-section page-width"><div className="section-heading section-heading--inline"><div><span className="eyebrow">تفصيل الوحدات</span><h2>نتيجتك في كل محور</h2></div><BarChart3 size={25} /></div><div className="results-list">{learningUnits.map(unit => { const record = stats?.units.find(item => item.unitId === unit.id); const completed = record?.completedLessons ?? 0; const unitProgress = Math.round((completed / unit.lessons.length) * 100); const unitAccuracy = record?.attempts ? Math.round((record.correctAnswers / record.attempts) * 100) : 0; return <article key={unit.id} className="result-row"><div className="result-row__title"><span>٠{unit.order}</span><div><strong>{unit.title}</strong><small>{completed}/{unit.lessons.length} دروس مكتملة</small></div></div><div className="result-row__progress"><div className="progress-track"><span style={{ width: `${unitProgress}%` }} /></div><strong>{unitProgress}%</strong></div><div className="result-row__accuracy"><span>الدقة</span><strong>{unitAccuracy}%</strong><small>{record?.attempts ?? 0} محاولة</small></div><Link href={`/units/${unit.slug}`} aria-label={`فتح وحدة ${unit.title}`}><ArrowLeft size={18} /></Link></article>; })}</div></section>
      {!isAuthenticated && <section className="signin-prompt page-width"><div><strong>هذه الصفحة جاهزة لإحصاءاتك.</strong><span>سجّل الدخول من بيئة المنصة لربط الدروس والمحاولات بحسابك.</span></div><Link href="/units/errors-rounding" className="primary-button">ابدأ التعلّم <ArrowLeft size={17} /></Link></section>}
      {isLoading && <p className="loading-note page-width">جارٍ تحميل الإحصاءات…</p>}
    </LearningShell>
  );
}
