# Flowchart - Listing Creation Process

## Mermaid Code

```mermaid
flowchart TD
    START([Seller Logged In]) --> ACCESS[Access "Create Listing"]
    
    subgraph Step1["📦 Step 1: Product Information"]
        ACCESS --> SELECT_CAT[Select Category<br/>Agriculture / Livestock]
        SELECT_CAT --> SELECT_PROD[Select Product Type<br/>from Reference List]
        SELECT_PROD --> ENTER_DETAILS[Enter Details<br/>Title, Variety, Domain]
    end
    
    subgraph Step2["📊 Step 2: Quantity & Pricing"]
        ENTER_DETAILS --> ENTER_QTY[Enter Quantity]
        ENTER_QTY --> SELECT_UNIT[Select Unit<br/>kg, ton, piece, bag]
        SELECT_UNIT --> ENTER_PRICE[Enter Price per Unit]
        ENTER_PRICE --> SELECT_CURRENCY[Select Currency<br/>XAF default]
    end
    
    subgraph Step3["📍 Step 3: Location"]
        SELECT_CURRENCY --> SELECT_REGION[Select Region<br/>10 Regions of Cameroon]
        SELECT_REGION --> ENTER_LOCALITY[Enter Locality<br/>Optional]
        ENTER_LOCALITY --> SET_COORDS{Set GPS Coordinates?}
        SET_COORDS -->|Yes| GET_GPS[Get Current Location]
        SET_COORDS -->|No| SKIP_GPS[Skip GPS]
        GET_GPS --> AVAIL_DATE
        SKIP_GPS --> AVAIL_DATE[Set Availability Date]
    end
    
    subgraph Step4["📷 Step 4: Photos"]
        AVAIL_DATE --> UPLOAD_PHOTOS[Upload Photos<br/>Max 5 images]
        UPLOAD_PHOTOS --> CLOUDINARY[Upload to Cloudinary]
        CLOUDINARY --> STORE_KEYS[Store Storage Keys]
    end
    
    subgraph Step5["✅ Step 5: Review & Publish"]
        STORE_KEYS --> PREVIEW[Preview Listing]
        PREVIEW --> VALIDATE{All Fields Valid?}
        VALIDATE -->|No| SHOW_ERRORS[Show Validation Errors]
        SHOW_ERRORS --> ENTER_DETAILS
        VALIDATE -->|Yes| CONFIRM{Confirm Publish?}
        CONFIRM -->|No| EDIT[Edit Listing]
        EDIT --> ENTER_DETAILS
        CONFIRM -->|Yes| SAVE_DB[Save to Database]
    end
    
    SAVE_DB --> SET_STATUS[Set Status = PUBLISHED]
    SET_STATUS --> INDEX_SEARCH[Index for Search]
    INDEX_SEARCH --> NOTIFY[Notify Followers]
    NOTIFY --> SUCCESS([Listing Published ✓])
    
    style Step1 fill:#e8f5e9
    style Step2 fill:#fff8e1
    style Step3 fill:#e3f2fd
    style Step4 fill:#fce4ec
    style Step5 fill:#f3e5f5
```

## Explanatory Text for Memoir

### Introduction (Before Figure)
The listing creation process is the core functionality that enables farmers and breeders to sell their products on MBOA Market. This flowchart details the step-by-step process a seller follows to publish a new product listing. The process is designed to be intuitive while capturing all necessary information for buyers to make informed purchasing decisions.

### Figure Caption
**Figure X.X: Flowchart - Product Listing Creation Process**

### Explanation (After Figure)
The listing creation process is organized into five distinct steps:

**Step 1: Product Information (Green)**
- The seller selects a category (Agriculture or Livestock)
- They choose a product type from a predefined reference list
- They enter specific details: title, variety, and domain
- This structured approach ensures consistency across listings

**Step 2: Quantity & Pricing (Yellow)**
- The seller specifies the available quantity
- They select the appropriate unit (kg, ton, piece, bag, etc.)
- They set the price per unit
- Currency defaults to XAF (Central African CFA Franc)

**Step 3: Location (Blue)**
- The seller selects their region from the 10 regions of Cameroon
- They can optionally specify a locality for more precise location
- GPS coordinates can be captured for map-based discovery
- An availability date indicates when the product will be ready

**Step 4: Photos (Pink)**
- The seller uploads up to 5 product photos
- Images are uploaded to Cloudinary for optimized storage and delivery
- Storage keys are saved for retrieval

**Step 5: Review & Publish (Purple)**
- The seller previews the complete listing
- Validation ensures all required fields are properly filled
- Upon confirmation, the listing is saved to the database
- The status is set to PUBLISHED
- The listing is indexed for search functionality
- Followers of the seller are notified of the new listing

**Technical Implementation**:
- Frontend validation prevents incomplete submissions
- Backend validation ensures data integrity
- Cloudinary integration provides fast image loading
- Database indexing enables efficient search queries
