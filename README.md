<p align="center">
  <img src="/brand/enjaz-icon.png" alt="ENJAZ" width="80" />
</p>

<h1 align="center">ENJAZ — إنجاز</h1>

<p align="center">
  منصة عربية متكاملة لإدارة المتاجر — نقاط بيع، مخزون، موظفين، تقارير، ومساعد ذكي
</p>

<p align="center">
  <a href="https://enjaz.one">enjaz.one</a>
</p>

## المميزات

- **نقطة بيع (POS)** — واجهة كاشير سريعة مع دعم الباركود والطابعة الحرارية وطرق دفع متعددة
- **إدارة المخزون** — تتبّع المخزون لحظة بلحظة مع تنبيهات تلقائية
- **الموظفين والصلاحيات** — صلاحيات دقيقة وتتبع أداء المبيعات والرواتب
- **التقارير والتحليلات** — رسوم بيانية تفاعلية وتقارير مبيعات وأرباح
- **AI Agent** — مساعد ذكي للمتجر مع تحليل المبيعات والمخزون
- **الأجهزة والإلكترونيات** — كشف الأجهزة وتحليلها عبر AI
- **إشعارات ذكية** — تنبيهات للمخزون المنخفض والمبيعات والمرتجعات
- **PIN للمناطق الحساسة** — حماية إضافية بالإعدادات والتقارير

## التقنيات

- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** CockroachDB Serverless (PostgreSQL)
- **ORM:** Prisma 7
- **Auth:** Custom (bcryptjs + Session model)
- **AI:** Groq (primary) → OpenRouter → Baseten (fallback chain)

## التشغيل محلياً

```bash
# 1. استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/enjaz.git
cd enjaz

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد المتغيرات البيئية
cp .env.example .env
# عدّل ملف .env بالمفاتيح المطلوبة

# 4. إنشاء قاعدة البيانات
npx prisma db push

# 5. تشغيل التطبيق
npm run dev
```

## المتغيرات البيئية

انظر [`.env.example`](.env.example) لجميع المتغيرات المطلوبة:
- `DATABASE_URL` — CockroachDB / PostgreSQL
- `JWT_SECRET` — مفتاح لتوقيع الجلسات
- `NEXT_PUBLIC_APP_URL` — رابط التطبيق
- `GROQ_API_KEY` — مفتاح Groq (AI الأساسي)
- `OPENROUTER_API_KEY` — مفتاح OpenRouter (احتياطي)
- `BASETEN_API_KEY` — مفتاح Baseten (احتياطي ثاني)
- `TELEGRAM_BOT_TOKEN` — بوت تيليجرام للتواصل (اختياري)

## الترخيص

MIT
# ENJAZ-POS
# ENJAZ-POS
