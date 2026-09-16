"""
Final cleanup - fix encoding issues and ensure clean English
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_MEMOIR_FINAL_V2.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_CLEAN.docx"

# Encoding fixes - corrupted text patterns
ENCODING_FIXES = {
    "thes ": "the ",
    "tabthe": "table",
    "pthandform": "platform",
    "markand": "market",
    "someign": "design",
    "comby": "compar",
    "prothisss": "process",
    "mandhodology": "methodology",
    "Agithe": "Agile",
    "byticutherly": "particularly",
    "randhevant": "relevant",
    "andhements": "elements",
    "compthande": "complete",
    "interprandation": "interpretation",
    "foad": "found",
    "forrnit": "provides",
    "combyaison": "comparison",
    "existantes": "existing",
    "produthisrs": "producers",
    "theft": "left",
    "theorandical": "theoretical",
    "knowthedge": "knowledge",
    "corrses": "courses",
    " yand ": " and ",
    " ae ": " a ",
    " Il ": " It ",
    " thes ": " the ",
    " les ": " the ",
    " la ": " the ",
    " le ": " the ",
    " et ": " and ",
    " ou ": " or ",
    " un ": " a ",
    " une ": " a ",
    " des ": " some ",
    " du ": " of the ",
    " de ": " of ",
    " dans ": " in ",
    " sur ": " on ",
    " pour ": " for ",
    " avec ": " with ",
    " par ": " by ",
    " qui ": " which ",
    " que ": " that ",
    " est ": " is ",
    " sont ": " are ",
    " nous ": " we ",
    " notre ": " our ",
    " cette ": " this ",
    " ce ": " this ",
    " ces ": " these ",
}


def fix_document():
    """Clean up encoding issues"""
    print("="*70)
    print("FINAL CLEANUP - FIXING ENCODING ISSUES")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    fixes = 0
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text
        original = text
        
        # Apply encoding fixes
        for bad, good in ENCODING_FIXES.items():
            if bad in text:
                text = text.replace(bad, good)
        
        # Fix double spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Fix common issues
        text = text.replace('  ', ' ')
        text = text.replace(' .', '.')
        text = text.replace(' ,', ',')
        
        if text != original:
            if para.runs:
                para.runs[0].text = text
                for run in para.runs[1:]:
                    run.text = ""
            else:
                para.text = text
            fixes += 1
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n✅ Fixed {fixes} paragraphs with encoding issues")
    print(f"📄 Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    fix_document()
