export type CashDrawerProvider = "browser" | "desktop_helper" | "disabled"

export type OpenDrawerReason = "cash_deposit" | "cash_withdrawal" | "change" | "cash_review" | "other"

export interface OpenCashDrawerInput {
  storeId: string
  userId: string
  saleId?: string
  reason?: OpenDrawerReason
  reasonText?: string
  provider: CashDrawerProvider
}

export interface OpenCashDrawerResult {
  success: boolean
  status: "unavailable" | "blocked" | "opened" | "failed"
  message: string
}

const reasonLabels: Record<OpenDrawerReason, string> = {
  cash_deposit: "إيداع نقدية",
  cash_withdrawal: "سحب نقدية",
  change: "صرف باقي",
  cash_review: "مراجعة الكاش",
  other: "سبب آخر",
}

export function getReasonLabel(reason: OpenDrawerReason): string {
  return reasonLabels[reason]
}

export const OPEN_DRAWER_REASONS: { value: OpenDrawerReason; label: string }[] = [
  { value: "cash_deposit", label: "إيداع نقدية" },
  { value: "cash_withdrawal", label: "سحب نقدية" },
  { value: "change", label: "صرف باقي" },
  { value: "cash_review", label: "مراجعة الكاش" },
  { value: "other", label: "سبب آخر" },
]

/**
 * openCashDrawer
 *
 * Attempts to open the cash drawer based on the configured provider.
 *
 * TODO: Implement ESC/POS communication via Desktop Helper.
 * The desktop helper should:
 *   - Expose a local HTTP endpoint (e.g. http://localhost:5741)
 *   - Accept POST /api/cash-drawer/open with { reason, saleId }
 *   - Send ESC/POS sequence to open the drawer (ESC p 0 50 250)
 *   - Return { success: boolean, message: string }
 *
 * For the "browser" and "disabled" providers, this function
 * always returns unavailable since direct browser access to
 * hardware is not possible without a native helper.
 */
export async function openCashDrawer(input: OpenCashDrawerInput): Promise<OpenCashDrawerResult> {
  const { provider } = input

  if (provider === "disabled") {
    return {
      success: false,
      status: "blocked",
      message: "فتح الخزنة معطل في إعدادات المتجر",
    }
  }

  if (provider === "browser") {
    return {
      success: false,
      status: "unavailable",
      message: "فتح الخزنة من المتصفح غير متاح حاليًا. سيتم دعمه لاحقًا عبر ENJAZ Desktop Helper.",
    }
  }

  // TODO: Implement desktop_helper provider
  // When the desktop helper is ready:
  // 1. POST to http://localhost:5741/api/cash-drawer/open
  //    with { reason, saleId } in the body
  // 2. Send ESC/POS command: ESC p 0 50 250
  // 3. Return the result from the helper
  if (provider === "desktop_helper") {
    return {
      success: false,
      status: "unavailable",
      message: "ENJAZ Desktop Helper غير مثبت. قم بتثبيته لتفعيل فتح الخزنة.",
    }
  }

  return {
    success: false,
    status: "failed",
    message: "مزود الخزنة غير معروف",
  }
}
