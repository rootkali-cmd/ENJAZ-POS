import { prisma } from "@/lib/prisma"

export interface AgentDashboardData {
  generatedAt: string
  overallStatus: "good" | "warning" | "critical"
  metrics: {
    key: string
    label: string
    value: string
    trend: "up" | "down" | "neutral"
    description: string
  }[]
  insights: {
    id: string
    type: "sales" | "inventory" | "customers" | "employees" | "expenses" | "returns" | "operations"
    title: string
    severity: "high" | "medium" | "low"
    description: string
    recommendedAction: string
  }[]
  tasks: {
    id: string
    title: string
    priority: "high" | "medium" | "low"
    description: string
    actionType: "view_details" | "prepare_message" | "review_products" | "create_campaign_draft" | "view_report"
    cta: string
  }[]
  activity: {
    title: string
    type: "summary" | "warning" | "suggestion" | "analysis"
    timestampLabel: string
  }[]
}

export async function buildStoreContext(storeId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const [todaySales, yesterdaySales, weeklySales, lowStock, stagnant, inactiveCustomers, totalProducts, expenses] = await Promise.all([
    prisma.sale.aggregate({ where: { storeId, createdAt: { gte: today }, status: "completed" }, _sum: { total: true, profit: true }, _count: true }),
    prisma.sale.aggregate({ where: { storeId, createdAt: { gte: yesterday, lt: today }, status: "completed" }, _sum: { total: true } }),
    prisma.sale.aggregate({ where: { storeId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) }, status: "completed" }, _sum: { total: true } }),
    prisma.product.count({ where: { storeId, isActive: true, quantity: { lte: prisma.product.fields.lowStockThreshold } } }),
    prisma.product.count({ where: { storeId, isActive: true, saleItems: { none: { sale: { createdAt: { gte: new Date(Date.now() - 90 * 86400000) } } } } } }),
    prisma.customer.count({ where: { storeId, lastPurchaseAt: { lt: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.product.count({ where: { storeId, isActive: true } }),
    prisma.expense.aggregate({ where: { storeId, date: { gte: today } }, _sum: { amount: true } }),
  ])

  return {
    todaySales: todaySales._sum.total || 0,
    todayProfit: todaySales._sum.profit || 0,
    todayTransactions: todaySales._count,
    yesterdaySales: yesterdaySales._sum.total || 0,
    weeklySales: weeklySales._sum.total || 0,
    lowStockCount: lowStock,
    stagnantCount: stagnant,
    inactiveCustomers,
    totalProducts,
    todayExpenses: expenses._sum.amount || 0,
  }
}

export function generateFallbackDashboard(ctx: {
  todaySales: number; todayProfit: number; todayTransactions: number;
  yesterdaySales: number; weeklySales: number; lowStockCount: number;
  stagnantCount: number; inactiveCustomers: number; totalProducts: number;
  todayExpenses: number;
}): AgentDashboardData {
  return {
    generatedAt: new Date().toISOString(),
    overallStatus: "good",
    metrics: [
      { key: "sales_today", label: "مبيعات اليوم", value: `${ctx.todaySales.toLocaleString()} ريال`, trend: ctx.todaySales >= ctx.yesterdaySales ? "up" : "down", description: "إجمالي مبيعات اليوم" },
      { key: "low_stock", label: "مخزون يحتاج متابعة", value: `${ctx.lowStockCount} منتج`, trend: ctx.lowStockCount > 5 ? "down" : "neutral", description: "منتجات وصلت لحد الطلب" },
      { key: "opportunities", label: "فرص إعادة شراء", value: `${ctx.inactiveCustomers} عميل`, trend: ctx.inactiveCustomers > 10 ? "down" : "neutral", description: "عملاء لم يشتروا منذ 30 يوم" },
      { key: "suggestions", label: "اقتراحات اليوم", value: `${Math.max(1, ctx.stagnantCount > 0 ? 3 : 2)}`, trend: "neutral", description: "توصيات ذكية لمتجرك" },
    ],
    insights: [
      ...(ctx.todaySales > 0 ? [{
        id: "sales-1", type: "sales" as const, title: "المبيعات اليومية", severity: "high" as const,
        description: `مبيعات اليوم ${ctx.todaySales.toLocaleString()} ريال${ctx.yesterdaySales > 0 ? ` مقابل ${ctx.yesterdaySales.toLocaleString()} أمس` : ""}.`,
        recommendedAction: "تابع أداء المبيعات وراجع المنتجات الأكثر طلباً.",
      }] : []),
      ...(ctx.lowStockCount > 0 ? [{
        id: "stock-1", type: "inventory" as const, title: "مخزون منخفض", severity: ctx.lowStockCount > 5 ? "high" as const : "medium" as const,
        description: `يوجد ${ctx.lowStockCount} منتج وصل لمخزون منخفض ويحتاج إعادة طلب.`,
        recommendedAction: "راجع المخزون المنخفض واطلب كميات جديدة.",
      }] : []),
      ...(ctx.stagnantCount > 0 ? [{
        id: "stagnant-1", type: "inventory" as const, title: "منتجات راكدة", severity: "medium" as const,
        description: `${ctx.stagnantCount} منتج لم يبع منذ 3 أشهر.`,
        recommendedAction: "فكر في عرض خصم أو تصفية لهذه المنتجات.",
      }] : []),
      ...(ctx.inactiveCustomers > 5 ? [{
        id: "cust-1", type: "customers" as const, title: "عملاء غير نشطين", severity: "medium" as const,
        description: `${ctx.inactiveCustomers} عميل لم يشتروا منذ 30 يوماً.`,
        recommendedAction: "تواصل مع العملاء غير النشطين بعرض خاص.",
      }] : []),
    ],
    tasks: [
      { id: "task-1", title: "تحسين وصف المنتجات", priority: "medium" as const, description: "حسّن وصف المنتجات الأكثر مبيعاً لزيادة التحويل.", actionType: "view_report" as const, cta: "مراجعة" },
      ...(ctx.inactiveCustomers > 5 ? [{ id: "task-2", title: "التواصل مع العملاء غير النشطين", priority: "high" as const, description: `تواصل مع ${ctx.inactiveCustomers} عميل لم يشتروا منذ 30 يوماً.`, actionType: "prepare_message" as const, cta: "تجهيز نص" }] : []),
      ...(ctx.lowStockCount > 0 ? [{ id: "task-3", title: "مراجعة المنتجات منخفضة المخزون", priority: "high" as const, description: `راجع ${ctx.lowStockCount} منتج يحتاج إعادة طلب.`, actionType: "review_products" as const, cta: "مراجعة" }] : []),
      ...(ctx.stagnantCount > 0 ? [{ id: "task-4", title: "إنشاء حملة خصم", priority: "medium" as const, description: "أنشئ حملة خصم للمنتجات الراكدة.", actionType: "create_campaign_draft" as const, cta: "إنشاء" }] : []),
      { id: "task-5", title: "تحليل الإيراد الأسبوعي", priority: "low" as const, description: "تعرف على اتجاهات الإيرادات هذا الأسبوع.", actionType: "view_report" as const, cta: "عرض التقرير" },
    ],
    activity: [
      ...(ctx.todaySales > 0 ? [{ title: "تم توليد ملخص المبيعات اليومي", type: "summary" as const, timestampLabel: "منذ دقائق" }] : []),
      ...(ctx.lowStockCount > 0 ? [{ title: "تم اكتشاف منتجات منخفضة المخزون", type: "warning" as const, timestampLabel: "منذ دقائق" }] : []),
      ...(ctx.inactiveCustomers > 5 ? [{ title: "تم اقتراح رسائل متابعة للعملاء", type: "suggestion" as const, timestampLabel: "منذ ساعة" }] : []),
      ...(ctx.stagnantCount > 0 ? [{ title: "تم اقتراح حملة خصم مستهدفة", type: "suggestion" as const, timestampLabel: "منذ ساعة" }] : []),
      { title: "آخر تحديث للرؤى التشغيلية", type: "analysis" as const, timestampLabel: "الآن" },
    ],
  }
}
