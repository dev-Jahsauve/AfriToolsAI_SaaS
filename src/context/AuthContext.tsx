import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Plan = "gratuit" | "starter" | "pro" | "business";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  plan: Plan;
  generationsUsed: number;
  generationsLimit: number;
  createdAt: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nom: string, prenom: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  useGeneration: () => boolean;
}

const PLAN_LIMITS: Record<Plan, number> = {
  gratuit: 5,
  starter: 100,
  pro: 500,
  business: 2000,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("afritools_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem("afritools_user", JSON.stringify(u));
  };

  const login = async (email: string, _password: string): Promise<boolean> => {
    const usersRaw = localStorage.getItem("afritools_users");
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find((u) => u.email === email);
    if (!found) return false;
    saveUser(found);
    return true;
  };

  const register = async (nom: string, prenom: string, email: string, _password: string): Promise<boolean> => {
    const usersRaw = localStorage.getItem("afritools_users");
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.find((u) => u.email === email)) return false;
    const newUser: User = {
      id: Date.now().toString(),
      nom,
      prenom,
      email,
      plan: "gratuit",
      generationsUsed: 0,
      generationsLimit: PLAN_LIMITS.gratuit,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("afritools_users", JSON.stringify(users));
    saveUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("afritools_user");
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    const usersRaw = localStorage.getItem("afritools_users");
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) users[idx] = updated;
    localStorage.setItem("afritools_users", JSON.stringify(users));
    saveUser(updated);
  };

  const useGeneration = (): boolean => {
    if (!user) return false;
    if (user.generationsUsed >= user.generationsLimit) return false;
    updateUser({ generationsUsed: user.generationsUsed + 1 });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUser, useGeneration }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { PLAN_LIMITS };
