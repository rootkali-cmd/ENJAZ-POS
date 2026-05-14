"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import {
  Search, Plus, Minus, Trash2, Percent, Tag, X,
  ShoppingCart, Printer, User, Pause, CreditCard,
  Banknote, Wallet, Smartphone, Check, Scan,
  Keyboard, Lock, DollarSign, List, ExternalLink, LogOut
} from "lucide-react"
import toast from "react-hot-toast"
import { OPEN_DRAWER_REASONS, getReasonLabel } from "@/services/cash-drawer"
import type { OpenDrawerReason } from "@/services/cash-drawer"
import { useCurrency } from "@/contexts/currency"

interface CartItem {
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

interface Product {
  id: string
  name: string
  price: number
  costPrice: number
  quantity: number
  sku?: string
  image?: string
  barcodes: { barcode: string }[]
  category?: { name: string }
}

type PaymentMethod = "cash" | "card" | "wallet" | "credit"

interface DrawerSettings {
  cashDrawerEnabled: boolean
  cashDrawerRequiresOwnerPin: boolean
  cashDrawerProvider: string
}

const SHORTCUTS = [
  { key: "F1", label: "تركيز البحث" },
  { key: "F2", label: "تركيز الباركود" },
  { key: "F3", label: "تعليق الفاتورة" },
  { key: "F4", label: "الفواتير المعلقة" },
  { key: "F5", label: "خصم الفاتورة" },
  { key: "F6", label: "اختيار عميل" },
  { key: "F7", label: "دفع كاش" },
  { key: "F8", label: "دفع بطاقة" },
  { key: "F9", label: "دفع مختلط" },
  { key: "F10", label: "إتمام البيع" },
  { key: "F11", label: "طباعة آخر فاتورة" },
  { key: "F12", label: "فتح الخزنة" },
  { key: "Esc", label: "إغلاق النافذة" },
  { key: "Ctrl + Enter", label: "بيع مباشر" },
  { key: "Ctrl + Bksp", label: "حذف آخر منتج" },
  { key: "+ / -", label: "زيادة/تقليل الكمية" },
  { key: "Delete", label: "حذف المنتج المحدد" },
  { key: "Ctrl + P", label: "طباعة الفاتورة" },
  { key: "Ctrl + H", label: "عرض الاختصارات" },
]

export default function POSPage() {
  const router = useRouter()
  const barcodeRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed")
  const [discountValue, setDiscountValue] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null)
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [employee, setEmployee] = useState<{ id: string; name: string } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [processing, setProcessing] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [session, setSession] = useState<any>(null)

  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSuspended, setShowSuspended] = useState(false)
  const [suspendedSales, setSuspendedSales] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null)

  const [showDrawer, setShowDrawer] = useState(false)
  const [showDrawerPin, setShowDrawerPin] = useState(false)
  const [showDrawerReason, setShowDrawerReason] = useState(false)
  const [drawerPin, setDrawerPin] = useState("")
  const [drawerReason, setDrawerReason] = useState<OpenDrawerReason>("cash_review")
  const [drawerReasonText, setDrawerReasonText] = useState("")
  const [drawerSettings, setDrawerSettings] = useState<DrawerSettings | null>(null)
  const [drawerProcessing, setDrawerProcessing] = useState(false)
  const [hasOwnerPin, setHasOwnerPin] = useState(false)
  const { format: fmt } = useCurrency()

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      setSession(d.user)
      if (d.user?.role !== "owner") {
        fetch(`/api/employees/${d.user?.employeeId}`).then(r => r.json()).then(e => {
          if (e.employee) setEmployee({ id: e.employee.id, name: e.employee.name })
        })
      } else {
        setEmployee({ id: d.user.id, name: d.user.name })
      }
    })
    fetch("/api/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cash-drawer-settings" }),
    }).then(r => r.json()).then(d => {
      setDrawerSettings(d.settings)
      setHasOwnerPin(d.hasOwnerPin)
    })
  }, [])

  useEffect(() => {
    fetch("/api/customers?limit=100").then(r => r.json()).then(d => {
      if (d.customers) setCustomers(d.customers.map((c: any) => ({ id: c.id, name: c.name })))
    })
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0)
  const invoiceDiscount = discountType === "percentage"
    ? subtotal * (parseFloat(discountValue || "0") / 100)
    : parseFloat(discountValue || "0")
  const total = Math.max(0, subtotal - invoiceDiscount - totalDiscount)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleBarcode = useCallback(async (code: string) => {
    if (!code) return
    try {
      const res = await fetch(`/api/products/barcode?code=${encodeURIComponent(code)}`)
      if (!res.ok) {
        toast.error("المنتج غير موجود")
        return
      }
      const data = await res.json()
      addToCart(data.product)
    } catch {
      toast.error("خطأ في البحث عن المنتج")
    }
  }, [])

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.error("هذا المنتج غير متوفر في المخزون")
      return
    }
    if (product.price <= 0) {
      toast.error("هذا المنتج ليس له سعر")
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error("الكمية المطلوبة غير متوفرة")
          return prev
        }
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price - item.discount }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        barcode: product.barcodes?.[0]?.barcode,
        sku: product.sku,
        price: product.price,
        costPrice: product.costPrice,
        quantity: 1,
        discount: 0,
        total: product.price,
        image: product.image,
      }]
    })
    setSelectedItemId(product.id)
    toast.success(`تمت إضافة ${product.name}`)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta), total: Math.max(1, item.quantity + delta) * item.price - item.discount }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const filtered = prev.filter(item => item.productId !== productId)
      if (selectedItemId === productId) {
        setSelectedItemId(filtered.length > 0 ? filtered[filtered.length - 1].productId : null)
      }
      return filtered
    })
  }

  const removeLastFromCart = () => {
    if (cart.length === 0) return
    const last = cart[cart.length - 1]
    removeFromCart(last.productId)
    toast.success(`تم حذف ${last.name}`)
  }

  const loadSuspended = async () => {
    const res = await fetch("/api/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-suspended" }),
    })
    const d = await res.json()
    setSuspendedSales(d.sales || [])
  }

  const handleSuspend = async () => {
    if (cart.length === 0) return
    await fetch("/api/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suspend", data: { cart } }),
    })
    setCart([])
    setSelectedItemId(null)
    toast.success("تم تعليق الفاتورة")
  }

  const handleResume = (sale: any) => {
    setCart(sale.data || [])
    setShowSuspended(false)
    toast.success("تم استرجاع الفاتورة المعلقة")
  }

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("الفاتورة فارغة")
      return
    }
    setProcessing(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
          })),
          payments: [{ method: paymentMethod, amount: total }],
          discount: parseFloat(discountValue || "0"),
          discountType,
          customerId: selectedCustomer?.id || null,
          employeeId: employee?.id || null,
          notes: "",
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("تم إتمام البيع بنجاح")
        setLastInvoiceId(data.sale?.id || null)
        setCart([])
        setSelectedItemId(null)
        setDiscountValue("")
        setShowPayment(false)
        if (data.sale) {
          window.open(`/sales/${data.sale.id}`, "_blank")
        }
      } else {
        toast.error(data.error || "حدث خطأ")
      }
    } catch {
      toast.error("حدث خطأ في إتمام البيع")
    } finally {
      setProcessing(false)
    }
  }

  const handlePrintLast = () => {
    if (lastInvoiceId) {
      window.open(`/sales/${lastInvoiceId}`, "_blank")
    } else {
      toast.error("لا توجد فاتورة سابقة")
    }
  }

  const handleLogout = () => {
    document.cookie = "enjaz_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
  }

  const handleDrawerOpen = async () => {
    if (!drawerSettings?.cashDrawerEnabled) {
      toast.error("فتح الخزنة معطل في إعدادات المتجر")
      return
    }
    setShowDrawerReason(true)
    setDrawerReason("cash_review")
    setDrawerReasonText("")
  }

  const executeDrawerOpen = async (skipPin = false) => {
    setDrawerProcessing(true)
    try {
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cash-drawer-open",
          data: {
            reason: drawerReason,
            reasonText: drawerReasonText || null,
            ownerPin: drawerPin || null,
            skipOwnerPin: skipPin,
          },
        }),
      })
      const result = await res.json()

      if (result.status === "pin_required") {
        setShowDrawerReason(false)
        setShowDrawerPin(true)
        return
      }

      if (result.success) {
        toast.success("تم فتح الخزنة")
      } else {
        toast.error(result.message || "تعذر فتح الخزنة")
      }

      setShowDrawerPin(false)
      setShowDrawerReason(false)
      setDrawerPin("")
    } catch {
      toast.error("حدث خطأ")
    } finally {
      setDrawerProcessing(false)
    }
  }

  const closeAllModals = useCallback(() => {
    setShowPayment(false)
    setShowDiscount(false)
    setShowCustomerSelect(false)
    setShowShortcuts(false)
    setShowSuspended(false)
    setShowDrawer(false)
    setShowDrawerPin(false)
    setShowDrawerReason(false)
  }, [])

  const anyModalOpen = showPayment || showDiscount || showCustomerSelect || showShortcuts || showSuspended || showDrawer || showDrawerPin || showDrawerReason

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable

      if (e.key === "Escape") {
        e.preventDefault()
        if (anyModalOpen) {
          closeAllModals()
        }
        return
      }

      if (e.key === "F1") {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }

      if (e.key === "F2") {
        e.preventDefault()
        barcodeRef.current?.focus()
        barcodeRef.current?.select()
        return
      }

      if (e.ctrlKey && e.key === "h") {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
        return
      }

      if (e.ctrlKey && e.key === "p") {
        e.preventDefault()
        handlePrintLast()
        return
      }

      if (e.ctrlKey && e.key === "Backspace") {
        e.preventDefault()
        removeLastFromCart()
        return
      }

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault()
        if (cart.length > 0) {
          setShowPayment(true)
        }
        return
      }

      if (anyModalOpen) return

      if (e.key === "F3") {
        e.preventDefault()
        if (cart.length > 0) handleSuspend()
        return
      }

      if (e.key === "F4") {
        e.preventDefault()
        loadSuspended()
        setShowSuspended(true)
        return
      }

      if (e.key === "F5") {
        e.preventDefault()
        if (cart.length > 0) setShowDiscount(true)
        return
      }

      if (e.key === "F6") {
        e.preventDefault()
        setShowCustomerSelect(true)
        return
      }

      if (e.key === "F10") {
        e.preventDefault()
        if (cart.length > 0) setShowPayment(true)
        return
      }

      if (e.key === "F11") {
        e.preventDefault()
        handlePrintLast()
        return
      }

      if (e.key === "F12") {
        e.preventDefault()
        handleDrawerOpen()
        return
      }

      if (e.key === "F7" && !isInput) {
        e.preventDefault()
        setPaymentMethod("cash")
        return
      }

      if (e.key === "F8" && !isInput) {
        e.preventDefault()
        setPaymentMethod("card")
        return
      }

      if (e.key === "F9" && !isInput) {
        e.preventDefault()
        setPaymentMethod("credit")
        return
      }

      if (isInput) return

      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        const id = selectedItemId || cart[cart.length - 1]?.productId
        if (id) updateQuantity(id, 1)
        return
      }

      if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        const id = selectedItemId || cart[cart.length - 1]?.productId
        if (id) updateQuantity(id, -1)
        return
      }

      if (e.key === "Delete" || e.key === "Del") {
        e.preventDefault()
        if (selectedItemId) removeFromCart(selectedItemId)
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [anyModalOpen, cart, selectedItemId, lastInvoiceId, drawerSettings])

  const handleBarcodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleBarcode(barcodeInput)
      setBarcodeInput("")
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault()
      addToCart(searchResults[0])
      setShowSearch(false)
      setSearch("")
    }
  }

  const handleSearch = async (query: string) => {
    setSearch(query)
    if (query.length < 1) {
      setSearchResults([])
      setShowSearch(false)
      return
    }
    setShowSearch(true)
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json()
      setSearchResults(data.products || [])
    } catch {
      setSearchResults([])
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Scan className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              ref={barcodeRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="مسح باركود... F2"
              className="w-full rounded-lg border border-border bg-input-bg pr-10 pl-4 py-3 text-lg
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
              autoFocus
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="بحث بالاسم أو SKU... F1"
              className="w-full rounded-lg border border-border bg-input-bg pr-10 pl-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => { addToCart(product); setShowSearch(false); setSearch("") }}
                    className="w-full px-4 py-3 text-right hover:bg-card-hover flex items-center justify-between border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sku || ""}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{fmt(product.price)}</p>
                      <Badge variant={product.quantity > 0 ? "success" : "danger"}>
                        {product.quantity > 0 ? `متبقي ${product.quantity}` : "نفذ"}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Card className="flex-1 p-0 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between bg-card-hover">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" />
              <span className="font-medium text-sm">الفواتير المعلقة</span>
            </div>
            <span className="text-sm text-gray-500">{itemCount} منتج</span>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ShoppingCart size={48} />
                <p className="mt-3">الفاتورة فارغة</p>
                <p className="text-sm">F1 للبحث أو F2 لمسح الباركود</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    onClick={() => setSelectedItemId(item.productId)}
                    className={`p-3 hover:bg-card-hover transition-colors cursor-pointer ${
                      selectedItemId === item.productId ? "bg-primary/5 border-r-2 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.sku || ""}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.productId) }}
                        className="p-1 text-gray-400 hover:text-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1) }}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-card-hover"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1) }}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-card-hover"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                           {fmt(item.price * item.quantity - item.discount)}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-xs text-danger">خصم: {fmt(item.discount)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:w-80 space-y-3">
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">الإجمالي الفرعي</span>
              <span className="font-medium">{fmt(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between items-center text-danger">
                <span>خصم المنتجات</span>
                <span>- {fmt(totalDiscount)}</span>
              </div>
            )}
            {parseFloat(discountValue || "0") > 0 && (
              <div className="flex justify-between items-center text-amber-600">
                <span>خصم الفاتورة</span>
                <span>- {fmt(invoiceDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-3">
              <span>الإجمالي</span>
              <span className="text-primary">{fmt(total)}</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => { if (cart.length > 0) setShowDiscount(true) }}
          >
            <Tag size={16} />
            خصم
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowCustomerSelect(true)}
          >
            <User size={16} />
            {selectedCustomer ? selectedCustomer.name : "عميل"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleSuspend}
            disabled={cart.length === 0}
          >
            <Pause size={16} />
            تعليق
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await loadSuspended()
              setShowSuspended(true)
            }}
          >
            <List size={16} />
            استرجاع
          </Button>
        </div>

        {drawerSettings?.cashDrawerEnabled && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDrawerOpen}
          >
            <Lock size={16} />
            فتح الخزنة
          </Button>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={cart.length === 0}
          onClick={() => setShowPayment(true)}
        >
          <Check size={20} />
          إتمام البيع ({fmt(total)})
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs text-gray-400"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard size={14} />
            اختصارات الكاشير
          </Button>
          {lastInvoiceId && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-gray-400"
              onClick={handlePrintLast}
            >
              <Printer size={14} />
              طباعة F11
            </Button>
          )}
        </div>

        <hr className="border-border" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-danger hover:bg-danger/5"
          onClick={handleLogout}
        >
          <LogOut size={14} />
          تسجيل الخروج
        </Button>
      </div>

      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="إتمام البيع" size="md">
        <div className="space-y-4">
          <div className="bg-card-hover rounded-lg p-4">
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">{fmt(total)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { method: "cash" as const, label: "كاش (F7)", icon: Banknote },
                { method: "card" as const, label: "بطاقة (F8)", icon: CreditCard },
                { method: "wallet" as const, label: "محفظة", icon: Smartphone },
                { method: "credit" as const, label: "آجل (F9)", icon: Wallet },
              ].map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    paymentMethod === method
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-border-hover"
                  }`}
                >
                  <Icon size={24} className="mx-auto mb-1" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "cash" && (
            <Input
              label="المبلغ المدفوع"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="المبلغ المدفوع"
            />
          )}

          {paymentMethod === "cash" && parseFloat(paymentAmount) >= total && (
            <div className="bg-success/10 text-success rounded-lg p-3 text-center">
              <p className="text-sm font-medium">الباقي: {fmt(parseFloat(paymentAmount) - total)}</p>
            </div>
          )}

          <Button
            onClick={handlePayment}
            loading={processing}
            className="w-full"
            size="lg"
          >
            تأكيد البيع
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showDiscount} onClose={() => setShowDiscount(false)} title="خصم على الفاتورة" size="sm">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={discountType === "fixed" ? "primary" : "outline"}
              onClick={() => setDiscountType("fixed")}
              className="flex-1"
            >
              <Tag size={16} />قيمة ثابتة
            </Button>
            <Button
              variant={discountType === "percentage" ? "primary" : "outline"}
              onClick={() => setDiscountType("percentage")}
              className="flex-1"
            >
              <Percent size={16} />نسبة مئوية
            </Button>
          </div>
          <Input
            label={discountType === "fixed" ? "قيمة الخصم" : "نسبة الخصم (%)"}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "fixed" ? "0" : "0%"}
          />
          {parseFloat(discountValue || "0") > 0 && (
            <p className="text-sm text-gray-500">
              الخصم: {fmt(invoiceDiscount)}
            </p>
          )}
          <Button onClick={() => setShowDiscount(false)} className="w-full">
            تطبيق
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showCustomerSelect} onClose={() => setShowCustomerSelect(false)} title="اختيار عميل" size="sm">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <button
            onClick={() => { setSelectedCustomer(null); setShowCustomerSelect(false) }}
            className="w-full p-3 text-right hover:bg-card-hover rounded-lg border border-border"
          >
            بدون عميل
          </button>
          {customers.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedCustomer(c); setShowCustomerSelect(false) }}
              className="w-full p-3 text-right hover:bg-card-hover rounded-lg border border-border"
            >
              {c.name}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} title="اختصارات الكاشير" size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center gap-3 p-2 rounded-lg bg-card-hover">
                <kbd className="px-2 py-1 text-xs font-bold bg-primary/10 text-primary rounded border border-primary/20 min-w-[80px] text-center">
                  {shortcut.key}
                </kbd>
                <span className="text-sm">{shortcut.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center pt-2 border-t border-border">
            بعض اختصارات المتصفح قد تختلف حسب الجهاز أو نظام التشغيل.
          </p>
        </div>
      </Modal>

      <Modal isOpen={showSuspended} onClose={() => setShowSuspended(false)} title="الفواتير المعلقة" size="sm">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {suspendedSales.length === 0 ? (
            <p className="text-center py-8 text-gray-400">لا توجد فواتير معلقة</p>
          ) : suspendedSales.map((sale: any) => (
            <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">{sale.label || "فاتورة معلقة"}</p>
                <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleString("ar-SA")}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleResume(sale)}>
                <ExternalLink size={14} />استرجاع
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showDrawerReason} onClose={() => setShowDrawerReason(false)} title="سبب فتح الخزنة" size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            {OPEN_DRAWER_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setDrawerReason(r.value)}
                className={`w-full p-3 text-right rounded-lg border transition-all ${
                  drawerReason === r.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-border-hover"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {drawerReason === "other" && (
            <Input
              label="وصف السبب"
              value={drawerReasonText}
              onChange={(e) => setDrawerReasonText(e.target.value)}
              placeholder="اكتب السبب..."
            />
          )}
          <Button onClick={() => executeDrawerOpen()} loading={drawerProcessing} className="w-full">
            <Lock size={16} />فتح الخزنة
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showDrawerPin} onClose={() => { setShowDrawerPin(false); setDrawerPin("") }} title="التحقق من PIN" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">هذه الخاصية محمية. الرجاء إدخال PIN صاحب المتجر.</p>
          <Input
            label="PIN"
            type="password"
            value={drawerPin}
            onChange={(e) => setDrawerPin(e.target.value)}
            placeholder="أدخل PIN"
            maxLength={6}
          />
          <Button onClick={() => executeDrawerOpen()} loading={drawerProcessing} className="w-full">
            تأكيد
          </Button>
        </div>
      </Modal>
    </div>
  )
}
