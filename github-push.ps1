# Script simple pour pousser sur GitHub
Write-Host "MBOA Market - Push to GitHub" -ForegroundColor Green
Write-Host ""

Set-Location "c:\Users\HP\Desktop\mboa-market"

$username = Read-Host "Entrez votre username GitHub"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "Username requis" -ForegroundColor Red
    exit 1
}

# Supprimer l'ancien remote si existe
git remote remove origin 2>$null

# Ajouter le nouveau remote
$repoUrl = "https://github.com/$username/mboa-market.git"
git remote add origin $repoUrl

Write-Host ""
Write-Host "Push vers $repoUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Git va demander vos identifiants:" -ForegroundColor Yellow
Write-Host "- Username: $username" -ForegroundColor Yellow
Write-Host "- Password: Utilisez un Personal Access Token" -ForegroundColor Yellow
Write-Host ""
Write-Host "Token: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Code pousse sur GitHub" -ForegroundColor Green
    Write-Host "Repo: https://github.com/$username/mboa-market" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERREUR - Verifiez que le repo existe sur GitHub" -ForegroundColor Red
    Write-Host "Creez-le sur: https://github.com/new" -ForegroundColor Yellow
}

Read-Host "Appuyez sur Entree pour fermer"
