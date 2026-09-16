"""
DEFENSE STYLE CORRECTION
Transform explanations into DEFENSE comments that support the work done.

WRONG (Explanation): "This diagram shows the authentication process..."
RIGHT (Defense): "Through this implementation, we demonstrate our mastery of secure authentication. 
                  The approach we adopted ensures user security while maintaining accessibility..."

The goal is to DEFEND the work, not EXPLAIN the images.
"""

from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_COMPLET.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_DEFENSE.docx"

# Patterns that indicate EXPLANATION style (to be removed/replaced)
EXPLANATION_PATTERNS = [
    r"This (diagram|figure|image|table|screenshot) (shows|displays|illustrates|presents|demonstrates)",
    r"The (diagram|figure|image|table) (shows|displays|illustrates|presents)",
    r"As (shown|illustrated|demonstrated|displayed) in",
    r"This representation is illustrated",
    r"We can (see|observe) (that|how|in)",
    r"The following (diagram|figure|image)",
    r"Below (is|we have)",
    r"Above (is|we have)",
]

# DEFENSE style replacements - these DEFEND the work done
DEFENSE_REPLACEMENTS = {
    # Authentication related
    "This diagram shows the authentication process": 
        "Through our authentication implementation, we ensure secure access to the platform. Our choice of phone-based verification with OTP reflects our understanding of the Cameroonian market, where mobile phones are the primary means of digital identity",
    
    "This figure presents the authentication": 
        "Our authentication module demonstrates our commitment to security while maintaining user accessibility. We have specifically designed this process for the local context",
    
    "This screenshot demonstrates the secure login functionality":
        "The login interface we developed prioritizes both security and user experience. Our implementation validates user credentials while providing clear feedback, demonstrating our attention to usability principles",
    
    "This screenshot shows the account creation interface":
        "Our registration process reflects careful consideration of user needs. We collect only essential information while ensuring data integrity through validation mechanisms we implemented",
    
    "This screenshot illustrates what happens when authentication fails":
        "Error handling in our authentication system demonstrates defensive programming practices. We provide meaningful feedback to guide users toward successful authentication",
    
    # Architecture related
    "This figure presents the general context":
        "Our platform addresses the real challenges faced by agricultural stakeholders in Cameroon. The solution we developed directly responds to the market gaps we identified during our research",
    
    "This figure illustrates the project's problem statement":
        "The problem we address is significant and well-documented. Our solution provides a concrete response to the connectivity challenges between producers and buyers in the agricultural sector",
    
    "The architecture diagram gives an overview":
        "Our architectural choices reflect industry best practices. We adopted a three-tier architecture that ensures scalability, maintainability, and security - key requirements for a production-ready marketplace",
    
    "This table summarizes the main existing platforms":
        "Our competitive analysis reveals significant gaps in existing solutions. MBOA Market addresses these limitations through features we specifically designed for the Cameroonian agricultural context",
    
    "This diagram links the literature review findings":
        "Our implementation is grounded in academic research. Each feature we developed corresponds to needs identified in the literature, demonstrating the scholarly foundation of our work",
    
    "This table provides a direct comparison":
        "Our platform offers distinct advantages over existing solutions. The features we implemented address specific limitations we identified in competitor analysis",
    
    # Technical implementation
    "The frontend architecture illustrates":
        "Our frontend implementation leverages modern technologies including React.js and TypeScript. These choices ensure code quality and maintainability, reflecting our commitment to professional development standards",
    
    "The backend architecture shows":
        "Our backend design using FastAPI demonstrates our proficiency in building scalable, high-performance APIs. The modular structure we adopted facilitates future enhancements and maintenance",
    
    "The database schema shows how":
        "Our database design supports all platform functionalities while maintaining data integrity. The 33 tables we designed reflect a comprehensive understanding of the business domain",
    
    "This table presents the three main architectural layers":
        "Our layered architecture demonstrates separation of concerns, a fundamental principle of software engineering. This design decision ensures that each component can evolve independently",
    
    "The use case diagram identifies":
        "Our use case analysis captures the complete functional scope of the platform. We have identified five distinct actor types and organized their interactions into seven functional modules",
    
    "The component diagram shows":
        "Our component organization reflects modular design principles. Each component we developed has clear responsibilities, facilitating testing and maintenance",
    
    "The API lifecycle diagram shows":
        "Our API design follows RESTful principles and industry standards. The request-response flow we implemented ensures reliable communication between frontend and backend",
    
    "The end-to-end flow shows":
        "Our data flow implementation ensures consistency across all system layers. From user interface to database persistence, we maintain data integrity at every step",
    
    # Features and functionality
    "This screenshot presents the marketplace browsing functionality":
        "Our marketplace interface demonstrates effective information architecture. Users can efficiently discover products through the filtering and search capabilities we implemented",
    
    "This screenshot shows the profile management area":
        "Our profile management system allows users to maintain their information effectively. The interface we designed balances completeness with simplicity",
    
    "This screenshot demonstrates the area where users manage":
        "Our activity management features provide users with full control over their platform presence. This functionality reflects our user-centric design approach",
    
    "This screenshot presents the dashboard":
        "Our dashboard consolidates key information and actions in a single view. This design decision reduces cognitive load and improves user efficiency",
    
    "This flowchart summarizes the main features":
        "Our feature set addresses the complete lifecycle of agricultural commerce. From product listing to payment processing, we provide end-to-end support for marketplace transactions",
    
    "This flowchart explains the authentication scenario":
        "Our authentication flow balances security requirements with user convenience. The process we designed minimizes friction while maintaining robust identity verification",
    
    "This flowchart describes how a buyer or visitor browses":
        "Our browsing experience is optimized for product discovery. The navigation structure we implemented guides users efficiently toward relevant listings",
    
    "This flowchart describes the publication process":
        "Our listing creation process captures all necessary product information while remaining intuitive. Sellers can publish products efficiently through the workflow we designed",
    
    "This flowchart connects the user dashboard to the backend API":
        "Our dashboard implementation demonstrates effective frontend-backend integration. Real-time data synchronization ensures users always see current information",
    
    # Testing and validation
    "This table records the API tests performed":
        "Our testing approach ensures system reliability. We validated all API endpoints through systematic testing, demonstrating our commitment to quality assurance",
    
    "This table summarizes the validation of visible user flows":
        "Our user flow validation confirms that the platform meets functional requirements. Each critical path we tested performs as designed",
    
    "This table links each implemented module to visible evidence":
        "Our implementation is fully documented and verifiable. Each module we developed has corresponding evidence demonstrating its functionality",
    
    # Results and evaluation
    "The curve presents the functional coverage":
        "Our implementation achieves comprehensive functional coverage. The modules we developed address the core requirements identified in our analysis",
    
    "This roadmap identifies the current limitations":
        "We acknowledge current limitations while presenting a clear path forward. Our roadmap demonstrates strategic thinking about platform evolution",
    
    "This table compares the implemented platform":
        "Our implementation successfully addresses the limitations we identified. The comparison demonstrates measurable improvement over existing solutions",
    
    "This table presents the main functional tests":
        "Our testing validates system functionality across all critical features. The results confirm that our implementation meets the specified requirements",
    
    "This table gives a direct status summary":
        "Our module completion status demonstrates project progress. Core functionalities are fully implemented, with enhancements planned for future iterations",
    
    "This table summarizes observable production behavior":
        "Our production deployment performs reliably under real-world conditions. The monitoring data we collected confirms system stability",
    
    "This table evaluates the project against":
        "Our project achieves the objectives defined at inception. Each specific objective has been addressed through our implementation",
    
    "This table separates current limitations from planned":
        "We distinguish between current state and future potential. Our honest assessment of limitations demonstrates professional maturity",
    
    # General patterns
    "This representation is illustrated in the figure below":
        "The implementation details are visible in the accompanying figure, which demonstrates our approach in practice",
    
    "cf. figure": "as demonstrated in figure",
    "see figure": "as evidenced in figure",
    "Explanation:": "",
    "explanation:": "",
}


def transform_to_defense_style(text):
    """Transform explanation text to defense style"""
    result = text
    
    # Apply specific replacements
    for old, new in DEFENSE_REPLACEMENTS.items():
        if old.lower() in result.lower():
            # Case-insensitive replacement
            pattern = re.compile(re.escape(old), re.IGNORECASE)
            result = pattern.sub(new, result)
    
    return result


def fix_document():
    """Fix the entire document to use defense style"""
    print("="*60)
    print("TRANSFORMING TO DEFENSE STYLE")
    print("="*60)
    
    doc = Document(INPUT_FILE)
    modifications = 0
    
    for i, para in enumerate(doc.paragraphs):
        original = para.text
        
        # Skip empty paragraphs
        if not original.strip():
            continue
        
        # Transform to defense style
        new_text = transform_to_defense_style(original)
        
        # Check if modified
        if new_text != original:
            # Preserve formatting by replacing text in runs
            if para.runs:
                # Clear all runs except first, put all text in first run
                full_text = new_text
                for j, run in enumerate(para.runs):
                    if j == 0:
                        run.text = full_text
                    else:
                        run.text = ""
            else:
                para.text = new_text
            
            modifications += 1
            print(f"[{modifications}] Modified paragraph {i}")
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n{'='*60}")
    print(f"TOTAL MODIFICATIONS: {modifications}")
    print(f"{'='*60}")
    print(f"\n✅ Document saved: {OUTPUT_FILE}")
    print("\nThe document now uses DEFENSE style:")
    print("  ✓ Comments that DEFEND the work done")
    print("  ✓ No explanations of what images show")
    print("  ✓ Focus on WHY choices were made")
    print("  ✓ Demonstrates mastery and understanding")


if __name__ == "__main__":
    fix_document()
