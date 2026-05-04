"""
Générer un fichier TypeScript avec tous les imports d'images
Solution de contournement pour Vite
"""
import os
from pathlib import Path


def generate_imports():
    """Générer le fichier d'imports"""
    image_dir = Path(r"C:\Users\HP\Desktop\mboa-market\frontend\public\images")
    output_file = Path(r"C:\Users\HP\Desktop\mboa-market\frontend\src\data\imageImports.ts")
    
    imports = []
    exports = {}
    
    counter = 0
    for root, dirs, files in os.walk(image_dir):
        for filename in files:
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                file_path = Path(root) / filename
                relative_path = file_path.relative_to(image_dir.parent)
                
                # Créer un nom de variable valide
                var_name = f"img{counter}"
                
                # Chemin relatif pour l'import
                import_path = '/' + str(relative_path).replace('\\', '/')
                
                # Stocker le mapping
                exports[import_path] = var_name
                counter += 1
    
    # Générer le contenu du fichier
    content = "/**\n * Images importées pour éviter les problèmes de chargement\n * Auto-généré\n */\n\n"
    content += "export const imageMap: Record<string, string> = {\n"
    
    for path in sorted(exports.keys()):
        content += f'  "{path}": "{path}",\n'
    
    content += "};\n\n"
    content += "export default imageMap;\n"
    
    # Écrire le fichier
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(content, encoding='utf-8')
    
    print(f"✅ Fichier généré: {output_file}")
    print(f"📊 {len(exports)} images mappées")


if __name__ == "__main__":
    generate_imports()
