# Flowchart - AI Assistant (Bigiass)

## Mermaid Code

```mermaid
flowchart TD
    START([User Opens Chat]) --> ACCESS[Access Bigiass AI]
    
    subgraph Input["📝 User Input"]
        ACCESS --> TYPE_MSG[Type Question/Message]
        TYPE_MSG --> EXAMPLES{Example Questions}
        EXAMPLES --> Q1[🌱 How to grow tomatoes?]
        EXAMPLES --> Q2[🐔 Chicken disease symptoms?]
        EXAMPLES --> Q3[💰 Current maize prices?]
        EXAMPLES --> Q4[🌧️ Best planting season?]
        Q1 --> SEND
        Q2 --> SEND
        Q3 --> SEND
        Q4 --> SEND
        TYPE_MSG --> SEND[Send Message]
    end
    
    subgraph Processing["⚙️ Backend Processing"]
        SEND --> RECEIVE[Backend Receives Request]
        RECEIVE --> VALIDATE{Valid Request?}
        VALIDATE -->|No| ERROR[Return Error Message]
        ERROR --> TYPE_MSG
        VALIDATE -->|Yes| BUILD_PROMPT[Build AI Prompt]
        
        BUILD_PROMPT --> ADD_CONTEXT[Add Context:<br/>- User Profile<br/>- Location/Region<br/>- Activity Type]
        ADD_CONTEXT --> ADD_SYSTEM[Add System Prompt:<br/>Agricultural Expert<br/>Cameroon Focus]
        ADD_SYSTEM --> CALL_API[Call Gemini API]
    end
    
    subgraph AIProcessing["🤖 Gemini AI"]
        CALL_API --> GEMINI[Google Gemini<br/>generativelanguage.googleapis.com]
        GEMINI --> ANALYZE[Analyze Question]
        ANALYZE --> GENERATE[Generate Response]
        GENERATE --> FORMAT[Format for Display]
    end
    
    subgraph Response["💬 Response Handling"]
        FORMAT --> RECEIVE_RESP[Backend Receives Response]
        RECEIVE_RESP --> CHECK{Response OK?}
        CHECK -->|No| FALLBACK[Fallback Response<br/>Generic Advice]
        CHECK -->|Yes| PROCESS_RESP[Process Response]
        FALLBACK --> DISPLAY
        PROCESS_RESP --> DISPLAY[Display to User]
    end
    
    subgraph Features["✨ AI Features"]
        DISPLAY --> FEATURE1[🌾 Crop Advice<br/>Planting, Care, Harvest]
        DISPLAY --> FEATURE2[🐄 Livestock Tips<br/>Feeding, Health, Breeding]
        DISPLAY --> FEATURE3[📊 Market Analysis<br/>Prices, Trends, Demand]
        DISPLAY --> FEATURE4[🔬 Disease Diagnosis<br/>Symptoms, Treatment]
        DISPLAY --> FEATURE5[🌍 Local Knowledge<br/>Cameroon-specific]
    end
    
    FEATURE1 --> CONTINUE{Continue Chat?}
    FEATURE2 --> CONTINUE
    FEATURE3 --> CONTINUE
    FEATURE4 --> CONTINUE
    FEATURE5 --> CONTINUE
    
    CONTINUE -->|Yes| TYPE_MSG
    CONTINUE -->|No| END_CHAT([End Conversation])
    
    style Input fill:#e3f2fd
    style Processing fill:#fff3e0
    style AIProcessing fill:#e8f5e9
    style Response fill:#fce4ec
    style Features fill:#f3e5f5
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
Bigiass is the AI-powered virtual assistant integrated into MBOA Market, designed to provide agricultural advice and support to farmers and breeders. This flowchart illustrates how user questions are processed through the system and how the Google Gemini AI generates contextually relevant responses. The assistant is specifically trained to understand the agricultural context of Cameroon.

### Figure Caption
**Figure X.X: Flowchart - Bigiass AI Assistant Process**

### Explanation (After Figure)
The AI assistant process consists of four main phases:

**Phase 1: User Input (Blue)**
- Users access the Bigiass chat interface
- They can type questions in natural language
- Common question categories include:
  - Crop cultivation advice
  - Livestock health and care
  - Market prices and trends
  - Disease diagnosis
  - Seasonal planting guidance

**Phase 2: Backend Processing (Orange)**
- The backend receives and validates the request
- A comprehensive prompt is built including:
  - User's profile information (activity type, experience)
  - Geographic context (region, locality)
  - System instructions defining the AI's role as an agricultural expert
- The request is sent to the Gemini API

**Phase 3: Gemini AI Processing (Green)**
- Google Gemini analyzes the question
- It generates a response based on:
  - Agricultural knowledge base
  - Cameroon-specific context
  - User's specific situation
- The response is formatted for display

**Phase 4: Response Handling (Pink)**
- The backend receives the AI response
- If the API fails, a fallback response is provided
- The response is displayed to the user

**AI Features (Purple)**
The assistant provides expertise in five key areas:
1. **Crop Advice**: Planting techniques, care instructions, harvest timing
2. **Livestock Tips**: Feeding schedules, health monitoring, breeding practices
3. **Market Analysis**: Current prices, demand trends, selling strategies
4. **Disease Diagnosis**: Symptom identification, treatment recommendations
5. **Local Knowledge**: Cameroon-specific agricultural practices and conditions

**Technical Implementation**:
- Backend endpoint: `POST /api/ai/chat`
- AI Provider: Google Gemini API
- Fallback: Local response generation if API unavailable
- Context: User profile and location for personalized advice
