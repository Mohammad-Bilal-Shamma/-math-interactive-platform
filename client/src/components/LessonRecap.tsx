import React, { useEffect, useId, useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, Sigma, Target } from "lucide-react";
import type { LessonRecap as LessonRecapData } from "@shared/learningTypes";
import { MathFormula } from "./MathFormula";

type LessonRecapProps = {
  recap: LessonRecapData;
  initiallyExpanded?: boolean;
};

export function LessonRecap({ recap, initiallyExpanded = true }: LessonRecapProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const detailsId = useId();

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 680px)");
    const syncExpandedState = () => setIsExpanded(!mobileQuery.matches);

    syncExpandedState();
    mobileQuery.addEventListener("change", syncExpandedState);
    return () => mobileQuery.removeEventListener("change", syncExpandedState);
  }, []);

  return (
    <section id="recap" className={`lesson-recap ${isExpanded ? "lesson-recap--expanded" : "lesson-recap--collapsed"}`} aria-labelledby="lesson-recap-title">
      <div className="lesson-recap__heading">
        <span className="eyebrow">قبل أن تبدأ التفاصيل</span>
        <h2 id="lesson-recap-title">ملخص الدرس</h2>
        <p className="lesson-recap__description" hidden={!isExpanded}>ثلاث إشارات سريعة تساعدك على تثبيت المسار قبل الانتقال إلى الشرح والمثال.</p>
        <p className="lesson-recap__preview" hidden={isExpanded}>{recap.keyIdea}</p>
        <button className="lesson-recap__toggle" type="button" aria-expanded={isExpanded} aria-controls={detailsId} onClick={() => setIsExpanded(expanded => !expanded)}>
          <span>{isExpanded ? "طي الملخص" : "توسيع الملخص"}</span>
          {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>
      </div>
      <div id={detailsId} className="lesson-recap__items" hidden={!isExpanded}>
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
