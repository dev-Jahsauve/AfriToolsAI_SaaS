import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCredits } from "../../context/CreditsContext";
import { toolById, type ToolId } from "../../config/tools";
import { ArrowRightIcon, ZapIcon } from "../../components/icons";

interface Props {
  toolId: ToolId;
  children: ReactNode;
}

export default function ToolLayout({ toolId, children }: Props) {
  const { summary } = useCredits();
  const meta = toolById(toolId);
  const Icon = meta?.Icon;
  const balance = summary?.balance ?? 0;
  const adminBypass = summary?.admin_bypass ?? false;
  const blocked = !adminBypass && balance <= 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta?.gradient ?? "from-slate-400 to-slate-500"} flex items-center justify-center text-white flex-shrink-0`}>
          {Icon && <Icon size={22} />}
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>{meta?.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{meta?.description}</p>
        </div>
        <div className="flex-shrink-0">
          <div
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: blocked ? "rgba(239,68,68,0.15)" : "var(--primary-subtle)",
              color: blocked ? "#EF4444" : "var(--primary-text)"
            }}
          >
            {adminBypass ? "Accès admin" : blocked ? "Aucun crédit" : `${balance} crédit${balance > 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {blocked ? (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white mx-auto mb-4">
            <ZapIcon size={26} />
          </div>
          <div className="font-display font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>Vous n'avez plus de crédits</div>
          <div className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            Récupérez vos crédits gratuits depuis la barre latérale ou passez à un plan pour continuer à créer du contenu professionnel.
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/tarifs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-bold hover:opacity-90">
              Voir les plans <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}