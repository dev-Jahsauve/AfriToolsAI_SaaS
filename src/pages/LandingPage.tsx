import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Images Unsplash
const IMG_HERO_WOMAN = "https://images.unsplash.com/photo-1687422808311-a776f467a468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80";
const IMG_ENTREPRENEUR_WOMAN = "https://images.unsplash.com/photo-1680879275304-bbe20f7e28fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";
const IMG_ENTREPRENEUR_MAN = "https://images.unsplash.com/photo-1676119451563-0c4a1a37e019?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";
const IMG_LAPTOP_WOMAN = "https://images.unsplash.com/photo-1675250719891-37d4747c9e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";
const IMG_COFFEE_WOMAN = "https://images.unsplash.com/photo-1748002369513-af0f999d9f1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";

const tools = [
  { icon: "📦", title: "Fiche produit", desc: "Fiches persuasives qui donnent envie d'acheter instantanément.", path: "/dashboard/fiche-produit", color: "from-blue-500 to-indigo-600" },
  { icon: "📢", title: "Publicité", desc: "Textes publicitaires percutants pour Facebook, Instagram et WhatsApp.", path: "/dashboard/publicite", color: "from-purple-500 to-violet-600" },
  { icon: "📱", title: "Publication sociale", desc: "Posts optimisés avec accroche, contenu engageant et appel à l'action.", path: "/dashboard/publication-sociale", color: "from-pink-500 to-rose-600" },
  { icon: "💬", title: "Messages WhatsApp", desc: "Messages naturels pour relancer, fidéliser ou convertir vos prospects.", path: "/dashboard/messages-whatsapp", color: "from-green-500 to-emerald-600" },
  { icon: "🎯", title: "Offre commerciale", desc: "Transformez vos réductions en offres irrésistibles avec plusieurs variantes.", path: "/dashboard/offre-commerciale", color: "from-orange-500 to-amber-600" },
];

const results = [
  {
    img: IMG_ENTREPRENEUR_WOMAN,
    name: "Fatou N.",
    job: "Vendeuse de cosmétiques naturels",
    country: "🇨🇲 Cameroun",
    metric: "+340%",
    metricLabel: "de ventes en 2 mois",
    quote: "Mes posts Facebook sont devenus tellement professionnels que mes clientes pensent que j'ai une agence !",
    tool: "Publication sociale",
  },
  {
    img: IMG_ENTREPRENEUR_MAN,
    name: "Kwame A.",
    job: "Coach business digital",
    country: "🇬🇭 Ghana",
    metric: "2× plus",
    metricLabel: "de clients en 30 jours",
    quote: "Je génère mes textes publicitaires en 30 secondes. Avant, ça me prenait 2 heures et c'était moins bien.",
    tool: "Publicité",
  },
  {
    img: IMG_LAPTOP_WOMAN,
    name: "Aminata D.",
    job: "Community Manager",
    country: "🇸🇳 Sénégal",
    metric: "5 clients",
    metricLabel: "gérés avec AfriTools AI",
    quote: "Je gère 5 pages Facebook pour mes clients et je crée tout le contenu en moins d'une heure par semaine !",
    tool: "Publication sociale",
  },
  {
    img: IMG_COFFEE_WOMAN,
    name: "Ngozi O.",
    job: "Restauratrice & traiteure",
    country: "🇳🇬 Nigeria",
    metric: "0 → 800",
    metricLabel: "commandes WhatsApp/mois",
    quote: "Mes messages WhatsApp sont tellement bien rédigés que les clients commandent sans même poser de questions.",
    tool: "Messages WhatsApp",
  },
];

const steps = [
  { num: "1", title: "Choisissez un outil", desc: "Sélectionnez parmi nos 5 outils IA selon votre besoin du moment.", icon: "🎯" },
  { num: "2", title: "Remplissez le formulaire", desc: "Décrivez votre produit, votre audience et votre objectif en quelques secondes.", icon: "✍️" },
  { num: "3", title: "Obtenez votre contenu", desc: "L'IA génère un contenu professionnel et persuasif adapté au marché africain.", icon: "⚡" },
  { num: "4", title: "Copiez et publiez", desc: "Utilisez le contenu directement sur WhatsApp, Facebook, Instagram ou votre boutique.", icon: "🚀" },
];

const faqs = [
  { q: "AfriTools AI est-il gratuit ?", a: "Oui ! Vous pouvez commencer gratuitement avec 5 générations par mois. Pour plus de générations, nos plans payants commencent à 1 500 FCFA/mois." },
  { q: "Ai-je besoin de compétences techniques ?", a: "Absolument pas. AfriTools AI est conçu pour être utilisé par n'importe qui. Si vous pouvez envoyer un message WhatsApp, vous pouvez utiliser nos outils." },
  { q: "Le contenu est-il adapté au marché africain ?", a: "Oui. Nos outils génèrent du contenu pensé pour les réalités des business africains — les prix en FCFA, les plateformes locales, le style de communication." },
  { q: "Puis-je annuler mon abonnement à tout moment ?", a: "Bien sûr. Vous pouvez passer d'un plan à l'autre ou annuler votre abonnement à tout moment, sans frais ni engagement." },
  { q: "Combien de temps faut-il pour générer un contenu ?", a: "Environ 2 à 3 secondes. Vous remplissez le formulaire, l'IA génère et vous obtenez votre contenu prêt à l'emploi instantanément." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, var(--primary-subtle) 0%, var(--bg) 50%, var(--accent-subtle) 100%)" }}
        />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: "var(--accent)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-text)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--primary)" }} />
                Outil IA #1 pour entrepreneurs africains
              </span>
              <h1 className="font-display font-900 text-4xl sm:text-5xl lg:text-[3.5rem] leading-tight mb-6" style={{ color: "var(--text-primary)" }}>
                L'IA qui aide les{" "}
                <span className="gradient-text">business africains</span>
                {" "}à vendre plus
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Créez en quelques secondes des fiches produits, publicités, posts et messages WhatsApp professionnels — sans compétences en marketing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/inscription" className="px-8 py-4 rounded-xl gradient-primary text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg text-center">
                  Commencer gratuitement →
                </Link>
                <a href="#resultats" className="px-8 py-4 rounded-xl font-bold text-base transition-all text-center border-2" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
                  Voir les résultats
                </a>
              </div>
              <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>5 générations gratuites · Aucune carte bancaire requise</p>

              {/* Mini stats */}
              <div className="flex gap-6 mt-8 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
                {[["5 000+", "Entrepreneurs"], ["120K+", "Contenus générés"], ["4.9★", "Note moyenne"]].map(([v, l]) => (
                  <div key={l}>
                    <div className="font-display font-bold text-xl gradient-text">{v}</div>
                    <div className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-float" style={{ boxShadow: "var(--shadow-hover)" }}>
                <img src={IMG_HERO_WOMAN} alt="Entrepreneur africaine utilisant AfriTools AI" className="w-full h-[460px] object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-2xl p-4 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-lg">⚡</div>
                      <div>
                        <div className="font-bold text-white text-sm">Fiche produit générée</div>
                        <div className="text-white/70 text-xs">en 2.3 secondes · Prête à publier</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-xl animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="text-2xl text-center">🔥</div>
                <div className="font-bold text-xs text-center mt-1" style={{ color: "var(--text-primary)" }}>+340% ventes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problème ── */}
      <section className="py-20" style={{ backgroundColor: "var(--text-primary)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-6">
            Vous perdez des ventes à cause de contenus peu convaincants ?
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Rédiger des publicités efficaces, des fiches produits persuasives et des messages qui convertissent demande du temps et des compétences. La plupart des entrepreneurs africains n'ont ni l'un ni l'autre.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: "⏰", title: "Perte de temps", desc: "Des heures passées à chercher les bons mots sans résultat." },
              { icon: "😕", title: "Contenu amateur", desc: "Des posts et publicités qui ne convainquent pas vos clients." },
              { icon: "📉", title: "Ventes stagnantes", desc: "Votre produit est bon, mais personne ne l'achète." },
            ].map((p) => (
              <div key={p.title} className="rounded-xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-2xl mb-3">{p.icon}</div>
                <div className="font-display font-bold text-white mb-2">{p.title}</div>
                <div className="text-white/50 text-sm">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Résultats réels ── */}
      <section id="resultats" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary-text)" }}>Résultats concrets</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 mb-4" style={{ color: "var(--text-primary)" }}>
              Ce que nos utilisateurs obtiennent
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Des entrepreneurs africains comme vous ont transformé leur business avec AfriTools AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden card-hover"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex gap-0">
                  {/* Image */}
                  <div className="w-32 sm:w-44 flex-shrink-0 relative">
                    <img src={r.img} alt={r.name} className="w-full h-full object-cover min-h-[180px]" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, var(--surface))" }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{r.job}</div>
                        <div className="text-xs mt-0.5">{r.country}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-text)" }}>
                        {r.tool}
                      </span>
                    </div>
                    {/* Metric */}
                    <div className="mb-3">
                      <div className="font-display font-bold text-2xl gradient-text">{r.metric}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{r.metricLabel}</div>
                    </div>
                    <p className="text-xs italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      "{r.quote}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA résultats */}
          <div className="mt-12 text-center">
            <Link to="/inscription" className="inline-block px-8 py-4 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-opacity shadow-lg">
              Obtenez les mêmes résultats — Gratuit →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Outils ── */}
      <section id="outils" className="py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary-text)" }}>5 outils IA puissants</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 mb-4" style={{ color: "var(--text-primary)" }}>
              Tout ce qu'il vous faut pour vendre plus
            </h2>
            <p style={{ color: "var(--text-secondary)" }} className="max-w-xl mx-auto">
              Chaque outil est optimisé pour le marché africain et les plateformes que vous utilisez au quotidien.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <div key={i} className="rounded-2xl p-6 card-hover group" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{tool.title}</h3>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tool.desc}</p>
                <Link to="/inscription" className="text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "var(--primary-text)" }}>
                  Essayer gratuitement
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                  </svg>
                </Link>
              </div>
            ))}
            {/* CTA card */}
            <div className="gradient-primary rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-5">✨</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">Prêt à commencer ?</h3>
                <p className="text-white/70 text-sm mb-5">5 générations gratuites, sans carte bancaire.</p>
              </div>
              <Link to="/inscription" className="bg-white font-bold text-sm py-3 px-5 rounded-xl text-center hover:opacity-90 transition-opacity" style={{ color: "var(--primary)" }}>
                Créer mon compte →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary-text)" }}>Simple et rapide</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3" style={{ color: "var(--text-primary)" }}>Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary text-2xl flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="font-display font-bold text-xs mb-1 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Étape {step.num}</div>
                <h3 className="font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof visuel large ── */}
      <section className="py-0 overflow-hidden">
        <div className="grid grid-cols-3 h-64 sm:h-80">
          {[IMG_ENTREPRENEUR_WOMAN, IMG_HERO_WOMAN, IMG_LAPTOP_WOMAN].map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--text-primary) 0%, transparent 60%)" }} />
            </div>
          ))}
        </div>
        <div className="gradient-primary py-12 text-center px-4">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
            Rejoignez des milliers d'entrepreneurs africains
          </h2>
          <p className="text-white/70 mb-6">qui utilisent déjà AfriTools AI pour vendre plus chaque jour</p>
          <Link to="/inscription" className="inline-block bg-white font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-opacity" style={{ color: "var(--primary)" }}>
            Commencer maintenant — Gratuit
          </Link>
        </div>
      </section>

      {/* ── Tarifs preview ── */}
      <section className="py-24" style={{ backgroundColor: "var(--text-primary)" }} id="tarifs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Tarification simple</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 mb-4">Commencez gratuitement</h2>
          <p className="text-white/50 mb-10">Passez au plan payant uniquement quand vous en avez besoin.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { name: "Gratuit", price: "0", gens: "5 gen/mois" },
              { name: "Starter", price: "1 500", gens: "100 gen/mois" },
              { name: "Pro", price: "3 500", gens: "500 gen/mois" },
              { name: "Business", price: "7 500", gens: "2 000 gen/mois" },
            ].map((p, i) => (
              <div key={p.name} className={`rounded-2xl p-5 text-left ${i === 2 ? "gradient-primary" : "bg-white/5"}`} style={{ border: i !== 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div className="font-display font-bold text-white text-sm mb-1">{p.name}</div>
                <div className="font-bold text-xl text-white mb-1">
                  {p.price === "0" ? "Gratuit" : <>{p.price} <span className="text-xs font-normal opacity-70">FCFA/mois</span></>}
                </div>
                <div className="text-xs text-white/50">{p.gens}</div>
              </div>
            ))}
          </div>
          <Link to="/tarifs" className="inline-block px-6 py-3 rounded-xl font-bold text-white transition-colors" style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
            Voir tous les détails →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl" style={{ color: "var(--text-primary)" }}>Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto gradient-primary rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)" }} />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Prêt à vendre plus avec l'IA ?
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Rejoignez des milliers d'entrepreneurs africains qui créent du contenu qui convertit chaque jour.
            </p>
            <Link to="/inscription" className="inline-block bg-white font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-colors shadow-lg" style={{ color: "var(--primary)" }}>
              Commencer gratuitement — 0 FCFA
            </Link>
            <p className="mt-4 text-white/40 text-xs">Sans carte bancaire · 5 générations offertes · Accès immédiat</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      <button className="w-full flex items-center justify-between px-6 py-4 text-left gap-4" onClick={() => setOpen(!open)}>
        <span className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm leading-relaxed border-t pt-4" style={{ color: "var(--text-secondary)", borderColor: "var(--border-subtle)" }}>
          {a}
        </div>
      )}
    </div>
  );
}
