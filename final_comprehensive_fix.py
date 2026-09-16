"""
FINAL COMPREHENSIVE FIX - Fix ALL remaining French text
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_ENGLISH.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_CLEAN_FINAL.docx"

# All remaining fixes
FIXES = {
    # French contractions with l'
    "l'agriculture": "agriculture",
    "l'assistance": "assistance",
    "l'administration": "administration",
    "l'ecran": "the screen",
    "l'interfathis": "the interface",
    "l'inscription": "registration",
    "l'acces": "access",
    
    # French contractions with d'
    "d'exprimer": "to express",
    "d'user": "of user",
    "d'execution": "of execution",
    "d'ecran": "screen",
    
    # French words
    "ainsi que": "as well as",
    "ainsi": "thus",
    "communs": "common",
    "optionnelles": "optional",
    "optionnelle": "optional",
    "accessibles": "accessible",
    "depuis": "from",
    "jusqu'a": "until",
    "jusqu'à": "until",
    "maniere": "manner",
    "de maniere": "in a manner",
    "affichees": "displayed",
    "affichee": "displayed",
    "resultats": "results",
    "confirms": "confirms",
    "connexion": "connection",
    "lecteur": "reader",
    "captures": "screenshots",
    "demonstrations": "demonstrations",
    "vert": "green",
    "au asrthis": "to the earth",
    "prix en temps reel": "prices in real time",
    "en temps reel": "in real time",
    "temps reel": "real time",
    "base of data": "database",
    "base de donnees": "database",
    "iciels": "software",
    "logiciels": "software",
    "environments": "environments",
    "services": "services",
    "construire": "build",
    "validation": "validation",
    "paiements": "payments",
    "commandes": "orders",
    "behaviors": "behaviors",
    "features": "features",
    "diagram of use case": "use case diagram",
    "type d'user": "type of user",
    
    # Il -> It (when at start of sentence or after period)
    ". Il ": ". It ",
    ", Il ": ", It ",
    "Il shows": "It shows",
    "Il confirms": "It confirms",
    "Il includes": "It includes",
    "Il presents": "It presents",
    "Il allows": "It allows",
    "Il demonstrates": "It demonstrates",
    "Il explains": "It explains",
    
    # Elle -> It
    "Elle is": "It is",
    "Elle uses": "It uses",
    "Elle allows": "It allows",
    "Elle demonstrates": "It demonstrates",
    
    # elles -> they/them
    "between elles": "between them",
    "elles are": "they are",
    "elles is": "it is",
    
    # More mixed phrases
    "the prix": "the prices",
    "the base": "the database",
    "the user": "the user",
    "the screen": "the screen",
    "the interface": "the interface",
    "the registration": "the registration",
    "the connection": "the connection",
    "the validation": "the validation",
    "the payments": "the payments",
    "the orders": "the orders",
    "the software": "the software",
    "the environments": "the environments",
    "the services": "the services",
    "the behaviors": "the behaviors",
    "the features": "the features",
    "the results": "the results",
    "the screenshots": "the screenshots",
    "the demonstrations": "the demonstrations",
    
    # Fix remaining corrupted words
    "interfathis": "interface",
    "asrthis": "earth",
    
    # Clean up
    "  ": " ",
}


def fix_text(text):
    """Apply all fixes"""
    result = text
    
    for old, new in FIXES.items():
        if old in result:
            result = result.replace(old, new)
    
    # Clean up
    result = re.sub(r'\s+', ' ', result)
    
    return result.strip()


def fix_document():
    """Fix document"""
    print("="*70)
    print("FINAL COMPREHENSIVE FIX")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    para_fixes = 0
    for para in doc.paragraphs:
        original = para.text
        new_text = fix_text(original)
        
        if new_text != original:
            if para.runs:
                para.runs[0].text = new_text
                for run in para.runs[1:]:
                    run.text = ""
            para_fixes += 1
    
    table_fixes = 0
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    original = para.text
                    new_text = fix_text(original)
                    
                    if new_text != original:
                        if para.runs:
                            para.runs[0].text = new_text
                            for run in para.runs[1:]:
                                run.text = ""
                        table_fixes += 1
    
    doc.save(OUTPUT_FILE)
    
    print(f"\n✅ Paragraph fixes: {para_fixes}")
    print(f"✅ Table fixes: {table_fixes}")
    print(f"\n📄 Saved: {OUTPUT_FILE}")


if __name__ == "__main__":
    fix_document()
