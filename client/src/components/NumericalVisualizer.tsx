import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ChartNoAxesCombined, ChevronLeft, FunctionSquare, Sigma } from "lucide-react";
import { eulerSeries, lagrangeValue, newtonIterationSeries } from "@shared/numericalVisualizations";

type VisualizerKind = "interpolation" | "integration" | "newton" | "euler";

const tabConfig: { id: VisualizerKind; label: string; icon: typeof Activity; note: string }[] = [
  { id: "interpolation", label: "الاستيفاء", icon: FunctionSquare, note: "نقاط معلومة وكثيرة حدود تمر بها." },
  { id: "integration", label: "التكامل", icon: Sigma, note: "تقريب المساحة باستخدام عدد من الشرائح." },
  { id: "newton", label: "نيوتن", icon: Activity, note: "مراقبة تقارب الجذر مع كل تكرار." },
  { id: "euler", label: "أويلر", icon: ChartNoAxesCombined, note: "مقارنة الحل العددي بالمنحنى المرجعي." },
];

export function NumericalVisualizer() {
  const [kind, setKind] = useState<VisualizerKind>("interpolation");
  const [segments, setSegments] = useState(6);
  const [start, setStart] = useState(1.2);
  const [step, setStep] = useState(0.25);

  const interpolationData = useMemo(() => {
    const points = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 3, y: -1 }];
    return Array.from({ length: 31 }, (_, index) => {
      const x = index / 10;
      const given = points.find(point => point.x === x)?.y;
      return { x: Number(x.toFixed(1)), polynomial: Number(lagrangeValue(points, x).toFixed(3)), points: given ?? null };
    });
  }, []);

  const integrationData = useMemo(() => {
    const width = Math.PI / segments;
    return Array.from({ length: segments + 1 }, (_, index) => {
      const x = index * width;
      const y = Math.sin(x) + 1;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(3)), trapezoid: Number(y.toFixed(3)) };
    });
  }, [segments]);

  const eulerData = useMemo(() => eulerSeries(step), [step]);

  const newtonData = useMemo(() => newtonIterationSeries(start), [start]);
  const active = tabConfig.find(tab => tab.id === kind)!;

  return (
    <section className="visualizer" aria-labelledby="visualizer-heading">
      <div className="visualizer__header">
        <div><span className="eyebrow">مختبر مرئي</span><h2 id="visualizer-heading">شاهد الطريقة العددية وهي تعمل</h2></div>
        <p>{active.note}</p>
      </div>
      <div className="visualizer__tabs" role="tablist" aria-label="طرق عددية مرئية">
        {tabConfig.map(tab => {
          const Icon = tab.icon;
          return <button key={tab.id} type="button" role="tab" aria-selected={kind === tab.id} className={kind === tab.id ? "visualizer-tab visualizer-tab--active" : "visualizer-tab"} onClick={() => setKind(tab.id)}><Icon size={16} />{tab.label}</button>;
        })}
      </div>
      <div className="visualizer__canvas">
        {kind === "interpolation" && <ResponsiveContainer width="100%" height={300}><LineChart data={interpolationData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e7ec" /><XAxis dataKey="x" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="polynomial" stroke="#6f9fbb" strokeWidth={3} dot={false} name="كثيرة الحدود" /><Line type="linear" dataKey="points" stroke="#d88291" strokeWidth={0} dot={{ r: 5, fill: "#d88291" }} name="نقاط معطاة" /></LineChart></ResponsiveContainer>}
        {kind === "integration" && <ResponsiveContainer width="100%" height={300}><AreaChart data={integrationData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e7ec" /><XAxis dataKey="x" /><YAxis /><Tooltip /><Area type="monotone" dataKey="trapezoid" stroke="#6f9fbb" fill="#bfddec" fillOpacity={0.72} name="المساحة المقربة" /></AreaChart></ResponsiveContainer>}
        {kind === "newton" && <ResponsiveContainer width="100%" height={300}><LineChart data={newtonData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e7ec" /><XAxis dataKey="iteration" /><YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" /><Tooltip /><Legend /><Line yAxisId="left" type="monotone" dataKey="x" stroke="#6f9fbb" strokeWidth={3} name="تقريب الجذر" /><Line yAxisId="right" type="monotone" dataKey="error" stroke="#d88291" strokeWidth={2} name="|f(x)|" /></LineChart></ResponsiveContainer>}
        {kind === "euler" && <ResponsiveContainer width="100%" height={300}><LineChart data={eulerData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e7ec" /><XAxis dataKey="x" /><YAxis /><Tooltip /><Legend /><Line type="stepAfter" dataKey="euler" stroke="#d88291" strokeWidth={3} name="أويلر" /><Line type="monotone" dataKey="exact" stroke="#6f9fbb" strokeWidth={3} dot={false} name="مرجع مقارن" /></LineChart></ResponsiveContainer>}
      </div>
      <div className="visualizer__controls">
        {kind === "integration" && <label>عدد الشرائح <input type="range" min="2" max="16" step="2" value={segments} onChange={event => setSegments(Number(event.target.value))} /><strong>{segments}</strong></label>}
        {kind === "newton" && <label>التقريب الابتدائي <input type="range" min="1.1" max="2" step="0.1" value={start} onChange={event => setStart(Number(event.target.value))} /><strong>{start.toFixed(1)}</strong></label>}
        {kind === "euler" && <label>طول الخطوة h <input type="range" min="0.1" max="0.5" step="0.05" value={step} onChange={event => setStep(Number(event.target.value))} /><strong>{step.toFixed(2)}</strong></label>}
        {kind === "interpolation" && <p>تظهر النقاط المعطاة بالوردي، بينما يرسم الخط الأزرق كثيرة الحدود الملائمة لها.</p>}
      </div>
    </section>
  );
}
