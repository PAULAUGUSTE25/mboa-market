# Flowchart - Authentication Process

## Mermaid Code

```mermaid
flowchart TD
    START([Start]) --> CHOICE{New User?}
    
    CHOICE -->|Yes| REG[Registration Page]
    CHOICE -->|No| LOGIN[Login Page]
    
    subgraph Registration["📝 Registration Process"]
        REG --> PHONE[Enter Phone Number]
        PHONE --> PWD[Create Password]
        PWD --> PROFILE_INFO[Enter Profile Info<br/>Name, Activity Type, Region]
        PROFILE_INFO --> VALIDATE_REG{Valid Input?}
        VALIDATE_REG -->|No| REG_ERROR[Show Error Message]
        REG_ERROR --> PHONE
        VALIDATE_REG -->|Yes| SEND_OTP[Send OTP via SMS]
        SEND_OTP --> ENTER_OTP[Enter OTP Code]
        ENTER_OTP --> VERIFY_OTP{OTP Valid?}
        VERIFY_OTP -->|No| OTP_ERROR[Invalid Code]
        OTP_ERROR --> ENTER_OTP
        VERIFY_OTP -->|Yes| CREATE_USER[Create User Account]
    end
    
    subgraph Login["🔐 Login Process"]
        LOGIN --> ENTER_CRED[Enter Phone + Password]
        ENTER_CRED --> VALIDATE_LOGIN{Credentials Valid?}
        VALIDATE_LOGIN -->|No| LOGIN_ERROR[Invalid Credentials]
        LOGIN_ERROR --> ENTER_CRED
        VALIDATE_LOGIN -->|Yes| CHECK_2FA{2FA Enabled?}
        CHECK_2FA -->|Yes| SEND_2FA[Send 2FA Code]
        SEND_2FA --> ENTER_2FA[Enter 2FA Code]
        ENTER_2FA --> VERIFY_2FA{Code Valid?}
        VERIFY_2FA -->|No| FA_ERROR[Invalid Code]
        FA_ERROR --> ENTER_2FA
        VERIFY_2FA -->|Yes| GEN_TOKEN[Generate JWT Token]
        CHECK_2FA -->|No| GEN_TOKEN
    end
    
    CREATE_USER --> GEN_TOKEN
    GEN_TOKEN --> STORE_TOKEN[Store Token in Browser]
    STORE_TOKEN --> LOG_LOGIN[Log Login Attempt]
    LOG_LOGIN --> REDIRECT{User Role?}
    
    REDIRECT -->|Admin| ADMIN_DASH[Admin Dashboard]
    REDIRECT -->|Seller| SELLER_DASH[Seller Dashboard]
    REDIRECT -->|Buyer| BUYER_FEED[Marketplace Feed]
    
    ADMIN_DASH --> END_AUTH([Authenticated])
    SELLER_DASH --> END_AUTH
    BUYER_FEED --> END_AUTH
    
    style Registration fill:#e3f2fd
    style Login fill:#fff3e0
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
The authentication flowchart illustrates the complete user journey from initial access to authenticated session. MBOA Market implements a dual-path authentication system that handles both new user registration and returning user login. The process incorporates security measures including OTP verification for new accounts and optional two-factor authentication (2FA) for enhanced security.

### Figure Caption
**Figure X.X: Flowchart - User Authentication Process**

### Explanation (After Figure)
The authentication flow is divided into two main paths:

**Registration Path (Blue Section)**:
1. New users access the registration page
2. They enter their phone number (primary identifier in Cameroon)
3. They create a secure password
4. They provide profile information: display name, activity type (farmer, buyer, etc.), and region
5. Input validation ensures data integrity
6. An OTP (One-Time Password) is sent via SMS
7. The user enters the received code
8. Upon successful verification, the account is created

**Login Path (Orange Section)**:
1. Returning users access the login page
2. They enter their phone number and password
3. Credentials are validated against the database
4. If 2FA is enabled, an additional verification code is required
5. Upon successful authentication, a JWT token is generated

**Post-Authentication**:
- The JWT token is stored in the browser's localStorage
- The login attempt is logged for security auditing
- Users are redirected based on their role:
  - Administrators → Admin Dashboard
  - Sellers (Farmers/Breeders) → Seller Dashboard
  - Buyers → Marketplace Feed

**Security Features Highlighted**:
- Phone-based authentication (suited for local market)
- OTP verification prevents fake accounts
- Optional 2FA for sensitive accounts
- JWT tokens with expiration for session management
- Login attempt logging for audit trails
