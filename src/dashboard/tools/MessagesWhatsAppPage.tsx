import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useCredits } from "../../context/CreditsContext";
import { runGeneration } from "../../lib/generate";
import { creditErrorMessage } from "../../lib/credits";
import { generateMessageWhatsApp } from "../../context/aiEngine";
import GenerationOutput from "../../components/GenerationOutput";
import ToolLayout from "./ToolLayout";
import { CheckIcon, FlameIcon, HeartIcon, HistoryIcon, MessageCircleIcon, SparklesIcon } from "../../components/icons";

const situations = [
  { val: "premier-contact", label: "Premier contact", Icon: MessageCircleIcon, desc: "Contacter un nouveau prospect" },
  { val: "reponse", label: "Réponse client", Icon: CheckIcon, desc: "Répondre à une demande" },
  { val: "relance", label: "Relance", Icon: HistoryIcon, desc: "Relancer un client silencieux" },
  { val: "promotion", label: "Promotion", Icon: FlameIcon, desc: "Annoncer une offre spéciale" },
  { val: "fidelisation", label: "Fidélisation", Icon: HeartIcon, desc: "Remercier et fidéliser" },
];

export default function MessagesWhatsAppPage() {
  const { user } = useAuth();
  const { addGeneration } = useApp();
  const { refresh } = useCredits();
  const [form, setForm] = useState({ produit: "", situation: "", prenom: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.produit || !form.situation) { setError("Veuillez remplir les champs obligatoires."); return; }
    setLoading(true);
    const res = await runGeneration("messages-whatsapp", form, () => generateMessageWhatsApp(form));
    setLoading(false);
    if (!res.ok) {
      setError(creditErrorMessage({ ok: false, error: res.error, required: res.required, balance: res.balance }));
      return;
    }
    setOutput(res.output);
    if (user) addGeneration({ userId: user.id, tool: "messages-whatsapp", toolLabel: "Messages WhatsApp", input: form, output: res.output });
    refresh();
  };

  return (
    <ToolLayout toolId="messages-whatsapp">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          {error && <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EF4444] font-semibold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Votre produit / service <span className="text-[#EF4444]">*</span></label>
              <input type="text" value={form.produit} onChange={(e) => update("produit", e.target.value)}
                placeholder="Ex: Robes de soirée africaines, coaching business..."
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-3">Situation <span className="text-[#EF4444]">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {situations.map((s) => (
                  <button key={s.val} type="button" onClick={() => update("situation", s.val)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.situation === s.val ? "border-[#4F46E5] bg-[#EEF2FF]" : "border-[#E2E8F0] hover:border-[#4F46E5]/50"}`}>
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white`}>
                      <s.Icon size={18} />
                    </span>
                    <div>
                      <div className={`font-bold text-sm ${form.situation === s.val ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>{s.label}</div>
                      <div className="text-xs text-[#94A3B8]">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Prénom du client (optionnel)</label>
              <input type="text" value={form.prenom} onChange={(e) => update("prenom", e.target.value)}
                placeholder="Ex: Fatou" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Génération en cours...</>) : (<><SparklesIcon size={14} /> Générer le message</>)}
            </button>
          </form>
        </div>
        <GenerationOutput output={output} isLoading={loading} />
      </div>
    </ToolLayout>
  );
}
