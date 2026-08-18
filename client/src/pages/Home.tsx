import { ArrowLeft, BookMarked, CheckCircle2, CircleGauge, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LearningShell } from "@/components/LearningShell";
import { MathFormula } from "@/components/MathFormula";
import { learningUnits } from "@shared/learningContent";
import { trpc } from "@/lib/trpc";

const unitColors = { blue: "unit-card--blue", pink: "unit-card--pink", ink: "unit-card--ink" };

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: progress } = trpc.learning.progress.useQuery(undefined, { enabled: isAuthenticated });
  const completedLessons = progress?.lessons.filter(lesson => lesson.isCompleted === 1).length ?? 0;
  const totalLessons = learningUnits.reduce((count, unit) => count + unit.lessons.length, 0);
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <LearningShell>
      <section className="hero-section page-width">
        <div className="hero-copy">
          <span className="eyebrow eyebrow--with-icon"><Sparkles size={15} /> دراسة منظمة · فهم أعمق</span>
          <h1>تعلّم الطرق العددية<br /><em>خطوة بخطوة.</em></h1>
          <p>منصة عربية تفاعلية تجمع الشرح المركز، الأمثلة المحلولة، والمسائل التي تمنحك تصحيحًا فوريًا لكل خطوة.</p>
          <div className="hero-actions">
            <Link href="/units/errors-rounding" className="primary-button">ابدأ من الوحدة الأولى <ArrowLeft size={18} /></Link>
            <Link href="/visualize" className="subtle-button">افتح المختبر المرئي</Link>
          </div>
          <div className="hero-meta"><span><strong>٥</strong> وحدات دراسية</span><span><strong>٤</strong> أنماط أسئلة</span><span><strong>RTL</strong> واجهة عربية كاملة</span></div>
        </div>
        <div className="hero-math" aria-label="مثال على معادلة رياضية معروضة">
          <span className="math-note math-note--one">اقرأ القانون</span>
          <span className="math-note math-note--two">طبّق فورًا</span>
          <div className="math-card">
            <span>دقّة التدوير</span>
            <MathFormula latex="\\varepsilon_x=0.5\\times10^{-n}" />
            <p>اعرف الحد الأعلى للخطأ قبل أن تثق في أي تقريب.</p>
          </div>
        </div>
      </section>

      <section className="overview-section page-width" aria-label="ملخص التقدم">
        <div className="section-heading"><span className="eyebrow">مسارك الدراسي</span><h2>{isAuthenticated && user ? `مرحبًا ${user.name ?? "بك"}` : "كل مفهوم، في موضعه الصحيح"}</h2></div>
        <div className="overview-grid">
          <article className="progress-card">
            <div className="progress-card__top"><span>التقدم الكلي</span><strong>{progressPercent}%</strong></div>
            <div className="progress-track" aria-label={`التقدم الكلي ${progressPercent}%`}><span style={{ width: `${progressPercent}%` }} /></div>
            <p>{completedLessons} من {totalLessons} دروس مكتملة {loading ? "" : isAuthenticated ? "ومحفوظة في حسابك" : ""}.</p>
          </article>
          <article className="quick-card"><BookMarked size={20} /><div><span>الدرس التالي</span><strong>{learningUnits[0].lessons[0].title}</strong></div><Link href="/units/errors-rounding/lessons/rounding-rules" aria-label="فتح الدرس التالي"><ArrowLeft size={18} /></Link></article>
          <article className="quick-card"><CircleGauge size={20} /><div><span>نمط الدراسة</span><strong>تعلم · طبّق · راجع</strong></div></article>
        </div>
      </section>

      <section className="units-section page-width" aria-labelledby="units-heading">
        <div className="section-heading section-heading--inline"><div><span className="eyebrow">الوحدات الخمس</span><h2 id="units-heading">ابدأ من الأساس، وتقدّم بثقة</h2></div><p>اختَر وحدة، اقرأ المفاهيم الأساسية، ثم انتقل مباشرةً إلى تطبيق تفاعلي مصمم من تمارين الملف.</p></div>
        <div className="units-grid">
          {learningUnits.map(unit => {
            const complete = progress?.units.find(item => item.unitId === unit.id)?.completedLessons ?? 0;
            const unitPercent = Math.round((complete / unit.lessons.length) * 100);
            return (
              <Link key={unit.id} href={`/units/${unit.slug}`} className={`unit-card ${unitColors[unit.accent]}`}>
                <div className="unit-card__top"><span className="unit-index">٠{unit.order}</span><span className="unit-orb" aria-hidden="true" /></div>
                <div><h3>{unit.title}</h3><p>{unit.subtitle}</p></div>
                <div className="unit-card__bottom"><span>{unit.lessons.length} دروس</span><span>{unitPercent}% <ArrowLeft size={15} /></span></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="method-section page-width">
        <div><span className="eyebrow">طريقة التعلّم</span><h2>الشرح لا يكتمل إلا عندما تتعامل مع المسألة بنفسك.</h2></div>
        <div className="method-steps"><article><span>١</span><strong>افهم</strong><p>نظرية مركزة وصيغ مكتوبة بوضوح.</p></article><article><span>٢</span><strong>تتبّع</strong><p>مثال محلول خطوة بخطوة في أي وقت.</p></article><article><span>٣</span><strong>طبّق</strong><p>تغذية راجعة فورية على كل محاولة.</p></article></div>
      </section>

      <section className="cta-section page-width"><CheckCircle2 size={24} /><div><strong>المنصة تحفظ نتائجك عندما تسجّل الدخول.</strong><span>ارجع إلى أي مثال محلول، وتابع من حيث توقفت دون فقدان التقدم.</span></div><Link href="/results" className="subtle-button">صفحة النتائج <ArrowLeft size={16} /></Link></section>
    </LearningShell>
  );
}
