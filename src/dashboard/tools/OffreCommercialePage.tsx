import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { generateOffreCommerciale } from "../../context/aiEngine";
import GenerationOutput from "../../components/GenerationOutput";
import ToolLayout from "./ToolLayout";

const durees = ["24 heures", "48 heures", "3 jours", "1 semaine", "2 semaines", "1 mois"];

export default function OffreCommercialePage() {
  const { user, useGeneration } = useAuth();
  const { addGeneration } = useApp();
  const [form, setForm] = useState({ produit: "", ancienPrix: "", nouveauPrix: "", duree: "", avantages: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reduction =
    form.ancienPrix && form.nouveauPrix
      ? Math.round(((parseInt(form.ancienPrix) - parseInt(form.nouveauPrix)) / parseInt(form.ancienPrix)) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.produit || !form.ancienPrix || !form.nouveauPrix || !form.duree) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }
    if (parseInt(form.nouveauPrix) >= parseInt(form.ancienPrix)) {
      setError("Le nouveau prix doit être inférieur à l'ancien prix.");
      return;
    }
    const ok = useGeneration();
    if (!ok) { setError("Limite de générations atteinte."); return; }
    setLoading(true);
    const result = await generateOffreCommerciale(form);
    setLoading(false);
    setOutput(result);
    if (user) addGeneration({ userId: user.id, tool: "offre-commerciale", toolLabel: "Offre commerciale", input: form, output: result });
  };

  return (
    <ToolLayout icon="🎯" title="Générateur d'offre commerciale" description="Transformez n'importe quelle réduction en offre irrésistible avec plusieurs variantes.">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          {error && <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EF4444] font-semibold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Produit / service en promotion <span className="text-[#EF4444]">*</span></label>
              <input type="text" value={form.produit} onChange={(e) => update("produit", e.target.value)}
                placeholder="Ex: Formation vidéo marketing digital"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Ancien prix (FCFA) <span className="text-[#EF4444]">*</span></label>
                <input type="number" value={form.ancienPrix} onChange={(e) => update("ancienPrix", e.target.value)}
                  placeholder="50 000" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Nouveau prix (FCFA) <span className="text-[#EF4444]">*</span></label>
                <input type="number" value={form.nouveauPrix} onChange={(e) => update("nouveauPrix", e.target.value)}
                  placeholder="25 000" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
              </div>
            </div>

            {reduction > 0 && (
              <div className="flex items-center gap-3 p-4 bg-[#DCFCE7] rounded-xl animate-fade-in">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="font-bold text-[#16A34A] text-sm">Réduction de {reduction}% !</div>
                  <div className="text-xs text-[#166534]">Économie de {parseInt(form.ancienPrix) - parseInt(form.nouveauPrix)} FCFA</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Durée de l'offre <span className="text-[#EF4444]">*</span></label>
              <div className="flex flex-wrap gap-2">
                {durees.map((d) => (
                  <button key={d} type="button" onClick={() => update("duree", d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.duree === d ? "gradient-primary text-white border-transparent" : "border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5]"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Avantages inclus (optionnel)</label>
              <input type="text" value={form.avantages} onChange={(e) => update("avantages", e.target.value)}
                placeholder="Ex: Livraison gratuite, garantie 30 jours, cadeau offert..."
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Génération en cours...</>) : "✨ Générer l'offre commerciale"}
            </button>
          </form>
        </div>
        <GenerationOutput output={output} isLoading={loading} />
      </div>
    </ToolLayout>
  );
}
