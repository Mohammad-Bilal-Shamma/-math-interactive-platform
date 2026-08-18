# ملاحظات اعتماد Clerk

تم اعتماد Clerk كمزود مصادقة خارجي لمنصة نُقطة، لأن التطبيق يتكون من واجهة React/Vite وخادم Express وهدف نشر Vercel.

| طبقة التطبيق | التكامل المعتمد | المتغيرات المطلوبة |
|---|---|---|
| React/Vite | `@clerk/react` و`ClerkProvider` على جذر التطبيق | `VITE_CLERK_PUBLISHABLE_KEY` |
| Express وVercel Function | `@clerk/express` مع `clerkMiddleware()` و`getAuth()` | `CLERK_SECRET_KEY` و`CLERK_PUBLISHABLE_KEY` |
| الأدوار | حقل `publicMetadata.role` في Clerk مع تحقق خادمي | لا متغير إضافي |

يجب أن يبقى `CLERK_SECRET_KEY` خادميًا فقط؛ ولا يجوز وضعه في متغير يبدأ بـ`VITE_`. سيوفر Clerk مفتاح النشر للواجهة ومفتاح السر للخادم، بينما ستستعمل واجهات Vite المتغيرات المسبوقة بـ`VITE_` فقط.

## المصادر الرسمية

1. Clerk React Quickstart: https://clerk.com/docs/react/getting-started/quickstart
2. Clerk Express Quickstart: https://clerk.com/docs/expressjs/getting-started/quickstart
3. Clerk Express SDK Overview: https://clerk.com/docs/reference/express/overview
4. Clerk Environment Variables: https://clerk.com/docs/guides/development/clerk-environment-variables
