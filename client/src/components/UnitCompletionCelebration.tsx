import React from "react";
import { ArrowLeft, CheckCircle2, Sparkles, X } from "lucide-react";
import { Link } from "wouter";

type UnitCompletionCelebrationProps = {
  unitTitle: string;
  unitHref: string;
  onDismiss: () => void;
};

export function UnitCompletionCelebration({ unitTitle, unitHref, onDismiss }: UnitCompletionCelebrationProps) {
  return (
    <div className="celebration-backdrop" role="presentation">
      <section className="celebration-dialog" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
        <div className="celebration-confetti" aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => <span key={index} style={{ "--piece": index } as React.CSSProperties} />)}
        </div>
        <button className="celebration-close" type="button" onClick={onDismiss} aria-label="إغلاق الاحتفال"><X size={18} /></button>
        <div className="celebration-icon"><CheckCircle2 size={30} /></div>
        <span className="eyebrow"><Sparkles size={14} /> إنجاز جديد</span>
        <h2 id="celebration-title">أكملت وحدة<br />{unitTitle}</h2>
        <p>أحسنت! تم حفظ تقدمك، ويمكنك الآن مراجعة الأمثلة أو الانتقال بثقة إلى الوحدة التالية.</p>
        <div className="celebration-actions">
          <Link href={unitHref} className="primary-button">عرض إنجاز الوحدة <ArrowLeft size={17} /></Link>
          <button type="button" className="subtle-button" onClick={onDismiss}>متابعة التعلم</button>
        </div>
      </section>
    </div>
  );
}
