import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const tools = [
  { icon: "📦", label: "Fiche produit", path: "/dashboard/fiche-produit", gradient: "from-blue-500 to-indigo-600" },
  { icon: "📢", label: "Publicité", path: "/dashboard/publicite", gradient: "from-purple-500 to-violet-600" },
  { icon: "📱", label: "Publication sociale", path: "/dashboard/publication-sociale", gradient: "from-pink-500 to-rose-600" },
  { icon: "💬", label: "Messages WhatsApp", path: "/dashboard/messages-whatsapp", gradient: "from-green-500 to-emerald-600" },
  { icon: "🎯", label: "Offre commerciale", path: "/dashboard/offre-commerciale", gradient: "from-orange-500 to-amber-600" },
];

const toolLabels: Record<string, string> = {
  "fiche-produit": "Fiche produit",
  publicite: "Publicité",
  "publication-sociale": "Publication sociale",
  "messages-whatsapp": "Messages WhatsApp",
  "offre-commerciale": "Offre commerciale",
};

const planLabels: Record<string, string> = { gratuit: "Gratuit", starter: "Starter", pro: "Pro", business: "Business" };
const planGradients: Record<string, string> = {
  gratuit: "from-slate-400 to-slate-500",
  starter: "from-indigo-500 to-violet-600",
  pro: "from-violet-500 to-purple-600",
  business: "from-amber-500 to-orange-500",
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { getGenerationsByUser } = useApp();

  if (!user) return null;

  const userGens = getGenerationsByUser(user.id);
  const recentGens = userGens.slice(0, 4);
  const usagePercent = Math.min(100, Math.round((user.generationsUsed / user.generationsLimit) * 100));
  const remaining = user.generationsLimit - user.generationsUsed;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
          Bonjour, {user.prenom} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Prêt à créer du contenu qui vend ?</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { val: user.generationsUsed, label: "Utilisées", icon: "⚡" },
          { val: remaining, label: "Restantes", icon: "🎯", alert: remaining === 0 },
          { val: userGens.length, label: "Total généré", icon: "📄" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5 card-hover" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="font-display font-bold text-2xl" style={{ color: s.alert ? "#EF4444" : "var(--text-primary)" }}>{s.val}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
        {/* Plan card */}
        <div className={`rounded-2xl p-5 bg-gradient-to-br ${planGradients[user.plan]} text-white card-hover`}>
          <div className="text-xl mb-2">👑</div>
          <div className="font-display font-bold text-xl">{planLabels[user.plan]}</div>
          <div className="text-xs font-semibold mt-1 text-white/70">Plan actuel</div>
        </div>
      </div>

      {/* Usage bar */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>Utilisation mensuelle</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{user.generationsUsed} sur {user.generationsLimit} générations</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{usagePercent}%</div>
          </div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${usagePercent}%`,
              background: usagePercent >= 90 ? "#EF4444" : "var(--gradient-primary)"
            }}
          />
        </div>
        {user.plan === "gratuit" && remaining <= 2 && (
          <div className="mt-4 p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "var(--primary-subtle)", border: "1px solid var(--border)" }}>
            <span className="text-lg">✨</span>
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: "var(--primary-text)" }}>Passez au plan Starter</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>100 générations/mois pour seulement 1 500 FCFA</div>
            </div>
            <Link to="/tarifs" className="flex-shrink-0 text-xs font-bold text-white gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90">Voir →</Link>
          </div>
        )}
      </div>

      {/* Tools */}
      <div>
        <h2 className="font-display font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Accès rapide aux outils</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              to={remaining > 0 ? tool.path : "/tarifs"}
              className="rounded-2xl p-5 text-center card-hover group"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <div className="font-display font-bold text-xs leading-tight" style={{ color: "var(--text-primary)" }}>{tool.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent generations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>Générations récentes</h2>
          <Link to="/dashboard/generations" className="text-sm font-bold transition-colors" style={{ color: "var(--primary-text)" }}>
            Voir tout →
          </Link>
        </div>

        {recentGens.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-4xl mb-3">🚀</div>
            <div className="font-display font-bold mb-1" style={{ color: "var(--text-primary)" }}>Commencez à générer !</div>
            <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Utilisez un outil ci-dessus pour créer votre premier contenu</div>
            <Link to="/dashboard/fiche-produit" className="inline-block px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90">
              Créer une fiche produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentGens.map((gen) => (
              <div key={gen.id} className="rounded-2xl p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm">
                    {tools.find((t) => t.path.includes(gen.tool))?.icon || "📄"}
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{toolLabels[gen.tool]}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(gen.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>{gen.output.substring(0, 150)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
