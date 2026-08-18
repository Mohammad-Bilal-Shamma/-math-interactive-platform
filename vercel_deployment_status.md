# حالة نشر Vercel

تاريخ المراجعة: 18 أغسطس 2026.

- مشروع Vercel: `math-interactive-platform` ضمن فريق المستخدم الشخصي على Hobby.
- المستودع المرتبط: `Mohammad-Bilal-Shamma/-math-interactive-platform`، الفرع `main`، الالتزام `2fdea7b`.
- رابط الإنتاج: https://math-interactive-platform.vercel.app
- أضيفت متغيرات Clerk الاختبارية إلى بيئتَي Production وPreview:
  - `VITE_CLERK_PUBLISHABLE_KEY`
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- أُنشئت إعادة نشر للإنتاج بالمعرّف `4ziE19oRJD1xpuBt1LPrDvh9bDhq`. وصلت في Vercel إلى الحالة `Ready` خلال دقيقة وست ثوانٍ، وأُسندت إلى نطاق الإنتاج ورابط معاينة خاص.
- تم التحقق من رابط الإنتاج بعد إعادة النشر؛ حمّلت الصفحة الرئيسية واجهة نُقطة العربية كاملة مع تنقل المنصة وزر تسجيل الدخول.
- فشل تنفيذ `pnpm build:vercel` محليًا أثناء مرحلة Vite بسبب ضغط ذاكرة مرتفع في بيئة التجربة، قبل ظهور خطأ مصدر أو TypeScript. بناء Vercel السحابي لنفس الالتزام نجح لاحقًا ووصل إلى `Ready`، وهو التحقق العملي المعتمد لبناء الإنتاج في هذه الحالة.
- ما يزال النشر الكامل للميزات يحتاج `DATABASE_URL` خارجيًا و`JWT_SECRET`، وإعادة تهيئة خدمات الذكاء الاصطناعي وتخزين الصور التي كانت تعتمد على Forge الداخلي.
