# CORRECTIONS FEEDPAGE - Plan d'Exécution

## ✅ ÉTAPE 1: IMPORTS (COMPLÉTÉ)
```typescript
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';
```

## 📋 SECTIONS À CORRIGER

### SECTION 1: Bouton "Créer Publication" (Ligne ~617)
**Avant:**
```typescript
<button className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
```

**Après:**
```typescript
<button 
  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
  style={getButtonStyles(theme, 'secondary', 'emerald')}
>
```

### SECTION 2: Modal Création - Card Principale (Ligne ~630)
**Avant:**
```typescript
<div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#060D0A] border border-white/20' : 'bg-white'}`}>
```

**Après:**
```typescript
<div 
  className="backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl"
  style={{
    ...getCardStyles(theme, 'emerald'),
    borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
  }}
>
```

### SECTION 3: Modal Création - Titre (Ligne ~633)
**Avant:**
```typescript
<h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
```

**Après:**
```typescript
<h2 className="text-2xl font-bold" style={{ color: getTextStyles(theme).title }}>
```

### SECTION 4: Modal Création - Inputs (Multiples lignes)
**Avant:**
```typescript
<input className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/[0.05] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
```

**Après:**
```typescript
<input 
  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"
  style={getInputStyles(theme)}
/>
```

### SECTION 5: Modal Création - Boutons (Ligne ~851-863)
**Avant:**
```typescript
<button className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'border border-white/20 text-gray-300 hover:bg-white/[0.05]' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
  Annuler
</button>
<button className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
  Publier
</button>
```

**Après:**
```typescript
<button 
  className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
  style={getButtonStyles(theme, 'secondary', 'emerald')}
>
  Annuler
</button>
<button 
  className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
  style={getButtonStyles(theme, 'primary', 'emerald')}
>
  Publier
</button>
```

### SECTION 6: Cards Produits - Card Principale (Ligne ~920)
**Avant:**
```typescript
<div className={`rounded-2xl overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-white'}`}>
```

**Après:**
```typescript
<div 
  className="backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 border shadow-xl hover:shadow-2xl"
  style={{
    ...getCardStyles(theme, 'emerald'),
    borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
  }}
>
```

### SECTION 7: Cards Produits - Textes (Multiples)
**Avant:**
```typescript
<h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
<h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
<p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
```

**Après:**
```typescript
<h3 className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>
<h2 className="text-2xl font-bold mb-2" style={{ color: getTextStyles(theme).title }}>
<p className="text-base" style={{ color: getTextStyles(theme).body }}>
```

### SECTION 8: Bouton "Contacter" (À localiser)
**Avant:**
```typescript
<button className={`px-6 py-3 rounded-xl font-bold ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500 text-white'}`}>
```

**Après:**
```typescript
<button 
  className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
  style={getButtonStyles(theme, 'primary', 'emerald')}
>
```

### SECTION 9: Chat Modal - Card (À localiser)
**Avant:**
```typescript
<div className={`rounded-2xl ${theme === 'dark' ? 'bg-[#060D0A] border border-white/20' : 'bg-white'}`}>
```

**Après:**
```typescript
<div 
  className="backdrop-blur-md rounded-2xl border shadow-2xl"
  style={{
    ...getCardStyles(theme, 'emerald'),
    borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
  }}
>
```

### SECTION 10: Chat Modal - Input Message (À localiser)
**Avant:**
```typescript
<input className={`w-full px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-white/[0.05] border-white/20 text-white' : 'bg-white border-gray-300'}`} />
```

**Après:**
```typescript
<input 
  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"
  style={getInputStyles(theme)}
/>
```

## 🎯 STRATÉGIE D'EXÉCUTION

Vu la taille du fichier (1183 lignes), je vais:
1. ✅ Imports ajoutés
2. Créer des corrections ciblées par multi_edit
3. Grouper les corrections similaires
4. Tester après chaque groupe

## 📊 PROGRESSION

- [x] Étape 1: Imports
- [ ] Étape 2: Bouton créer publication
- [ ] Étape 3: Modal création (card + titre + inputs + boutons)
- [ ] Étape 4: Cards produits (card + textes)
- [ ] Étape 5: Bouton contacter
- [ ] Étape 6: Chat modal
- [ ] Étape 7: Tests finaux
