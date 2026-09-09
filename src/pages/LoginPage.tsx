import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "../components/icons";

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate("/dashboard");
    else setError("Email ou mot de passe incorrect. Vérifiez vos informations.");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-bold" style={{ color: "var(--text-primary)" }}>AfriTools <span className="gradient-text">AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm">{isDark ? <MoonIcon size={15} style={{ color: "var(--text-muted)" }} /> : <SunIcon size={15} style={{ color: "var(--text-muted)" }} />}</span>
          <button onClick={toggleTheme} className={`theme-toggle ${isDark ? "dark" : ""}`} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--text-primary)" }}>Bon retour !</h1>
            <p style={{ color: "var(--text-secondary)" }}>Connectez-vous pour accéder à vos outils IA</p>
          </div>

          <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            {error && (
              <div className="mb-5 p-4 rounded-xl text-sm font-semibold" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Adresse email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>
            <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Pas encore de compte ?{" "}
              <Link to="/inscription" className="font-bold" style={{ color: "var(--primary-text)" }}>Créer un compte gratuit</Link>
            </div>
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>5 générations gratuites · Aucune carte bancaire requise</p>
        </div>
      </div>
    </div>
  );
}
