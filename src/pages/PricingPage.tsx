import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { MessageCircleIcon } from "../components/icons";

const plans = [
  {
    id: "gratuit",
    name: "Gratuit",
    price: "0",
    period: "",
    gens: 5,
    color: "border-[#E2E8F0]",
    badge: "",
    highlight: false,
    features: [
      "5 générations par mois",
      "Accès aux 5 outils IA",
      "Historique des générations",
      "Copie en un clic",
    ],
    missing: [
      "Générations illimitées",
      "Priorité de traitement",
      "Support prioritaire",
      "Export PDF",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "1 500",
    period: "/mois",
    gens: 100,
    color: "border-[#4F46E5]",
    badge: "Populaire",
    highlight: true,
    features: [
      "100 générations par mois",
      "Accès aux 5 outils IA",
      "Historique complet",
      "Copie en un clic",
      "Support par email",
    ],
    missing: [
      "Priorité de traitement",
      "Export PDF",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "3 500",
    period: "/mois",
    gens: 500,
    color: "border-[#7C3AED]",
    badge: "Meilleure valeur",
    highlight: false,
    features: [
      "500 générations par mois",
      "Accès aux 5 outils IA",
      "Historique complet",
      "Copie en un clic",
      "Support prioritaire",
      "Priorité de traitement",
    ],
    missing: [
      "Export PDF",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "7 500",
    period: "/mois",
    gens: 2000,
    color: "border-[#0F172A]",
    badge: "Tout inclus",
    highlight: false,
    features: [
      "2 000 générations par mois",
      "Accès aux 5 outils IA",
      "Historique illimité",
      "Copie en un clic",
      "Support dédié 24/7",
      "Priorité de traitement",
      "Export PDF",
      "Accès anticipé aux nouveaux outils",
    ],
    missing: [],
  },
];

const comparaison = [
  { label: "Générations/mois", gratuit: "5", starter: "100", pro: "500", business: "2 000" },
  { label: "Fiche produit", gratuit: "✓", starter: "✓", pro: "✓", business: "✓" },
  { label: "Publicité", gratuit: "✓", starter: "✓", pro: "✓", business: "✓" },
  { label: "Publication sociale", gratuit: "✓", starter: "✓", pro: "✓", business: "✓" },
  { label: "Messages WhatsApp", gratuit: "✓", starter: "✓", pro: "✓", business: "✓" },
  { label: "Offre commerciale", gratuit: "✓", starter: "✓", pro: "✓", business: "✓" },
  { label: "Historique", gratuit: "Limité", starter: "Complet", pro: "Complet", business: "Illimité" },
  { label: "Support", gratuit: "—", starter: "Email", pro: "Prioritaire", business: "Dédié 24/7" },
  { label: "Export PDF", gratuit: "—", starter: "—", pro: "—", business: "✓" },
];

export default function PricingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      {/* Hero */}
      <section className="py-20 text-center px-4">
        <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest">Tarification transparente</span>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-[#0F172A] mt-3 mb-4">
          Des tarifs adaptés à vos besoins
        </h1>
        <p className="text-[#64748B] max-w-xl mx-auto">
          Commencez gratuitement. Passez au plan supérieur uniquement quand vous en avez besoin. Annulez à tout moment.
        </p>
      </section>

      {/* Plans */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative ${plan.highlight ? "shadow-xl shadow-indigo-100" : "shadow-sm"}`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white ${plan.highlight ? "gradient-primary" : "bg-[#0F172A]"}`}>
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <div className="font-display font-bold text-[#0F172A] text-lg mb-1">{plan.name}</div>
                <div className="flex items-end gap-1">
                  <span className="font-display font-bold text-3xl text-[#0F172A]">
                    {plan.price === "0" ? "Gratuit" : plan.price}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-[#94A3B8] text-sm mb-1">FCFA{plan.period}</span>
                  )}
                </div>
                <div className="text-xs text-[#94A3B8] mt-1">{plan.gens} générations/mois</div>
              </div>

              <Link
                to={isAuthenticated ? "/dashboard" : "/inscription"}
                className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition-all mb-6 ${
                  plan.highlight
                    ? "gradient-primary text-white hover:opacity-90"
                    : "border-2 border-[#E2E8F0] text-[#0F172A] hover:border-[#4F46E5] hover:text-[#4F46E5]"
                }`}
              >
                {plan.price === "0" ? "Commencer gratuitement" : "Choisir ce plan"}
              </Link>

              <div className="space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-[#0F172A]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    {f}
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-[#94A3B8]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tableau comparatif */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-[#0F172A] text-center mb-8">
            Comparaison détaillée
          </h2>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E2E8F0]">
                  <th className="text-left px-5 py-4 font-bold text-[#64748B]">Fonctionnalité</th>
                  {["Gratuit", "Starter", "Pro", "Business"].map((p) => (
                    <th key={p} className="text-center px-4 py-4 font-bold text-[#0F172A]">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparaison.map((row, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="px-5 py-3.5 text-[#64748B] font-semibold">{row.label}</td>
                    {[row.gratuit, row.starter, row.pro, row.business].map((val, j) => (
                      <td key={j} className="text-center px-4 py-3.5">
                        {val === "✓" ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EEF2FF]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                          </span>
                        ) : val === "—" ? (
                          <span className="text-[#CBD5E1]">—</span>
                        ) : (
                          <span className="font-semibold text-[#0F172A] text-xs">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ tarifs */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl text-[#0F172A] mb-4">Des questions sur les tarifs ?</h2>
          <p className="text-[#64748B] mb-6">Les paiements seront disponibles très prochainement via Mobile Money et cartes bancaires.</p>
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#EEF2FF] rounded-xl">
            <span className="text-white flex justify-center"><MessageCircleIcon size={22} /></span>
            <div className="text-left">
              <div className="font-bold text-[#0F172A] text-sm">Contactez-nous sur WhatsApp</div>
              <div className="text-[#64748B] text-xs">+221 XX XXX XX XX</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
