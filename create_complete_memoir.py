"""
COMPLETE AUTOMATED SCRIPT
1. Render all Mermaid diagrams to PNG images
2. Create Word document with images and academic comments
"""

import os
import asyncio
from pathlib import Path

# Paths
BASE_DIR = Path(r"c:\Users\HP\Desktop\mboa-market")
IMAGES_DIR = BASE_DIR / "docs" / "diagrams" / "images"
OUTPUT_DOCX = BASE_DIR / "MEMOIR_COMPLETE_WITH_DIAGRAMS.docx"

# Create images directory
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# All diagrams with Mermaid code and academic comments
DIAGRAMS = [
    {
        "id": "01_system_architecture",
        "number": "3.1",
        "title": "System Architecture Overview",
        "mermaid": """flowchart TB
    subgraph Users["👥 Users"]
        V[Visitor]
        F[Farmer/Breeder]
        B[Buyer]
        A[Administrator]
    end

    subgraph Frontend["🖥️ Frontend - React.js + TypeScript"]
        LP[Landing Page]
        AUTH[Auth Pages]
        FEED[Feed Page]
        DASH[Dashboard]
        CHAT[Chat Interface]
    end

    subgraph Backend["⚙️ Backend - FastAPI Python"]
        API[REST API - 34 Endpoints]
        AUTH_SVC[Auth Service]
        LISTING_SVC[Listings Service]
        ORDER_SVC[Orders Service]
        AI_SVC[AI Service]
    end

    subgraph Database["🗄️ Database - PostgreSQL"]
        USERS_DB[(Users & Profiles)]
        MARKET_DB[(Listings & Categories)]
        ORDER_DB[(Orders & Payments)]
    end

    subgraph External["🌐 External Services"]
        GEMINI[Google Gemini AI]
        CLOUDINARY[Cloudinary CDN]
        MOMO[Mobile Money]
    end

    Users --> Frontend
    Frontend <-->|HTTPS/REST| Backend
    Backend <--> Database
    Backend <-->|API| External""",
        "comment_before": """In this section, we present the overall architecture of the MBOA Market platform. We have adopted a modern three-tier architecture that separates the presentation layer, business logic, and data persistence. This architectural choice reflects our commitment to building a scalable and maintainable system.

As illustrated in Figure 3.1, we can observe how the different components of our platform interact with each other. We have organized the system into four distinct layers, each serving a specific purpose in delivering the marketplace functionality to our users.""",
        "comment_after": """As we can see in Figure 3.1, our architecture integrates five main actors (Visitor, Farmer/Breeder, Buyer, Administrator, and Bigiass AI) with a React.js frontend, a FastAPI backend exposing 34 endpoints, and a PostgreSQL database containing 33 tables. We have also integrated external services including Google Gemini for AI capabilities, Cloudinary for media storage, and Mobile Money providers for payment processing.

This architecture allows us to maintain a clear separation of concerns while ensuring efficient communication between all system components."""
    },
    {
        "id": "02_sequence_auth",
        "number": "3.2",
        "title": "User Authentication Sequence",
        "mermaid": """sequenceDiagram
    autonumber
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant SMS as SMS Service

    U->>F: Enter phone + password
    F->>B: POST /api/auth/register
    B->>DB: Check if phone exists
    DB-->>B: Phone not found
    B->>DB: Create user record
    B->>SMS: Send OTP code
    SMS-->>U: SMS with 6-digit code
    U->>F: Enter OTP code
    F->>B: POST /api/auth/verify-phone
    B->>DB: Verify OTP code
    B->>B: Generate JWT token
    B-->>F: Return JWT + user data
    F-->>U: Redirect to Dashboard""",
        "comment_before": """For the authentication module, we have implemented a phone-based verification system with OTP (One-Time Password). This approach was chosen specifically for the Cameroonian context, where phone numbers are more commonly used than email addresses for identity verification.

In Figure 3.2, we present the sequence of interactions that occur during the user authentication process. We can observe how the different system components collaborate to ensure secure access to the platform.""",
        "comment_after": """As demonstrated in Figure 3.2, our authentication sequence involves the frontend, backend, database, and SMS service working together. We have implemented JWT (JSON Web Token) for session management, which allows us to maintain stateless authentication while ensuring security.

The process we have designed includes input validation, OTP generation and verification, and secure token generation. This approach provides us with a robust authentication mechanism that is both secure and user-friendly for our target market."""
    },
    {
        "id": "03_sequence_order",
        "number": "3.3",
        "title": "Order and Payment Process Sequence",
        "mermaid": """sequenceDiagram
    autonumber
    participant Buyer
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant Pay as Payment Provider
    participant Seller

    Buyer->>F: Select product
    F->>B: POST /api/orders
    B->>DB: Create order
    B-->>F: Return order details
    Buyer->>F: Initiate payment
    F->>B: POST /api/payments
    B->>Pay: Request payment
    Pay-->>Buyer: USSD prompt
    Buyer->>Pay: Confirm payment
    Pay-->>B: Payment webhook
    B->>DB: Create escrow_hold
    B-->>Seller: Notify new order
    Seller->>F: Mark as shipped
    Buyer->>F: Confirm receipt
    B->>DB: Release escrow
    B-->>Seller: Payment released""",
        "comment_before": """The order management system represents one of the core functionalities of MBOA Market. We have implemented an escrow-based payment model that protects both buyers and sellers during transactions.

In Figure 3.3, we illustrate the complete sequence of an order from product selection to payment confirmation and delivery. We can observe how we have designed the system to ensure trust between parties who may not know each other.""",
        "comment_after": """Figure 3.3 demonstrates our implementation of the order lifecycle. We can see that we have divided the process into three main phases: order creation with fee calculation, payment processing via Mobile Money with escrow protection, and fulfillment with delivery confirmation.

Our escrow mechanism, as shown in the diagram, holds the buyer's funds until delivery is confirmed. This approach allows us to build trust in the marketplace while protecting all parties involved in the transaction."""
    },
    {
        "id": "04_class_diagram",
        "number": "3.4",
        "title": "Domain Model Class Diagram",
        "mermaid": """classDiagram
    class User {
        +UUID id
        +String phone
        +String password_hash
        +UserStatus status
        +BadgeLevel badge
        +register()
        +login()
    }

    class Listing {
        +UUID id
        +UUID seller_id
        +String title
        +Decimal quantity
        +Decimal price_per_unit
        +ListingStatus status
        +create()
        +publish()
    }

    class Order {
        +UUID id
        +UUID buyer_id
        +UUID seller_id
        +OrderStatus status
        +Decimal total
        +create()
        +updateStatus()
    }

    class Payment {
        +UUID id
        +UUID order_id
        +PaymentStatus status
        +Decimal amount
        +initiate()
        +confirm()
    }

    class Message {
        +UUID id
        +UUID sender_id
        +String content
        +send()
    }

    User "1" -- "*" Listing : creates
    User "1" -- "*" Order : places
    Listing "1" -- "*" Order : generates
    Order "1" -- "1" Payment : has
    User "1" -- "*" Message : sends""",
        "comment_before": """To structure our application's data model, we have designed a comprehensive class diagram following object-oriented principles. Our domain model represents the real-world entities involved in agricultural commerce.

Figure 3.4 presents the main classes of our system along with their attributes, methods, and relationships. We can observe how we have organized the domain to support all marketplace functionalities.""",
        "comment_after": """In Figure 3.4, we can identify the core entities of our system: User (with authentication and profile management), Listing (representing products for sale), Order (managing transactions), Payment (handling mobile money), and Message (enabling communication).

The relationships we have established reflect the business rules of our marketplace. For instance, we can see that a User can create multiple Listings, place multiple Orders, and each Order has exactly one Payment. This design allows us to maintain data integrity while supporting complex business scenarios."""
    },
    {
        "id": "05_flowchart_auth",
        "number": "3.5",
        "title": "Authentication Process Flowchart",
        "mermaid": """flowchart TD
    START([Start]) --> CHOICE{New User?}
    CHOICE -->|Yes| REG[Registration]
    CHOICE -->|No| LOGIN[Login]
    
    REG --> PHONE[Enter Phone]
    PHONE --> PWD[Create Password]
    PWD --> OTP[Send OTP]
    OTP --> VERIFY[Verify OTP]
    VERIFY --> TOKEN[Generate JWT]
    
    LOGIN --> CRED[Enter Credentials]
    CRED --> VALID{Valid?}
    VALID -->|No| ERROR[Show Error]
    ERROR --> CRED
    VALID -->|Yes| TOKEN
    
    TOKEN --> STORE[Store Token]
    STORE --> REDIRECT{Role?}
    REDIRECT -->|Admin| ADMIN[Admin Dashboard]
    REDIRECT -->|Seller| SELLER[Seller Dashboard]
    REDIRECT -->|Buyer| FEED[Marketplace Feed]""",
        "comment_before": """To better understand the user journey during authentication, we have created a detailed flowchart. This diagram allows us to visualize the different paths a user can take when accessing the platform.

In Figure 3.5, we present the complete authentication flow, including both registration for new users and login for returning users. We can observe the decision points and the different outcomes based on user actions.""",
        "comment_after": """As illustrated in Figure 3.5, our authentication system provides two distinct paths. For new users, we have implemented a registration flow that includes phone verification via OTP. For returning users, we offer a streamlined login process with optional two-factor authentication.

We can also observe in the diagram how users are redirected based on their role after successful authentication. This role-based routing allows us to provide a personalized experience for Administrators, Sellers, and Buyers."""
    },
    {
        "id": "06_flowchart_listing",
        "number": "3.6",
        "title": "Listing Creation Process Flowchart",
        "mermaid": """flowchart TD
    START([Seller Logged In]) --> CAT[Select Category]
    CAT --> PROD[Select Product Type]
    PROD --> DETAILS[Enter Details]
    DETAILS --> QTY[Enter Quantity]
    QTY --> PRICE[Set Price]
    PRICE --> REGION[Select Region]
    REGION --> PHOTOS[Upload Photos]
    PHOTOS --> CLOUD[Upload to Cloudinary]
    CLOUD --> PREVIEW[Preview Listing]
    PREVIEW --> VALID{Valid?}
    VALID -->|No| DETAILS
    VALID -->|Yes| SAVE[Save to Database]
    SAVE --> PUBLISH[Set Status = PUBLISHED]
    PUBLISH --> NOTIFY[Notify Followers]
    NOTIFY --> SUCCESS([Listing Published ✓])""",
        "comment_before": """The listing creation process is essential for sellers to publish their products on the marketplace. We have designed this process to be intuitive while capturing all necessary information for buyers.

Figure 3.6 illustrates the step-by-step process that a farmer or breeder follows to create a new product listing. We can observe how we have organized the process into logical steps to ensure a smooth user experience.""",
        "comment_after": """In Figure 3.6, we can see that our listing creation process consists of five main steps: product information entry, quantity and pricing configuration, location selection, photo upload, and final review before publication.

We have integrated Cloudinary for image storage, as shown in the diagram, which allows us to optimize image delivery and reduce loading times. Upon publication, we automatically notify the seller's followers, creating engagement within the platform."""
    },
    {
        "id": "07_flowchart_order",
        "number": "3.7",
        "title": "Complete Order Process Flowchart",
        "mermaid": """flowchart TD
    BROWSE([Browse Marketplace]) --> FILTER[Apply Filters]
    FILTER --> SELECT[Select Product]
    SELECT --> STOCK{In Stock?}
    STOCK -->|No| BROWSE
    STOCK -->|Yes| QTY[Select Quantity]
    QTY --> DELIVERY[Choose Delivery Mode]
    DELIVERY --> FEES[Calculate Fees]
    FEES --> CONFIRM{Confirm?}
    CONFIRM -->|No| BROWSE
    CONFIRM -->|Yes| ORDER[Create Order]
    ORDER --> PAY[Select Payment Method]
    PAY --> MOMO[Mobile Money]
    MOMO --> USSD[USSD Prompt]
    USSD --> SUCCESS{Success?}
    SUCCESS -->|No| PAY
    SUCCESS -->|Yes| ESCROW[Hold in Escrow]
    ESCROW --> NOTIFY_S[Notify Seller]
    NOTIFY_S --> SHIP[Seller Ships]
    SHIP --> RECEIVE[Buyer Receives]
    RECEIVE --> CONFIRM_R{Confirm Receipt?}
    CONFIRM_R -->|No| DISPUTE[Open Dispute]
    CONFIRM_R -->|Yes| RELEASE[Release Escrow]
    DISPUTE --> RELEASE
    RELEASE --> COMPLETE([Order Complete ✓])""",
        "comment_before": """The order process represents the complete buyer journey from product discovery to order completion. We have designed this flow to accommodate the realities of agricultural commerce in Cameroon, including optional negotiation and mobile money payments.

In Figure 3.7, we present the end-to-end order process. We can observe how we have incorporated multiple decision points to handle various scenarios that may occur during a transaction.""",
        "comment_after": """Figure 3.7 demonstrates our comprehensive order flow. We can observe five distinct phases: product discovery with filtering capabilities, optional negotiation via chat, order creation with fee calculation, payment processing with escrow protection, and fulfillment with delivery confirmation.

We have also implemented a dispute resolution mechanism, as shown in the diagram, which allows buyers to raise concerns if they encounter issues with their orders. This feature enables us to maintain trust and fairness in the marketplace."""
    },
    {
        "id": "08_component_diagram",
        "number": "3.8",
        "title": "Software Component Diagram",
        "mermaid": """flowchart TB
    subgraph Client["🖥️ Client Layer"]
        REACT[React App]
        ROUTER[React Router]
        PAGES[20 Pages]
        SERVICES[API Services]
    end
    
    subgraph Server["⚙️ Server Layer"]
        FASTAPI[FastAPI]
        AUTH_R[/auth]
        LISTINGS_R[/listings]
        ORDERS_R[/orders]
        AI_R[/ai]
        MIDDLEWARE[JWT + CORS]
    end
    
    subgraph Data["🗄️ Data Layer"]
        ORM[SQLAlchemy]
        POSTGRES[(PostgreSQL)]
    end
    
    subgraph External["🌐 External"]
        GEMINI[Gemini AI]
        CLOUDINARY[Cloudinary]
        MOMO[Mobile Money]
    end
    
    Client -->|HTTPS| Server
    Server --> Data
    Server --> External""",
        "comment_before": """To provide a detailed view of our software organization, we have created a component diagram showing how the different parts of the system are structured and how they interact.

Figure 3.8 presents the software components organized into distinct layers. We can observe how we have separated concerns to ensure maintainability and scalability of the platform.""",
        "comment_after": """As we can see in Figure 3.8, our system is organized into four main layers. The Client Layer contains our React application with 20 pages and reusable components. The Server Layer hosts our FastAPI application with route modules for authentication, listings, orders, and AI functionality.

The Data Layer, as shown in the diagram, uses SQLAlchemy ORM to interact with PostgreSQL. We have also integrated external services for AI (Gemini), media storage (Cloudinary), and payments (Mobile Money). This modular architecture allows us to easily extend and maintain the system."""
    },
    {
        "id": "09_deployment_diagram",
        "number": "3.9",
        "title": "Cloud Deployment Diagram",
        "mermaid": """flowchart TB
    subgraph Users["👥 End Users"]
        MOBILE[📱 Mobile]
        DESKTOP[💻 Desktop]
    end
    
    subgraph CDN["🌐 CDN"]
        NETLIFY[Netlify<br/>mboa-market.netlify.app]
        CLOUD_CDN[Cloudinary CDN]
    end
    
    subgraph Backend["⚙️ Backend"]
        RENDER[Render.com<br/>mboa-market-backend.onrender.com]
    end
    
    subgraph DB["🗄️ Database"]
        POSTGRES[(PostgreSQL<br/>Render Managed)]
    end
    
    subgraph APIs["🔌 External APIs"]
        GEMINI[Gemini API]
        MOMO[MTN MoMo]
        ORANGE[Orange Money]
    end
    
    Users -->|HTTPS| NETLIFY
    NETLIFY -->|API| RENDER
    RENDER --> POSTGRES
    RENDER --> APIs
    CLOUD_CDN --> Users""",
        "comment_before": """For the deployment of MBOA Market, we have leveraged modern cloud platforms to ensure reliability, scalability, and global accessibility. Our deployment strategy prioritizes cost-effectiveness while maintaining performance.

In Figure 3.9, we illustrate how our platform is deployed across various cloud services. We can observe the infrastructure components and how they communicate with each other.""",
        "comment_after": """Figure 3.9 shows our production deployment architecture. We have deployed the frontend on Netlify (mboa-market.netlify.app), which provides automatic SSL certificates and global CDN distribution. The backend runs on Render.com (mboa-market-backend.onrender.com) with a managed PostgreSQL database.

As we can observe in the diagram, all communication is encrypted via HTTPS, and we have implemented CORS policies to secure API access. This cloud-native approach allows us to scale the platform as our user base grows."""
    },
    {
        "id": "10_flowchart_ai",
        "number": "3.10",
        "title": "AI Assistant (Bigiass) Flowchart",
        "mermaid": """flowchart TD
    START([Open Chat]) --> TYPE[Type Question]
    TYPE --> SEND[Send Message]
    SEND --> BACKEND[Backend Receives]
    BACKEND --> CONTEXT[Add Context<br/>User Profile, Region]
    CONTEXT --> PROMPT[Build AI Prompt]
    PROMPT --> GEMINI[Call Gemini API]
    GEMINI --> RESPONSE[Generate Response]
    RESPONSE --> CHECK{Success?}
    CHECK -->|No| FALLBACK[Fallback Response]
    CHECK -->|Yes| DISPLAY[Display Answer]
    FALLBACK --> DISPLAY
    DISPLAY --> FEATURES{Feature Type}
    FEATURES --> CROP[🌾 Crop Advice]
    FEATURES --> LIVESTOCK[🐄 Livestock Tips]
    FEATURES --> MARKET[📊 Market Analysis]
    FEATURES --> DISEASE[🔬 Disease Diagnosis]
    CROP --> CONTINUE{Continue?}
    LIVESTOCK --> CONTINUE
    MARKET --> CONTINUE
    DISEASE --> CONTINUE
    CONTINUE -->|Yes| TYPE
    CONTINUE -->|No| END([End Chat])""",
        "comment_before": """Bigiass is our AI-powered virtual assistant designed to provide agricultural advice to farmers and breeders. We have integrated Google Gemini to deliver intelligent, context-aware responses.

Figure 3.10 presents the process flow of our AI assistant. We can observe how user questions are processed and how we generate relevant agricultural advice.""",
        "comment_after": """In Figure 3.10, we can see how our AI assistant processes user queries. We have implemented context enrichment, where user profile information and location are added to the prompt before sending to the Gemini API.

The diagram shows that we provide advice in four main areas: crop cultivation, livestock management, market analysis, and disease diagnosis. We have also implemented a fallback mechanism to ensure users always receive a response, even if the external API is unavailable."""
    },
    {
        "id": "11_usecase_diagram",
        "number": "3.11",
        "title": "Use Case Diagram",
        "mermaid": """flowchart TB
    subgraph Actors["👥 Actors"]
        V[Visitor]
        F[Farmer/Breeder]
        B[Buyer]
        A[Administrator]
        AI[Bigiass AI]
    end

    subgraph Auth["🔐 Authentication"]
        UC1[Register]
        UC2[Login]
        UC3[Verify Phone]
        UC4[Manage Profile]
    end

    subgraph Listings["📦 Listings"]
        UC5[Create Listing]
        UC6[Edit Listing]
        UC7[Delete Listing]
        UC8[Upload Photos]
    end

    subgraph Discovery["🔍 Discovery"]
        UC9[Browse Listings]
        UC10[Search Products]
        UC11[Filter by Category]
        UC12[View Details]
    end

    subgraph Orders["🛒 Orders"]
        UC17[Place Order]
        UC18[Pay via MoMo]
        UC19[Track Order]
        UC20[Leave Review]
    end

    subgraph AIModule["🤖 AI Assistant"]
        UC21[Ask Question]
        UC22[Get Advice]
    end

    V --> UC1
    V --> UC9
    F --> Auth
    F --> Listings
    B --> Discovery
    B --> Orders
    A --> UC4
    AI --> AIModule""",
        "comment_before": """To model the functional requirements of MBOA Market, we have developed a comprehensive use case diagram. This diagram identifies the main actors and their interactions with the system.

In Figure 3.11, we present the use cases organized into functional modules. We can observe how different types of users interact with various features of the platform.""",
        "comment_after": """As illustrated in Figure 3.11, our system supports five main actors: Visitor (unauthenticated browsing), Farmer/Breeder (product listing and selling), Buyer (purchasing and reviewing), Administrator (platform management), and Bigiass AI (intelligent assistance).

We have organized the use cases into modules: Authentication, Listings Management, Discovery, Orders & Payments, and AI Assistant. This organization allows us to clearly define the scope of each functional area and ensure comprehensive coverage of user needs."""
    },
    {
        "id": "12_erd_diagram",
        "number": "3.12",
        "title": "Database Entity-Relationship Diagram",
        "mermaid": """erDiagram
    users ||--o| profiles : has
    users ||--o{ listings : creates
    users ||--o{ orders : places
    users ||--o{ messages : sends
    users ||--o{ reviews : gives
    
    listings ||--o{ listing_photos : has
    listings }o--|| categories : belongs_to
    listings ||--o{ orders : generates
    
    orders ||--|| payments : has
    orders ||--|| escrow_holds : has
    orders ||--o{ order_items : contains
    
    conversations ||--o{ messages : contains
    
    kyc_submissions ||--o{ kyc_documents : has
    
    b2b_requests ||--o{ b2b_offers : receives
    
    livestock_batches ||--o{ livestock_events : has""",
        "comment_before": """The database design is fundamental to our platform's data management capabilities. We have designed a relational schema that supports all marketplace functionalities while maintaining data integrity.

Figure 3.12 presents the entity-relationship diagram of our database. We can observe the tables and their relationships that form the data foundation of MBOA Market.""",
        "comment_after": """In Figure 3.12, we can identify the main entity groups: User & Auth (users, profiles), Marketplace (listings, categories, photos), Orders & Payments (orders, payments, escrow), Messaging (conversations, messages), KYC (submissions, documents), B2B (requests, offers), and Livestock (batches, events).

The relationships we have established, as shown in the diagram, ensure referential integrity across all tables. This comprehensive schema allows us to support complex business processes while maintaining data consistency."""
    }
]


async def render_diagrams():
    """Render all Mermaid diagrams to PNG images using Playwright"""
    from playwright.async_api import async_playwright
    
    print("🎨 Rendering diagrams to PNG images...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        for i, diagram in enumerate(DIAGRAMS):
            print(f"  [{i+1}/{len(DIAGRAMS)}] Rendering {diagram['id']}...")
            
            # Create HTML with Mermaid
            html_content = f"""<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {{ 
            margin: 0; 
            padding: 20px; 
            background: white;
            display: flex;
            justify-content: center;
        }}
        .mermaid {{ 
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="mermaid">
{diagram['mermaid']}
    </div>
    <script>
        mermaid.initialize({{ 
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        }});
    </script>
</body>
</html>"""
            
            page = await browser.new_page()
            await page.set_content(html_content)
            await page.wait_for_timeout(2000)  # Wait for Mermaid to render
            
            # Get the diagram element
            element = await page.query_selector('.mermaid')
            if element:
                image_path = IMAGES_DIR / f"{diagram['id']}.png"
                await element.screenshot(path=str(image_path))
            
            await page.close()
        
        await browser.close()
    
    print("✅ All diagrams rendered!")


def create_word_document():
    """Create Word document with images and academic comments"""
    from docx import Document
    from docx.shared import Inches, Pt
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    
    print("\n📄 Creating Word document...")
    
    doc = Document()
    
    # Title
    title = doc.add_heading('MBOA Market - Technical Documentation', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    subtitle = doc.add_paragraph('Complete Diagrams with Academic Comments')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph()
    doc.add_page_break()
    
    # Add each diagram
    for diagram in DIAGRAMS:
        print(f"  Adding Figure {diagram['number']}: {diagram['title']}")
        
        # Section heading
        doc.add_heading(f"Figure {diagram['number']}: {diagram['title']}", level=1)
        
        # Introduction (BEFORE figure)
        doc.add_paragraph()
        intro = doc.add_paragraph(diagram["comment_before"])
        intro.paragraph_format.first_line_indent = Inches(0.5)
        
        doc.add_paragraph()
        
        # Add image
        image_path = IMAGES_DIR / f"{diagram['id']}.png"
        if image_path.exists():
            doc.add_picture(str(image_path), width=Inches(6))
            last_paragraph = doc.paragraphs[-1]
            last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        else:
            placeholder = doc.add_paragraph(f"[IMAGE NOT FOUND: {diagram['id']}.png]")
            placeholder.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Figure caption
        caption = doc.add_paragraph()
        caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = caption.add_run(f"Figure {diagram['number']}: {diagram['title']}")
        run.bold = True
        run.italic = True
        
        doc.add_paragraph()
        
        # Analysis (AFTER figure)
        analysis = doc.add_paragraph(diagram["comment_after"])
        analysis.paragraph_format.first_line_indent = Inches(0.5)
        
        doc.add_page_break()
    
    # Save
    doc.save(str(OUTPUT_DOCX))
    print(f"\n✅ Document saved: {OUTPUT_DOCX}")


async def main():
    print("="*60)
    print("MBOA MARKET - COMPLETE MEMOIR GENERATOR")
    print("="*60)
    
    # Step 1: Render diagrams
    await render_diagrams()
    
    # Step 2: Create Word document
    create_word_document()
    
    print("\n" + "="*60)
    print("✅ COMPLETE!")
    print("="*60)
    print(f"\n📁 Images saved in: {IMAGES_DIR}")
    print(f"📄 Document saved: {OUTPUT_DOCX}")
    print("\nYou can now copy the content to your main memoir document.")


if __name__ == "__main__":
    asyncio.run(main())
