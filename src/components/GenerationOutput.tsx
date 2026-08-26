import { useState } from "react";

interface Props {
  output: string;
  isLoading: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/^━+$/gm, "<hr style='border-color:var(--border);margin:12px 0'/>")
    .replace(/\n/g, "<br/>");
}

export default function GenerationOutput({ output, isLoading }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center animate-pulse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>Génération en cours...</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>L'IA prépare votre contenu</p>
          </div>
        </div>
        <div className="space-y-3">
          {[100, 85, 70, 90, 60].map((w, i) => (
            <div key={i} className="shimmer h-4 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!output) return null;

  return (
    <div className="rounded-2xl overflow-hidden animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-secondary)" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-bold" style={{ color: "var(--primary-text)" }}>Résultat généré par AfriTools AI</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{
            backgroundColor: copied ? "rgba(34,197,94,0.15)" : "var(--primary-subtle)",
            color: copied ? "#22C55E" : "var(--primary-text)"
          }}
        >
          {copied ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>Copié !</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copier</>
          )}
        </button>
      </div>
      <div
        className="p-5 text-sm leading-relaxed whitespace-pre-wrap font-sans"
        style={{ color: "var(--text-primary)" }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
      />
    </div>
  );
}
