import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الشروط والأحكام - ENJAZ",
  description: "الشروط والأحكام الخاصة باستخدام منصة ENJAZ",
}

const SECTIONS = [
  {
    title: "مقدمة",
    content: "مرحباً بك في ENJAZ. باستخدامك لمنصتنا، فإنك توافق على هذه الشروط والأحكام بالكامل. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك التوقف عن استخدام المنصة فوراً. هذه الشروط قابلة للتحديث من وقت لآخر، ونحن ننصحك بمراجعتها دورياً.",
  },
  {
    title: "الخدمات المقدمة",
    content: "ENJAZ هي منصة سحابية لإدارة المتاجر تشمل: نظام نقاط بيع (POS)، إدارة المخزون، تتبع المبيعات والموظفين، التقارير والتحليلات، المساعد الذكي (AI Agent)، وأدوات إدارة الأجهزة. جميع الخدمات مقدمة \"كما هي\" ونسعى لتطويرها وتحسينها باستمرار.",
  },
  {
    title: "الحساب والتسجيل",
    content: "للاستفادة من خدماتنا، يجب عليك إنشاء حساب. أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول وجميع الأنشطة التي تتم تحت حسابك. يجب أن تكون معلومات التسجيل دقيقة وكاملة. نحن نحتفظ بالحق في تعليق أو إلغاء أي حساب يخالف هذه الشروط.",
  },
  {
    title: "الملكية الفكرية",
    content: "جميع الحقوق الفكرية للمنصة ومحتواها وتصميمها وبرمجياتها هي ملك لشركة ENJAZ. لا يجوز نسخ أو توزيع أو تعديل أو إعادة نشر أي جزء من المنصة دون إذن كتابي صريح. شعار ENJAZ واسمها علامات تجارية مسجلة.",
  },
  {
    title: "البيانات والمحتوى",
    content: "أنت تملك جميع البيانات التي تدخلها في المنصة (بيانات المنتجات، المبيعات، العملاء، إلخ). نحن لا نملك هذه البيانات ولا نستخدمها لأغراضنا الخاصة. نستخدم تقنيات التشفير لحماية بياناتك. لك الحق في تصدير وحذف بياناتك في أي وقت. قد نستخدم بيانات مجمعة غير شخصية لأغراض تحسين الخدمة.",
  },
  {
    title: "الخصوصية وأمان البيانات",
    content: "نحن نأخذ خصوصيتك على محمل الجد. جميع البيانات منقولة عبر اتصال مشفر (SSL/TLS). نستخدم قاعدة بيانات CockroachDB الموزعة مع تشفير متقدم. لا نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية. أنظر سياسة الخصوصية لمزيد من التفاصيل.",
  },
  {
    title: "الدفع والفواتير",
    content: "الخدمة حالياً في مرحلة تجريبية مجانية. عند الإطلاق الرسمي، سيتم الإعلان عن خطط الأسعار. المشتركون في النسخة التجريبية سيحصلون على مميزات حصرية. جميع المبالغ المدفوعة غير قابلة للاسترداد إلا في حالات محددة يقرها فريق الدعم.",
  },
  {
    title: "حدود المسؤولية",
    content: "ENJAZ غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة. الخدمة مقدمة \"كما هي\" دون أي ضمانات. نحن لا نضمن أن الخدمة ستكون خالية من الأخطاء أو متوفرة دون انقطاع. في جميع الأحوال، مسؤوليتنا محدودة بالمبلغ المدفوع مقابل الخدمة.",
  },
  {
    title: "إلغاء الخدمة",
    content: "يمكنك إلغاء حسابك في أي وقت من صفحة الإعدادات. عند الإلغاء، سيتم حذف بياناتك بعد 30 يوماً من تاريخ الإلغاء. نحن نحتفظ بالحق في تعليق أو إنهاء الخدمة لأي حساب يخالف هذه الشروط دون إشعار مسبق.",
  },
  {
    title: "التعديلات على الشروط",
    content: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإشعار المستخدمين المسجلين بالتغييرات الجوهرية عبر البريد الإلكتروني. استمرار استخدام المنصة بعد التعديل يعني موافقتك على الشروط المعدلة.",
  },
  {
    title: "القانون المطبق",
    content: "تخضع هذه الشروط للقوانين والأنظمة المعمول بها في المملكة العربية السعودية. في حالة وجود أي نزاع، يتم حله ودياً أولاً، فإن تعذر ذلك، يتم اللجوء إلى القضاء المختص.",
  },
  {
    title: "التواصل",
    content: "للاستفسارات المتعلقة بهذه الشروط، تواصل معنا على: support@enjaz.one",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">ENJAZ</Link>
          <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">الرئيسية</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
        <div className="text-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">الشروط والأحكام</h1>
          <p className="text-xs text-muted">آخر تحديث: ١٥ مايو ٢٠٢٦</p>
        </div>

        <div className="border-t border-border pt-8 mt-8 space-y-8">
          {SECTIONS.map((section, i) => (
            <section key={i}>
              <h2 className="text-sm font-bold mb-2">
                {i + 1}. {section.title}
              </h2>
              <p className="text-xs text-muted leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 border border-border rounded-xl p-5 text-center">
          <p className="text-xs text-muted">
            باستخدامك لـ ENJAZ، فإنك توافق على هذه الشروط والأحكام. لأي استفسار، تواصل معنا على{" "}
            <a href="mailto:support@enjaz.one" className="text-primary hover:underline">support@enjaz.one</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <div className="max-w-4xl mx-auto px-4">© {new Date().getFullYear()} ENJAZ. كل الحقوق محفوظة.</div>
      </footer>
    </div>
  )
}
