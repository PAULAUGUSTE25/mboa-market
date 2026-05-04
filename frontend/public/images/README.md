# 📸 Organisation des Images

## Structure des Dossiers

### 🌾 `agriculture/` (26 images)
Produits agricoles: tubercules, légumes, fruits, cultures
- Produits frais: macabo, manioc, plantain, patate, tomate
- Cultures: cacao, café, coton, canne à sucre, thé, hévéa
- Légumes et autres produits agricoles

### 🐄 `livestock/` (31 images)
Animaux d'élevage et poissons
- Volaille: poulets, coqs, poussins
- Porcs: porcelets, porcs de race
- Chèvres: différentes races
- Poissons: carpes, bars, silure, tilapia, alevins
- Lapins de race

### 🖼️ `backgrounds/` (11 images)
Images de fond pour les pages
- Fonds principaux: back gount, pexels-szafran, light mode
- Champs et plantations
- Paysages agricoles

### 🔧 `equipment/` (8 images)
Équipements et matériel agricole
- Outils: houe, arrosoir, tracteur
- Équipements pisciculture: bacs, bassins
- Machines: provende, aliments

### 🤖 `gemini/` (10 images)
Images générées par IA (Gemini)
- Gemini_Generated_Image_*.png

### 📦 `misc/` (25 images)
Images diverses et contenus mixtes
- Actualités et annonces
- Stories et publications
- Images promotionnelles
- Contenus éducatifs

## 📝 Conventions de Nommage

- **Format:** kebab-case (mots séparés par des tirets)
- **Extensions:** .png (avec transparence) ou .jpg (photos)
- **Descriptif:** Nom clair et descriptif du contenu

## 🔗 Utilisation dans le Code

```tsx
// Exemple d'utilisation
<img src="/images/agriculture/macabo-fresh.png" alt="Macabo frais" />
<img src="/images/backgrounds/pexels-szafran-34125512.jpg" alt="Background" />
```

## 🧹 Maintenance

- Supprimer les images non utilisées régulièrement
- Optimiser les images avant ajout (compression)
- Vérifier les doublons
- Maintenir cette documentation à jour
