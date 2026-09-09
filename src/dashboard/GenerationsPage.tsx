import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp, ToolType } from "../context/AppContext";
import { TOOLS, toolById, toolLabel } from "../config/tools";
import { ArrowRightIcon, CopyIcon, InboxIcon } from "../components/icons";

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
    <div className="p-6 max-w-5xl mx-auto" style={{ backgroundColor: "var(--bg)" }}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>Mes générations</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{allGens.length} contenu{allGens.length > 1 ? "s" : ""} généré{allGens.length > 1 ? "s" : ""} au total</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["tous", ...TOOLS.map((t) => t.id)] as const).map((f) => {
          const meta = f === "tous" ? null : toolById(f);
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                active
                  ? "gradient-primary text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary-text)]"
              }`}
              style={active ? undefined : { backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {meta && <meta.Icon size={13} style={{ color: active ? "currentColor" : "var(--text-muted)" }} />}
              {f === "tous" ? "Tous" : meta?.label}
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white">
            <InboxIcon size={26} />
          </div>
          <div className="font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>Aucune génération pour l'instant</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Utilisez un outil IA pour créer votre premier contenu</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((gen) => {
            const meta = toolById(gen.tool);
            const Icon = meta?.Icon;
            return (
              <div key={gen.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta?.gradient ?? "from-slate-400 to-slate-500"} flex items-center justify-center text-white flex-shrink-0`}>
                    {Icon && <Icon size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>{toolLabel(gen.tool)}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(gen.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(gen.id, gen.output)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        copied === gen.id
                          ? "text-[#16A34A]"
                          : "hover:text-white"
                      }`}
                      style={copied === gen.id ? { backgroundColor: "rgba(22,163,74,0.12)" } : { backgroundColor: "var(--primary-subtle)", color: "var(--primary-text)" }}
                    >
                      <CopyIcon size={12} />
                      {copied === gen.id ? "Copié !" : "Copier"}
                    </button>
                    <button
                      onClick={() => setExpanded(expanded === gen.id ? null : gen.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                    >
                      {expanded === gen.id ? "Réduire" : "Voir"}
                      <ArrowRightIcon size={12} className={expanded === gen.id ? "rotate-90 transition-transform" : "transition-transform"} />
                    </button>
                  </div>
                </div>

                {expanded === gen.id && (
                  <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: "var(--text-primary)" }}>{gen.output}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}