import { Link } from "react-router-dom";
import { FacebookIcon, HeartIcon, KeyIcon, MessageCircleIcon, RocketIcon } from "./icons";

const WHATSAPP_NUMBER = "237698308780";
const FACEBOOK_URL = "https://www.facebook.com/share/18xePHwZTX/";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--text-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display font-bold text-white text-lg">AfriTools AI</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-5">
              L'IA qui aide les business africains à vendre. Créez du contenu commercial professionnel en quelques secondes.
            </p>

            {/* Contacts réels */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                style={{ backgroundColor: "rgba(37, 211, 102, 0.12)", border: "1px solid rgba(37, 211, 102, 0.25)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#25D366" }}>
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Nous contacter sur WhatsApp</div>
                  <div className="text-xs" style={{ color: "#25D366" }}>+{WHATSAPP_NUMBER}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" className="ml-auto group-hover:translate-x-0.5 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                style={{ backgroundColor: "rgba(24, 119, 242, 0.12)", border: "1px solid rgba(24, 119, 242, 0.25)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1877F2" }}>
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Notre page Facebook</div>
                  <div className="text-xs" style={{ color: "#1877F2" }}>Suivez-nous et rejoignez la communauté</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" className="ml-auto group-hover:translate-x-0.5 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Outils IA", to: "/#outils" },
                { label: "Tarifs", to: "/tarifs" },
                { label: "Comment ça marche", to: "/#comment-ca-marche" },
                { label: "Résultats", to: "/#resultats" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Nous rejoindre</h4>
            <ul className="space-y-2.5">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircleIcon size={13} className="text-white/40" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                  <FacebookIcon size={13} className="text-white/40" /> Facebook
                </a>
              </li>
              <li>
                <Link to="/inscription" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                  <RocketIcon size={13} className="text-white/40" /> S'inscrire gratuitement
                </Link>
              </li>
              <li>
                <Link to="/connexion" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
                  <KeyIcon size={13} className="text-white/40" /> Se connecter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-xs text-white/25">© 2025 AfriTools AI. Tous droits réservés.</p>
          <p className="text-xs text-white/25 flex items-center gap-1.5">Fait avec <HeartIcon size={12} className="text-white/40" /> pour les entrepreneurs africains</p>
        </div>
      </div>
    </footer>
  );
}
