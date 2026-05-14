import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">الصفحة غير موجودة</h2>
        <p className="text-gray-500 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <Link
          href="/api/auth/redirect"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          العودة للصفحة المناسبة
        </Link>
      </div>
    </div>
  )
}
