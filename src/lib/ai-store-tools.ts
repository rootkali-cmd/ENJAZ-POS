import { hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoiceNumber } from "@/lib/utils"
import { DEFAULT_PERMISSIONS, MANAGER_PERMISSIONS } from "@/types"
import type { Permission } from "@/types"

type JsonObject = Record<string, unknown>

export type StoreToolResult = {
  success: boolean
  data: unknown
  error?: string
}

type StoreToolAction = (storeId: string, args?: JsonObject) => Promise<StoreToolResult>

type SaleProduct = {
  id: string
  name: string
  price: number
  costPrice: number
  quantity: number
}

type ResolvedSaleItem = {
  product: SaleProduct
  quantity: number
  price: number
  discount: number
}

type StoreTool = {
  type: "function"
  function: {
    name: string
    description: string
    parameters?: JsonObject
  }
}

const roleAliases: Record<string, string> = {
  cashier: "cashier",
  "كاشير": "cashier",
  branch_manager: "branch_manager",
  "مدير فرع": "branch_manager",
  warehouse: "warehouse",
  "مخزن": "warehouse",
  accountant: "accountant",
  "محاسب": "accountant",
  manager: "manager",
  "مدير": "manager",
}

const salaryTypeAliases: Record<string, string> = {
  monthly: "monthly",
  "شهري": "monthly",
  daily: "daily",
  "يومي": "daily",
  hourly: "hourly",
  "بالساعة": "hourly",
}

const paymentMethodAliases: Record<string, string> = {
  cash: "cash",
  "كاش": "cash",
  "نقدي": "cash",
  card: "card",
  "كارت": "card",
  "بطاقة": "card",
  wallet: "wallet",
  "محفظة": "wallet",
  credit: "credit",
  "آجل": "credit",
  "اجل": "credit",
}

const expenseCategoryAliases: Record<string, string> = {
  rent: "rent",
  "إيجار": "rent",
  "ايجار": "rent",
  salaries: "salaries",
  "رواتب": "salaries",
  utilities: "utilities",
  "فواتير": "utilities",
  maintenance: "maintenance",
  "صيانة": "maintenance",
  supplies: "supplies",
  "مستلزمات": "supplies",
  marketing: "marketing",
  "تسويق": "marketing",
  transport: "transport",
  "نقل": "transport",
  other: "other",
  "أخرى": "other",
  "اخرى": "other",
}

const allExceptAdminPermissions: Permission = {
  viewProducts: true,
  editProducts: true,
  deleteProducts: false,
  sell: true,
  discounts: true,
  returns: true,
  viewInvoices: true,
  cancelInvoices: false,
  manageInventory: true,
  manageCustomers: true,
  manageSuppliers: true,
  manageEmployees: false,
  viewReports: true,
  viewProfit: true,
  manageSalaries: false,
  storeSettings: false,
  useAI: false,
  accessProtected: false,
  openCashDrawer: false,
  viewDevices: true,
  manageDevices: false,
  testDevices: false,
  analyzeDevicesWithAI: false,
  printReceipts: true,
  configureDeviceHelper: false,
}

const ok = (data: unknown): StoreToolResult => ({ success: true, data })
const fail = (error: string, data: unknown = null): StoreToolResult => ({ success: false, data, error })

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return undefined
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "yes", "1", "نعم", "اه", "ايوه"].includes(normalized)) return true
    if (["false", "no", "0", "لا"].includes(normalized)) return false
  }
  return undefined
}

function asObject(value: unknown): JsonObject | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as JsonObject
  return undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asNumber(value: unknown, min = 0): number | undefined {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""))
  if (!Number.isFinite(parsed) || parsed < min) return undefined
  return parsed
}

function asInteger(value: unknown, min = 0): number | undefined {
  const parsed = typeof value === "number" ? value : parseInt(String(value ?? ""), 10)
  if (!Number.isInteger(parsed) || parsed < min) return undefined
  return parsed
}

function clampTake(value: unknown, fallback = 20, max = 50): number {
  const parsed = asInteger(value, 1) ?? fallback
  return Math.min(parsed, max)
}

function normalizeRole(value: unknown): string {
  const role = asString(value)
  return role ? roleAliases[role] || "cashier" : "cashier"
}

function normalizeSalaryType(value: unknown): string {
  const salaryType = asString(value)
  return salaryType ? salaryTypeAliases[salaryType] || "monthly" : "monthly"
}

function normalizePaymentMethod(value: unknown): string {
  const method = asString(value)
  return method ? paymentMethodAliases[method] || "cash" : "cash"
}

function normalizeExpenseCategory(value: unknown): string {
  const category = asString(value)
  return category ? expenseCategoryAliases[category] || category : "other"
}

function normalizeDate(value: unknown): Date {
  const raw = asString(value)
  if (!raw) return new Date()

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function buildEmployeePermissions(args: JsonObject, role: string): Permission {
  const permissionsText = asString(args.permissions)
  const inferredPreset = permissionsText && (
    (permissionsText.includes("كل") && (permissionsText.includes("ادمن") || permissionsText.includes("أدمن"))) ||
    permissionsText.toLowerCase().includes("all_except_admin")
  )
    ? "all_except_admin"
    : undefined
  const preset = asString(args.permissionPreset) || asString(args.permissionsPreset) || inferredPreset
  const rawPermissions = asObject(args.permissions)
  const base =
    preset === "all_except_admin" || preset === "كل الصلاحيات ماعدا الادمن"
      ? allExceptAdminPermissions
      : preset === "manager" || role === "manager" || role === "branch_manager"
        ? MANAGER_PERMISSIONS
        : DEFAULT_PERMISSIONS

  const permissions: Permission = { ...base }

  for (const key of Object.keys(permissions) as (keyof Permission)[]) {
    const directValue = asBoolean(args[key])
    const nestedValue = rawPermissions ? asBoolean(rawPermissions[key]) : undefined
    const value = nestedValue ?? directValue
    if (value !== undefined) permissions[key] = value
  }

  const canGiveDiscount = asBoolean(args.canGiveDiscount)
  const canProcessReturns = asBoolean(args.canProcessReturns)
  const canAccessProtected = asBoolean(args.canAccessProtected)

  if (canGiveDiscount !== undefined) permissions.discounts = canGiveDiscount
  if (canProcessReturns !== undefined) permissions.returns = canProcessReturns
  if (canAccessProtected !== undefined) permissions.accessProtected = canAccessProtected

  return permissions
}

async function logAiAction(storeId: string, action: string, entity: string, entityId: string, details: unknown) {
  try {
    await prisma.auditLog.create({
      data: {
        storeId,
        action,
        entity,
        entityId,
        details: JSON.stringify(details),
        userType: "ai-agent",
      },
    })
  } catch (error) {
    console.error("[AI][audit]", error)
  }
}

async function findCategoryId(storeId: string, args: JsonObject): Promise<string | null> {
  const categoryId = asString(args.categoryId)
  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, storeId } })
    return category?.id || null
  }

  const categoryName = asString(args.categoryName) || asString(args.category)
  if (!categoryName) return null

  const existing = await prisma.category.findFirst({
    where: { storeId, name: { equals: categoryName, mode: "insensitive" } },
  })
  const category = existing || await prisma.category.create({ data: { storeId, name: categoryName } })

  return category.id
}

async function findSupplierId(storeId: string, args: JsonObject): Promise<string | null> {
  const supplierId = asString(args.supplierId)
  if (supplierId) {
    const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, storeId } })
    return supplier?.id || null
  }

  const supplierName = asString(args.supplierName) || asString(args.supplier)
  if (!supplierName) return null

  const supplier = await prisma.supplier.findFirst({
    where: { storeId, name: { equals: supplierName, mode: "insensitive" } },
  })
  if (supplier) return supplier.id

  const created = await prisma.supplier.create({ data: { storeId, name: supplierName } })
  await logAiAction(storeId, "ai_create_supplier_from_product", "supplier", created.id, { name: supplierName })
  return created.id
}

async function resolveProduct(storeId: string, args: JsonObject) {
  const productId = asString(args.productId) || asString(args.id)
  if (productId) {
    const product = await prisma.product.findFirst({ where: { id: productId, storeId, isActive: true } })
    if (!product) return { product: null, result: fail("المنتج غير موجود داخل هذا المتجر") }
    return { product, result: null }
  }

  const barcode = asString(args.barcode)
  const sku = asString(args.sku)
  const name = asString(args.productName) || asString(args.name) || asString(args.query)

  if (!barcode && !sku && !name) {
    return { product: null, result: fail("يجب تحديد المنتج بالاسم أو الكود أو الباركود أو المعرف") }
  }

  const products = await prisma.product.findMany({
    where: {
      storeId,
      isActive: true,
      OR: [
        ...(barcode ? [{ barcodes: { some: { barcode } } }] : []),
        ...(sku ? [{ sku: { equals: sku, mode: "insensitive" as const } }] : []),
        ...(name ? [{ name: { contains: name, mode: "insensitive" as const } }] : []),
      ],
    },
    include: { barcodes: true },
    take: 6,
  })

  if (products.length === 0) return { product: null, result: fail("المنتج غير موجود") }

  const exact = name
    ? products.filter((product) => product.name.toLowerCase() === name.toLowerCase())
    : products
  const candidates = exact.length === 1 ? exact : products

  if (candidates.length > 1) {
    return {
      product: null,
      result: fail("وجدت أكثر من منتج مطابق. حدد المنتج بدقة أكبر.", candidates.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        price: product.price,
      }))),
    }
  }

  return { product: candidates[0], result: null }
}

async function resolveCustomer(storeId: string, args: JsonObject) {
  const customerId = asString(args.customerId) || asString(args.id)
  if (customerId) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId } })
    if (!customer) return { customer: null, result: fail("العميل غير موجود داخل هذا المتجر") }
    return { customer, result: null }
  }

  const phone = asString(args.phone) || asString(args.customerPhone)
  const name = asString(args.customerName) || asString(args.name) || asString(args.query)
  if (!phone && !name) return { customer: null, result: fail("يجب تحديد العميل بالاسم أو الهاتف أو المعرف") }

  const customers = await prisma.customer.findMany({
    where: {
      storeId,
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(name ? [{ name: { contains: name, mode: "insensitive" as const } }] : []),
      ],
    },
    take: 6,
  })

  if (customers.length === 0) return { customer: null, result: fail("العميل غير موجود") }
  if (customers.length > 1) {
    return {
      customer: null,
      result: fail("وجدت أكثر من عميل مطابق. حدد العميل بدقة أكبر.", customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      }))),
    }
  }

  return { customer: customers[0], result: null }
}

async function resolveSupplier(storeId: string, args: JsonObject) {
  const supplierId = asString(args.supplierId) || asString(args.id)
  if (supplierId) {
    const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, storeId } })
    if (!supplier) return { supplier: null, result: fail("المورد غير موجود داخل هذا المتجر") }
    return { supplier, result: null }
  }

  const phone = asString(args.phone) || asString(args.supplierPhone)
  const name = asString(args.supplierName) || asString(args.name) || asString(args.query)
  if (!phone && !name) return { supplier: null, result: fail("يجب تحديد المورد بالاسم أو الهاتف أو المعرف") }

  const suppliers = await prisma.supplier.findMany({
    where: {
      storeId,
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(name ? [{ name: { contains: name, mode: "insensitive" as const } }] : []),
      ],
    },
    take: 6,
  })

  if (suppliers.length === 0) return { supplier: null, result: fail("المورد غير موجود") }
  if (suppliers.length > 1) {
    return {
      supplier: null,
      result: fail("وجدت أكثر من مورد مطابق. حدد المورد بدقة أكبر.", suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
      }))),
    }
  }

  return { supplier: suppliers[0], result: null }
}

async function resolveExpense(storeId: string, args: JsonObject) {
  const expenseId = asString(args.expenseId) || asString(args.id)
  if (expenseId) {
    const expense = await prisma.expense.findFirst({ where: { id: expenseId, storeId } })
    if (!expense) return { expense: null, result: fail("المصروف غير موجود داخل هذا المتجر") }
    return { expense, result: null }
  }

  return { expense: null, result: fail("يجب تحديد المصروف بالمعرف") }
}

async function resolveSale(storeId: string, args: JsonObject) {
  const saleId = asString(args.saleId) || asString(args.id)
  const invoiceNumber = asString(args.invoiceNumber)
  let sale = null

  if (saleId) {
    sale = await prisma.sale.findFirst({ where: { id: saleId, storeId } })
  }
  if (!sale && invoiceNumber) {
    sale = await prisma.sale.findFirst({ where: { invoiceNumber, storeId } })
  }

  if (!sale) return { sale: null, result: fail("الفاتورة غير موجودة داخل هذا المتجر") }
  return { sale, result: null }
}

async function resolveEmployee(storeId: string, args: JsonObject) {
  const employeeId = asString(args.employeeId) || asString(args.id)
  if (employeeId) {
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, storeId, isActive: true } })
    if (!employee) return { employee: null, result: fail("الموظف غير موجود داخل هذا المتجر") }
    return { employee, result: null }
  }

  const phone = asString(args.phone) || asString(args.employeePhone)
  const name = asString(args.employeeName) || asString(args.name) || asString(args.query)
  if (!phone && !name) return { employee: null, result: fail("يجب تحديد الموظف بالاسم أو الهاتف أو المعرف") }

  const employees = await prisma.employee.findMany({
    where: {
      storeId,
      isActive: true,
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(name ? [{ name: { contains: name, mode: "insensitive" as const } }] : []),
      ],
    },
    take: 6,
  })

  if (employees.length === 0) return { employee: null, result: fail("الموظف غير موجود") }
  if (employees.length > 1) {
    return {
      employee: null,
      result: fail("وجدت أكثر من موظف مطابق. حدد الموظف بدقة أكبر.", employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
      }))),
    }
  }

  return { employee: employees[0], result: null }
}

const stringField = (description: string) => ({ type: "string", description })
const numberField = (description: string) => ({ type: "number", description })
const booleanField = (description: string) => ({ type: "boolean", description })

export const STORE_TOOLS: StoreTool[] = [
  { type: "function", function: { name: "get_store_overview", description: "Get safe store-level operational counts and dashboard summary." } },
  { type: "function", function: { name: "get_today_sales", description: "Get today's total sales, profit, and transaction count." } },
  { type: "function", function: { name: "get_weekly_summary", description: "Get sales, profit, and transaction count for the last 7 days." } },
  { type: "function", function: { name: "get_payment_methods_breakdown", description: "Get payments breakdown by payment method." } },
  { type: "function", function: { name: "get_recent_sales", description: "Get recent invoices and their basic details.", parameters: { type: "object", properties: { limit: numberField("Maximum invoices to return.") } } } },
  { type: "function", function: { name: "get_all_products", description: "Get all active products with price, cost, stock, and SKU." } },
  { type: "function", function: { name: "search_products", description: "Search products by name, SKU, or barcode before editing or selling.", parameters: { type: "object", properties: { query: stringField("Product name, SKU, or barcode."), limit: numberField("Maximum results.") } } } },
  { type: "function", function: { name: "get_low_stock_products", description: "Get low-stock and out-of-stock products." } },
  { type: "function", function: { name: "get_top_products", description: "Get the best-selling products." } },
  { type: "function", function: { name: "get_slow_products", description: "Get active products with no sales in the last 3 months." } },
  { type: "function", function: { name: "search_customers", description: "Search customers by name or phone.", parameters: { type: "object", properties: { query: stringField("Customer name or phone."), limit: numberField("Maximum results.") } } } },
  { type: "function", function: { name: "get_customer_insights", description: "Get top customers by total purchases." } },
  { type: "function", function: { name: "search_suppliers", description: "Search suppliers by name or phone.", parameters: { type: "object", properties: { query: stringField("Supplier name or phone."), limit: numberField("Maximum results.") } } } },
  { type: "function", function: { name: "search_employees", description: "Search active employees by name or phone.", parameters: { type: "object", properties: { query: stringField("Employee name or phone."), limit: numberField("Maximum results.") } } } },
  { type: "function", function: { name: "get_employee_performance", description: "Get employee sales performance data." } },
  { type: "function", function: { name: "get_expenses_summary", description: "Get total expenses and breakdown by category." } },
  {
    type: "function",
    function: {
      name: "create_employee",
      description: "Create a real employee in the current store. Use only after the owner explicitly asks to add an employee.",
      parameters: {
        type: "object",
        properties: {
          name: stringField("Employee name."),
          phone: stringField("Phone number as text."),
          email: stringField("Email address."),
          role: stringField("cashier, branch_manager, warehouse, accountant, manager, or Arabic role name."),
          salary: numberField("Salary amount."),
          salaryType: stringField("monthly, daily, or hourly."),
          password: stringField("Optional employee password."),
          permissionPreset: stringField("default, manager, all_except_admin."),
          canGiveDiscount: booleanField("Allow discounts."),
          canProcessReturns: booleanField("Allow returns."),
          canAccessProtected: booleanField("Allow protected actions. Keep false unless explicitly requested."),
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_employee",
      description: "Update a real employee in the current store. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          employeeId: stringField("Employee ID."),
          employeeName: stringField("Employee name if ID is unknown."),
          phone: stringField("Existing employee phone, or new phone when employeeId is provided."),
          role: stringField("New role."),
          salary: numberField("New salary."),
          salaryType: stringField("monthly, daily, or hourly."),
          isActive: booleanField("Whether the employee remains active."),
          permissionPreset: stringField("default, manager, all_except_admin."),
          canGiveDiscount: booleanField("Allow discounts."),
          canProcessReturns: booleanField("Allow returns."),
          canAccessProtected: booleanField("Allow protected actions."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_employee",
      description: "Deactivate a real employee in the current store. Use only after an explicit owner request to delete/remove an employee.",
      parameters: {
        type: "object",
        properties: {
          employeeId: stringField("Employee ID."),
          employeeName: stringField("Employee name if ID is unknown."),
          phone: stringField("Employee phone if ID is unknown."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description: "Create a real product in the current store.",
      parameters: {
        type: "object",
        properties: {
          name: stringField("Product name."),
          sku: stringField("SKU."),
          price: numberField("Selling price."),
          costPrice: numberField("Cost price."),
          quantity: numberField("Initial stock quantity."),
          lowStockThreshold: numberField("Low stock threshold."),
          categoryName: stringField("Category name."),
          supplierName: stringField("Supplier name."),
          description: stringField("Product description."),
          barcodes: { type: "array", items: { type: "string" }, description: "Product barcodes." },
        },
        required: ["name", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product_details",
      description: "Update product info except price and stock. Use update_product_price/update_product_stock for those.",
      parameters: {
        type: "object",
        properties: {
          productId: stringField("Product ID."),
          productName: stringField("Product name if ID is unknown."),
          sku: stringField("New SKU."),
          name: stringField("New product name."),
          costPrice: numberField("New cost price."),
          lowStockThreshold: numberField("New low stock threshold."),
          categoryName: stringField("New category name."),
          supplierName: stringField("New supplier name."),
          description: stringField("New description."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product_price",
      description: "Update a product's selling price. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          productId: stringField("Product ID."),
          productName: stringField("Product name if ID is unknown."),
          sku: stringField("Product SKU if ID is unknown."),
          barcode: stringField("Product barcode if ID is unknown."),
          price: numberField("New selling price."),
        },
        required: ["price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product_stock",
      description: "Update a product's stock quantity. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          productId: stringField("Product ID."),
          productName: stringField("Product name if ID is unknown."),
          sku: stringField("Product SKU if ID is unknown."),
          barcode: stringField("Product barcode if ID is unknown."),
          quantity: numberField("New stock quantity."),
        },
        required: ["quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_customer",
      description: "Create a real customer in the current store.",
      parameters: {
        type: "object",
        properties: {
          name: stringField("Customer name."),
          phone: stringField("Phone number as text."),
          address: stringField("Address."),
          notes: stringField("Notes."),
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_customer",
      description: "Update a customer in the current store.",
      parameters: {
        type: "object",
        properties: {
          customerId: stringField("Customer ID."),
          customerName: stringField("Customer name if ID is unknown."),
          phone: stringField("Phone."),
          address: stringField("Address."),
          notes: stringField("Notes."),
          name: stringField("New customer name."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_supplier",
      description: "Create a real supplier in the current store.",
      parameters: {
        type: "object",
        properties: {
          name: stringField("Supplier name."),
          phone: stringField("Phone number as text."),
          notes: stringField("Notes."),
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_supplier",
      description: "Update a supplier in the current store.",
      parameters: {
        type: "object",
        properties: {
          supplierId: stringField("Supplier ID."),
          supplierName: stringField("Supplier name if ID is unknown."),
          phone: stringField("Phone."),
          notes: stringField("Notes."),
          name: stringField("New supplier name."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_supplier",
      description: "Delete a real supplier in the current store and unlink its products. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          supplierId: stringField("Supplier ID."),
          supplierName: stringField("Supplier name if ID is unknown."),
          phone: stringField("Supplier phone if ID is unknown."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_customer",
      description: "Delete a real customer in the current store. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          customerId: stringField("Customer ID."),
          customerName: stringField("Customer name if ID is unknown."),
          phone: stringField("Customer phone if ID is unknown."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Deactivate a product in the current store. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          productId: stringField("Product ID."),
          productName: stringField("Product name if ID is unknown."),
          sku: stringField("Product SKU if ID is unknown."),
          barcode: stringField("Product barcode if ID is unknown."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_expense",
      description: "Update an expense in the current store.",
      parameters: {
        type: "object",
        properties: {
          expenseId: stringField("Expense ID."),
          category: stringField("Expense category."),
          amount: numberField("Expense amount."),
          description: stringField("Description."),
          date: stringField("Expense date in ISO format or YYYY-MM-DD."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_expense",
      description: "Delete an expense in the current store.",
      parameters: {
        type: "object",
        properties: {
          expenseId: stringField("Expense ID."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_sale",
      description: "Cancel a completed sale and restore inventory. Use only after an explicit owner request.",
      parameters: {
        type: "object",
        properties: {
          saleId: stringField("Sale ID."),
          invoiceNumber: stringField("Sale invoice number if ID is unknown."),
          reason: stringField("Cancellation reason."),
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_expense",
      description: "Create a real expense in the current store.",
      parameters: {
        type: "object",
        properties: {
          category: stringField("rent, salaries, utilities, maintenance, supplies, marketing, transport, other, or Arabic category."),
          amount: numberField("Expense amount."),
          description: stringField("Description."),
          date: stringField("Expense date in ISO format or YYYY-MM-DD."),
        },
        required: ["category", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_sale",
      description: "Create a real completed sale and decrease stock. Use only after an explicit owner request to make an invoice/sale with exact items.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Sale items. Each item needs productId or productName/SKU/barcode and quantity.",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                productName: { type: "string" },
                sku: { type: "string" },
                barcode: { type: "string" },
                quantity: { type: "number" },
                price: { type: "number" },
                discount: { type: "number" },
              },
            },
          },
          paymentMethod: stringField("cash, card, wallet, or credit."),
          payments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                method: { type: "string" },
                amount: { type: "number" },
                reference: { type: "string" },
              },
            },
          },
          discount: numberField("Invoice discount."),
          discountType: stringField("fixed or percentage."),
          customerName: stringField("Customer name."),
          customerPhone: stringField("Customer phone."),
          employeeName: stringField("Employee name."),
          notes: stringField("Invoice notes."),
        },
        required: ["items"],
      },
    },
  },
]

export const storeActions: Record<string, StoreToolAction> = {
  get_store_overview: async (storeId) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [products, customers, suppliers, employees, todaySales, lowStockCount, expenses] = await Promise.all([
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.customer.count({ where: { storeId } }),
      prisma.supplier.count({ where: { storeId } }),
      prisma.employee.count({ where: { storeId, isActive: true } }),
      prisma.sale.aggregate({ where: { storeId, createdAt: { gte: today }, status: "completed" }, _sum: { total: true, profit: true }, _count: true }),
      prisma.product.count({ where: { storeId, isActive: true, quantity: { lte: prisma.product.fields.lowStockThreshold } } }),
      prisma.expense.aggregate({ where: { storeId, date: { gte: today } }, _sum: { amount: true }, _count: true }),
    ])

    return ok({
      products,
      customers,
      suppliers,
      employees,
      todaySales: todaySales._sum.total || 0,
      todayProfit: todaySales._sum.profit || 0,
      todayTransactions: todaySales._count,
      lowStockCount,
      todayExpenses: expenses._sum.amount || 0,
      todayExpensesCount: expenses._count,
    })
  },

  get_today_sales: async (storeId) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sales = await prisma.sale.aggregate({
      where: { storeId, createdAt: { gte: today }, status: "completed" },
      _sum: { total: true, profit: true },
      _count: true,
    })
    return ok({ totalSales: sales._sum.total || 0, totalProfit: sales._sum.profit || 0, transactions: sales._count })
  },

  get_weekly_summary: async (storeId) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [weekly, todaySales] = await Promise.all([
      prisma.sale.aggregate({ where: { storeId, createdAt: { gte: weekAgo }, status: "completed" }, _sum: { total: true, profit: true }, _count: true }),
      prisma.sale.aggregate({ where: { storeId, createdAt: { gte: today }, status: "completed" }, _sum: { total: true } }),
    ])
    return ok({ weeklyTotal: weekly._sum.total || 0, weeklyProfit: weekly._sum.profit || 0, weeklyTransactions: weekly._count, todaySales: todaySales._sum.total || 0 })
  },

  get_payment_methods_breakdown: async (storeId) => {
    const payments = await prisma.payment.findMany({ where: { sale: { storeId } }, select: { method: true, amount: true } })
    const breakdown: Record<string, number> = {}
    payments.forEach((payment) => {
      breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount
    })
    return ok(breakdown)
  },

  get_recent_sales: async (storeId, args = {}) => {
    const sales = await prisma.sale.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: clampTake(args.limit, 10, 30),
      include: {
        customer: { select: { id: true, name: true } },
        employee: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        payments: true,
      },
    })
    return ok(sales)
  },

  get_all_products: async (storeId) => {
    const products = await prisma.product.findMany({
      where: { storeId, isActive: true },
      select: { id: true, name: true, sku: true, price: true, costPrice: true, quantity: true, lowStockThreshold: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    })
    return ok(products)
  },

  search_products: async (storeId, args = {}) => {
    const query = asString(args.query) || ""
    const products = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { barcodes: { some: { barcode: { contains: query, mode: "insensitive" } } } },
          ],
        } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        barcodes: { select: { barcode: true, isPrimary: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: clampTake(args.limit),
    })
    return ok(products)
  },

  get_low_stock_products: async (storeId) => {
    const products = await prisma.product.findMany({
      where: { storeId, isActive: true, quantity: { lte: prisma.product.fields.lowStockThreshold } },
      select: { id: true, name: true, quantity: true, lowStockThreshold: true, price: true, sku: true },
      orderBy: { quantity: "asc" },
    })
    return ok(products)
  },

  get_top_products: async (storeId) => {
    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
      where: { sale: { storeId, status: "completed" } },
    })
    if (items.length === 0) return ok([])

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((item) => item.productId) }, storeId },
      select: { id: true, name: true, price: true },
    })
    const productMap = new Map(products.map((product) => [product.id, product]))
    return ok(items.map((item) => ({
      id: item.productId,
      name: productMap.get(item.productId)?.name || "Unknown",
      totalSold: item._sum.quantity || 0,
      totalRevenue: item._sum.total || 0,
      price: productMap.get(item.productId)?.price || 0,
    })))
  },

  get_slow_products: async (storeId) => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const products = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        saleItems: { none: { sale: { createdAt: { gte: threeMonthsAgo } } } },
      },
      select: { id: true, name: true, quantity: true, price: true, costPrice: true, sku: true },
    })
    return ok(products)
  },

  search_customers: async (storeId, args = {}) => {
    const query = asString(args.query) || ""
    const customers = await prisma.customer.findMany({
      where: {
        storeId,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { totalPurchases: "desc" },
      take: clampTake(args.limit),
    })
    return ok(customers)
  },

  get_customer_insights: async (storeId) => {
    const customers = await prisma.customer.findMany({
      where: { storeId },
      orderBy: { totalPurchases: "desc" },
      take: 10,
      select: { id: true, name: true, phone: true, totalPurchases: true, creditAmount: true, lastPurchaseAt: true },
    })
    return ok(customers)
  },

  search_suppliers: async (storeId, args = {}) => {
    const query = asString(args.query) || ""
    const suppliers = await prisma.supplier.findMany({
      where: {
        storeId,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      take: clampTake(args.limit),
    })
    return ok(suppliers)
  },

  search_employees: async (storeId, args = {}) => {
    const query = asString(args.query) || ""
    const employees = await prisma.employee.findMany({
      where: {
        storeId,
        isActive: true,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        } : {}),
      },
      select: { id: true, name: true, phone: true, email: true, role: true, salary: true, salaryType: true, canGiveDiscount: true, canProcessReturns: true, canAccessProtected: true, permissions: true },
      orderBy: { name: "asc" },
      take: clampTake(args.limit),
    })
    return ok(employees)
  },

  get_employee_performance: async (storeId) => {
    const employees = await prisma.employee.findMany({
      where: { storeId, isActive: true },
      include: { _count: { select: { sales: true } }, sales: { select: { total: true, profit: true } } },
    })
    return ok(employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      totalSales: employee.sales.reduce((sum, sale) => sum + sale.total, 0),
      totalProfit: employee.sales.reduce((sum, sale) => sum + sale.profit, 0),
      transactions: employee._count.sales,
    })))
  },

  get_expenses_summary: async (storeId) => {
    const expenses = await prisma.expense.findMany({ where: { storeId } })
    const byCategory: Record<string, number> = {}
    expenses.forEach((expense) => {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount
    })
    return ok({ total: expenses.reduce((sum, expense) => sum + expense.amount, 0), byCategory, count: expenses.length })
  },

  create_employee: async (storeId, args = {}) => {
    const name = asString(args.name)
    if (!name) return fail("اسم الموظف مطلوب")

    const phone = asString(args.phone)
    if (phone) {
      const existing = await prisma.employee.findFirst({ where: { storeId, isActive: true, phone } })
      if (existing) return fail("يوجد موظف نشط بنفس رقم الهاتف.", { id: existing.id, name: existing.name, phone: existing.phone })
    }

    const role = normalizeRole(args.role)
    const permissions = buildEmployeePermissions(args, role)
    const salary = asNumber(args.salary) ?? 0
    const password = asString(args.password)

    const employee = await prisma.employee.create({
      data: {
        storeId,
        name,
        phone,
        email: asString(args.email),
        role,
        salary,
        salaryType: normalizeSalaryType(args.salaryType),
        password: password ? await hashPassword(password) : null,
        canGiveDiscount: permissions.discounts,
        canProcessReturns: permissions.returns,
        canAccessProtected: permissions.accessProtected,
        permissions: JSON.stringify(permissions),
      },
      select: { id: true, name: true, phone: true, email: true, role: true, salary: true, salaryType: true, canGiveDiscount: true, canProcessReturns: true, canAccessProtected: true, permissions: true },
    })

    await logAiAction(storeId, "ai_create_employee", "employee", employee.id, { name, phone, role })
    return ok({ employee, performance: { totalSales: 0, totalProfit: 0, transactions: 0 } })
  },

  update_employee: async (storeId, args = {}) => {
    const resolved = await resolveEmployee(storeId, args)
    if (resolved.result || !resolved.employee) return resolved.result || fail("الموظف غير موجود")

    const updateData: JsonObject = {}
    const name = asString(args.newName) || asString(args.name)
    const phone = asString(args.newPhone) || (asString(args.employeeId) ? asString(args.phone) : undefined)
    const email = asString(args.email)
    const salary = args.salary !== undefined ? asNumber(args.salary) : undefined
    const isActive = asBoolean(args.isActive)

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (args.role !== undefined) updateData.role = normalizeRole(args.role)
    if (salary !== undefined) updateData.salary = salary
    if (args.salaryType !== undefined) updateData.salaryType = normalizeSalaryType(args.salaryType)
    if (isActive !== undefined) updateData.isActive = isActive

    if (args.permissionPreset !== undefined || args.permissions !== undefined || args.canGiveDiscount !== undefined || args.canProcessReturns !== undefined || args.canAccessProtected !== undefined) {
      const role = typeof updateData.role === "string" ? updateData.role : resolved.employee.role
      const permissions = buildEmployeePermissions(args, role)
      updateData.canGiveDiscount = permissions.discounts
      updateData.canProcessReturns = permissions.returns
      updateData.canAccessProtected = permissions.accessProtected
      updateData.permissions = JSON.stringify(permissions)
    }

    if (Object.keys(updateData).length === 0) return fail("لا توجد بيانات لتحديث الموظف")

    const employee = await prisma.employee.update({
      where: { id: resolved.employee.id },
      data: updateData,
      select: { id: true, name: true, phone: true, email: true, role: true, salary: true, salaryType: true, canGiveDiscount: true, canProcessReturns: true, canAccessProtected: true, permissions: true },
    })

    await logAiAction(storeId, "ai_update_employee", "employee", employee.id, updateData)
    return ok({ before: resolved.employee, employee })
  },

  delete_employee: async (storeId, args = {}) => {
    const resolved = await resolveEmployee(storeId, args)
    if (resolved.result || !resolved.employee) return resolved.result || fail("الموظف غير موجود")

    const employee = await prisma.employee.update({
      where: { id: resolved.employee.id },
      data: { isActive: false },
      select: { id: true, name: true, phone: true, role: true, isActive: true },
    })

    await logAiAction(storeId, "ai_delete_employee", "employee", employee.id, { name: employee.name })
    return ok({ employee, deleted: true })
  },

  create_product: async (storeId, args = {}) => {
    const name = asString(args.name)
    const price = asNumber(args.price)
    if (!name) return fail("اسم المنتج مطلوب")
    if (price === undefined) return fail("سعر البيع مطلوب ويجب أن يكون رقم صحيح")

    const quantity = asInteger(args.quantity) ?? 0
    const categoryId = await findCategoryId(storeId, args)
    const supplierId = await findSupplierId(storeId, args)
    const barcodeValues = asArray(args.barcodes).map(asString).filter((value): value is string => Boolean(value))

    const product = await prisma.product.create({
      data: {
        storeId,
        name,
        sku: asString(args.sku) || `SKU-${generateInvoiceNumber().slice(0, 10)}`,
        price,
        costPrice: asNumber(args.costPrice) ?? 0,
        quantity,
        lowStockThreshold: asInteger(args.lowStockThreshold) ?? 5,
        categoryId,
        supplierId,
        description: asString(args.description),
        barcodes: barcodeValues.length
          ? { create: barcodeValues.map((barcode, index) => ({ barcode, isPrimary: index === 0 })) }
          : undefined,
      },
      include: { category: true, supplier: true, barcodes: true },
    })

    await prisma.inventoryMovement.create({
      data: { productId: product.id, type: "in", quantity, notes: "إضافة منتج جديد عن طريق AI Agent" },
    })
    await logAiAction(storeId, "ai_create_product", "product", product.id, { name, price, quantity })
    return ok(product)
  },

  update_product_details: async (storeId, args = {}) => {
    const resolved = await resolveProduct(storeId, args)
    if (resolved.result || !resolved.product) return resolved.result || fail("المنتج غير موجود")

    const updateData: JsonObject = {}
    const name = asString(args.newName) || asString(args.name)
    const sku = asString(args.sku)
    const costPrice = args.costPrice !== undefined ? asNumber(args.costPrice) : undefined
    const lowStockThreshold = args.lowStockThreshold !== undefined ? asInteger(args.lowStockThreshold) : undefined

    if (name !== undefined) updateData.name = name
    if (sku !== undefined) updateData.sku = sku
    if (costPrice !== undefined) updateData.costPrice = costPrice
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold
    if (args.description !== undefined) updateData.description = asString(args.description) || null
    if (args.categoryName !== undefined || args.category !== undefined || args.categoryId !== undefined) updateData.categoryId = await findCategoryId(storeId, args)
    if (args.supplierName !== undefined || args.supplier !== undefined || args.supplierId !== undefined) updateData.supplierId = await findSupplierId(storeId, args)

    if (Object.keys(updateData).length === 0) return fail("لا توجد بيانات لتحديث المنتج")

    const product = await prisma.product.update({
      where: { id: resolved.product.id },
      data: updateData,
      include: { category: true, supplier: true, barcodes: true },
    })

    await logAiAction(storeId, "ai_update_product_details", "product", product.id, updateData)
    return ok({ before: resolved.product, product })
  },

  update_product_price: async (storeId, args = {}) => {
    const price = asNumber(args.price)
    if (price === undefined) return fail("السعر الجديد مطلوب ويجب أن يكون رقم صحيح")

    const resolved = await resolveProduct(storeId, args)
    if (resolved.result || !resolved.product) return resolved.result || fail("المنتج غير موجود")

    const oldPrice = resolved.product.price
    const product = await prisma.product.update({ where: { id: resolved.product.id }, data: { price } })
    await prisma.inventoryMovement.create({
      data: { productId: product.id, type: "adjustment", quantity: 0, notes: `تغيير السعر من ${oldPrice} إلى ${price} - عن طريق AI Agent` },
    })
    await logAiAction(storeId, "ai_update_product_price", "product", product.id, { oldPrice, newPrice: price })
    return ok({ name: product.name, oldPrice, newPrice: price })
  },

  update_product_stock: async (storeId, args = {}) => {
    const quantity = asInteger(args.quantity)
    if (quantity === undefined) return fail("كمية المخزون الجديدة مطلوبة ويجب أن تكون رقم صحيح")

    const resolved = await resolveProduct(storeId, args)
    if (resolved.result || !resolved.product) return resolved.result || fail("المنتج غير موجود")

    const diff = quantity - resolved.product.quantity
    const product = await prisma.product.update({ where: { id: resolved.product.id }, data: { quantity } })
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        type: diff > 0 ? "in" : "out",
        quantity: Math.abs(diff),
        notes: diff >= 0 ? "إضافة مخزون عن طريق AI Agent" : "تخفيض مخزون عن طريق AI Agent",
      },
    })
    await logAiAction(storeId, "ai_update_product_stock", "product", product.id, { oldQuantity: resolved.product.quantity, newQuantity: quantity, diff })
    return ok({ name: product.name, oldQuantity: resolved.product.quantity, newQuantity: quantity, diff })
  },

  create_customer: async (storeId, args = {}) => {
    const name = asString(args.name)
    if (!name) return fail("اسم العميل مطلوب")

    const phone = asString(args.phone)
    if (phone) {
      const existing = await prisma.customer.findFirst({ where: { storeId, phone } })
      if (existing) return fail("يوجد عميل بنفس رقم الهاتف.", { id: existing.id, name: existing.name, phone: existing.phone })
    }

    const customer = await prisma.customer.create({
      data: { storeId, name, phone, address: asString(args.address), notes: asString(args.notes) },
    })
    await logAiAction(storeId, "ai_create_customer", "customer", customer.id, { name, phone })
    return ok(customer)
  },

  update_customer: async (storeId, args = {}) => {
    const resolved = await resolveCustomer(storeId, args)
    if (resolved.result || !resolved.customer) return resolved.result || fail("العميل غير موجود")

    const updateData: JsonObject = {}
    const name = asString(args.newName) || asString(args.name)
    const phone = asString(args.newPhone) || (asString(args.customerId) ? asString(args.phone) : undefined)
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (args.address !== undefined) updateData.address = asString(args.address) || null
    if (args.notes !== undefined) updateData.notes = asString(args.notes) || null

    if (Object.keys(updateData).length === 0) return fail("لا توجد بيانات لتحديث العميل")

    const customer = await prisma.customer.update({ where: { id: resolved.customer.id }, data: updateData })
    await logAiAction(storeId, "ai_update_customer", "customer", customer.id, updateData)
    return ok({ before: resolved.customer, customer })
  },

  create_supplier: async (storeId, args = {}) => {
    const name = asString(args.name)
    if (!name) return fail("اسم المورد مطلوب")

    const phone = asString(args.phone)
    if (phone) {
      const existing = await prisma.supplier.findFirst({ where: { storeId, phone } })
      if (existing) return fail("يوجد مورد بنفس رقم الهاتف.", { id: existing.id, name: existing.name, phone: existing.phone })
    }

    const supplier = await prisma.supplier.create({
      data: { storeId, name, phone, notes: asString(args.notes) },
    })
    await logAiAction(storeId, "ai_create_supplier", "supplier", supplier.id, { name, phone })
    return ok(supplier)
  },

  update_supplier: async (storeId, args = {}) => {
    const resolved = await resolveSupplier(storeId, args)
    if (resolved.result || !resolved.supplier) return resolved.result || fail("المورد غير موجود")

    const updateData: JsonObject = {}
    const name = asString(args.newName) || asString(args.name)
    const phone = asString(args.newPhone) || (asString(args.supplierId) ? asString(args.phone) : undefined)
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (args.notes !== undefined) updateData.notes = asString(args.notes) || null

    if (Object.keys(updateData).length === 0) return fail("لا توجد بيانات لتحديث المورد")

    const supplier = await prisma.supplier.update({ where: { id: resolved.supplier.id }, data: updateData })
    await logAiAction(storeId, "ai_update_supplier", "supplier", supplier.id, updateData)
    return ok({ before: resolved.supplier, supplier })
  },

  delete_supplier: async (storeId, args = {}) => {
    const resolved = await resolveSupplier(storeId, args)
    if (resolved.result || !resolved.supplier) return resolved.result || fail("المورد غير موجود")

    const productCount = await prisma.product.count({
      where: { storeId, supplierId: resolved.supplier.id },
    })

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { storeId, supplierId: resolved.supplier.id },
        data: { supplierId: null },
      }),
      prisma.supplier.delete({ where: { id: resolved.supplier.id } }),
    ])

    await logAiAction(storeId, "ai_delete_supplier", "supplier", resolved.supplier.id, { name: resolved.supplier.name, productCount })
    return ok({ supplier: resolved.supplier, unlinkedProducts: productCount, deleted: true })
  },

  delete_customer: async (storeId, args = {}) => {
    const resolved = await resolveCustomer(storeId, args)
    if (resolved.result || !resolved.customer) return resolved.result || fail("العميل غير موجود")

    await prisma.$transaction([
      prisma.sale.updateMany({ where: { storeId, customerId: resolved.customer.id }, data: { customerId: null } }),
      prisma.customer.delete({ where: { id: resolved.customer.id } }),
    ])

    await logAiAction(storeId, "ai_delete_customer", "customer", resolved.customer.id, { name: resolved.customer.name })
    return ok({ customer: resolved.customer, deleted: true })
  },

  delete_product: async (storeId, args = {}) => {
    const resolved = await resolveProduct(storeId, args)
    if (resolved.result || !resolved.product) return resolved.result || fail("المنتج غير موجود")

    const product = await prisma.product.update({
      where: { id: resolved.product.id },
      data: { isActive: false },
    })

    await logAiAction(storeId, "ai_delete_product", "product", product.id, { name: product.name })
    return ok({ product, deleted: true })
  },

  update_expense: async (storeId, args = {}) => {
    const resolved = await resolveExpense(storeId, args)
    if (resolved.result || !resolved.expense) return resolved.result || fail("المصروف غير موجود")

    const updateData: JsonObject = {}
    if (args.category !== undefined) updateData.category = normalizeExpenseCategory(args.category)
    if (args.amount !== undefined) {
      const amount = asNumber(args.amount)
      if (amount === undefined) return fail("مبلغ المصروف يجب أن يكون رقم صحيح")
      updateData.amount = amount
    }
    if (args.description !== undefined) updateData.description = asString(args.description) || null
    if (args.date !== undefined) updateData.date = normalizeDate(args.date)

    if (Object.keys(updateData).length === 0) return fail("لا توجد بيانات لتحديث المصروف")

    const expense = await prisma.expense.update({ where: { id: resolved.expense.id }, data: updateData })
    await logAiAction(storeId, "ai_update_expense", "expense", expense.id, updateData)
    return ok({ before: resolved.expense, expense })
  },

  delete_expense: async (storeId, args = {}) => {
    const resolved = await resolveExpense(storeId, args)
    if (resolved.result || !resolved.expense) return resolved.result || fail("المصروف غير موجود")

    await prisma.expense.delete({ where: { id: resolved.expense.id } })
    await logAiAction(storeId, "ai_delete_expense", "expense", resolved.expense.id, { category: resolved.expense.category, amount: resolved.expense.amount })
    return ok({ expense: resolved.expense, deleted: true })
  },

  cancel_sale: async (storeId, args = {}) => {
    const resolved = await resolveSale(storeId, args)
    if (resolved.result || !resolved.sale) return resolved.result || fail("الفاتورة غير موجودة")
    if (resolved.sale.status === "cancelled") return fail("الفاتورة ملغاة بالفعل")

    const sale = await prisma.sale.findFirst({ where: { id: resolved.sale.id, storeId }, include: { items: true } })
    if (!sale) return fail("الفاتورة غير موجودة")

    await prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.product.update({ where: { id: item.productId }, data: { quantity: { increment: item.quantity } } })
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "out",
            quantity: item.quantity,
            reference: sale.invoiceNumber,
            notes: `إلغاء فاتورة ${sale.invoiceNumber}`,
          },
        })
      }
      await tx.sale.update({
        where: { id: sale.id },
        data: { status: "cancelled", notes: asString(args.reason) || sale.notes },
      })
    })

    await logAiAction(storeId, "ai_cancel_sale", "sale", resolved.sale.id, { invoiceNumber: resolved.sale.invoiceNumber, reason: asString(args.reason) })
    return ok({ sale: { id: resolved.sale.id, invoiceNumber: resolved.sale.invoiceNumber, status: "cancelled" }, cancelled: true })
  },

  create_expense: async (storeId, args = {}) => {
    const amount = asNumber(args.amount)
    if (amount === undefined) return fail("مبلغ المصروف مطلوب ويجب أن يكون رقم صحيح")

    const category = normalizeExpenseCategory(args.category)
    const expense = await prisma.expense.create({
      data: {
        storeId,
        category,
        amount,
        description: asString(args.description),
        date: normalizeDate(args.date),
      },
    })
    await logAiAction(storeId, "ai_create_expense", "expense", expense.id, { category, amount })
    return ok(expense)
  },

  create_sale: async (storeId, args = {}) => {
    const rawItems = asArray(args.items).map(asObject).filter((item): item is JsonObject => Boolean(item))
    if (rawItems.length === 0) return fail("الفاتورة فارغة. يجب تحديد المنتجات والكميات.")

    const resolvedItems: ResolvedSaleItem[] = []
    for (const rawItem of rawItems) {
      const quantity = asInteger(rawItem.quantity, 1)
      if (quantity === undefined) return fail("كل صنف في الفاتورة يحتاج كمية صحيحة أكبر من صفر.", rawItem)

      const resolved = await resolveProduct(storeId, rawItem)
      if (resolved.result || !resolved.product) return resolved.result || fail("منتج في الفاتورة غير موجود")
      if (resolved.product.quantity < quantity) {
        return fail(`الكمية غير متوفرة لـ ${resolved.product.name}`, {
          productId: resolved.product.id,
          available: resolved.product.quantity,
          requested: quantity,
        })
      }

      const price = asNumber(rawItem.price) ?? resolved.product.price
      const itemDiscount = asNumber(rawItem.discount) ?? 0
      resolvedItems.push({ product: resolved.product, quantity, price, discount: itemDiscount })
    }

    const customerName = asString(args.customerName)
    const customerPhone = asString(args.customerPhone)
    let customerId = asString(args.customerId)
    if (customerId) {
      const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId }, select: { id: true } })
      if (!customer) return fail("العميل المحدد غير موجود داخل هذا المتجر")
    }
    if (!customerId && (customerName || customerPhone)) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          storeId,
          OR: [
            ...(customerPhone ? [{ phone: customerPhone }] : []),
            ...(customerName ? [{ name: { equals: customerName, mode: "insensitive" as const } }] : []),
          ],
        },
      })
      const customer = existingCustomer || await prisma.customer.create({
        data: { storeId, name: customerName || customerPhone || "عميل", phone: customerPhone },
      })
      customerId = customer.id
    }

    let employeeId = asString(args.employeeId)
    if (employeeId) {
      const employee = await prisma.employee.findFirst({ where: { id: employeeId, storeId, isActive: true }, select: { id: true } })
      if (!employee) return fail("الموظف المحدد غير موجود داخل هذا المتجر")
    }
    if (!employeeId && (args.employeeName || args.employeePhone)) {
      const resolved = await resolveEmployee(storeId, args)
      if (resolved.result || !resolved.employee) return resolved.result || fail("الموظف غير موجود")
      employeeId = resolved.employee.id
    }

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountValue = asNumber(args.discount) ?? 0
    const discountType = asString(args.discountType) === "percentage" ? "percentage" : "fixed"
    const discountAmount = discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue
    const total = subtotal - discountAmount
    if (total < 0) return fail("قيمة الخصم أكبر من إجمالي الفاتورة")

    const rawPayments = asArray(args.payments).map(asObject).filter((payment): payment is JsonObject => Boolean(payment))
    const payments = rawPayments.length
      ? rawPayments.map((payment) => ({
          method: normalizePaymentMethod(payment.method),
          amount: asNumber(payment.amount) ?? 0,
          reference: asString(payment.reference) || null,
        }))
      : [{ method: normalizePaymentMethod(args.paymentMethod), amount: total, reference: null }]

    const paidTotal = payments.reduce((sum, payment) => sum + payment.amount, 0)
    if (Math.abs(paidTotal - total) > 0.01) {
      return fail("إجمالي المدفوعات لا يساوي إجمالي الفاتورة.", { total, paidTotal, payments })
    }

    const invoiceNumber = generateInvoiceNumber()
    const profit = resolvedItems.reduce((sum, item) => sum + (item.price - item.product.costPrice) * item.quantity, 0)

    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
        data: {
          storeId,
          invoiceNumber,
          subtotal,
          discount: discountAmount,
          discountType,
          tax: 0,
          total,
          profit,
          paymentMethod: payments[0]?.method || "cash",
          paymentMethods: JSON.stringify(payments),
          status: "completed",
          notes: asString(args.notes),
          customerId: customerId || null,
          employeeId: employeeId || null,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.price,
              costPrice: item.product.costPrice,
              discount: item.discount,
              total: item.price * item.quantity - item.discount,
            })),
          },
          payments: {
            create: payments.map((payment) => ({
              method: payment.method,
              amount: payment.amount,
              reference: payment.reference,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, sku: true } } } },
          payments: true,
          customer: true,
          employee: { select: { id: true, name: true } },
        },
      })

      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { quantity: { decrement: item.quantity } },
        })
        await tx.inventoryMovement.create({
          data: {
            productId: item.product.id,
            type: "sale",
            quantity: -item.quantity,
            reference: invoiceNumber,
            notes: `بيع فاتورة ${invoiceNumber} عن طريق AI Agent`,
          },
        })
      }

      if (customerId) {
        const customerSales = await tx.sale.aggregate({
          where: { customerId, status: "completed" },
          _sum: { total: true },
        })
        await tx.customer.update({
          where: { id: customerId },
          data: { totalPurchases: customerSales._sum.total || 0, lastPurchaseAt: new Date() },
        })
      }

      return createdSale
    })

    await logAiAction(storeId, "ai_create_sale", "sale", sale.id, { invoiceNumber, total, itemCount: resolvedItems.length })
    return ok(sale)
  },
}
