export type PaymentMethod = "cash" | "card" | "wallet" | "credit" | "mixed"
export type SaleStatus = "completed" | "partial_return" | "full_return" | "suspended" | "cancelled"
export type EmployeeRole = "cashier" | "branch_manager" | "warehouse" | "accountant" | "manager"
export type SalaryType = "monthly" | "daily" | "hourly"
export type SalaryStatus = "pending" | "paid" | "partial"
export type InventoryMovementType = "in" | "out" | "sale" | "return" | "adjustment"

export interface CartItem {
  productId: string
  name: string
  barcode?: string
  sku?: string
  price: number
  costPrice: number
  quantity: number
  discount: number
  total: number
  image?: string | null
}

export interface Permission {
  viewProducts: boolean
  editProducts: boolean
  deleteProducts: boolean
  sell: boolean
  discounts: boolean
  returns: boolean
  viewInvoices: boolean
  cancelInvoices: boolean
  manageInventory: boolean
  manageCustomers: boolean
  manageSuppliers: boolean
  manageEmployees: boolean
  viewReports: boolean
  viewProfit: boolean
  manageSalaries: boolean
  storeSettings: boolean
  useAI: boolean
  accessProtected: boolean
  openCashDrawer: boolean
  viewDevices: boolean
  manageDevices: boolean
  testDevices: boolean
  analyzeDevicesWithAI: boolean
  printReceipts: boolean
  configureDeviceHelper: boolean
}

export const DEFAULT_PERMISSIONS: Permission = {
  viewProducts: true, editProducts: false, deleteProducts: false,
  sell: true, discounts: false, returns: false,
  viewInvoices: true, cancelInvoices: false,
  manageInventory: false, manageCustomers: true, manageSuppliers: false,
  manageEmployees: false, viewReports: false, viewProfit: false,
  manageSalaries: false, storeSettings: false, useAI: false,
  accessProtected: false, openCashDrawer: false,
  viewDevices: true, manageDevices: false, testDevices: false,
  analyzeDevicesWithAI: false, printReceipts: true, configureDeviceHelper: false,
}

export const MANAGER_PERMISSIONS: Permission = {
  viewProducts: true, editProducts: true, deleteProducts: false,
  sell: true, discounts: true, returns: true,
  viewInvoices: true, cancelInvoices: false,
  manageInventory: true, manageCustomers: true, manageSuppliers: true,
  manageEmployees: false, viewReports: true, viewProfit: false,
  manageSalaries: false, storeSettings: false, useAI: false,
  accessProtected: false, openCashDrawer: true,
  viewDevices: true, manageDevices: true, testDevices: true,
  analyzeDevicesWithAI: true, printReceipts: true, configureDeviceHelper: false,
}
