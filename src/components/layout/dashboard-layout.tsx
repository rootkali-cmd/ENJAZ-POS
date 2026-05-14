"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { PageLoading } from "@/components/ui/loading"
import { CurrencyProvider } from "@/contexts/currency"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [session, setSession] = useState<{
    id: string
    name: string
    email: string
    role: string
    storeId?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated")
        return res.json()
      })
      .then((data) => {
        setSession(data.user)
        if (!data.user.storeId && window.location.pathname !== "/onboarding") {
          router.push("/onboarding")
        }
      })
      .catch(() => {
        router.push("/login")
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <PageLoading />

  if (!session) return null

  return (
    <CurrencyProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar role={session.role} storeName={undefined} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            userName={session.name}
            role={session.role}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </CurrencyProvider>
  )
}
