# Script pour corriger l'authentification PostgreSQL
Write-Host "Correction de l'authentification PostgreSQL" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Chemin du fichier pg_hba.conf
$pgDataPath = "C:\Program Files\PostgreSQL\18\data"
$pgHbaFile = Join-Path $pgDataPath "pg_hba.conf"

Write-Host "Fichier de configuration: $pgHbaFile" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier existe
if (Test-Path $pgHbaFile) {
    Write-Host "Fichier trouve!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Vous devez executer ce script en tant qu'Administrateur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Etapes manuelles:" -ForegroundColor Yellow
    Write-Host "1. Ouvrez le fichier avec Notepad en tant qu'admin:" -ForegroundColor White
    Write-Host "   notepad `"$pgHbaFile`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Cherchez les lignes qui commencent par:" -ForegroundColor White
    Write-Host "   host    all             all             127.0.0.1/32" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Changez 'scram-sha-256' ou 'md5' en 'trust' pour localhost:" -ForegroundColor White
    Write-Host "   host    all             all             127.0.0.1/32            trust" -ForegroundColor Green
    Write-Host ""
    Write-Host "4. Sauvegardez le fichier" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Redemarrez PostgreSQL:" -ForegroundColor White
    Write-Host "   Restart-Service postgresql-x64-18" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Fichier non trouve a: $pgHbaFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cherchons le fichier..." -ForegroundColor Yellow
    $found = Get-ChildItem "C:\Program Files\PostgreSQL\" -Recurse -Filter "pg_hba.conf" -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "Trouve a: $($found.FullName)" -ForegroundColor Green
    }
}
