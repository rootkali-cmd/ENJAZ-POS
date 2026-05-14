import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الأسئلة الشائعة - ENJAZ",
  description: "إجابات شاملة لجميع الأسئلة المتكررة حول منصة ENJAZ",
}

const FAQS = [
  {
    q: "ما هي منصة ENJAZ؟",
    a: "ENJAZ هي منصة سحابية متكاملة لإدارة المتاجر والمحلات التجارية. توفر لك نظام نقاط بيع (POS) احترافي، إدارة مخزون لحظية، تتبع المبيعات والموظفين، تقارير تفصيلية، ومساعد ذكي بالذكاء الاصطناعي — كل هذا في لوحة تحكم واحدة بتصميم عربي بالكامل.",
  },
  {
    q: "هل ENJAZ مناسبة لمتاجري؟",
    a: "ENJAZ صممت خصيصاً لأصحاب المتاجر والمحلات التجارية في العالم العربي. سواء كنت تملك بقالة، مطعماً، مقهى، ملابس، إلكترونيات، أو أي نشاط تجاري — ENJAZ تناسبك. نوفر أدوات مرنة تناسب المتاجر الصغيرة والمتوسطة والكبيرة.",
  },
  {
    q: "هل أحتاج لطابعة حرارية لاستخدام نظام نقاط البيع؟",
    a: "لا، نظام نقاط البيع يعمل بشكل كامل بدون طابعة. لكن إذا كنت ترغب في طباعة الفواتير، ندعم الطابعات الحرارية المتوافقة مع المتصفح. نوفر أيضاً إرسال الفواتير عبر الواتساب أو البريد الإلكتروني.",
  },
  {
    q: "كيف أعمل باركود للمنتجات؟",
    a: "تستطيع إضافة الباركود بطريقتين: إما إدخال رقم الباركود العالمي المطبوع على المنتج، أو استخدام نظام ENJAZ لإنشاء باركود خاص بمتجرك وطباعته. في شاشة البيع، يكفي تمرير الباركود أمام الكاميرا لمسحه ضوئياً.",
  },
  {
    q: "هل ENJAZ آمنة؟",
    a: "نحن نأخذ الأمان على محمل الجد. جميع البيانات مشفرة أثناء النقل (SSL) وأثناء التخزين. نظام PIN لحماية المناطق الحساسة، صلاحيات متعددة للموظفين، جلسات مشفرة مع صلاحية محدودة، وتسجيل أحداث كامل لكل عملية في المتجر.",
  },
  {
    q: "هل تدعمون الموظفين والصلاحيات؟",
    a: "نعم. توفر ENJAZ نظام صلاحيات متكامل. تستطيع تحديد صلاحية كل موظف: من يمكنه البيع، من يمكنه إدارة المخزون، من يمكنه الاطلاع على التقارير. كما ندعم تتبع أداء المبيعات، العمولات، والرواتب.",
  },
  {
    q: "كيف أعمل تقرير مبيعات؟",
    a: "من لوحة التحكم، تذهب إلى قسم التقارير. تختار الفترة الزمنية (يوم، أسبوع، شهر، سنة مخصصة). وتظهر لك رسوم بيانية تفاعلية توضح: إجمالي المبيعات، الأرباح، المنتجات الأكثر مبيعاً، المصروفات، وأداء الموظفين. يمكنك تصدير التقارير بصيغة PDF.",
  },
  {
    q: "ما هو AI Agent؟",
    a: "AI Agent هو مساعد ذكي يعمل بالذكاء الاصطناعي لمتجرك. يسألك عن متجرك ويقدم: تحليلات مبيعات ذكية، تنبيهات عن المخزون المنخفض، اقتراحات لتحسين الأداء، مراقبة مستمرة للمؤشرات. يعمل بتقنيات Groq و OpenRouter و Baseten.",
  },
  {
    q: "هل يمكنني استخدام ENJAZ على الجوال؟",
    a: "نعم، ENJAZ متجاوبة بالكامل وتعمل على جميع الأجهزة — كمبيوتر، تابلت، جوال. يمكنك إدارة متجرك من أي مكان عبر المتصفح. تطبيق الجوال قيد التطوير وسيطلق قريباً.",
  },
  {
    q: "كم تكلفة ENJAZ؟",
    a: "حالياً ENJAZ في مرحلة الاختبار التجريبي (Beta) ومتاحة مجاناً. سنعلن عن خطط الأسعار عند الإطلاق الرسمي. المشتركون في النسخة التجريبية سيحصلون على مميزات حصرية.",
  },
  {
    q: "هل بياناتي آمنة في السحابة؟",
    a: "جميع بياناتك مخزنة على خوادم CockroachDB الموزعة، مع تشفير كامل ورُقُبَة صارمة. نعمل بنظام الفصل التام بين المتاجر (Multi-tenant Isolation) بحيث لا يمكن لأي متجر الوصول لبيانات متجر آخر.",
  },
  {
    q: "هل تدعمون الدفع الإلكتروني؟",
    a: "ندعم حالياً الدفع النقدي والبطاقات الائتمانية وطرق دفع أخرى. في التحديثات القادمة سنضيف تكامل مع بوابات الدفع الإلكتروني المحلية.",
  },
  {
    q: "هل يمكنني تصدير بياناتي من ENJAZ؟",
    a: "نعم، في أي وقت. نوفر تصدير البيانات بصيغ Excel و PDF و CSV. ومثل ما نقول دائماً: بياناتك ملكك — تقدر تاخذها وتخرج في أي وقت.",
  },
  {
    q: "كيف أتواصل مع الدعم الفني؟",
    a: "تواصل معنا عبر البريد الإلكتروني support@enjaz.one. فريقنا يرد خلال 24 ساعة. في الإصدارات القادمة سنضيف دعم مباشر (Live Chat) داخل التطبيق.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">ENJAZ</Link>
          <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">الرئيسية</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">الأسئلة الشائعة</h1>
          <p className="text-sm text-muted max-w-xl mx-auto">
            إجابات شاملة لكل ما قد يخطر ببالك حول منصة ENJAZ. إن لم تجد إجابتك، تواصل معنا.
          </p>
        </div>

        <div className="space-y-4" dir="rtl">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group border border-border rounded-xl overflow-hidden transition-colors hover:border-primary/30"
            >
              <summary className="px-5 py-4 cursor-pointer text-sm font-semibold flex items-center justify-between gap-3 hover:bg-card-hover transition-colors select-none marker:hidden">
                <span>{faq.q}</span>
                <svg
                  className="w-4 h-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-xs text-muted leading-relaxed border-t border-border pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center border border-border rounded-xl p-6">
          <p className="text-sm font-semibold mb-1">لم تجد إجابتك؟</p>
          <p className="text-xs text-muted mb-3">تواصل معنا مباشرة وسنرد عليك في أقرب وقت.</p>
          <a
            href="mailto:support@enjaz.one"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            تواصل معنا
          </a>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <div className="max-w-4xl mx-auto px-4">© {new Date().getFullYear()} ENJAZ. كل الحقوق محفوظة.</div>
      </footer>
    </div>
  )
}
