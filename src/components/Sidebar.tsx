import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tools = [
  { path: "/dashboard/fiche-produit", label: "Fiche produit", icon: "📦" },
  { path: "/dashboard/publicite", label: "Publicité", icon: "📢" },
  { path: "/dashboard/publication-sociale", label: "Publication sociale", icon: "📱" },
  { path: "/dashboard/messages-whatsapp", label: "Messages WhatsApp", icon: "💬" },
  { path: "/dashboard/offre-commerciale", label: "Offre commerciale", icon: "🎯" },
];

const navItems = [
  { path: "/dashboard", label: "Tableau de bord", icon: HomeIcon },
  { path: "/dashboard/generations", label: "Mes générations", icon: HistoryIcon },
  { path: "/dashboard/profil", label: "Mon profil", icon: UserIcon },
  { path: "/tarifs", label: "Abonnements", icon: StarIcon },
];

const planColors: Record<string, string> = {
  gratuit: "#64748B",
  starter: "var(--primary)",
  pro: "var(--accent)",
  business: "#F59E0B",
};
const planLabels: Record<string, string> = { gratuit: "Gratuit", starter: "Starter", pro: "Pro", business: "Business" };

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate("/"); };

  const usagePercent = user ? Math.min(100, Math.round((user.generationsUsed / user.generationsLimit) * 100)) : 0;

  return (
    <aside className="w-64 flex flex-col h-full" style={{ backgroundColor: "var(--surface)", borderRight: "1px solid var(--border)" }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center animate-glow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
            AfriTools <span className="gradient-text">AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? "active" : ""}`}
              style={{ color: active ? "var(--primary-text)" : "var(--text-secondary)" }}
            >
              <Icon active={active} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Outils IA</p>
        </div>

        {tools.map((tool) => {
          const active = isActive(tool.path);
          return (
            <Link
              key={tool.path}
              to={tool.path}
              onClick={onClose}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? "active" : ""}`}
              style={{ color: active ? "var(--primary-text)" : "var(--text-secondary)" }}
            >
              <span className="text-base leading-none">{tool.icon}</span>
              {tool.label}
            </Link>
          );
        })}
      </nav>

      {/* Usage + user */}
      <div className="p-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
        {user && (
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Générations</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: planColors[user.plan] }}>
                {planLabels[user.plan]}
              </span>
            </div>
            <div className="text-xs font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
              {user.generationsUsed} / {user.generationsLimit}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
              <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.prenom?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{user?.prenom} {user?.nom}</p>
            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-muted)" }} title="Déconnexion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-muted)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  );
}
function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-muted)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12,8 12,12 14,14"/><path d="M3.05 11a9 9 0 119.9-8.9M3 4v7h7"/>
    </svg>
  );
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-muted)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function StarIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--primary)" : "var(--text-muted)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}
