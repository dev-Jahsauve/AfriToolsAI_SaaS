# =============================================================
# déploiement AfriTools AI (Windows / PowerShell)
# Vérifie le projet, construit, puis publie sur GitHub (origine).
# Usage :
#   .\deploy.ps1 -CommitMessage "v1.2.0 - engine de crédits + dashboard admin"
#   .\deploy.ps1 -NoPush                # construit sans push
#   .\deploy.ps1 -NoCommit              # construit seulement
# =============================================================

param(
  [string]$CommitMessage = "",
  [switch]$NoCommit = $false,
  [switch]$NoPush = $false
)

$ErrorActionPreference = "Stop"

if (-not $CommitMessage) { $CommitMessage = "AfriTools AI - mise a jour automatique" }

Write-Host "==> 1/3 Installation des dépendances (pnpm)" -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -ne 0) { throw "pnpm install a échoué" }

Write-Host "==> 2/3 Build de production (Vite + TypeScript)" -ForegroundColor Cyan
pnpm build
if ($LASTEXITCODE -ne 0) { throw "pnpm build a échoué" }

if ($NoCommit) {
  Write-Host "Build OK — aucune publication effectuée (NoCommit)." -ForegroundColor Green
  exit 0
}

Write-Host "==> 3/3 Publication sur GitHub (origin)" -ForegroundColor Cyan
git add -A
git status
git commit -m $CommitMessage
git push origin HEAD
if ($LASTEXITCODE -eq 0) {
  Write-Host "Publie avec succès. Voir : git log --oneline -5" -ForegroundColor Green
} else {
  Write-Host "git push a échoué — vérifiez la branche / l'authentification." -ForegroundColor Yellow
  exit 1
}