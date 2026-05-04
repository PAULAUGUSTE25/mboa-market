# 🔐 Guide d'Authentification - MBOA Market

## ✅ Configuration Terminée

Le frontend est maintenant connecté au backend PostgreSQL!

---

## 📝 Exigences pour l'Inscription

### **Mot de Passe Fort Requis:**

Votre mot de passe doit contenir:
- ✅ Au moins **8 caractères**
- ✅ Au moins **une majuscule** (A-Z)
- ✅ Au moins **une minuscule** (a-z)
- ✅ Au moins **un chiffre** (0-9)
- ✅ Au moins **un caractère spécial** (!@#$%^&*(),.?":{}|<>)

**Exemples de mots de passe valides:**
- `Mboa@2024!`
- `Market#Pass123`
- `Agri$2026Secure`

**Exemples de mots de passe invalides:**
- `password` ❌ (pas de majuscule, chiffre, caractère spécial)
- `Password` ❌ (pas de chiffre, caractère spécial)
- `Pass123` ❌ (pas de caractère spécial, trop court)

---

## 📱 Format du Numéro de Téléphone

- Doit commencer par **+** (indicatif pays)
- Exemple: `+237690000001` (Cameroun)
- Exemple: `+33612345678` (France)

---

## 👤 Informations de Profil Requises

### **Obligatoires:**
- **Nom complet** (display_name)
- **Type d'activité** (activity_type):
  - `producer` - Producteur
  - `seed_provider` - Fournisseur
  - `buyer` - Acheteur
- **Région** (region) - Ex: "Centre", "Littoral", "Ouest"

### **Optionnelles:**
- **Domaine** (domain) - "agriculture" ou "elevage"
- **Localité** (locality) - Ville ou village
- **Bio** (bio) - Description

---

## 🧪 Tester l'Inscription

### **1. Ouvrez le Frontend:**
http://localhost:5173

### **2. Cliquez sur "S'inscrire"**

### **3. Remplissez le Formulaire:**

**Exemple de données valides:**
```
Téléphone: +237690000001
Mot de passe: Mboa@2024!
Nom complet: Jean Producteur
Type d'activité: Producteur
Région: Centre
Localité: Yaoundé
```

### **4. Vérifiez dans HeidiSQL:**

Après l'inscription, ouvrez HeidiSQL et vérifiez:

**Table `users`:**
```sql
SELECT id, phone, email, phone_verified, status, badge
FROM users
ORDER BY created_at DESC;
```

**Table `profiles`:**
```sql
SELECT p.display_name, p.activity_type, p.domain, p.region, u.phone
FROM profiles p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

---

## 🔑 Connexion

### **Format:**
```
Téléphone: +237690000001
Mot de passe: Mboa@2024!
```

### **Réponse API:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "phone": "+237690000001",
    "profile": {
      "display_name": "Jean Producteur",
      "domain": "agriculture"
    }
  }
}
```

---

## 🐛 Résolution des Erreurs Courantes

### **Erreur 422: Unprocessable Content**

**Cause:** Données de validation incorrectes

**Solutions:**
- Vérifiez que le mot de passe respecte toutes les exigences
- Vérifiez que le téléphone commence par +
- Vérifiez que tous les champs obligatoires sont remplis

### **Erreur 400: Phone already registered**

**Cause:** Le numéro de téléphone existe déjà

**Solution:** Utilisez un autre numéro ou connectez-vous

### **Erreur 401: Unauthorized**

**Cause:** Mot de passe incorrect lors de la connexion

**Solution:** Vérifiez votre mot de passe

---

## 📊 Flux d'Authentification

```
1. Utilisateur remplit le formulaire
   ↓
2. Validation côté frontend
   ↓
3. Envoi au backend (POST /api/auth/register)
   ↓
4. Backend valide les données
   ↓
5. Création User + Profile dans PostgreSQL
   ↓
6. Retour des tokens JWT
   ↓
7. Stockage dans localStorage
   ↓
8. Redirection vers /feed
```

---

## 🔒 Sécurité

### **Tokens JWT:**
- **Access Token:** Valide 30 minutes
- **Refresh Token:** Valide 7 jours

### **Stockage:**
- Tokens stockés dans `localStorage`
- Envoyés dans header `Authorization: Bearer <token>`

### **Hachage Mot de Passe:**
- Algorithme: **bcrypt**
- Jamais stocké en clair dans la base de données

---

## ✅ Checklist de Test

- [ ] Inscription avec mot de passe fort
- [ ] Vérification dans HeidiSQL (tables users + profiles)
- [ ] Connexion avec les mêmes credentials
- [ ] Réception du token JWT
- [ ] Accès aux pages protégées (/feed)
- [ ] Déconnexion
- [ ] Tentative d'accès sans token (doit rediriger)

---

## 🚀 Prochaines Étapes

Maintenant que l'authentification fonctionne:

1. ✅ **Vérification par SMS** (optionnel)
2. ✅ **Gestion du profil** (modification)
3. ✅ **Upload d'avatar**
4. ✅ **Badge de vérification (KYC)**

---

**L'authentification est maintenant fonctionnelle avec PostgreSQL!** 🎉
