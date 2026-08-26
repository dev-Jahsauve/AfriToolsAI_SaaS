import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, PLAN_LIMITS } from "../context/AuthContext";

const planColors: Record<string, string> = {
  gratuit: "text-[#64748B] bg-[#F1F5F9]",
  starter: "text-[#4F46E5] bg-[#EEF2FF]",
  pro: "text-[#7C3AED] bg-[#F5F3FF]",
  business: "text-[#D97706] bg-[#FEF3C7]",
};
const planLabels: Record<string, string> = {
  gratuit: "Plan Gratuit",
  starter: "Plan Starter",
  pro: "Plan Pro",
  business: "Plan Business",
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ nom: user?.nom || "", prenom: user?.prenom || "", email: user?.email || "" });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const usagePercent = Math.min(100, Math.round((user.generationsUsed / user.generationsLimit) * 100));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#0F172A]">Mon profil</h1>
        <p className="text-[#64748B] text-sm mt-1">Gérez vos informations et votre abonnement</p>
      </div>

      {saved && (
        <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-sm text-[#16A34A] font-bold animate-fade-in">
          ✓ Profil mis à jour avec succès !
        </div>
      )}

      {/* Avatar + Plan */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-display font-bold text-2xl">
            {user.prenom?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-xl text-[#0F172A]">{user.prenom} {user.nom}</div>
            <div className="text-[#64748B] text-sm">{user.email}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${planColors[user.plan]}`}>
                {planLabels[user.plan]}
              </span>
              <span className="text-xs text-[#94A3B8]">
                Membre depuis {new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all"
          >
            {editing ? "Annuler" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 animate-fade-in">
          <h2 className="font-display font-bold text-[#0F172A] mb-5">Modifier le profil</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Prénom</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] transition-all"
              />
            </div>
            <button type="submit" className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity">
              Sauvegarder les modifications
            </button>
          </form>
        </div>
      )}

      {/* Usage */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-display font-bold text-[#0F172A] mb-5">Utilisation du plan</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B] font-semibold">Générations utilisées ce mois</span>
            <span className="font-bold text-[#0F172A]">{user.generationsUsed} / {user.generationsLimit}</span>
          </div>
          <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${usagePercent >= 90 ? "bg-[#EF4444]" : "gradient-primary"}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#94A3B8]">
            <span>{user.generationsLimit - user.generationsUsed} restantes</span>
            <span>{usagePercent}% utilisé</span>
          </div>
        </div>

        {user.plan !== "business" && (
          <div className="mt-5 p-4 bg-[#EEF2FF] rounded-xl">
            <div className="font-bold text-[#4F46E5] text-sm mb-1">Besoin de plus de générations ?</div>
            <div className="text-xs text-[#64748B] mb-3">Passez au plan supérieur pour débloquer plus de générations.</div>
            <Link to="/tarifs" className="inline-block px-4 py-2 rounded-lg gradient-primary text-white text-xs font-bold hover:opacity-90">
              Voir les plans →
            </Link>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-[#FCA5A5] p-6">
        <h2 className="font-display font-bold text-[#0F172A] mb-2">Zone de danger</h2>
        <p className="text-[#64748B] text-sm mb-4">Ces actions sont irréversibles. Procédez avec prudence.</p>
        <button className="px-4 py-2 rounded-xl border border-[#FCA5A5] text-sm font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-all">
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
