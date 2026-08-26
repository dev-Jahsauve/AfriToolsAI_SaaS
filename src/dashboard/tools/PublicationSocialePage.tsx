import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { generatePublicationSociale } from "../../context/aiEngine";
import GenerationOutput from "../../components/GenerationOutput";
import ToolLayout from "./ToolLayout";

const plateformes = ["Facebook", "Instagram", "WhatsApp", "TikTok", "LinkedIn", "Twitter/X"];
const tons = [
  { val: "professionnel", label: "Professionnel" },
  { val: "amical", label: "Amical et décontracté" },
  { val: "urgent", label: "Urgent / promotionnel" },
  { val: "inspirant", label: "Inspirant" },
  { val: "humoristique", label: "Humoristique" },
];

export default function PublicationSocialePage() {
  const { user, useGeneration } = useAuth();
  const { addGeneration } = useApp();
  const [form, setForm] = useState({ plateforme: "", sujet: "", ton: "", cta: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.plateforme || !form.sujet) { setError("Veuillez remplir les champs obligatoires."); return; }
    const ok = useGeneration();
    if (!ok) { setError("Limite de générations atteinte."); return; }
    setLoading(true);
    const result = await generatePublicationSociale(form);
    setLoading(false);
    setOutput(result);
    if (user) addGeneration({ userId: user.id, tool: "publication-sociale", toolLabel: "Publication sociale", input: form, output: result });
  };

  return (
    <ToolLayout icon="📱" title="Générateur de publication sociale" description="Créez des posts engageants optimisés pour chaque réseau social.">
      <div className="space-y-6">
        {/* Sélection plateforme visuelle */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <label className="block text-sm font-bold text-[#0F172A] mb-3">Choisissez une plateforme <span className="text-[#EF4444]">*</span></label>
          <div className="flex flex-wrap gap-2 mb-6">
            {plateformes.map((p) => (
              <button key={p} type="button" onClick={() => update("plateforme", p)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${form.plateforme === p ? "gradient-primary text-white border-transparent" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5]"}`}>
                {p}
              </button>
            ))}
          </div>

          {error && <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EF4444] font-semibold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Sujet de la publication <span className="text-[#EF4444]">*</span></label>
              <textarea value={form.sujet} onChange={(e) => update("sujet", e.target.value)} rows={3}
                placeholder="Ex: Lancement de ma nouvelle collection de pagnes africains, promotion de -20% pour le mois de novembre..."
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all resize-none"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Ton de la publication</label>
                <select value={form.ton} onChange={(e) => update("ton", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white transition-all">
                  <option value="">Choisir un ton</option>
                  {tons.map((t) => <option key={t.val} value={t.val}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Appel à l'action</label>
                <input type="text" value={form.cta} onChange={(e) => update("cta", e.target.value)}
                  placeholder="Ex: Envoyez-nous un message !" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Génération en cours...</>) : "✨ Générer la publication"}
            </button>
          </form>
        </div>
        <GenerationOutput output={output} isLoading={loading} />
      </div>
    </ToolLayout>
  );
}
