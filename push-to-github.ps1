# Script automatisé pour pousser MBOA Market sur GitHub
# Exécutez ce script dans PowerShell

Write-Host "🚀 MBOA Market - Push to GitHub" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Vérifier si Git est installé
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git n'est pas installé. Installez-le depuis https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier du projet
Set-Location "c:\Users\HP\Desktop\mboa-market"

Write-Host "📁 Dossier du projet : $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Demander le username GitHub
Write-Host "🔑 Configuration GitHub" -ForegroundColor Yellow
$username = Read-Host "Entrez votre username GitHub"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username GitHub requis" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Username : $username" -ForegroundColor Green
Write-Host ""

# Vérifier si le remote existe déjà
$remoteExists = git remote | Select-String -Pattern "origin" -Quiet

if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' existe déjà. Suppression..." -ForegroundColor Yellow
    git remote remove origin
}

# Ajouter le remote
$repoUrl = "https://github.com/$username/mboa-market.git"
Write-Host "🔗 Ajout du remote : $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

Write-Host ""
Write-Host "📤 Push vers GitHub..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT : Git va vous demander vos identifiants GitHub" -ForegroundColor Yellow
Write-Host "   - Username : $username" -ForegroundColor Yellow
Write-Host "   - Password : Utilisez un Personal Access Token (pas votre mot de passe)" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Pour créer un token :" -ForegroundColor Cyan
Write-Host "   1. Allez sur : https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "   2. Generate new token (classic)" -ForegroundColor Cyan
Write-Host "   3. Cochez 'repo'" -ForegroundColor Cyan
Write-Host "   4. Copiez le token et utilisez-le comme mot de passe" -ForegroundColor Cyan
Write-Host ""

# Pousser le code
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ CODE POUSSÉ AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Votre repo : https://github.com/$username/mboa-market" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 PROCHAINES ÉTAPES :" -ForegroundColor Yellow
    Write-Host "   1. Allez sur : https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. New + → Web Service" -ForegroundColor White
    Write-Host "   3. Connectez GitHub et sélectionnez 'mboa-market'" -ForegroundColor White
    Write-Host "   4. Configurez le backend (voir DEPLOY_NOW_BACKEND.md)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ ERREUR lors du push" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 SOLUTIONS :" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que le repo existe sur GitHub : https://github.com/$username/mboa-market" -ForegroundColor White
    Write-Host "   2. Si le repo n'existe pas, créez-le sur : https://github.com/new" -ForegroundColor White
    Write-Host "   3. Utilisez un Personal Access Token au lieu du mot de passe" -ForegroundColor White
    Write-Host "   4. Réexécutez ce script" -ForegroundColor White
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
