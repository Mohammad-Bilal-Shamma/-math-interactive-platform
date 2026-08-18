# Math Interactive Platform

منصة تفاعلية لتعليم الرياضيات بشكل حديث وفعال.

## المتطلبات

- Node.js 20+ 
- npm أو pnpm
- MySQL (اختياري، للبيانات الحقيقية)

## التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/Mohammad-Bilal-Shamma/-math-interactive-platform.git
cd math-interactive-platform

# تثبيت المتعلقات
npm install --legacy-peer-deps
```

## الإعدادات

1. انسخ `.env.example` إلى `.env.local`:
```bash
cp .env.example .env.local
```

2. عدّل المتغيرات في `.env.local` حسب احتياجاتك:
```env
OAUTH_SERVER_URL=http://localhost:3000
DATABASE_URL=mysql://...
# أضف API keys إذا كنت تستخدمها
```

## التشغيل

### وضع التطوير
```bash
npm run dev
```
سيبدأ:
- Backend على `http://localhost:3000` (أو أول port متاح)
- Frontend يعمل عبر Vite مع Hot Reload

### وضع الإنتاج
```bash
# بناء المشروع
npm run build

# تشغيل الإصدار الإنتاجي
npm start
```

## أوامر مفيدة

```bash
# فحص الأخطاء
npm run check

# تنسيق الكود
npm run format

# تشغيل الاختبارات
npm test

# إدارة قاعدة البيانات
npm run db:push
```

## الهيكل

```
.
├── client/          # Frontend (React + Vite)
│   └── src/
│       ├── components/    # مكونات React
│       ├── pages/         # الصفحات
│       └── lib/           # المكتبات المساعدة
├── server/          # Backend (Express + tRPC)
│   └── _core/
│       ├── index.ts       # نقطة الدخول
│       ├── routers.ts     # وظائف tRPC
│       └── ...
├── shared/          # الكود المشترك
└── drizzle/         # إدارة قاعدة البيانات
```

## النشر

### على Vercel
```bash
# نشر إلى الإنتاج
npx vercel --prod
```

المشروع متصل بـ CI/CD على GitHub ويتم النشر تلقائياً عند كل push إلى فرع `main`.

**الرابط الحي**: https://math-interactive-platform.vercel.app

## المساهمة

الخطوات:
1. أنشئ فرعاً جديداً
2. اعمل على التعديلات
3. أرسل Pull Request

## الترخيص

MIT
