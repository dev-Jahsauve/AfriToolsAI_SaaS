import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCredits } from "../context/CreditsContext";
import { TOOLS } from "../config/tools";
import {
  HomeIcon,
  HistoryIcon,
  UserIcon,
  StarIcon,
  WalletIcon,
  LockIcon,
  LogOutIcon,
  GiftIcon,
} from "./icons";

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
  const { summary, claim } = useCredits();

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate("/"); };

  const balance = summary?.balance ?? 0;
  const dailyEnabled = summary?.daily_free?.enabled ?? false;
  const dailyClaimed = summary?.daily_free?.claimed_today ?? false;
  const dailyQuantity = summary?.daily_free?.quantity ?? 0;
  const dailyNextAt = summary?.daily_free?.next_at ?? null;
  const isAdminArea =
    summary?.role === "moderator" || summary?.role === "admin" || summary?.role === "super_admin";

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
              <Icon active={active} size={16} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Outils IA</p>
        </div>

        {TOOLS.map((tool) => {
          const Icon = tool.Icon;
          const active = isActive(tool.path);
          return (
            <Link
              key={tool.path}
              to={tool.path}
              onClick={onClose}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? "active" : ""}`}
              style={{ color: active ? "var(--primary-text)" : "var(--text-secondary)" }}
            >
              <Icon active={active} size={16} />
              {tool.label}
            </Link>
          );
        })}

        {isAdminArea && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Administration</p>
            </div>
            <Link
              to="/admin"
              onClick={onClose}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive("/admin") ? "active" : ""}`}
              style={{ color: isActive("/admin") ? "var(--primary-text)" : "var(--text-secondary)" }}
            >
              <LockIcon active={isActive("/admin")} size={16} />
              Administration
            </Link>
          </>
        )}
      </nav>

      {/* Usage + user */}
      <div className="p-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
        {user && (
          <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Mes crédits</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: planColors[user.plan] }}>
                {planLabels[user.plan]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <WalletIcon size={16} style={{ color: "var(--primary)" }} />
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{balance}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>crédit(s)</span>
            </div>
            {summary?.admin_bypass && (
              <p className="text-[10px] font-bold text-emerald-600">Mode admin : générations sans débit</p>
            )}
            {dailyEnabled && !summary?.admin_bypass && (
              <button
                onClick={claim}
                disabled={dailyClaimed}
                className="w-full py-1.5 rounded-lg gradient-primary text-white text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <GiftIcon size={13} className="flex-shrink-0" />
                {dailyClaimed
                  ? dailyNextAt
                    ? `Crédits gratuits dispo le ${new Date(dailyNextAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                    : "Crédits gratuits récupérés"
                  : `Récupérer ${dailyQuantity} crédits gratuits`}
              </button>
            )}
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
          <button onClick={handleLogout} className="p-1.5 rounded-lg transition-all hover:bg-[var(--primary-subtle)]" style={{ color: "var(--text-muted)" }} title="Déconnexion">
            <LogOutIcon size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}