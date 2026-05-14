"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { Select } from "@/components/ui/select"
import { Spinner } from "@/components/ui/loading"
import { useCurrency } from "@/contexts/currency"
import {
  Plus, Package, Edit, Trash2, Barcode, AlertTriangle,
  Search, Filter, Download
} from "lucide-react"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  costPrice: number
  quantity: number
  lowStockThreshold: number
  category?: { id: string; name: string }
  barcodes: { barcode: string; isPrimary: boolean }[]
  supplier?: { id: string; name: string }
  description?: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const { format: fmt } = useCurrency()

  const [form, setForm] = useState({
    name: "", sku: "", price: "", costPrice: "", quantity: "",
    lowStockThreshold: "5", categoryId: "", supplierId: "",
    description: "", barcodes: "",
  })

  const loadProducts = async () => {
    const params = new URLSearchParams({ limit: "100" })
    if (search) params.set("search", search)
    if (categoryFilter) params.set("categoryId", categoryFilter)
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    if (data.products) setProducts(data.products)
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
    fetch("/api/products?limit=100").then(r => r.json()).then(d => {
      const cats = d.products?.map((p: Product) => p.category).filter(Boolean) || []
      const unique = Array.from(new Map(cats.map((c: Category) => [c.id, c])).values())
      setCategories(unique as Category[])
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [search, categoryFilter])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          costPrice: parseFloat(form.costPrice || "0"),
          quantity: parseInt(form.quantity || "0"),
          lowStockThreshold: parseInt(form.lowStockThreshold),
          barcodes: form.barcodes ? form.barcodes.split(",").map(b => b.trim()).filter(Boolean) : [],
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("تمت إضافة المنتج")
        setShowAddModal(false)
        resetForm()
        loadProducts()
      } else {
        toast.error(data.error || "حدث خطأ")
      }
    } catch {
      toast.error("حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editProduct) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          price: parseFloat(form.price),
          costPrice: parseFloat(form.costPrice || "0"),
          quantity: parseInt(form.quantity || "0"),
          lowStockThreshold: parseInt(form.lowStockThreshold),
          categoryId: form.categoryId || null,
          supplierId: form.supplierId || null,
          description: form.description,
          barcodes: form.barcodes ? form.barcodes.split(",").map(b => b.trim()).filter(Boolean) : [],
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("تم تحديث المنتج")
        setShowEditModal(false)
        setEditProduct(null)
        resetForm()
        loadProducts()
      } else {
        toast.error(data.error || "حدث خطأ")
      }
    } catch {
      toast.error("حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`هل أنت متأكد من حذف ${product.name}؟`)) return
    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" })
      toast.success("تم حذف المنتج")
      loadProducts()
    } catch {
      toast.error("حدث خطأ")
    }
  }

  const resetForm = () => {
    setForm({ name: "", sku: "", price: "", costPrice: "", quantity: "", lowStockThreshold: "5", categoryId: "", supplierId: "", description: "", barcodes: "" })
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      sku: product.sku || "",
      price: product.price.toString(),
      costPrice: product.costPrice.toString(),
      quantity: product.quantity.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      categoryId: product.category?.id || "",
      supplierId: product.supplier?.id || "",
      description: product.description || "",
      barcodes: product.barcodes.map(b => b.barcode).join(", "),
    })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <Button onClick={() => { resetForm(); setShowAddModal(true) }}>
          <Plus size={18} />إضافة منتج
        </Button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث باسم المنتج أو SKU..." />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-input-bg px-3 py-2 text-sm"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>المنتج</TableHeader>
                <TableHeader>SKU</TableHeader>
                <TableHeader>السعر</TableHeader>
                <TableHeader>التكلفة</TableHeader>
                <TableHeader>الكمية</TableHeader>
                <TableHeader>التصنيف</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    <Package size={40} className="mx-auto mb-3" />
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.barcodes?.length > 0 && (
                            <p className="text-xs text-gray-400">{product.barcodes[0].barcode}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{product.sku || "-"}</TableCell>
                    <TableCell className="font-semibold">{fmt(product.price)}</TableCell>
                    <TableCell className="text-gray-500">{fmt(product.costPrice)}</TableCell>
                    <TableCell>
                      <Badge variant={product.quantity <= product.lowStockThreshold ? "danger" : product.quantity === 0 ? "warning" : "success"}>
                        {product.quantity}
                      </Badge>
                      {product.quantity <= product.lowStockThreshold && (
                        <AlertTriangle size={14} className="inline mr-1 text-danger" />
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">{product.category?.name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-info transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="p-1.5 text-gray-400 hover:text-danger transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal isOpen={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); setEditProduct(null) }}
        title={editProduct ? "تعديل منتج" : "إضافة منتج"} size="lg">
        <div className="space-y-4">
          <Input label="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="الباركود (أكثر من كود مفصول بفاصلة)" value={form.barcodes} onChange={(e) => setForm({ ...form, barcodes: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="سعر البيع" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="سعر الشراء" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="الكمية" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="حد التنبيه" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
          </div>
          <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={editProduct ? handleEdit : handleAdd} loading={saving} className="w-full">
            {editProduct ? "حفظ التغييرات" : "إضافة المنتج"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
