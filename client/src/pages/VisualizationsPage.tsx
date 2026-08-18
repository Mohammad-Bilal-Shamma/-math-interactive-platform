import { Link } from "wouter";
import { ArrowLeft, Sparkles } from "lucide-react";
import { LearningShell } from "@/components/LearningShell";
import { NumericalVisualizer } from "@/components/NumericalVisualizer";

export default function VisualizationsPage() {
  return <LearningShell><section className="visualizations-hero page-width"><Link href="/" className="back-link"><ArrowLeft size={16} /> العودة للرئيسية</Link><span className="eyebrow"><Sparkles size={14} /> مختبر الطرق العددية</span><h1>افهم كل تقريب<br />قبل أن تحسبه.</h1><p>حرّك المتغيرات وشاهد أثر عدد الشرائح، وطول الخطوة، والتقريب الابتدائي على النتيجة والتقارب.</p></section><div className="page-width"><NumericalVisualizer /></div></LearningShell>;
}
