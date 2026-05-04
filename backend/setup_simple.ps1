# Script simplifié de configuration PostgreSQL pour MBOA Market

Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host "🐘 Configuration PostgreSQL - MBOA Market" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host ""

# Ajouter PostgreSQL au PATH
$env:Path = "C:\Program Files\PostgreSQL\18\bin;" + $env:Path

Write-Host "📋 Exécution du script SQL de configuration..." -ForegroundColor Yellow
Write-Host "⚠️  Vous allez devoir entrer le mot de passe postgres" -ForegroundColor Yellow
Write-Host ""

# Exécuter le script SQL
psql -U postgres -f setup_mboa_db.sql

Write-Host ""
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""

# Créer le fichier .env
if (Test-Path ".env") {
    Write-Host "⚠️  Le fichier .env existe déjà" -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. pip install -r requirements.txt" -ForegroundColor Cyan
Write-Host "  2. python init_db.py" -ForegroundColor Cyan
Write-Host "  3. uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host ""
