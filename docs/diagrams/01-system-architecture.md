# System Architecture Diagram

## Mermaid Code (Copy to any Mermaid editor)

```mermaid
flowchart TB
    subgraph Users["👥 Users"]
        V[Visitor]
        F[Farmer/Breeder]
        B[Buyer]
        A[Administrator]
    end

    subgraph Frontend["🖥️ Frontend - React.js + TypeScript"]
        LP[Landing Page]
        AUTH[Auth Pages<br/>Login/Register]
        FEED[Feed Page<br/>Marketplace]
        DASH[Dashboard]
        CHAT[Chat Interface]
        PROFILE[Profile Management]
    end

    subgraph Backend["⚙️ Backend - FastAPI Python"]
        API[REST API<br/>34 Endpoints]
        AUTH_SVC[Auth Service<br/>JWT + 2FA]
        LISTING_SVC[Listings Service]
        ORDER_SVC[Orders Service]
        MSG_SVC[Messaging Service]
        AI_SVC[AI Service<br/>Bigiass]
    end

    subgraph Database["🗄️ Database - PostgreSQL"]
        USERS_DB[(Users<br/>Profiles<br/>Roles)]
        MARKET_DB[(Listings<br/>Categories<br/>Photos)]
        ORDER_DB[(Orders<br/>Payments<br/>Escrow)]
        MSG_DB[(Conversations<br/>Messages)]
    end

    subgraph External["🌐 External Services"]
        GEMINI[Google Gemini<br/>AI API]
        CLOUDINARY[Cloudinary<br/>Media Storage]
        MOMO[Mobile Money<br/>MTN/Orange]
    end

    Users --> Frontend
    Frontend <-->|HTTPS/REST| Backend
    Backend <--> Database
    Backend <-->|API Calls| External

    style Frontend fill:#61dafb,color:#000
    style Backend fill:#009688,color:#fff
    style Database fill:#336791,color:#fff
    style External fill:#ff9800,color:#000
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
The MBOA Market platform follows a modern three-tier architecture that separates concerns between presentation, business logic, and data persistence. This architectural choice ensures scalability, maintainability, and security. The system integrates with external services to provide AI-powered assistance, media storage, and mobile payment capabilities.

### Figure Caption
**Figure X.X: MBOA Market System Architecture Overview**

### Explanation (After Figure)
The architecture consists of four main layers:

1. **User Layer**: Four types of actors interact with the system - Visitors (unauthenticated users), Farmers/Breeders (sellers), Buyers, and Administrators.

2. **Frontend Layer**: Built with React.js and TypeScript, the frontend provides a responsive single-page application (SPA) with components for authentication, marketplace browsing, dashboard management, real-time chat, and profile management.

3. **Backend Layer**: Implemented using FastAPI (Python), the backend exposes 34 RESTful API endpoints organized into services: Authentication (JWT tokens with 2FA), Listings Management, Order Processing, Messaging, and AI Integration.

4. **Database Layer**: PostgreSQL stores all persistent data across 33 tables, organized into logical groups: User data, Marketplace data, Order/Payment data, and Messaging data.

5. **External Services**: The platform integrates with Google Gemini for AI-powered agricultural advice, Cloudinary for image and video storage, and Mobile Money providers (MTN MoMo, Orange Money) for payments.
