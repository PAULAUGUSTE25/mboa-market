# Script pour renommer les fichiers images (enlever les espaces)
Write-Host "🔧 Correction des noms de fichiers images..." -ForegroundColor Green
Write-Host ""

$imageDir = "C:\Users\HP\Desktop\mboa-market\frontend\public\images"

# Fonction pour renommer récursivement
function Rename-FilesRecursive {
    param($path)
    
    Get-ChildItem -Path $path -Recurse -File | ForEach-Object {
        $newName = $_.Name -replace '\s+', '_'
        if ($newName -ne $_.Name) {
            $newPath = Join-Path $_.Directory $newName
            Write-Host "Renommage: $($_.Name) -> $newName" -ForegroundColor Yellow
            Rename-Item -Path $_.FullName -NewName $newName -Force
        }
    }
}

Rename-FilesRecursive -path $imageDir

Write-Host ""
Write-Host "✅ Fichiers renommés!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Vous devez maintenant mettre à jour les chemins dans la base de données" -ForegroundColor Yellow
Write-Host "   Exécutez: python update_image_paths.py" -ForegroundColor Cyan
