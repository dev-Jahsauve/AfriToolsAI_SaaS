import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { isAdminEmail } from "../config/site";
import { MoonIcon, SunIcon } from "../components/icons";

export default function RegisterPage() {
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (isAdminEmail(form.email)) {
      setError("Les comptes administrateurs ne peuvent pas être créés ici. Utilisez la page de connexion pour accéder à votre compte.");
      return;
    }
    setLoading(true);
    const ok = await register(form.nom, form.prenom, form.email, form.password);
    setLoading(false);
    if (ok) navigate("/dashboard");
    else setError("Un compte existe déjà avec cet email. Essayez de vous connecter.");
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
            <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--text-primary)" }}>Créez votre compte</h1>
            <p style={{ color: "var(--text-secondary)" }}>5 générations gratuites pour commencer</p>
          </div>

          <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            {error && (
              <div className="mb-5 p-4 rounded-xl text-sm font-semibold" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Prénom</label>
                  <input type="text" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} placeholder="Aminata" required
                    className="w-full px-4 py-3 rounded-xl border text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Nom</label>
                  <input type="text" value={form.nom} onChange={(e) => update("nom", e.target.value)} placeholder="Diallo" required
                    className="w-full px-4 py-3 rounded-xl border text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Adresse email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="vous@exemple.com" required
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Mot de passe</label>
                <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Minimum 6 caractères" required
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2">
                {loading ? "Création en cours..." : "Créer mon compte gratuit →"}
              </button>
            </form>
            <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Déjà un compte ?{" "}
              <Link to="/connexion" className="font-bold" style={{ color: "var(--primary-text)" }}>Se connecter</Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
            {["5 générations gratuites", "Aucune carte bancaire", "Accès immédiat"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
