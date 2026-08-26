import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ToolType =
  | "fiche-produit"
  | "publicite"
  | "publication-sociale"
  | "messages-whatsapp"
  | "offre-commerciale";

export interface Generation {
  id: string;
  userId: string;
  tool: ToolType;
  toolLabel: string;
  input: Record<string, string>;
  output: string;
  createdAt: string;
}

interface AppContextType {
  generations: Generation[];
  addGeneration: (gen: Omit<Generation, "id" | "createdAt">) => void;
  getGenerationsByUser: (userId: string) => Generation[];
  clearUserGenerations: (userId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [generations, setGenerations] = useState<Generation[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("afritools_generations");
    if (stored) setGenerations(JSON.parse(stored));
  }, []);

  const save = (gens: Generation[]) => {
    setGenerations(gens);
    localStorage.setItem("afritools_generations", JSON.stringify(gens));
  };

  const addGeneration = (gen: Omit<Generation, "id" | "createdAt">) => {
    const newGen: Generation = {
      ...gen,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    save([newGen, ...generations]);
  };

  const getGenerationsByUser = (userId: string) =>
    generations.filter((g) => g.userId === userId);

  const clearUserGenerations = (userId: string) =>
    save(generations.filter((g) => g.userId !== userId));

  return (
    <AppContext.Provider value={{ generations, addGeneration, getGenerationsByUser, clearUserGenerations }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
