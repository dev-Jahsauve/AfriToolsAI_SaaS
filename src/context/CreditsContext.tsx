import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import {
  getCreditSummary,
  claimDailyCredits,
  type CreditSummary,
  type CreditCharge,
} from "../lib/credits"

interface CreditsContextType {
  summary: CreditSummary | null
  loading: boolean
  refresh: () => Promise<void>
  claim: () => Promise<CreditCharge>
}

const CreditsContext = createContext<CreditsContextType | null>(null)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [summary, setSummary] = useState<CreditSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (summary === null) setLoading(true)
    const s = await getCreditSummary()
    setSummary(s)
    setLoading(false)
  }, [summary])

  // Recharge le solde à la connexion / déconnexion
  useEffect(() => {
    setSummary(null)
    if (user) {
      getCreditSummary().then(setSummary)
    }
  }, [user?.id])

  const claim = async (): Promise<CreditCharge> => {
    const res = await claimDailyCredits()
    if (res.ok) refresh()
    return res
  }

  return (
    <CreditsContext.Provider value={{ summary, loading, refresh, claim }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const ctx = useContext(CreditsContext)
  if (!ctx) throw new Error("useCredits must be used inside CreditsProvider")
  return ctx
}