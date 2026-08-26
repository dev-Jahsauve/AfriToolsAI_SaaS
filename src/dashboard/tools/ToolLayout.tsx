import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolLayout({ icon, title, description, children }: Props) {
  const { user } = useAuth();
  const remaining = user ? user.generationsLimit - user.generationsUsed : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>{title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{description}</p>
        </div>
        <div className="flex-shrink-0">
          <div
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: remaining > 0 ? "var(--primary-subtle)" : "rgba(239,68,68,0.15)",
              color: remaining > 0 ? "var(--primary-text)" : "#EF4444"
            }}
          >
            {remaining > 0 ? `${remaining} restantes` : "Limite atteinte"}
          </div>
        </div>
      </div>

      {remaining === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-4">⚡</div>
          <div className="font-display font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>Vous avez atteint votre limite</div>
          <div className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            Passez au plan Starter pour continuer à créer du contenu professionnel.
          </div>
          <Link to="/tarifs" className="inline-block px-6 py-3 rounded-xl gradient-primary text-white font-bold hover:opacity-90">
            Voir les plans →
          </Link>
        </div>
      ) : children}
    </div>
  );
}
