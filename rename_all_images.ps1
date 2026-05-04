# RENOMMER TOUS LES FICHIERS IMAGES - ENLEVER ESPACES ET CARACTÈRES SPÉCIAUX
Write-Host "🔧 RENOMMAGE DE TOUS LES FICHIERS IMAGES..." -ForegroundColor Green
Write-Host ""

$imageDir = "C:\Users\HP\Desktop\mboa-market\frontend\public\images"
$mappingFile = "C:\Users\HP\Desktop\mboa-market\backend\image_mapping.txt"

# Créer le fichier de mapping
"# MAPPING: Ancien nom -> Nouveau nom" | Out-File -FilePath $mappingFile -Encoding UTF8

$totalRenamed = 0

# Fonction pour nettoyer le nom de fichier
function Clean-FileName {
    param($name)
    
    # Enlever l'extension
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($name)
    $ext = [System.IO.Path]::GetExtension($name)
    
    # Remplacer espaces par underscores
    $cleaned = $nameWithoutExt -replace '\s+', '_'
    
    # Enlever caractères spéciaux sauf underscore et tiret
    $cleaned = $cleaned -replace '[^\w\-]', ''
    
    # Enlever underscores multiples
    $cleaned = $cleaned -replace '_+', '_'
    
    # Enlever underscores au début et à la fin
    $cleaned = $cleaned.Trim('_')
    
    # Mettre en minuscules
    $cleaned = $cleaned.ToLower()
    
    return $cleaned + $ext
}

# Parcourir tous les fichiers
Get-ChildItem -Path $imageDir -Recurse -File -Include *.jpg,*.jpeg,*.png,*.gif,*.webp | ForEach-Object {
    $oldName = $_.Name
    $newName = Clean-FileName $oldName
    
    if ($oldName -ne $newName) {
        $oldPath = $_.FullName
        $newPath = Join-Path $_.Directory $newName
        
        # Vérifier si le nouveau nom existe déjà
        if (Test-Path $newPath) {
            # Ajouter un numéro
            $counter = 1
            $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($newName)
            $ext = [System.IO.Path]::GetExtension($newName)
            
            while (Test-Path $newPath) {
                $newName = "${nameWithoutExt}_${counter}${ext}"
                $newPath = Join-Path $_.Directory $newName
                $counter++
            }
        }
        
        # Renommer
        Rename-Item -Path $oldPath -NewName $newName -Force
        
        # Calculer le chemin relatif
        $relativePath = $_.FullName.Replace("C:\Users\HP\Desktop\mboa-market\frontend\public", "").Replace("\", "/")
        $newRelativePath = $newPath.Replace("C:\Users\HP\Desktop\mboa-market\frontend\public", "").Replace("\", "/")
        
        # Ajouter au mapping
        "$relativePath|$newRelativePath" | Out-File -FilePath $mappingFile -Append -Encoding UTF8
        
        Write-Host "✅ $oldName -> $newName" -ForegroundColor Yellow
        $totalRenamed++
    }
}

Write-Host ""
Write-Host "🎉 $totalRenamed fichiers renommés!" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Mapping sauvegardé dans: $mappingFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Exécutez maintenant:" -ForegroundColor Yellow
Write-Host "   cd C:\Users\HP\Desktop\mboa-market\backend" -ForegroundColor Cyan
Write-Host "   python update_image_paths_from_mapping.py" -ForegroundColor Cyan
