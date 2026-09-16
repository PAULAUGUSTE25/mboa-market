# Component Diagram - MBOA Market

## Mermaid Code

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        direction TB
        BROWSER[Web Browser]
        
        subgraph ReactApp["React Application"]
            ROUTER[React Router<br/>Navigation]
            PAGES[Page Components<br/>20 Pages]
            COMPONENTS[UI Components<br/>Reusable]
            HOOKS[Custom Hooks<br/>State Management]
            SERVICES[API Services<br/>Axios Calls]
        end
    end
    
    subgraph Server["⚙️ Server Layer"]
        direction TB
        
        subgraph FastAPI["FastAPI Application"]
            MAIN[Main Entry<br/>app.main]
            
            subgraph Routes["API Routes"]
                AUTH_R[/auth]
                USERS_R[/users]
                LISTINGS_R[/listings]
                ORDERS_R[/orders]
                MSG_R[/messaging]
                AI_R[/ai]
                ADMIN_R[/admin]
            end
            
            subgraph Middleware["Middleware"]
                CORS[CORS Handler]
                JWT_AUTH[JWT Authentication]
                RATE_LIMIT[Rate Limiting]
            end
            
            subgraph Services["Business Services"]
                AUTH_S[Auth Service]
                LISTING_S[Listing Service]
                ORDER_S[Order Service]
                PAYMENT_S[Payment Service]
                AI_S[AI Service]
            end
        end
    end
    
    subgraph Data["🗄️ Data Layer"]
        direction TB
        
        subgraph ORM["SQLAlchemy ORM"]
            MODELS[Models<br/>33 Tables]
            SCHEMAS[Pydantic Schemas<br/>Validation]
        end
        
        POSTGRES[(PostgreSQL<br/>Database)]
    end
    
    subgraph External["🌐 External Services"]
        direction TB
        CLOUDINARY[Cloudinary<br/>Image CDN]
        GEMINI[Google Gemini<br/>AI API]
        MOMO[MTN MoMo<br/>Payments]
        ORANGE[Orange Money<br/>Payments]
        SMS[SMS Gateway<br/>OTP]
    end
    
    BROWSER --> ReactApp
    ROUTER --> PAGES
    PAGES --> COMPONENTS
    PAGES --> HOOKS
    HOOKS --> SERVICES
    
    SERVICES -->|HTTPS| MAIN
    MAIN --> Middleware
    Middleware --> Routes
    Routes --> Services
    
    Services --> ORM
    ORM --> POSTGRES
    
    AI_S --> GEMINI
    LISTING_S --> CLOUDINARY
    PAYMENT_S --> MOMO
    PAYMENT_S --> ORANGE
    AUTH_S --> SMS
    
    style Client fill:#61dafb,color:#000
    style Server fill:#009688,color:#fff
    style Data fill:#336791,color:#fff
    style External fill:#ff9800,color:#000
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
The component diagram provides a detailed view of the software components that make up the MBOA Market platform. This diagram shows how the system is organized into distinct layers, each with specific responsibilities. Understanding this architecture is essential for maintaining and extending the platform.

### Figure Caption
**Figure X.X: Component Diagram - MBOA Market Software Architecture**

### Explanation (After Figure)
The system is organized into four main layers:

**Client Layer (React Application)**
- **React Router**: Handles navigation between 20 different pages
- **Page Components**: Individual screens (Landing, Feed, Dashboard, etc.)
- **UI Components**: Reusable interface elements (buttons, cards, modals)
- **Custom Hooks**: State management and business logic encapsulation
- **API Services**: Axios-based HTTP client for backend communication

**Server Layer (FastAPI Application)**
- **Main Entry**: Application initialization and configuration
- **API Routes**: 7 route modules handling different domains:
  - `/auth`: Registration, login, phone verification
  - `/users`: Profile management
  - `/listings`: Product CRUD operations
  - `/orders`: Order lifecycle management
  - `/messaging`: Chat functionality
  - `/ai`: Bigiass AI assistant
  - `/admin`: Administrative functions
- **Middleware**: Cross-cutting concerns:
  - CORS: Cross-origin request handling
  - JWT Authentication: Token validation
  - Rate Limiting: API abuse prevention
- **Business Services**: Core business logic implementation

**Data Layer**
- **SQLAlchemy ORM**: Object-relational mapping for database operations
- **Models**: 33 database table definitions
- **Pydantic Schemas**: Request/response validation
- **PostgreSQL**: Relational database for persistent storage

**External Services**
- **Cloudinary**: Image and video storage/delivery
- **Google Gemini**: AI-powered agricultural advice
- **MTN MoMo / Orange Money**: Mobile payment processing
- **SMS Gateway**: OTP delivery for authentication

**Communication Flow**:
1. User interacts with React components in the browser
2. API Services send HTTPS requests to FastAPI
3. Middleware validates authentication and handles CORS
4. Routes dispatch to appropriate business services
5. Services interact with database via ORM
6. External services are called as needed
7. Response flows back through the layers
