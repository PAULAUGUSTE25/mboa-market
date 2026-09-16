"""
Find REAL French text (not false positives like 'figure', 'image', etc.)
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_V2.docx"

# Real French patterns (excluding English words)
REAL_FRENCH = [
    r"d'utilisation",
    r"d'écran", 
    r"d'ensemble",
    r"d'architecture",
    r"d'implémentation",
    r"\béleveur\b",
    r"\belles\b",  # French pronoun
    r"\bpermet\b",
    r"\butilise\b",
    r"\bsous\b",
    r"\ble\b",  # French article (but could be English)
    r"\bla\b",  # French article
    r"\bles\b", # French article
    r"\bleur\b",
    r"\bun\b",  # French article (but could be English)
    r"Cette représentation",
    r"ci-dessous",
    r"ci-dessus",
    r"\btableau\b",
    r"\bdiagramme\b",
    r"\bschéma\b",
    r"\bsystème\b",
    r"\bprojet\b",
    r"\bdonnées\b",
    r"\butilisateur\b",
    r"\bfonctionnalité",
    r"\bscénario\b",
    r"\benvironnement\b",
]


def find_french():
    """Find real French text"""
    print("="*70)
    print("FINDING REAL FRENCH TEXT")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    found = []
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue
        
        for pattern in REAL_FRENCH:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                for match in matches:
                    # Get context
                    idx = text.lower().find(match.lower())
                    if idx >= 0:
                        context = text[max(0, idx-30):min(len(text), idx+len(match)+30)]
                        
                        # Check if it's really French (not part of an English word)
                        # For example, "le" in "table" is not French
                        before = text[max(0, idx-1):idx] if idx > 0 else " "
                        after = text[idx+len(match):idx+len(match)+1] if idx+len(match) < len(text) else " "
                        
                        # Skip if it's part of a larger word
                        if before.isalpha() or after.isalpha():
                            continue
                        
                        found.append({
                            'paragraph': i,
                            'match': match,
                            'context': context,
                            'full_text': text[:100]
                        })
    
    if found:
        print(f"\n⚠️  Found {len(found)} French occurrences:\n")
        seen = set()
        for item in found:
            key = (item['paragraph'], item['match'])
            if key in seen:
                continue
            seen.add(key)
            print(f"  [{item['paragraph']}] '{item['match']}'")
            print(f"    Context: ...{item['context']}...")
            print()
    else:
        print("\n✅ NO FRENCH TEXT FOUND!")
    
    return found


if __name__ == "__main__":
    find_french()
