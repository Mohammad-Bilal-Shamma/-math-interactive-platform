import React from "react";
import { Lightbulb, Sigma, Target } from "lucide-react";
import type { LessonRecap as LessonRecapData } from "@shared/learningTypes";
import { MathFormula } from "./MathFormula";

type LessonRecapProps = {
  recap: LessonRecapData;
};

export function LessonRecap({ recap }: LessonRecapProps) {
  return (
    <section id="recap" className="lesson-recap" aria-labelledby="lesson-recap-title">
      <div className="lesson-recap__heading">
        <span className="eyebrow">قبل أن تبدأ التفاصيل</span>
        <h2 id="lesson-recap-title">ملخص الدرس</h2>
        <p>ثلاث إشارات سريعة تساعدك على تثبيت المسار قبل الانتقال إلى الشرح والمثال.</p>
      </div>
      <div className="lesson-recap__items">
        <article className="lesson-recap__item">
          <div className="lesson-recap__label"><Lightbulb size={17} /><span>الفكرة المحورية</span></div>
          <p>{recap.keyIdea}</p>
        </article>
        <article className="lesson-recap__item lesson-recap__item--formula">
          <div className="lesson-recap__label"><Sigma size={17} /><span>القانون أو الإجراء الأهم</span></div>
          <MathFormula latex={recap.coreFormula} display={false} />
        </article>
        <article className="lesson-recap__item">
          <div className="lesson-recap__label"><Target size={17} /><span>ما ستتقنه</span></div>
          <p>{recap.masteryTakeaway}</p>
        </article>
      </div>
    </section>
  );
}
