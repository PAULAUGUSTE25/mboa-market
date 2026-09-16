"""
CORRECT MEMOIR STYLE TRANSFORMATION

Based on actual document analysis:
1. Find paragraphs that end with "Cette représentation est illustrée à la figure ci-dessous"
2. Remove that French phrase
3. Transform the explanation into a presentation comment
4. Add "(see Figure X.X)" reference
5. Translate ALL French to English
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_COMPLET.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_MEMOIR_CORRECTED.docx"

# French phrases to remove completely
FRENCH_PHRASES_TO_REMOVE = [
    "Cette représentation est illustrée à la figure ci-dessous.",
    "Cette représentation est illustrée à la figure ci-dessous",
    "Cette représentation est illustrée ci-dessous.",
    "Cette représentation est illustrée ci-dessous",
    "cf. figure ci-dessous",
    "voir figure ci-dessous",
]

# French to English translations for remaining text
TRANSLATIONS = {
    # Full French paragraphs found in the document
    "Le modèle d'acceptation technologique (TAM) est utilisé pour expliquer pourquoi les utilisateurs adoptent ou rejettent les nouvelles technologies. Dans le contexte de MBOA Market, ce modèle guide la conception de l'interface utilisateur.":
        "The Technology Acceptance Model (TAM) guides our interface design decisions, ensuring that the platform is both useful and easy to use for Cameroonian agricultural stakeholders",
    
    "Cette image montre comment MBOA Market réduit l'asymétrie d'information entre producteurs et acheteurs. La plateforme centralise les informations sur les produits, prix et disponibilités.":
        "Our platform addresses information asymmetry by centralizing product information, prices, and availability data, enabling fair transactions between producers and buyers",
    
    "Le diagramme de classes UML présente les principales entités logicielles utilisées dans MBOA Market. Il montre les relations entre les utilisateurs, les annonces, les commandes et les autres composants du système.":
        "Our UML class diagram represents the core software entities and their relationships, demonstrating the object-oriented design principles we applied in structuring the application",
    
    "Ce tableau fournit une comparaison directe entre MBOA Market et les solutions existantes. Il met en évidence les avantages compétitifs de notre plateforme.":
        "Our comparative analysis demonstrates the competitive advantages of MBOA Market over existing solutions, validating our design decisions",
    
    # Common French words/phrases
    "Cette": "This",
    "cette": "this",
    "Ce ": "This ",
    "ce ": "this ",
    " le ": " the ",
    " la ": " the ",
    " les ": " the ",
    " un ": " a ",
    " une ": " a ",
    " et ": " and ",
    " ou ": " or ",
    " est ": " is ",
    " sont ": " are ",
    " nous ": " we ",
    " notre ": " our ",
    " nos ": " our ",
    " dans ": " in ",
    " sur ": " on ",
    " pour ": " for ",
    " avec ": " with ",
    " par ": " by ",
    "également": "also",
    "notamment": "especially",
    "ainsi": "thus",
    "donc": "therefore",
}


def transform_explanation_to_comment(text, figure_ref):
    """
    Transform an explanation paragraph into a memoir-style comment.
    
    EXPLANATION style (BAD): "This table shows X. It presents Y..."
    MEMOIR style (GOOD): "Our analysis of X demonstrates Y (see Figure Z)."
    """
    
    # First, remove French phrases
    result = text
    for phrase in FRENCH_PHRASES_TO_REMOVE:
        result = result.replace(phrase, "")
    
    # Translate any remaining French
    for french, english in TRANSLATIONS.items():
        result = result.replace(french, english)
    
    # Clean up
    result = result.strip()
    result = re.sub(r'\s+', ' ', result)  # Remove extra spaces
    result = re.sub(r'\s+\.', '.', result)  # Fix " ."
    result = re.sub(r'\.+', '.', result)  # Fix multiple periods
    
    # Transform explanation phrases to presentation phrases
    transformations = [
        # "This X shows/presents Y" -> "Our X demonstrates Y"
        (r"^This (table|diagram|figure|image|flowchart|matrix|curve|map|chart) (shows|presents|displays|illustrates|summarizes|breaks|converts|links|organizes|gives|compares)", 
         r"Our \1 demonstrates"),
        
        # "The X shows/presents Y" -> "Our X demonstrates Y"  
        (r"^The (table|diagram|figure|image|flowchart|matrix|curve|map|chart) (shows|presents|displays|illustrates|summarizes|breaks|converts|links|organizes|gives|compares)",
         r"Our \1 demonstrates"),
        
        # "It shows/presents" -> "It demonstrates"
        (r"It (shows|presents|displays|illustrates)", r"It demonstrates"),
        
        # Remove "as shown/illustrated in the figure below"
        (r",?\s*as (shown|illustrated|demonstrated) in the figure (below|above)", ""),
        
        # Remove "see figure below"
        (r",?\s*see figure (below|above)", ""),
    ]
    
    for pattern, replacement in transformations:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Ensure it ends with the figure reference
    result = result.rstrip('.')
    if figure_ref and "Figure" not in result and "figure" not in result:
        result += f" (see {figure_ref})."
    else:
        result += "."
    
    return result


def extract_figure_reference(paragraphs, current_idx):
    """
    Look for the figure caption near this paragraph to get the figure number.
    Figure captions are usually right after the image.
    """
    # Look in the next few paragraphs for "Figure X.X:"
    for i in range(current_idx + 1, min(current_idx + 5, len(paragraphs))):
        text = paragraphs[i].text.strip()
        match = re.match(r'^Figure\s+(\d+\.\d+)', text)
        if match:
            return f"Figure {match.group(1)}"
    
    # Look in previous paragraphs too
    for i in range(max(0, current_idx - 3), current_idx):
        text = paragraphs[i].text.strip()
        match = re.match(r'^Figure\s+(\d+\.\d+)', text)
        if match:
            return f"Figure {match.group(1)}"
    
    return None


def is_explanation_paragraph(text):
    """Check if this paragraph is an explanation that needs transformation"""
    text_lower = text.lower()
    
    # Must contain French phrase OR explanation patterns
    has_french_marker = "cette représentation" in text_lower
    
    explanation_patterns = [
        "this table shows", "this table presents", "this table summarizes",
        "this table breaks", "this table converts", "this table links",
        "this diagram shows", "this diagram presents", "this diagram links",
        "this figure shows", "this figure presents",
        "this flowchart shows", "this flowchart compares", "this flowchart organizes",
        "this matrix shows", "this matrix presents",
        "this curve shows", "this curve gives",
        "this map shows", "this gap map shows",
        "this image shows", "this image converts",
        "the flowchart compares", "the coverage curve gives",
        "the matrix presents", "the diagram links",
    ]
    
    has_explanation_pattern = any(p in text_lower for p in explanation_patterns)
    
    return has_french_marker or has_explanation_pattern


def fix_document():
    """Transform the document to correct memoir style"""
    print("="*70)
    print("TRANSFORMING TO CORRECT MEMOIR STYLE")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    paragraphs = doc.paragraphs
    
    modifications = 0
    french_fixes = 0
    
    for i, para in enumerate(paragraphs):
        text = para.text.strip()
        
        # Skip empty or very short paragraphs
        if len(text) < 20:
            continue
        
        original_text = text
        modified = False
        
        # Check if this is an explanation paragraph
        if is_explanation_paragraph(text):
            # Find the figure reference
            figure_ref = extract_figure_reference(paragraphs, i)
            
            # Transform to memoir style
            new_text = transform_explanation_to_comment(text, figure_ref)
            
            if new_text != original_text:
                if para.runs:
                    para.runs[0].text = new_text
                    for run in para.runs[1:]:
                        run.text = ""
                else:
                    para.text = new_text
                
                modifications += 1
                modified = True
                print(f"[{modifications}] Transformed paragraph {i}")
                if figure_ref:
                    print(f"    → Added reference: {figure_ref}")
        
        # Even if not an explanation, check for French text
        if not modified:
            new_text = text
            for french, english in TRANSLATIONS.items():
                if french in new_text:
                    new_text = new_text.replace(french, english)
            
            # Remove French phrases
            for phrase in FRENCH_PHRASES_TO_REMOVE:
                new_text = new_text.replace(phrase, "")
            
            new_text = new_text.strip()
            new_text = re.sub(r'\s+', ' ', new_text)
            
            if new_text != original_text:
                if para.runs:
                    para.runs[0].text = new_text
                    for run in para.runs[1:]:
                        run.text = ""
                else:
                    para.text = new_text
                french_fixes += 1
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n{'='*70}")
    print("TRANSFORMATION COMPLETE")
    print(f"{'='*70}")
    print(f"\n✅ Explanations transformed: {modifications}")
    print(f"✅ French text fixed: {french_fixes}")
    print(f"\n📄 Document saved: {OUTPUT_FILE}")
    print("\nChanges made:")
    print("  • Removed 'Cette représentation est illustrée...'")
    print("  • Transformed 'This X shows...' → 'Our X demonstrates...'")
    print("  • Added '(see Figure X.X)' references")
    print("  • Translated French to English")


if __name__ == "__main__":
    fix_document()
