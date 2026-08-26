import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp, ToolType } from "../context/AppContext";

const toolLabels: Record<ToolType, string> = {
  "fiche-produit": "Fiche produit",
  publicite: "Publicité",
  "publication-sociale": "Publication sociale",
  "messages-whatsapp": "Messages WhatsApp",
  "offre-commerciale": "Offre commerciale",
};

const toolIcons: Record<ToolType, string> = {
  "fiche-produit": "📦",
  publicite: "📢",
  "publication-sociale": "📱",
  "messages-whatsapp": "💬",
  "offre-commerciale": "🎯",
};

export default function GenerationsPage() {
  const { user } = useAuth();
  const { getGenerationsByUser } = useApp();
  const [filter, setFilter] = useState<"tous" | ToolType>("tous");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  if (!user) return null;

  const allGens = getGenerationsByUser(user.id);
  const filtered = filter === "tous" ? allGens : allGens.filter((g) => g.tool === filter);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#0F172A]">Mes générations</h1>
        <p className="text-[#64748B] text-sm mt-1">{allGens.length} contenu{allGens.length > 1 ? "s" : ""} généré{allGens.length > 1 ? "s" : ""} au total</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["tous", "fiche-produit", "publicite", "publication-sociale", "messages-whatsapp", "offre-commerciale"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "gradient-primary text-white shadow-sm"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5] hover:text-[#4F46E5]"
            }`}
          >
            {f === "tous" ? "Tous" : `${toolIcons[f]} ${toolLabels[f]}`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <div className="font-display font-bold text-[#0F172A] mb-2">Aucune génération pour l'instant</div>
          <div className="text-[#64748B] text-sm">Utilisez un outil IA pour créer votre premier contenu</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((gen) => (
            <div key={gen.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-lg flex-shrink-0">
                  {toolIcons[gen.tool]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[#0F172A] text-sm">{toolLabels[gen.tool]}</div>
                  <div className="text-xs text-[#94A3B8]">
                    {new Date(gen.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(gen.id, gen.output)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      copied === gen.id
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : "bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                    }`}
                  >
                    {copied === gen.id ? "Copié !" : "Copier"}
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === gen.id ? null : gen.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F8F9FC] text-[#64748B] hover:bg-[#E2E8F0] transition-all"
                  >
                    {expanded === gen.id ? "Réduire" : "Voir"}
                  </button>
                </div>
              </div>

              {expanded === gen.id && (
                <div className="border-t border-[#F1F5F9] px-5 py-4">
                  <pre className="text-xs text-[#0F172A] whitespace-pre-wrap font-sans leading-relaxed">{gen.output}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
