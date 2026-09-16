# UML Class Diagram - MBOA Market

## Mermaid Code

```mermaid
classDiagram
    class User {
        +UUID id
        +String phone
        +Boolean phone_verified
        +String email
        +String password_hash
        +UserStatus status
        +BadgeLevel badge
        +String locale
        +DateTime created_at
        +DateTime updated_at
        +register()
        +login()
        +updateProfile()
        +verifyPhone()
    }

    class Profile {
        +UUID id
        +UUID user_id
        +String display_name
        +String activity_type
        +String domain
        +String region
        +String locality
        +String bio
        +String avatar_storage_key
    }

    class Role {
        +UUID id
        +String code
        +String name
        +String description
    }

    class Listing {
        +UUID id
        +UUID seller_id
        +UUID category_id
        +UUID product_ref_id
        +String title
        +String variety
        +Decimal quantity
        +String unit
        +Decimal price_per_unit
        +String currency
        +String region
        +ListingStatus status
        +create()
        +update()
        +delete()
        +publish()
    }

    class Category {
        +UUID id
        +String name_fr
        +String name_en
        +String kind
        +UUID parent_id
        +Boolean is_active
    }

    class ListingPhoto {
        +UUID id
        +UUID listing_id
        +String storage_key
        +Integer position
    }

    class Order {
        +UUID id
        +UUID buyer_id
        +UUID seller_id
        +UUID listing_id
        +OrderStatus status
        +Decimal subtotal
        +Decimal fee_platform
        +Decimal fee_logistics
        +Decimal total
        +String currency
        +String delivery_mode
        +create()
        +updateStatus()
        +cancel()
    }

    class Payment {
        +UUID id
        +UUID order_id
        +String provider
        +String provider_ref
        +PaymentStatus status
        +Decimal amount
        +String idempotency_key
        +initiate()
        +confirm()
        +refund()
    }

    class EscrowHold {
        +UUID id
        +UUID order_id
        +UUID payment_id
        +EscrowStatus status
        +Decimal held_amount
        +Decimal released_amount
        +hold()
        +release()
    }

    class Conversation {
        +UUID id
        +UUID listing_id
        +DateTime created_at
        +create()
        +addParticipant()
    }

    class Message {
        +UUID id
        +UUID conversation_id
        +UUID sender_id
        +String content
        +Boolean is_read
        +send()
        +markAsRead()
    }

    class Review {
        +UUID id
        +UUID from_user_id
        +UUID to_user_id
        +UUID order_id
        +Integer rating
        +String comment
        +create()
    }

    class Notification {
        +UUID id
        +UUID user_id
        +NotificationChannel channel
        +String title
        +String body
        +send()
    }

    User "1" -- "1" Profile : has
    User "1" -- "*" Role : has
    User "1" -- "*" Listing : creates
    User "1" -- "*" Order : places as buyer
    User "1" -- "*" Order : receives as seller
    User "1" -- "*" Review : gives
    User "1" -- "*" Review : receives
    User "1" -- "*" Notification : receives
    User "1" -- "*" Message : sends

    Listing "*" -- "1" Category : belongs to
    Listing "1" -- "*" ListingPhoto : has
    Listing "1" -- "*" Order : generates
    Listing "1" -- "*" Conversation : initiates

    Order "1" -- "1" Payment : has
    Order "1" -- "1" EscrowHold : has
    Order "1" -- "*" Review : receives

    Conversation "1" -- "*" Message : contains
    Conversation "*" -- "*" User : involves
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
The class diagram represents the object-oriented structure of the MBOA Market system. It shows the main entities, their attributes, methods, and relationships. This design follows the principles of domain-driven design, where each class represents a real-world concept in the agricultural marketplace domain.

### Figure Caption
**Figure X.X: UML Class Diagram - MBOA Market Domain Model**

### Explanation (After Figure)
The class diagram reveals the core domain model of MBOA Market:

**User Management Classes**:
- **User**: Central entity with authentication attributes (phone, password_hash) and status tracking (badge, status). Methods include register(), login(), and verifyPhone().
- **Profile**: Extended user information including display_name, activity_type (farmer, buyer, etc.), and location data.
- **Role**: Defines user permissions (ADMIN, SELLER, BUYER, TRANSPORTER).

**Marketplace Classes**:
- **Listing**: Represents a product for sale with quantity, price, and status. Linked to seller (User) and Category.
- **Category**: Hierarchical product classification with multilingual support (name_fr, name_en).
- **ListingPhoto**: Stores image references with position ordering.

**Transaction Classes**:
- **Order**: Links buyer and seller for a transaction, tracks status through lifecycle (CREATED → PAID → SHIPPED → DELIVERED).
- **Payment**: Handles mobile money transactions with provider integration.
- **EscrowHold**: Secures funds until delivery confirmation.

**Communication Classes**:
- **Conversation**: Groups messages between users, optionally linked to a listing.
- **Message**: Individual chat messages with read status tracking.

**Feedback Classes**:
- **Review**: Allows buyers to rate sellers after completed orders.
- **Notification**: System alerts sent to users via various channels.

**Key Relationships**:
- A User can have multiple Listings (1:N)
- A Listing belongs to one Category (N:1)
- An Order links one Buyer, one Seller, and one Listing
- Each Order has exactly one Payment and one EscrowHold (1:1)
