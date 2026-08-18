# دليل إعداد منصة نُقطة للنشر على Vercel

تمت إضافة تهيئة Vercel إلى هذا المشروع، لكنها **لا تنشر المشروع تلقائيًا**. تظل استضافة Manus هي المسار المتوافق مباشرة مع المصادقة وقاعدة البيانات الحالية. أما هذه النسخة فتهيئ الواجهة لتُبنى كملفات Vite ثابتة، وتحوّل كل طلبات `/api/*` إلى تطبيق Express واحد داخل Vercel Function.

> لا تضف ملف `.env` أو أي مفتاح أو سلسلة اتصال إلى GitHub. أضف القيم من لوحة Vercel فقط، واستخدم ملف `.env.vercel.example` كقائمة أسماء دون قيم حقيقية.

## ما الذي أضيف للمشروع؟

| الملف | الغرض |
|---|---|
| `api/[...path].ts` | مدخل Vercel Function لطلبات tRPC واستدعاء OAuth تحت `/api/*`. |
| `server/_core/app.ts` | تطبيق Express قابل لإعادة الاستخدام دون فتح منفذ؛ يستخدمه التطوير المحلي وVercel. |
| `vercel.json` | يضبط تثبيت pnpm، البناء، مجلد `dist/public`، وSPA fallback لمسارات الواجهة. |
| `build:vercel` | يبني واجهة Vite فقط دون حزمة خادم Manus التقليدية. |
| `.env.vercel.example` | قائمة متغيرات البيئة المطلوبة والاختيارية. |

## خطوات النشر اليدوي

| الخطوة | الإجراء |
|---|---|
| 1 | ادفع المشروع إلى مستودع GitHub تملك صلاحية الكتابة إليه. |
| 2 | من لوحة Vercel اختر **Add New → Project** ثم استورد المستودع. |
| 3 | اجعل **Framework Preset** هو `Other` أو اترك `vercel.json` يضبط الإعدادات. |
| 4 | استخدم `pnpm install --frozen-lockfile` للتثبيت، و`pnpm build:vercel` للبناء، و`dist/public` لمجلد الإخراج. يعمل أمر البناء نفسه على Windows وmacOS وLinux. |
| 5 | أضف المتغيرات اللازمة في **Settings → Environment Variables** إلى بيئتي Production وPreview، ثم أعد النشر. |
| 6 | جهّز قاعدة MySQL/TiDB خارج Manus، طبّق ترحيلات Drizzle عليها، ثم ضع سلسلة الاتصال في `DATABASE_URL`. |
| 7 | اختبر `/` ومسارات عميقة مثل `/units/errors-rounding` وواجهة `/api/trpc` على رابط Preview قبل جعل النشر Production. |

Vercel توضح أن Vite ينتج أصولًا ثابتة محسّنة، وأن تطبيقات SPA تحتاج إعادة كتابة للمسارات العميقة إلى `index.html`.[1] يدعم Vercel أيضًا تصدير تطبيق Express كدالة، ولذلك يجمع هذا المشروع مسارات API في دالة واحدة قابلة للتوسع.[2]

## قاعدة البيانات

يستعمل المشروع Drizzle مع برنامج تشغيل MySQL/TiDB؛ لذلك لا يكفي اختيار Vercel Postgres دون تحويل مخطط قاعدة البيانات والبرنامج التشغيلي إلى PostgreSQL. استخدم خدمة MySQL/TiDB يمكن لـ Vercel الاتصال بها عبر TLS، ثم أنشئ الجداول الموجودة في `drizzle/migrations/` قبل أول تشغيل.

| المتغير | إلزامي | ملاحظات |
|---|---:|---|
| `DATABASE_URL` | نعم لحفظ تقدم الطلاب | سلسلة اتصال MySQL/TiDB خاصة ببيئة Vercel، مع TLS عند طلب المزود. |
| `JWT_SECRET` | نعم | قيمة عشوائية طويلة ومختلفة عن بيئة Manus. |
| `VITE_APP_ID` | فقط عند إبقاء Manus OAuth | معرّف تطبيق OAuth الحالي. |
| `OAUTH_SERVER_URL` | فقط عند إبقاء Manus OAuth | خادم OAuth المستخدم حاليًا. |
| `VITE_OAUTH_PORTAL_URL` | فقط عند إبقاء Manus OAuth | بوابة تسجيل الدخول. |
| `OWNER_OPEN_ID` | اختياري | مطلوب فقط لمنح دور المدير تلقائيًا. |
| `BUILT_IN_FORGE_API_URL` و`BUILT_IN_FORGE_API_KEY` | اختياري | يلزمان لمسارات تخزين Manus؛ عطلها أو استبدلها بخدمة تخزين خارجية عند عدم توفرها. |
| `VITE_ANALYTICS_ENDPOINT` و`VITE_ANALYTICS_WEBSITE_ID` | اختياري | التحليلات الآن لا تُحمّل إن لم تُضبط القيم. |

تُخزّن Vercel متغيرات البيئة خارج المصدر وتطبق تغييراتها على عمليات النشر الجديدة فقط؛ يمكن ضبط قيم مختلفة للإنتاج والمعاينة والتطوير.[3]

## قيد المصادقة المهم

المصادقة الحالية مصممة لـ **Manus OAuth**، وتُعيد التوجيه إلى `/api/oauth/callback`. قبل أن تعمل على Vercel يجب أن تسمح إعدادات تطبيق OAuth بعنوان مثل:

```text
https://YOUR-PROJECT.vercel.app/api/oauth/callback
```

إذا لم يكن تعديل عنوان إعادة التوجيه في Manus ممكنًا، فلن يعمل تسجيل الدخول أو حفظ التقدم في Vercel. في هذه الحالة استبدل المصادقة بمزود مستقل مثل Auth.js أو Clerk أو Supabase Auth، ثم حدّث `server/_core/oauth.ts` و`client/src/const.ts` وفق المزود المختار.

## التحقق المحلي

نفّذ الأوامر التالية بعد إعداد ملف بيئة محلي لا يُرفع إلى Git:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build:vercel
```

يمكن استخدام `vercel dev` لاختبار سلوك الدالة والمسارات كما ستعمل على المنصة. Vercel تصف الدوال بأنها تستجيب لطلبات مستقلة وتتوسع تلقائيًا، ولذلك يجب عدم الاعتماد على ذاكرة العملية لحفظ جلسات الطلاب أو التقدم.[4]

## ملاحظات تشغيلية

لم أجرِ نشرًا فعليًا إلى Vercel، ولم أضف بيانات اعتماد خارجية إلى المشروع. يشمل `vercel.json` حد تشغيل 30 ثانية لمسار API؛ راجع حد الخطة الفعلي في لوحة Vercel إذا أضفت عمليات بطيئة أو رفع ملفات كبيرة. لا تعتمد على `express.static()` لخدمة الأصول في الدالة؛ Vercel تخدم أصول الواجهة من مخرج Vite الثابت.[2]

## المراجع

[1]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[2]: https://vercel.com/docs/frameworks/backend/express "Express on Vercel"
[3]: https://vercel.com/docs/environment-variables "Vercel Environment Variables"
[4]: https://vercel.com/docs/functions "Vercel Functions"
