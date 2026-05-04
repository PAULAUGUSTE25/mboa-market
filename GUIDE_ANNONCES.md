# 📦 Guide de Création d'Annonces - MBOA Market

## ✅ CONFIGURATION TERMINÉE

Le système de création d'annonces est maintenant opérationnel!

---

## 🎯 COMMENT CRÉER UNE ANNONCE

### **1. Accédez au Feed**
http://localhost:5173/feed

### **2. Cliquez sur le Bouton "+"**
- En haut à droite sur desktop
- En bas de l'écran sur mobile

### **3. Remplissez le Formulaire**

#### **Champs Obligatoires:**

**📂 Catégorie**
- Sélectionnez parmi: Céréales, Tubercules, Légumes, Fruits, Volaille, Bétail

**📝 Titre**
- Exemple: "Maïs frais de qualité"
- Soyez descriptif et précis

**📊 Quantité**
- Nombre de produits disponibles
- Exemple: 500

**⚖️ Unité**
- kg, sac, unité, tonne, etc.
- Exemple: kg

**💰 Prix Unitaire**
- Prix par unité en XAF
- Exemple: 350

**📍 Région**
- Votre région (obligatoire)
- Exemple: Centre, Littoral, Ouest

#### **Champs Optionnels:**

**🌾 Variété**
- Type spécifique du produit
- Exemple: "Jaune", "Rouge", "Cobb 500"

**🏘️ Localité**
- Ville ou village
- Exemple: Yaoundé, Douala, Bafoussam

**🖼️ Images**
- Cliquez sur "Ajouter des images"
- Sélectionnez jusqu'à 4 photos
- Formats acceptés: JPG, PNG, WEBP

---

## 📋 EXEMPLE COMPLET

```
Catégorie: Céréales
Titre: Maïs jaune de première qualité
Variété: Jaune
Quantité: 1000
Unité: kg
Prix: 400
Devise: XAF
Région: Centre
Localité: Yaoundé
Images: [2 photos de votre maïs]
```

**Résultat:** 
"Maïs jaune de première qualité - 1000 kg à 400 XAF/kg - Yaoundé, Centre"

---

## 🎨 IMAGES DISPONIBLES

Vous pouvez utiliser vos propres images depuis:

### **Agriculture:**
- `/images/agriculture/bonmanioc.jpg`
- `/images/agriculture/bonne qualite de macabo.jpg`
- `/images/agriculture/tomate de haute qualite.jpg`
- `/images/agriculture/cacao de mr etoga  750kg dispo.jpg`
- `/images/agriculture/cafe selectioné.jpg`
- Et 11 autres...

### **Élevage:**
- `/images/livestock/poulet de chaire 35 jour .jpg`
- `/images/livestock/poulet 35 jour ferme ndefo.jpg`
- `/images/livestock/chevre de bazou.jpg`
- `/images/livestock/porc female sans graisse .jpg`
- Et 16 autres...

---

## ✅ APRÈS LA CRÉATION

### **Votre annonce sera:**
1. ✅ **Publiée immédiatement** avec statut "PUBLISHED"
2. ✅ **Visible dans le Feed** pour tous les utilisateurs
3. ✅ **Stockée dans PostgreSQL** avec toutes les informations
4. ✅ **Associée à votre profil** utilisateur

### **Les utilisateurs pourront:**
- ❤️ Aimer votre annonce
- 💬 Commenter
- 📱 Vous contacter directement
- 🛒 Commander (si implémenté)

---

## 🔍 VÉRIFICATION DANS HEIDISQL

Après avoir créé une annonce, vérifiez dans HeidiSQL:

```sql
-- Voir toutes vos annonces
SELECT l.title, l.quantity, l.unit, l.price_per_unit, l.region, l.status
FROM listings l
JOIN users u ON l.seller_id = u.id
WHERE u.phone = '+237600000001'  -- Votre numéro
ORDER BY l.created_at DESC;

-- Voir les images d'une annonce
SELECT lp.storage_key, lp.position
FROM listing_photos lp
JOIN listings l ON lp.listing_id = l.id
WHERE l.title LIKE '%Maïs%'
ORDER BY lp.position;
```

---

## 🐛 RÉSOLUTION DES PROBLÈMES

### **Erreur: "Votre profil doit avoir un domaine défini"**
**Cause:** Votre profil n'a pas de domaine (agriculture/élevage)

**Solution:** 
1. Allez dans Profil
2. Modifiez votre profil
3. Sélectionnez un domaine

### **Erreur: "Category not found"**
**Cause:** La catégorie sélectionnée n'existe pas

**Solution:** Utilisez une des catégories créées:
- Céréales, Tubercules, Légumes, Fruits (agriculture)
- Volaille, Bétail (élevage)

### **Images ne s'affichent pas**
**Cause:** Chemin d'image incorrect

**Solution:** 
- Utilisez des chemins relatifs: `/images/agriculture/...`
- Ou des URLs complètes: `https://...`

---

## 📊 STATISTIQUES ACTUELLES

Après avoir créé vos annonces, vous pouvez voir:

```sql
-- Nombre total d'annonces
SELECT COUNT(*) as total_annonces FROM listings;

-- Annonces par région
SELECT region, COUNT(*) as nombre
FROM listings
GROUP BY region
ORDER BY nombre DESC;

-- Annonces par catégorie
SELECT c.name_fr, COUNT(l.id) as nombre
FROM categories c
LEFT JOIN listings l ON c.id = l.category_id
GROUP BY c.id, c.name_fr
ORDER BY nombre DESC;

-- Prix moyen par produit
SELECT pr.name_fr, AVG(l.price_per_unit) as prix_moyen
FROM products_ref pr
LEFT JOIN listings l ON pr.id = l.product_ref_id
GROUP BY pr.id, pr.name_fr;
```

---

## 🚀 PROCHAINES FONCTIONNALITÉS

### **À venir:**
- ✅ Upload d'images depuis l'appareil
- ✅ Modification d'annonces existantes
- ✅ Suppression d'annonces
- ✅ Statistiques de vues
- ✅ Gestion de stock automatique
- ✅ Notifications de nouvelles annonces

---

## 📝 CHECKLIST DE TEST

- [ ] Créer une annonce avec tous les champs
- [ ] Créer une annonce sans images
- [ ] Créer une annonce avec 1 image
- [ ] Créer une annonce avec 4 images
- [ ] Vérifier l'affichage dans le Feed
- [ ] Vérifier dans HeidiSQL
- [ ] Tester les boutons (J'aime, Commenter, Contacter)
- [ ] Créer une annonce dans un autre domaine

---

**Le système de création d'annonces est maintenant complet et fonctionnel!** 🎉

**Créez votre première annonce maintenant!** 🚀
