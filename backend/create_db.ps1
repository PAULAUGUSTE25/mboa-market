# Configuration PostgreSQL pour MBOA Market
$env:Path = "C:\Program Files\PostgreSQL\18\bin;" + $env:Path

Write-Host "Configuration PostgreSQL - MBOA Market"
Write-Host "======================================="
Write-Host ""
Write-Host "Entrez le mot de passe postgres quand demande"
Write-Host ""

# Executer le script SQL
psql -U postgres -f setup_mboa_db.sql

Write-Host ""
Write-Host "Configuration terminee!"
Write-Host ""

# Creer le fichier .env
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Fichier .env cree"
}

Write-Host ""
Write-Host "Prochaines etapes:"
Write-Host "1. pip install -r requirements.txt"
Write-Host "2. python init_db.py"
Write-Host "3. uvicorn app.main:app --reload"
