import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { supabase } from "../lib/supabaseClient"
import { isAdminEmail } from "../config/site"

export type Plan = "gratuit" | "starter" | "pro" | "business"

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  plan: Plan
  generationsUsed: number
  generationsLimit: number
  createdAt: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    nom: string,
    prenom: string,
    email: string,
    password: string,
  ) => Promise<boolean>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  useGeneration: () => boolean
}

const PLAN_LIMITS: Record<Plan, number> = {
  gratuit: 5,
  starter: 100,
  pro: 500,
  business: 2000,
}

interface ProfileRow {
  id: string
  nom: string
  prenom: string
  email: string
  plan_id: Plan
  generations_used: number
  generations_limit: number
  created_at: string
  avatar_url?: string | null
}

interface AuthMeta {
  id: string
  email?: string | null
  created_at?: string
  user_metadata?: Record<string, unknown> | null
}

const toUser = (p: ProfileRow): User => ({
  id: p.id,
  nom: p.nom,
  prenom: p.prenom,
  email: p.email,
  plan: p.plan_id ?? "gratuit",
  generationsUsed: p.generations_used ?? 0,
  generationsLimit: p.generations_limit ?? PLAN_LIMITS[p.plan_id ?? "gratuit"],
  createdAt: p.created_at,
  avatar: p.avatar_url ?? undefined,
})

const fallbackUser = (u: AuthMeta): User => ({
  id: u.id,
  nom: u.user_metadata?.nom as string ?? "",
  prenom: u.user_metadata?.prenom as string ?? "",
  email: u.email ?? "",
  plan: "gratuit",
  generationsUsed: 0,
  generationsLimit: PLAN_LIMITS.gratuit,
  createdAt: u.created_at ?? new Date().toISOString(),
})

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (id: string): Promise<ProfileRow | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error || !data) return null
    return data as ProfileRow
  }

  const refreshUser = async (authMeta: AuthMeta) => {
    const p = await loadProfile(authMeta.id)
    setUser(p ? toUser(p) : fallbackUser(authMeta))
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session) {
        refreshUser(data.session.user).then(() => {
          if (active) setLoading(false)
        })
      } else {
        setUser(null)
        if (active) setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error || !data.user) return false
      await refreshUser(data.user)
      return true
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    nom: string,
    prenom: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    if (isAdminEmail(email)) return false
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nom, prenom } },
      })
      if (error || !data.user) return false

      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          nom,
          prenom,
          email,
          plan_id: "gratuit",
          generations_used: 0,
          generations_limit: PLAN_LIMITS.gratuit,
        },
        { onConflict: "id" },
      )

      if (data.session) {
        await refreshUser(data.user)
      } else {
        setUser(null)
      }
      return true
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    supabase.auth.signOut()
  }

  const updateUser = (data: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    supabase
      .from("profiles")
      .update({
        nom: updated.nom,
        prenom: updated.prenom,
        email: updated.email,
      })
      .eq("id", user.id)
    if (updated.avatar) {
      supabase
        .from("profiles")
        .update({ avatar_url: updated.avatar })
        .eq("id", user.id)
    }
  }

  const useGeneration = (): boolean => {
    if (!user) return false
    if (user.generationsUsed >= user.generationsLimit) return false
    const next = user.generationsUsed + 1
    setUser({ ...user, generationsUsed: next })
    supabase
      .from("profiles")
      .update({ generations_used: next })
      .eq("id", user.id)
      .then(({ error }) => {
        if (error) refreshUser({ id: user.id })
      })
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        useGeneration,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

export { PLAN_LIMITS }
