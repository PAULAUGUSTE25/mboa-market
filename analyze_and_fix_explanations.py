"""
Analyze the document to find all "Explanation" patterns
and fix them properly
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_MEMOIR_FINAL.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_MEMOIR_FINAL_V2.docx"

def analyze_document():
    """Find all explanation-like paragraphs"""
    print("="*70)
    print("ANALYZING DOCUMENT FOR EXPLANATIONS")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    explanation_patterns = []
    figure_mentions = []
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        text_lower = text.lower()
        
        # Find patterns that look like explanations
        if any(pattern in text_lower for pattern in [
            "this diagram", "this figure", "this table", "this image",
            "this screenshot", "this flowchart", "this curve", "this roadmap",
            "the diagram", "the figure", "the table", "the image",
            "as shown", "as illustrated", "as demonstrated",
            "we can see", "we can observe", "below is", "above is",
            "this representation", "the following",
            "presents the", "shows the", "illustrates the", "demonstrates the",
            "displays the",
        ]):
            explanation_patterns.append((i, text[:100] + "..." if len(text) > 100 else text))
        
        # Find figure mentions
        if "figure" in text_lower or "fig." in text_lower:
            figure_mentions.append((i, text[:100] + "..." if len(text) > 100 else text))
    
    print(f"\nFound {len(explanation_patterns)} explanation-like paragraphs:")
    for idx, text in explanation_patterns[:20]:  # Show first 20
        print(f"  [{idx}] {text}")
    
    if len(explanation_patterns) > 20:
        print(f"  ... and {len(explanation_patterns) - 20} more")
    
    return explanation_patterns


def fix_explanations():
    """Fix all explanation paragraphs"""
    print("\n" + "="*70)
    print("FIXING EXPLANATIONS")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    modifications = 0
    figure_num = 1
    
    # Patterns that indicate explanation style
    explanation_indicators = [
        "this diagram", "this figure", "this table", "this image",
        "this screenshot", "this flowchart", "this curve", "this roadmap",
        "the diagram shows", "the figure shows", "the table shows",
        "as shown in", "as illustrated in", "as demonstrated in",
        "we can see", "we can observe",
        "below is", "above is", "the following",
        "this representation", "presents the", "shows the", 
        "illustrates the", "demonstrates the", "displays the",
    ]
    
    # Context-based replacement texts
    def get_replacement(text, fig_num):
        text_lower = text.lower()
        
        if any(w in text_lower for w in ["authentication", "login", "register", "otp"]):
            return f"We implemented a secure authentication system using phone-based verification with OTP, specifically designed for the Cameroonian market (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["architecture", "system", "component", "layer"]):
            return f"Our platform architecture follows modern design principles ensuring scalability and maintainability (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["database", "schema", "table", "entity", "erd"]):
            return f"Our database design supports all platform functionalities with comprehensive data integrity (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["order", "payment", "escrow", "transaction"]):
            return f"We implemented an escrow-based payment system protecting both buyers and sellers (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["listing", "product", "marketplace", "publish"]):
            return f"Our marketplace enables producers to effectively present their products to buyers (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["ai", "bigiass", "gemini", "assistant"]):
            return f"We integrated AI capabilities to provide agricultural advice tailored to local needs (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["deploy", "cloud", "netlify", "render"]):
            return f"Our deployment leverages modern cloud infrastructure ensuring reliability (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["test", "validation", "api"]):
            return f"We validated all functionalities through systematic testing (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["interface", "ui", "screen", "dashboard", "profile"]):
            return f"Our user interface prioritizes usability and accessibility (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["flow", "process", "sequence"]):
            return f"Our process design ensures efficient user journeys through the platform (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["comparison", "existing", "platform", "solution"]):
            return f"Our analysis reveals the advantages of MBOA Market over existing solutions (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["context", "problem", "challenge"]):
            return f"Our platform addresses real challenges in agricultural commerce in Cameroon (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["result", "coverage", "status", "module"]):
            return f"Our implementation achieves comprehensive coverage of the identified requirements (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["limitation", "future", "improvement"]):
            return f"We acknowledge current limitations while presenting a clear roadmap for future development (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["technology", "tool", "framework", "stack"]):
            return f"Our technology choices reflect current industry standards and best practices (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["color", "visual", "design", "brand"]):
            return f"Our visual design creates a cohesive brand identity reflecting agricultural commerce (see Figure {fig_num})."
        
        if any(w in text_lower for w in ["price", "ticker", "market"]):
            return f"Our market information features provide valuable insights to agricultural stakeholders (see Figure {fig_num})."
        
        # Default
        return f"Our implementation demonstrates comprehensive understanding of the requirements (see Figure {fig_num})."
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        text_lower = text.lower()
        
        # Skip short paragraphs
        if len(text) < 30:
            continue
        
        # Check if this is an explanation paragraph
        is_explanation = False
        for indicator in explanation_indicators:
            if indicator in text_lower:
                is_explanation = True
                break
        
        if is_explanation:
            new_text = get_replacement(text, figure_num)
            
            if para.runs:
                para.runs[0].text = new_text
                for run in para.runs[1:]:
                    run.text = ""
            else:
                para.text = new_text
            
            modifications += 1
            figure_num += 1
            print(f"[{modifications}] Fixed paragraph {i}")
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n{'='*70}")
    print(f"COMPLETE")
    print(f"{'='*70}")
    print(f"\n✅ Fixed {modifications} explanation paragraphs")
    print(f"📄 Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    explanations = analyze_document()
    fix_explanations()
