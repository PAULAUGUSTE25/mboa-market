# Deployment Diagram - MBOA Market

## Mermaid Code

```mermaid
flowchart TB
    subgraph Users["👥 End Users"]
        MOBILE[📱 Mobile Browser<br/>Android/iOS]
        DESKTOP[💻 Desktop Browser<br/>Chrome/Firefox/Safari]
    end
    
    subgraph CDN["🌐 Content Delivery"]
        NETLIFY[Netlify<br/>Frontend Hosting<br/>mboa-market.netlify.app]
        CLOUDINARY_CDN[Cloudinary CDN<br/>Image Delivery<br/>res.cloudinary.com]
    end
    
    subgraph Backend["⚙️ Backend Infrastructure"]
        RENDER[Render.com<br/>Backend Hosting<br/>mboa-market-backend.onrender.com]
        
        subgraph RenderServices["Render Services"]
            WEB[Web Service<br/>FastAPI App<br/>Python 3.11]
            WORKER[Background Worker<br/>Async Tasks]
        end
    end
    
    subgraph Database["🗄️ Database"]
        POSTGRES[(PostgreSQL<br/>Render Managed<br/>33 Tables)]
    end
    
    subgraph ExternalAPIs["🔌 External APIs"]
        GEMINI_API[Google Gemini API<br/>AI Services<br/>generativelanguage.googleapis.com]
        MOMO_API[MTN MoMo API<br/>Payment Gateway]
        OM_API[Orange Money API<br/>Payment Gateway]
        SMS_API[SMS Gateway<br/>OTP Delivery]
    end
    
    subgraph Security["🔒 Security"]
        SSL[SSL/TLS<br/>HTTPS Encryption]
        JWT[JWT Tokens<br/>Authentication]
        CORS_POLICY[CORS Policy<br/>Origin Validation]
    end
    
    Users -->|HTTPS| SSL
    SSL --> NETLIFY
    NETLIFY -->|Static Assets| Users
    
    NETLIFY -->|API Calls| RENDER
    RENDER --> WEB
    WEB --> WORKER
    
    WEB -->|SQL| POSTGRES
    WORKER -->|SQL| POSTGRES
    
    WEB -->|REST| GEMINI_API
    WEB -->|REST| MOMO_API
    WEB -->|REST| OM_API
    WEB -->|REST| SMS_API
    
    CLOUDINARY_CDN -->|Images/Videos| Users
    WEB -->|Upload| CLOUDINARY_CDN
    
    JWT -.->|Validates| WEB
    CORS_POLICY -.->|Enforces| WEB
    
    style Users fill:#e3f2fd
    style CDN fill:#c8e6c9
    style Backend fill:#fff3e0
    style Database fill:#336791,color:#fff
    style ExternalAPIs fill:#fce4ec
    style Security fill:#ffcdd2
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
The deployment diagram illustrates how the MBOA Market platform is deployed across various cloud services and infrastructure components. This architecture leverages modern cloud platforms to ensure scalability, reliability, and global accessibility. The deployment strategy prioritizes cost-effectiveness while maintaining performance for users across Cameroon.

### Figure Caption
**Figure X.X: Deployment Diagram - MBOA Market Cloud Infrastructure**

### Explanation (After Figure)
The deployment architecture consists of several interconnected components:

**End Users**
- Users access the platform via mobile browsers (Android/iOS) or desktop browsers
- The responsive design ensures optimal experience across all devices
- All communication is encrypted via HTTPS

**Content Delivery Network (CDN)**
- **Netlify**: Hosts the React frontend application
  - URL: `mboa-market.netlify.app`
  - Provides automatic SSL certificates
  - Global edge network for fast loading
  - Automatic deployments from Git
- **Cloudinary**: Delivers images and videos
  - URL: `res.cloudinary.com`
  - Automatic image optimization
  - Responsive image transformations

**Backend Infrastructure (Render.com)**
- **Web Service**: Runs the FastAPI application
  - URL: `mboa-market-backend.onrender.com`
  - Python 3.11 runtime
  - Auto-scaling based on traffic
- **Background Worker**: Handles asynchronous tasks
  - Email notifications
  - Payment processing callbacks
  - Data synchronization

**Database (PostgreSQL)**
- Managed PostgreSQL instance on Render
- 33 tables with full relational integrity
- Automatic backups and point-in-time recovery
- Connection pooling for performance

**External API Integrations**
- **Google Gemini**: AI-powered agricultural advice
- **MTN MoMo API**: Mobile money payments for MTN users
- **Orange Money API**: Mobile money payments for Orange users
- **SMS Gateway**: OTP delivery for authentication

**Security Measures**
- **SSL/TLS**: All traffic encrypted in transit
- **JWT Tokens**: Stateless authentication
- **CORS Policy**: Restricts API access to authorized origins
- **Environment Variables**: Secrets stored securely

**Deployment URLs**:
| Component | URL |
|-----------|-----|
| Frontend | https://mboa-market.netlify.app |
| Backend API | https://mboa-market-backend.onrender.com |
| API Docs | https://mboa-market-backend.onrender.com/docs |
