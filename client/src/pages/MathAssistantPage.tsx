import { BotMessageSquare, ImageUp, Lightbulb, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type ChatAttachment, type Message as ChatMessage } from "@/components/AIChatBox";
import { LearningShell } from "@/components/LearningShell";
import { MathFormula } from "@/components/MathFormula";
import { trpc } from "@/lib/trpc";

function MathAnswer({ content }: { content: string }) {
  return (
    <div className="math-assistant-answer" dir="rtl">
      {content.split(/(\$\$[\s\S]*?\$\$)/g).filter(Boolean).map((part, index) => {
        const isFormula = part.startsWith("$$") && part.endsWith("$$");
        return isFormula
          ? <MathFormula key={`${index}-${part}`} latex={part.slice(2, -2).trim()} />
          : <Streamdown key={`${index}-${part}`}>{part}</Streamdown>;
      })}
    </div>
  );
}

export default function MathAssistantPage() {
  const { isAuthenticated, startSignIn } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachment, setAttachment] = useState<ChatAttachment & { key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const askAssistant = trpc.mathAssistant.ask.useMutation();
  const uploadImage = trpc.mathAssistant.uploadImage.useMutation();

  const handleAttachment = (file: File) => {
    if (!isAuthenticated) return startSignIn();
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) return setError("اختر صورة بصيغة JPG أو PNG أو WEBP.");
    if (file.size > 4 * 1024 * 1024) return setError("يجب ألا يتجاوز حجم الصورة 4 ميغابايت.");

    const reader = new FileReader();
    reader.onload = () => uploadImage.mutate(
      { dataUrl: String(reader.result), fileName: file.name },
      {
        onSuccess: uploaded => { setAttachment({ key: uploaded.key, url: uploaded.url, fileName: file.name }); setError(null); },
        onError: failure => setError(failure.message || "تعذر رفع الصورة. حاول مرة أخرى."),
      },
    );
    reader.onerror = () => setError("تعذر قراءة الصورة من جهازك.");
    reader.readAsDataURL(file);
  };

  const handleSend = (content: string, selectedAttachment?: ChatAttachment) => {
    if (!isAuthenticated) return startSignIn();
    const question = content.trim();
    const image = selectedAttachment as (ChatAttachment & { key: string }) | undefined;
    const userMessage: ChatMessage = {
      role: "user",
      content: question || "أرفقت صورة لمسألة رياضية. حلّلها واشرح الخطوات.",
      imageUrl: image?.url,
    };
    const history = messages.slice(-6).map(message => ({ role: message.role as "user" | "assistant", content: message.content }));

    setMessages(current => [...current, userMessage]);
    setError(null);
    askAssistant.mutate(
      { question: question || undefined, imageKey: image?.key, history },
      {
        onSuccess: result => {
          setMessages(current => [...current, { role: "assistant", content: result.answer }]);
          setAttachment(null);
        },
        onError: failure => setError(failure.message || "تعذر الحصول على إجابة الآن. حاول مرة أخرى."),
      },
    );
  };

  return (
    <LearningShell>
      <section className="math-assistant-hero page-width">
        <div>
          <span className="eyebrow">مساعد دراسي مدعوم بالذكاء الاصطناعي</span>
          <h1>اسأل عن أي مسألة رياضية.</h1>
          <p>اكتب المعادلة أو أرفق صورة واضحة لمسألتك، وسيشرح لك المساعد الفكرة والخطوات بالعربية.</p>
        </div>
        <div className="math-assistant-hero__badge" aria-hidden="true"><BotMessageSquare size={26} /></div>
      </section>
      <section className="math-assistant-layout page-width">
        <aside className="math-assistant-notes">
          <article><Lightbulb size={18} /><strong>اسأل بوضوح</strong><p>أضف المعطيات وما المطلوب إيجاده لتحصل على خطوات أدق.</p></article>
          <article><ImageUp size={18} /><strong>أرفق صورة المسألة</strong><p>يقبل صور JPG وPNG وWEBP حتى 4 ميغابايت.</p></article>
          <article><ShieldCheck size={18} /><strong>للتعلّم</strong><p>ستظهر الخطوات والنتيجة، لكن تحقّق من الرموز غير الواضحة في الصورة.</p></article>
        </aside>
        <div className="math-assistant-workspace">
          {!isAuthenticated ? (
            <div className="math-assistant-signin"><BotMessageSquare size={28} /><h2>سجّل الدخول لبدء المحادثة</h2><p>يحتاج المساعد إلى حساب الطالب لحماية المحادثة والصور المرفقة.</p><button type="button" className="primary-button" onClick={startSignIn}>تسجيل الدخول</button></div>
          ) : (
            <>
              <AIChatBox
                messages={messages}
                onSendMessage={handleSend}
                isLoading={askAssistant.isPending || uploadImage.isPending}
                placeholder="مثال: كيف أطبق قاعدة سمبسون على هذا الجدول؟"
                emptyStateMessage="ابدأ بسؤال رياضي أو أرفق صورة لمسألة."
                suggestedPrompts={["اشرح لي الفرق بين الخطأ المطلق والنسبي.", "كيف أحسب خطوة في طريقة أويلر؟", "ساعدني في ترتيب خطوات طريقة نيوتن."]}
                attachment={attachment}
                onSelectAttachment={handleAttachment}
                onRemoveAttachment={() => setAttachment(null)}
                assistantRenderer={content => <MathAnswer content={content} />}
                className="math-assistant-chat"
                height="650px"
              />
              {error && <p className="math-assistant-error" role="alert">{error}</p>}
            </>
          )}
        </div>
      </section>
    </LearningShell>
  );
}
