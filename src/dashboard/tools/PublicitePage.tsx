import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { generatePublicite } from "../../context/aiEngine";
import GenerationOutput from "../../components/GenerationOutput";
import ToolLayout from "./ToolLayout";

const plateformes = ["Facebook", "Instagram", "WhatsApp", "TikTok", "LinkedIn"];
const objectifs = ["Vendre un produit", "Générer des leads", "Augmenter la notoriété", "Promouvoir une offre spéciale", "Fidéliser les clients"];

export default function PublicitePage() {
  const { user, useGeneration } = useAuth();
  const { addGeneration } = useApp();
  const [form, setForm] = useState({ produit: "", audience: "", prix: "", objectif: "", plateforme: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.produit || !form.audience || !form.objectif) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }
    const ok = useGeneration();
    if (!ok) { setError("Limite de générations atteinte."); return; }
    setLoading(true);
    const result = await generatePublicite(form);
    setLoading(false);
    setOutput(result);
    if (user) addGeneration({ userId: user.id, tool: "publicite", toolLabel: "Publicité", input: form, output: result });
  };

  return (
    <ToolLayout icon="📢" title="Générateur de publicité" description="Créez des textes publicitaires percutants pour toutes vos plateformes.">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          {error && <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EF4444] font-semibold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Votre produit / service <span className="text-[#EF4444]">*</span></label>
              <input type="text" value={form.produit} onChange={(e) => update("produit", e.target.value)}
                placeholder="Ex: Cours de couture en ligne" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Audience cible <span className="text-[#EF4444]">*</span></label>
              <input type="text" value={form.audience} onChange={(e) => update("audience", e.target.value)}
                placeholder="Ex: Femmes entrepreneurs 20-40 ans" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Prix (FCFA)</label>
                <input type="text" value={form.prix} onChange={(e) => update("prix", e.target.value)}
                  placeholder="Ex: 15 000" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Plateforme</label>
                <select value={form.plateforme} onChange={(e) => update("plateforme", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white transition-all">
                  <option value="">Toutes plateformes</option>
                  {plateformes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Objectif de la publicité <span className="text-[#EF4444]">*</span></label>
              <select value={form.objectif} onChange={(e) => update("objectif", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white transition-all">
                <option value="">Sélectionner un objectif</option>
                {objectifs.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Génération en cours...</>) : "✨ Générer les publicités"}
            </button>
          </form>
        </div>
        <GenerationOutput output={output} isLoading={loading} />
      </div>
    </ToolLayout>
  );
}
