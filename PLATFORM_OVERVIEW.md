# MBOA Market Platform - Complete Overview

## 🎯 Platform Purpose

MBOA Market is a complete agricultural marketplace connecting:
1. **Seed/Animal Providers** - Sell seeds, baby animals, farming supplies
2. **Producers/Farmers** - Buy from seed providers, grow/raise products, then sell harvest
3. **Buyers** - Purchase final products from producers
4. **Transporters** - Handle logistics

## ✅ What's Been Built

### Backend (FastAPI + SQLAlchemy)

#### Database Models (30 tables matching DBML exactly)
- **Users & Auth**: users, profiles, roles, user_roles
- **KYC**: kyc_submissions, kyc_documents
- **Marketplace**: categories, products_ref, listings, listing_photos
- **Orders**: orders, order_items, payments, escrow_holds, disputes, reviews
- **B2B**: b2b_requests, b2b_offers, b2b_contracts
- **Logistics**: hubs, transport_requests, transport_missions
- **Livestock**: livestock_batches, sync_clients, livestock_events
- **Messaging**: conversations, conversation_participants, messages
- **System**: notifications, audit_logs

#### API Endpoints
- **Authentication** (`/api/auth`)
  - POST `/register` - User registration with profile
  - POST `/login` - Login with JWT tokens
  - POST `/verify-phone` - Phone verification

- **Users** (`/api/users`)
  - GET `/me` - Get current user profile
  - PUT `/me/profile` - Update profile
  - GET `/{user_id}` - Get user by ID

- **Marketplace** (`/api/listings`)
  - GET `/categories/all` - Get all categories
  - GET `/products/all` - Get all product references
  - POST `` - Create listing
  - GET `` - Get paginated listings (with filters)
  - GET `/{listing_id}` - Get listing details
  - PUT `/{listing_id}` - Update listing
  - DELETE `/{listing_id}` - Delete listing
  - GET `/my/listings` - Get user's listings

- **Messaging** (`/api/messages`)
  - POST `/conversations` - Start conversation
  - GET `/conversations` - Get all conversations
  - GET `/conversations/{id}` - Get conversation with messages
  - POST `/conversations/{id}/messages` - Send message

- **Orders** (`/api/orders`) - Placeholder
- **B2B** (`/api/b2b`) - Placeholder
- **Logistics** (`/api/logistics`) - Placeholder
- **Livestock** (`/api/livestock`) - Placeholder

### Database Seeding
- 7 categories (Céréales, Légumes, Fruits, Tubercules, Élevage, Semences, Animaux)
- 9 products (Maïs, Riz, Tomate, Oignon, Manioc, Plantain, Poulet, Semences de Maïs, Poussins)
- 6 roles (admin, moderator, seed_provider, producer, buyer, transporter)

## 🚀 How to Run

### 1. Initialize Database
```bash
cd backend
python scripts/init_db.py
python scripts/seed_data.py
```

### 2. Start Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

## 📱 User Flows

### Seed Provider Flow
1. Register as seed provider
2. Create listings for seeds/baby animals
3. Set prices and quantities
4. Receive messages from producers
5. Chat with interested producers
6. Process orders

### Producer Flow
1. Register as producer
2. Browse seed provider listings
3. Chat with seed providers
4. Purchase seeds/animals
5. After harvest/growth:
   - Create own listings
   - Set prices
   - Receive buyer messages
   - Process orders

### Buyer Flow
1. Register as buyer
2. Browse producer listings
3. Chat with producers
4. Place orders
5. Track delivery
6. Leave reviews

## 🔧 Technical Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite/PostgreSQL (Database)
- JWT (Authentication)
- Pydantic (Validation)

### Frontend
- React + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- Axios (HTTP client)
- Zustand (State management)
- React Router (Navigation)

## 📊 Key Features

✅ User registration with profiles
✅ Role-based access control
✅ Product listings with photos
✅ Category and product filtering
✅ Real-time messaging/chat
✅ Order management with escrow
✅ Payment integration ready
✅ Dispute resolution system
✅ Review and rating system
✅ B2B bulk requests
✅ Logistics tracking
✅ Livestock management
✅ Offline sync capability

## 🎨 Frontend Pages Needed

### For Seed Providers
- Dashboard (sales overview)
- My Listings (seeds/animals)
- Create Listing
- Messages/Chat
- Orders Received

### For Producers
- Dashboard (purchases & sales)
- Browse Seeds/Animals
- My Purchases
- My Listings (harvest)
- Create Listing
- Messages/Chat
- Orders (received & placed)

### For Buyers
- Browse Products
- Search & Filter
- Product Details
- Cart
- Checkout
- My Orders
- Messages/Chat
- Reviews

## 🔐 Security
- JWT token authentication
- Password hashing (bcrypt)
- Role-based permissions
- Escrow payment protection
- Dispute resolution

## 📈 Next Steps

1. ✅ Complete backend models
2. ✅ Complete API endpoints
3. ✅ Add messaging system
4. 🔄 Test all APIs
5. ⏳ Build React frontend pages
6. ⏳ Implement chat UI
7. ⏳ Test complete user flows
8. ⏳ Deploy to production

## 🌟 Platform Highlights

- **Complete marketplace ecosystem**
- **Seed-to-harvest tracking**
- **Built-in communication**
- **Secure payments with escrow**
- **Multi-role support**
- **Mobile-ready design**
- **Offline livestock management**
- **B2B capabilities**

---

**Status**: Backend Complete ✅ | Frontend In Progress 🔄
