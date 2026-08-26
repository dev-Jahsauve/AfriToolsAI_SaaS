import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { generateFicheProduit } from "../../context/aiEngine";
import GenerationOutput from "../../components/GenerationOutput";
import ToolLayout from "./ToolLayout";

export default function FicheProduitPage() {
  const { user, useGeneration } = useAuth();
  const { addGeneration } = useApp();
  const [form, setForm] = useState({ nom: "", caracteristiques: "", prix: "", cible: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nom || !form.caracteristiques || !form.prix || !form.cible) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    const ok = useGeneration();
    if (!ok) {
      setError("Vous avez atteint votre limite de générations.");
      return;
    }
    setLoading(true);
    const result = await generateFicheProduit(form);
    setLoading(false);
    setOutput(result);
    if (user) {
      addGeneration({
        userId: user.id,
        tool: "fiche-produit",
        toolLabel: "Fiche produit",
        input: form,
        output: result,
      });
    }
  };

  return (
    <ToolLayout
      icon="📦"
      title="Générateur de fiche produit"
      description="Créez une fiche produit professionnelle et persuasive en quelques secondes."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          {error && (
            <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EF4444] font-semibold">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Nom du produit <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => update("nom", e.target.value)}
                placeholder="Ex: Huile de karité bio du Burkina Faso"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Caractéristiques (séparées par des virgules) <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={form.caracteristiques}
                onChange={(e) => update("caracteristiques", e.target.value)}
                placeholder="Ex: 100% naturelle, sans additifs, hydratante, 250ml, pot en verre"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">
                  Prix (FCFA) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={form.prix}
                  onChange={(e) => update("prix", e.target.value)}
                  placeholder="Ex: 3 500"
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">
                  Public cible <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={form.cible}
                  onChange={(e) => update("cible", e.target.value)}
                  placeholder="Ex: Femmes 25-45 ans"
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Génération en cours...
                </>
              ) : (
                "✨ Générer la fiche produit"
              )}
            </button>
          </form>
        </div>

        <GenerationOutput output={output} isLoading={loading} />
      </div>
    </ToolLayout>
  );
}
