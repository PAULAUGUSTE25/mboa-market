# Script PowerShell pour configurer PostgreSQL pour MBOA Market
# Exécuter avec: .\setup_database.ps1

Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host "🐘 Configuration PostgreSQL pour MBOA Market" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host ""

# Vérifier si PostgreSQL est installé
Write-Host "🔍 Vérification de PostgreSQL..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Installation requise:" -ForegroundColor Yellow
    Write-Host "  1. Téléchargez depuis: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "  2. Ou installez avec Chocolatey: choco install postgresql" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Guide complet: INSTALL_POSTGRES_WINDOWS.md" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ PostgreSQL trouvé: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Demander le mot de passe postgres
Write-Host "🔐 Entrez le mot de passe du superutilisateur 'postgres':" -ForegroundColor Yellow
$postgresPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
$postgresPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Créer la base de données et l'utilisateur
Write-Host ""
Write-Host "🗄️  Création de la base de données..." -ForegroundColor Yellow

$env:PGPASSWORD = $postgresPasswordPlain

# Vérifier si la base existe déjà
$dbExists = psql -U postgres -lqt 2>$null | Select-String -Pattern "mboa_market"

if ($dbExists) {
    Write-Host "⚠️  La base de données 'mboa_market' existe déjà" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous la supprimer et la recréer? (o/N)"
    
    if ($response -eq "o" -or $response -eq "O") {
        Write-Host "🗑️  Suppression de l'ancienne base..." -ForegroundColor Yellow
        psql -U postgres -c "DROP DATABASE IF EXISTS mboa_market;" 2>$null
        psql -U postgres -c "DROP USER IF EXISTS mboa_user;" 2>$null
    } else {
        Write-Host "❌ Installation annulée" -ForegroundColor Red
        exit 1
    }
}

# Créer la base de données
Write-Host "📋 Création de la base de données 'mboa_market'..." -ForegroundColor Cyan
psql -U postgres -c "CREATE DATABASE mboa_market;" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de données créée" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la création de la base" -ForegroundColor Red
    exit 1
}

# Créer l'utilisateur
Write-Host "👤 Création de l'utilisateur 'mboa_user'..." -ForegroundColor Cyan
psql -U postgres -c "CREATE USER mboa_user WITH PASSWORD 'mboa_password';" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Utilisateur créé" -ForegroundColor Green
} else {
    Write-Host "⚠️  L'utilisateur existe peut-être déjà" -ForegroundColor Yellow
}

# Donner les privilèges
Write-Host "🔑 Attribution des privilèges..." -ForegroundColor Cyan
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;" 2>$null
psql -U postgres -d mboa_market -c "GRANT ALL ON SCHEMA public TO mboa_user;" 2>$null
psql -U postgres -d mboa_market -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mboa_user;" 2>$null
psql -U postgres -d mboa_market -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mboa_user;" 2>$null

Write-Host "✅ Privilèges attribués" -ForegroundColor Green

# Activer les extensions
Write-Host "🔌 Activation des extensions..." -ForegroundColor Cyan
psql -U postgres -d mboa_market -c "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";" 2>$null
psql -U postgres -d mboa_market -c "CREATE EXTENSION IF NOT EXISTS ""pg_trgm"";" 2>$null
Write-Host "✅ Extensions activées" -ForegroundColor Green

# Nettoyer le mot de passe de l'environnement
Remove-Item Env:\PGPASSWORD

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host "✨ PostgreSQL configuré avec succès!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host ""

# Créer le fichier .env
Write-Host "📝 Configuration de l'application..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "⚠️  Le fichier .env existe déjà" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le mettre à jour? (o/N)"
    
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "⏭️  Fichier .env conservé" -ForegroundColor Cyan
    } else {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✅ Fichier .env mis à jour" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Prochaines étapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Installer les dépendances Python:" -ForegroundColor White
Write-Host "     pip install -r requirements.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Initialiser la base de données:" -ForegroundColor White
Write-Host "     python init_db.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Démarrer le serveur:" -ForegroundColor White
Write-Host "     uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Ouvrir la documentation API:" -ForegroundColor White
Write-Host "     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("="*59) -ForegroundColor Green
Write-Host ""

# Demander si on doit continuer avec l'initialisation
$response = Read-Host "Voulez-vous initialiser la base de données maintenant? (o/N)"

if ($response -eq "o" -or $response -eq "O") {
    Write-Host ""
    Write-Host "🚀 Initialisation de la base de données..." -ForegroundColor Yellow
    python init_db.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Tout est prêt!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Démarrez le serveur avec:" -ForegroundColor Yellow
        Write-Host "uvicorn app.main:app --reload" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "✅ Configuration terminée!" -ForegroundColor Green
    Write-Host "Exécutez 'python init_db.py' quand vous serez prêt" -ForegroundColor Yellow
}
