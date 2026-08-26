import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ backgroundColor: `color-mix(in srgb, var(--surface) 92%, transparent)`, borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center animate-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-800 text-lg leading-none" style={{ color: "var(--text-primary)" }}>
              AfriTools <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            <Link to="/#outils" className="hover:text-[var(--primary-text)] transition-colors">Outils</Link>
            <Link to="/#comment-ca-marche" className="hover:text-[var(--primary-text)] transition-colors">Comment ça marche</Link>
            <Link to="/tarifs" className="hover:text-[var(--primary-text)] transition-colors">Tarifs</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle discret */}
            <div className="flex items-center gap-2">
              <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
              <button
                onClick={toggleTheme}
                className={`theme-toggle ${isDark ? "dark" : ""}`}
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              />
            </div>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold transition-colors" style={{ color: "var(--primary-text)" }}>
                  Tableau de bord
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-sm font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>
                  Connexion
                </Link>
                <Link to="/inscription" className="text-sm font-semibold px-5 py-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity shadow-sm">
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleTheme} className={`theme-toggle ${isDark ? "dark" : ""}`} />
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {menuOpen ? (<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>) : (<><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>)}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 animate-fade-in" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          {["/#outils", "/#comment-ca-marche", "/tarifs"].map((href, i) => (
            <Link key={i} to={href} className="text-sm font-semibold py-2" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>
              {["Outils", "Comment ça marche", "Tarifs"][i]}
            </Link>
          ))}
          <div className="border-t pt-3 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold py-2" style={{ color: "var(--primary-text)" }} onClick={() => setMenuOpen(false)}>Tableau de bord</Link>
                <button onClick={handleLogout} className="text-sm font-semibold py-2 text-left" style={{ color: "var(--text-secondary)" }}>Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-sm font-semibold py-2" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>Connexion</Link>
                <Link to="/inscription" className="text-sm font-semibold px-5 py-3 rounded-xl gradient-primary text-white text-center" onClick={() => setMenuOpen(false)}>Commencer gratuitement</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
