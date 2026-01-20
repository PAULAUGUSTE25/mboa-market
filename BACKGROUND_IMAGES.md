# 🎨 Background Images for MBOA Market

## Current Background Theme: Agricultural Products

The login and registration pages now feature backgrounds showcasing:
- 🍅 Tomatoes
- 🌽 Cassava
- ☕ Coffee
- 🐷 Pigs
- 🐄 Cows
- 🐑 Sheep
- 🐐 Goats
- 🌾 Various crops and vegetables

## Alternative Background Options

If you want to change the background image, update these files:
- `frontend/src/pages/LoginPage.tsx` (line ~30)
- `frontend/src/pages/RegisterPage.tsx` (line ~36)

### Recommended Unsplash Images for Agricultural Theme:

**Mixed Agricultural Products:**
- `https://images.unsplash.com/photo-1464226184884-fa280b87c399` (Current - vegetables & crops)
- `https://images.unsplash.com/photo-1488459716781-31db52582fe9` (Fresh vegetables market)
- `https://images.unsplash.com/photo-1542838132-92c53300491e` (Colorful vegetables)

**Livestock Focus:**
- `https://images.unsplash.com/photo-1516467508483-a7212febe31a` (Cows in field)
- `https://images.unsplash.com/photo-1548550023-2bdb3c5beed7` (Goats)
- `https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8` (Chickens/poultry)

**Crops & Vegetables:**
- `https://images.unsplash.com/photo-1592921870789-04563d55041c` (Tomatoes)
- `https://images.unsplash.com/photo-1582284540020-8acbe03f4924` (Cassava/root vegetables)
- `https://images.unsplash.com/photo-1447175008436-054170c2e979` (Coffee beans)

**Farm Scenes:**
- `https://images.unsplash.com/photo-1500382017468-9049fed747ef` (Farm landscape with animals)
- `https://images.unsplash.com/photo-1625246333195-78d9c38ad449` (Agricultural field)

## How to Change Background

1. Open the file: `frontend/src/pages/LoginPage.tsx`
2. Find line with `backgroundImage:`
3. Replace the URL with your preferred image
4. Save and the page will auto-reload

Example:
```typescript
backgroundImage: `url('https://images.unsplash.com/photo-YOUR-CHOICE?q=80&w=2000')`,
```

## Current Styling

- **Overlay**: Dark gradient (40% opacity) for text readability
- **Card**: Teal semi-transparent with backdrop blur
- **Icons**: Leaf, Sprout, Settings representing agriculture
- **Text**: White for high contrast

The background is optimized to showcase Cameroon's agricultural diversity!
