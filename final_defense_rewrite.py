"""
FINAL DEFENSE STYLE REWRITE
More varied and contextual defense comments
"""

from docx import Document
import re
import random

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_COMPLET.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_DEFENSE_FINAL.docx"

# Keywords that indicate explanation style (BAD)
EXPLANATION_KEYWORDS = [
    "this diagram shows",
    "this figure shows", 
    "this image shows",
    "this table shows",
    "this screenshot shows",
    "this diagram presents",
    "this figure presents",
    "this diagram illustrates",
    "this figure illustrates",
    "as shown in",
    "as illustrated in",
    "as we can see",
    "we can observe",
    "the diagram displays",
    "the figure displays",
    "below is",
    "above is",
    "the following diagram",
    "the following figure",
    "explanation:",
    "this representation is illustrated",
    "cette figure",
    "ce diagramme",
    "ce tableau",
    "cette capture",
    "this table presents",
    "this table summarizes",
    "this table records",
    "this table links",
    "this table identifies",
    "this table defines",
    "this table explains",
    "this table compares",
    "this table evaluates",
    "this table separates",
    "this flowchart",
    "this curve",
    "this roadmap",
    "the curve presents",
]


def is_explanation_paragraph(text):
    """Check if paragraph contains explanation-style text"""
    text_lower = text.lower()
    for keyword in EXPLANATION_KEYWORDS:
        if keyword in text_lower:
            return True
    return False


def get_detailed_context(text):
    """Get more detailed context from the paragraph"""
    text_lower = text.lower()
    
    # Specific contexts
    if "authentication" in text_lower or "login" in text_lower or "register" in text_lower:
        if "screenshot" in text_lower or "interface" in text_lower:
            return "auth_ui"
        elif "sequence" in text_lower or "flow" in text_lower:
            return "auth_flow"
        else:
            return "auth_general"
    
    if "order" in text_lower or "payment" in text_lower or "escrow" in text_lower:
        return "order"
    
    if "listing" in text_lower or "product" in text_lower or "publish" in text_lower:
        return "listing"
    
    if "architecture" in text_lower or "component" in text_lower or "layer" in text_lower:
        return "architecture"
    
    if "database" in text_lower or "schema" in text_lower or "entity" in text_lower or "table" in text_lower:
        return "database"
    
    if "deploy" in text_lower or "cloud" in text_lower or "netlify" in text_lower or "render" in text_lower:
        return "deployment"
    
    if "ai" in text_lower or "bigiass" in text_lower or "gemini" in text_lower or "assistant" in text_lower:
        return "ai"
    
    if "test" in text_lower or "validation" in text_lower or "api test" in text_lower:
        return "testing"
    
    if "dashboard" in text_lower:
        return "dashboard"
    
    if "profile" in text_lower or "user" in text_lower:
        return "user"
    
    if "marketplace" in text_lower or "browse" in text_lower or "feed" in text_lower:
        return "marketplace"
    
    if "message" in text_lower or "chat" in text_lower or "conversation" in text_lower:
        return "messaging"
    
    if "context" in text_lower or "problem" in text_lower or "challenge" in text_lower:
        return "problem"
    
    if "comparison" in text_lower or "existing" in text_lower or "platform" in text_lower:
        return "comparison"
    
    if "literature" in text_lower or "research" in text_lower or "academic" in text_lower:
        return "literature"
    
    if "technology" in text_lower or "tool" in text_lower or "framework" in text_lower:
        return "technology"
    
    if "result" in text_lower or "evaluation" in text_lower or "objective" in text_lower:
        return "results"
    
    if "limitation" in text_lower or "improvement" in text_lower or "future" in text_lower:
        return "limitations"
    
    if "coverage" in text_lower or "module" in text_lower or "status" in text_lower:
        return "coverage"
    
    if "color" in text_lower or "visual" in text_lower or "design" in text_lower:
        return "design"
    
    if "swagger" in text_lower or "api" in text_lower or "endpoint" in text_lower:
        return "api"
    
    if "price" in text_lower or "ticker" in text_lower or "market" in text_lower:
        return "market"
    
    return "general"


# Defense texts by detailed context - more variety
DEFENSE_TEXTS = {
    "auth_ui": [
        "The authentication interface we developed reflects our commitment to user experience. Our design choices prioritize clarity and accessibility, ensuring users can securely access the platform with minimal friction. The visual feedback mechanisms we implemented guide users through the authentication process effectively.",
        "Our login and registration interfaces demonstrate professional UI/UX practices. We designed these screens to be intuitive while maintaining security standards, reflecting our understanding of the balance between usability and protection.",
    ],
    "auth_flow": [
        "Our authentication workflow demonstrates mastery of secure identity verification. We implemented phone-based OTP verification specifically for the Cameroonian market, where mobile phones serve as the primary digital identity tool. This design decision reflects our understanding of local user needs.",
        "The authentication sequence we designed ensures secure access while maintaining a smooth user experience. Our implementation of JWT tokens and password hashing follows industry best practices, demonstrating our proficiency in security-conscious development.",
    ],
    "auth_general": [
        "Our authentication system demonstrates our commitment to security without compromising accessibility. We chose phone-based verification recognizing the prevalence of mobile devices in our target market, adapting technical solutions to local realities.",
    ],
    "order": [
        "Our order management implementation demonstrates our ability to handle complex business workflows. The escrow-based payment model we designed builds trust between buyers and sellers who may not know each other, addressing a fundamental challenge in online marketplaces.",
        "Through our order processing system, we ensure fair and secure transactions. Our implementation supports the complete order lifecycle from creation through payment to delivery confirmation, demonstrating comprehensive understanding of e-commerce operations.",
    ],
    "listing": [
        "Our listing management system enables agricultural producers to effectively present their products. The structured data collection we implemented ensures consistency across the marketplace while the photo upload feature enhances product visibility and buyer confidence.",
        "Through our product listing workflow, we balance completeness with simplicity. Sellers can efficiently publish their offerings while we capture all information necessary for informed purchasing decisions.",
    ],
    "architecture": [
        "Our architectural design reflects industry best practices and demonstrates understanding of scalable system design. The three-tier architecture we adopted ensures separation of concerns, facilitating independent evolution of each layer while maintaining system integrity.",
        "The system architecture we implemented demonstrates proficiency in modern software engineering. Our technology choices—React.js for frontend, FastAPI for backend—reflect current industry standards while ensuring performance and maintainability.",
    ],
    "database": [
        "Our database design demonstrates comprehensive understanding of relational data modeling. The schema we developed supports all platform functionalities while maintaining referential integrity and enabling efficient query execution.",
        "The entity-relationship model we created reflects careful analysis of the business domain. Each table and relationship serves a specific purpose in supporting marketplace operations, from user management to transaction processing.",
    ],
    "deployment": [
        "Our deployment architecture demonstrates proficiency in modern cloud infrastructure. We leverage Netlify for frontend hosting and Render for backend services, ensuring reliability and global accessibility while maintaining cost-effectiveness.",
        "Through our cloud deployment strategy, we ensure the platform is accessible to users across Cameroon. Our infrastructure choices prioritize performance and security, with automatic SSL certificates and CDN distribution.",
    ],
    "ai": [
        "Our AI integration demonstrates our ability to leverage cutting-edge technology for practical applications. Bigiass, powered by Google Gemini, provides agricultural advice tailored to the Cameroonian context, adding significant value beyond basic marketplace functionality.",
        "The AI assistant we developed demonstrates proficiency in API integration and natural language processing applications. Our context-aware prompting ensures relevant, localized advice for agricultural stakeholders.",
    ],
    "testing": [
        "Our testing approach demonstrates commitment to software quality. We validated all critical functionalities through systematic testing, ensuring the platform meets its functional requirements before deployment.",
        "Through comprehensive testing, we verify that our implementation performs as designed. Each feature underwent validation to confirm correct behavior, demonstrating thorough quality assurance practices.",
    ],
    "dashboard": [
        "Our dashboard implementation consolidates key information and actions in a unified view. This design decision reduces cognitive load and improves user efficiency, demonstrating our understanding of effective information architecture.",
    ],
    "user": [
        "Our user management features demonstrate user-centric design principles. The profile interfaces we developed provide users with clear visibility and control over their platform presence, reflecting our commitment to user empowerment.",
    ],
    "marketplace": [
        "Our marketplace interface demonstrates effective information architecture. Users can efficiently discover products through the filtering and search capabilities we implemented, facilitating successful connections between buyers and sellers.",
    ],
    "messaging": [
        "Our messaging system enables direct communication between marketplace participants. This feature supports the negotiation process common in agricultural trade, demonstrating our understanding of real-world commerce dynamics.",
    ],
    "problem": [
        "Our platform addresses real challenges faced by agricultural stakeholders in Cameroon. The solution we developed responds directly to market gaps identified through our research, demonstrating the practical relevance of our work.",
    ],
    "comparison": [
        "Our competitive analysis reveals significant gaps in existing solutions. MBOA Market addresses these limitations through features specifically designed for the Cameroonian agricultural context, offering distinct advantages over alternatives.",
    ],
    "literature": [
        "Our implementation is grounded in academic research. Each feature we developed corresponds to needs identified in the literature, demonstrating the scholarly foundation of our work and its contribution to the field.",
    ],
    "technology": [
        "Our technology choices reflect current industry standards and best practices. The frameworks and tools we selected ensure code quality, maintainability, and performance, demonstrating professional development practices.",
    ],
    "results": [
        "Our project achieves the objectives defined at inception. The evaluation demonstrates that our implementation successfully addresses the identified requirements, validating our approach and methodology.",
    ],
    "limitations": [
        "We acknowledge current limitations while presenting a clear path forward. Our honest assessment demonstrates professional maturity and strategic thinking about platform evolution.",
    ],
    "coverage": [
        "Our implementation achieves comprehensive functional coverage. The modules we developed address core requirements identified in our analysis, demonstrating thorough execution of the project scope.",
    ],
    "design": [
        "Our visual design choices reflect the agricultural and commercial nature of the platform. The color palette and interface elements we selected create a cohesive brand identity while ensuring usability.",
    ],
    "api": [
        "Our API design follows RESTful principles and industry standards. The documentation we generated through Swagger enables easy integration and testing, demonstrating professional API development practices.",
    ],
    "market": [
        "Our market information features provide valuable insights to users. The price tracking and analysis capabilities we implemented help agricultural stakeholders make informed decisions.",
    ],
    "general": [
        "Our implementation demonstrates comprehensive understanding of the problem domain and technical proficiency in delivering a solution. Each feature addresses specific needs identified in our analysis.",
        "Through this project, we demonstrate our ability to design, implement, and deploy a complete web application. The platform provides tangible value to agricultural stakeholders in Cameroon.",
        "Our work reflects professional software development practices from requirements analysis through deployment. The resulting platform addresses real challenges in agricultural commerce.",
    ],
}


def get_defense_text(context, index=0):
    """Get defense text for context, with variety"""
    texts = DEFENSE_TEXTS.get(context, DEFENSE_TEXTS["general"])
    return texts[index % len(texts)]


def fix_document():
    """Fix the entire document"""
    print("="*60)
    print("FINAL DEFENSE STYLE REWRITE")
    print("="*60)
    
    doc = Document(INPUT_FILE)
    modifications = 0
    context_counts = {}
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        
        # Skip empty or short paragraphs
        if len(text) < 50:
            continue
        
        # Check if this is an explanation paragraph
        if is_explanation_paragraph(text):
            context = get_detailed_context(text)
            
            # Track how many times we've used this context for variety
            context_counts[context] = context_counts.get(context, 0)
            
            new_text = get_defense_text(context, context_counts[context])
            context_counts[context] += 1
            
            # Replace the paragraph text
            if para.runs:
                para.runs[0].text = new_text
                for run in para.runs[1:]:
                    run.text = ""
            else:
                para.text = new_text
            
            modifications += 1
            print(f"[{modifications}] Rewrote paragraph {i} → {context}")
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n{'='*60}")
    print(f"TOTAL REWRITES: {modifications}")
    print(f"{'='*60}")
    print(f"\n✅ Document saved: {OUTPUT_FILE}")
    print("\n📊 Context distribution:")
    for ctx, count in sorted(context_counts.items(), key=lambda x: -x[1]):
        print(f"   {ctx}: {count}")


if __name__ == "__main__":
    fix_document()
