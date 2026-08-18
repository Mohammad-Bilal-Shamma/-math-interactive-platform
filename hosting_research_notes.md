# ملاحظات مقارنة الاستضافة المجانية

تاريخ المراجعة: 18 أغسطس 2026.

| الخدمة | الملاءمة للمشروع | نقاط موثقة |
|---|---|---|
| Vercel Hobby | الأنسب للبنية الحالية؛ يتوافق مع إعداد Vercel الموجود وواجهات API على هيئة Functions. | الخطة مجانية للمشروعات الشخصية وغير التجارية، وتشمل أول مليون استدعاء Functions و4 CPU-hours ومدة Function قصوى 300 ثانية. المصدر: https://vercel.com/docs/plans/hobby |
| Netlify Free | بديل مناسب لتطبيق React مع Functions بعد تهيئة النشر. | الخطة Free بقيمة $0، وتتضمن نطاقات مخصصة مع SSL وFunctions وميزات تخزين؛ لها حد 300 credits. المصدر: https://www.netlify.com/pricing/ |
| Cloudflare Pages + Workers | مناسب عند إعادة تكييف خادم Express إلى Workers/Pages Functions؛ ليس نشرًا مباشرًا للنسخة الحالية. | الخطة Free تمنح 100,000 طلب Worker يوميًا و10ms CPU لكل استدعاء؛ صفحات Functions تحت تسعير Workers. المصدر: https://developers.cloudflare.com/workers/platform/pricing/ |
| Render Free | مناسب لنسخة تجريبية لخادم Node/Express كامل، لكنه غير ملائم لتجربة فورية دائمة. | يدعم Web Services مجانية، لكنه يسبت بعد 15 دقيقة من الخمول وقد يستغرق الإيقاظ نحو دقيقة؛ قاعدة Postgres المجانية تنتهي بعد 30 يومًا. المصدر: https://render.com/docs/free |

ملاحظة: يحتوي المشروع على استضافة Manus مفعلة بالفعل. تنطبق حدود وخطط الموفرين على تاريخ المراجعة وقد تتغير.
