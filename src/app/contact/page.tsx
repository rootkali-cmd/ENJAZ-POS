import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تواصل معنا - ENJAZ",
  description: "تواصل مع فريق ENJAZ — نحن هنا لمساعدتك",
}

const CONTACT_METHODS = [
  {
    title: "البريد الإلكتروني",
    value: "support@enjaz.one",
    href: "mailto:support@enjaz.one",
    desc: "للاستفسارات العامة والدعم الفني والاقتراحات. نرد خلال 24 ساعة.",
  },
  {
    title: "تيلجرام",
    value: "@enjaz_support",
    href: "https://t.me/enjaz_support",
    desc: "قناة التحديثات والإعلانات الرسمية.",
  },
  {
    title: "الموقع الإلكتروني",
    value: "enjaz.one",
    href: "https://enjaz.one",
    desc: "جميع المعلومات والتحديثات على موقعنا الرسمي.",
  },
]

const FAQ_CONTACT = [
  { q: "متى ستردون على بريدي الإلكتروني؟", a: "نحن نسعى للرد على جميع الاستفسارات خلال 24 ساعة عمل. في أوقات الذروة، قد يتأخر الرد قليلاً لكننا نحرص على التواصل مع الجميع." },
  { q: "هل يوجد دعم هاتفي؟", a: "حالياً الدعم عبر البريد الإلكتروني فقط. في المستقبل القريب سنضيف دعم مباشر (Live Chat) داخل التطبيق ودعم هاتفي." },
  { q: "كيف أبلغ عن مشكلة تقنية؟", a: "أرسل لنا وصفاً مفصلاً للمشكلة مع صورة توضيحية (screenshot) إن أمكن على support@enjaz.one. فريق التقنية سيتولى المتابعة فوراً." },
  { q: "هل تقبلون اقتراحات التطوير؟", a: "بالتأكيد! اقتراحاتكم هي ما يبني ENJAZ. أرسل اقتراحك على support@enjaz.one ونحن نقرأ كل رسالة." },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">ENJAZ</Link>
          <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">الرئيسية</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">تواصل معنا</h1>
          <p className="text-sm text-muted max-w-xl mx-auto">
            فريق ENJAZ دائماً هنا لمساعدتك. لأي استفسار، اقتراح، أو مشكلة — لا تتردد في التواصل.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {CONTACT_METHODS.map((method, i) => (
            <a
              key={i}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group border border-border rounded-xl p-5 hover:border-primary/30 transition-colors block"
            >
              <h3 className="text-sm font-semibold mb-1">{method.title}</h3>
              <p className="text-sm text-primary font-medium mb-1.5 group-hover:underline">{method.value}</p>
              <p className="text-xs text-muted">{method.desc}</p>
            </a>
          ))}
        </div>

        <div className="border border-border rounded-xl p-6 mb-12">
          <h2 className="text-sm font-semibold mb-4">أسئلة شائعة عن التواصل</h2>
          <div className="space-y-3">
            {FAQ_CONTACT.map((item, i) => (
              <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                <p className="text-xs font-semibold mb-1">{item.q}</p>
                <p className="text-xs text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-3">أرسل رسالة مباشرة</h2>
          <p className="text-xs text-muted mb-4">
            يمكنك التواصل معنا مباشرة عبر البريد الإلكتروني. نعدك بالرد في أقرب وقت ممكن.
          </p>
          <a
            href="mailto:support@enjaz.one"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            راسلنا على support@enjaz.one
          </a>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <div className="max-w-4xl mx-auto px-4">© {new Date().getFullYear()} ENJAZ. كل الحقوق محفوظة.</div>
      </footer>
    </div>
  )
}
