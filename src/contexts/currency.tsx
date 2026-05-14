"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CurrencyContextType {
  currency: string
  format: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "SAR",
  format: (amount: number) => `${amount.toLocaleString()} ر.س`,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("SAR")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.store?.currency) {
          setCurrency(data.user.store.currency)
        }
      })
      .catch(() => {})
  }, [])

  const format = (amount: number) => {
    const symbol = ({ SAR: "ر.س", AED: "د.إ", EGP: "ج.م", USD: "$" })[currency] || currency
    return `${amount.toLocaleString()} ${symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
