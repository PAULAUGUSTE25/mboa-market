# Système de Filtrage par Domaine et Catégorie

## Objectif
Implémenter un système de filtrage intelligent qui respecte:
1. Le **domaine** choisi par l'utilisateur (Agriculture ou Élevage)
2. La **catégorie** de l'utilisateur (Fournisseur, Producteur, Acheteur)

## Règles de Visibilité

### Pour les Fournisseurs (seed_provider)
- Voient les **demandes/requêtes** (posts sans images, type "RECHERCHE:")
- Peuvent poster des offres avec images de semences/races

### Pour les Producteurs (producer)
- Voient les posts des **Fournisseurs** (avec images)
- Voient les demandes des **Acheteurs**
- Peuvent vendre leurs productions

### Pour les Acheteurs (buyer)
- Voient **uniquement** les posts des **Producteurs**
- Ne voient pas les posts entre fournisseurs et producteurs

## Implémentation

### Backend
1. ✅ Ajout du champ `domain` aux modèles Profile et Listing
2. ✅ Migration de la base de données
3. 🔄 Mise à jour de l'API de login pour sauvegarder le domaine
4. 🔄 Endpoint de filtrage des listings par domaine et catégorie

### Frontend
1. 🔄 Capturer le domaine lors de la connexion (agriculture/elevage)
2. 🔄 Sauvegarder le domaine dans le profil utilisateur
3. 🔄 Filtrer le feed selon le domaine et la catégorie
4. 🔄 Ajouter des onglets de catégorie dans le feed

## Statut
- Base de données: ✅ Migrée
- Backend API: 🔄 En cours
- Frontend: 🔄 En cours
