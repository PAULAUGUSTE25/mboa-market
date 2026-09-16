"""
FINAL FRENCH CLEANUP - Fix remaining French text
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_100_ENGLISH.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_MEMOIR_FINAL.docx"

# Final fixes for remaining French
FINAL_FIXES = {
    # Specific paragraphs identified
    "en phases distinctes. Chaque": "in distinct phases. Each",
    "vue générale of the actors. Il presente": "general view of the actors. It presents",
    "evidence visibles in the relation": "visible evidence in the relation",
    
    # Common remaining French
    "en phases": "in phases",
    "distinctes": "distinct",
    "Chaque": "Each",
    "chaque": "each",
    "vue générale": "general view",
    "Il presente": "It presents",
    "Il présente": "It presents",
    "visibles": "visible",
    "générale": "general",
    "phases": "phases",
    
    # More French words
    "également": "also",
    "notamment": "especially",
    "ainsi": "thus",
    "donc": "therefore",
    "cependant": "however",
    "néanmoins": "nevertheless",
    "afin de": "in order to",
    "grâce à": "thanks to",
    "à travers": "through",
    "au sein de": "within",
    "vis-à-vis": "regarding",
    "par rapport à": "compared to",
    "en ce qui concerne": "regarding",
    
    # Accented characters that might indicate French
    "é": "e",
    "è": "e", 
    "ê": "e",
    "à": "a",
    "â": "a",
    "ù": "u",
    "û": "u",
    "î": "i",
    "ï": "i",
    "ô": "o",
    "ç": "c",
}

# Words that should keep accents (proper nouns, etc.)
KEEP_ACCENTS = [
    "Yaounde", "Yaoundé",
    "résumé",  # English word
    "café",    # English word
    "naïve",   # English word
]


def fix_document():
    """Final cleanup of French text"""
    print("="*70)
    print("FINAL FRENCH CLEANUP")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    fixes = 0
    
    for para in doc.paragraphs:
        original = para.text
        new_text = original
        
        # Apply fixes
        for french, english in FINAL_FIXES.items():
            if french in new_text:
                # Don't replace accents in words we want to keep
                should_replace = True
                for keep in KEEP_ACCENTS:
                    if keep in new_text:
                        should_replace = False
                        break
                
                if should_replace or french not in ['é', 'è', 'ê', 'à', 'â', 'ù', 'û', 'î', 'ï', 'ô', 'ç']:
                    new_text = new_text.replace(french, english)
        
        # Clean up
        new_text = re.sub(r'\s+', ' ', new_text)
        new_text = new_text.strip()
        
        if new_text != original:
            if para.runs:
                para.runs[0].text = new_text
                for run in para.runs[1:]:
                    run.text = ""
            fixes += 1
    
    # Process tables
    table_fixes = 0
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    original = para.text
                    new_text = original
                    
                    for french, english in FINAL_FIXES.items():
                        if french in new_text:
                            new_text = new_text.replace(french, english)
                    
                    new_text = re.sub(r'\s+', ' ', new_text)
                    new_text = new_text.strip()
                    
                    if new_text != original:
                        if para.runs:
                            para.runs[0].text = new_text
                            for run in para.runs[1:]:
                                run.text = ""
                        table_fixes += 1
    
    doc.save(OUTPUT_FILE)
    
    print(f"\n✅ Paragraph fixes: {fixes}")
    print(f"✅ Table fixes: {table_fixes}")
    print(f"\n📄 Final document: {OUTPUT_FILE}")


if __name__ == "__main__":
    fix_document()
