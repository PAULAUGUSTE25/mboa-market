"""
COMPLETE ENGLISH REWRITE

This script completely rewrites all paragraphs that contain French words
to ensure 100% English content.
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_CLEAN.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_100_ENGLISH.docx"

# Complete paragraph replacements for mixed language paragraphs
PARAGRAPH_REPLACEMENTS = {
    # Chapter 3 methodology paragraphs
    "Le diagramme of composants shows the main blocs techniques":
        "The component diagram shows the main technical blocks",
    
    "This table shows how the work of the project a été organisé":
        "This table shows how the project work was organized",
    
    "This table identifiess the main tools usedlisés for construire":
        "This table identifies the main tools used to build",
    
    "This table defines how the project has été évalué. Il presente":
        "This table defines how the project was evaluated. It presents",
    
    "Le diagramme d'architecture provides a vue d'ensemble of the":
        "The architecture diagram provides an overview of the",
    
    "L'architecture frontend illustre how l'interfathis utilisateur":
        "The frontend architecture illustrates how the user interface",
    
    "This table presents the three mains couches architecturales":
        "This table presents the three main architectural layers",
    
    "To model the interactions betweentween the différents actors":
        "To model the interactions between the different actors",
    
    "Le diagramme of cas d'utilisation identifiess the main actors":
        "The use case diagram identifies the main actors",
    
    "This diagramme of cas d'utilisation détaillé développe the":
        "This detailed use case diagram develops the",
    
    "Le schéma of base of données shows how the couche of données":
        "The database schema shows how the data layer",
    
    "This table explains the visual language off the application":
        "This table explains the visual language of the application",
    
    "Le flux of bout en bout shows how the données circulent":
        "The end-to-end flow shows how data circulates",
    
    "This table makes explicit the environmentt d'implementation":
        "This table makes explicit the implementation environment",
    
    "This table explains the technologies fromntend utilisées":
        "This table explains the frontend technologies used",
    
    "This table explains the technologies backend utilisées":
        "This table explains the backend technologies used",
    
    "Le mécanisme of the ticker of prix shows how the information":
        "The price ticker mechanism shows how the information",
    
    "This table enregistre the tests API performed via Swagger":
        "This table records the API tests performed via Swagger",
    
    "This table summarizes the validation of the flux utilisateur":
        "This table summarizes the validation of the user flows",
    
    "This table relie chaque module implémenté à of the preuves":
        "This table links each implemented module to the evidence",
    
    "This capture d'écran illustre this which se passe lorsque":
        "This screenshot illustrates what happens when",
    
    "This capture d'écran presents the fonctionnalité of navigation":
        "This screenshot presents the navigation functionality",
    
    "This capture d'écran demonstrates the zone où the utilisateur":
        "This screenshot demonstrates the area where the user",
    
    "This capture d'écran presents the table of bord comme espace":
        "This screenshot presents the dashboard as a space",
    
    "This diagramme of flux summarizes the main fonctionnalités":
        "This flowchart summarizes the main functionalities",
    
    "This diagramme of flux explains the scénario d'authentification":
        "This flowchart explains the authentication scenario",
    
    "This diagramme of flux décrit how a acheteur or visiteur":
        "This flowchart describes how a buyer or visitor",
    
    "This diagramme of flux connecte the table of bord utilisateur":
        "This flowchart connects the user dashboard",
    
    "This feuille of route identifies the limitations current":
        "This roadmap identifies the current limitations",
    
    "This table compare the platform MBOA Market implemented":
        "This table compares the implemented MBOA Market platform",
    
    "This table presents the main tests fonctionnels performed":
        "This table presents the main functional tests performed",
    
    "This table provides a summary direct of the status":
        "This table provides a direct summary of the status",
    
    "This table summarizes the behavior observable in production":
        "This table summarizes the observable behavior in production",
    
    "This table evaluates the project by relation aux objectives":
        "This table evaluates the project against the objectives",
    
    "This table separates the limitations current of the improvements":
        "This table separates the current limitations from the improvements",
    
    "The following improvements are identifiesd for implementation":
        "The following improvements are identified for implementation",
    
    # Common corrupted patterns
    "identifiess": "identifies",
    "betweentween": "between",
    "fromntend": "frontend",
    "environmentt": "environment",
    "identifiesd": "identified",
    
    # French words to replace
    "diagramme": "diagram",
    "schéma": "schema",
    "tableau": "table",
    "capture d'écran": "screenshot",
    "feuille de route": "roadmap",
    "flux": "flow",
    "cas d'utilisation": "use case",
    "base de données": "database",
    "bout en bout": "end-to-end",
    "table de bord": "dashboard",
    "vue d'ensemble": "overview",
    "couche": "layer",
    "couches": "layers",
    "données": "data",
    "utilisateur": "user",
    "utilisateurs": "users",
    "fonctionnalités": "functionalities",
    "fonctionnalité": "functionality",
    "fonctionnels": "functional",
    "scénario": "scenario",
    "acheteur": "buyer",
    "visiteur": "visitor",
    "preuves": "evidence",
    "implémenté": "implemented",
    "implémentée": "implemented",
    "évalué": "evaluated",
    "organisé": "organized",
    "utilisées": "used",
    "utilisés": "used",
    "architecturales": "architectural",
    "différents": "different",
    "acteurs": "actors",
    "détaillé": "detailed",
    "développe": "develops",
    "circulent": "circulates",
    "enregistre": "records",
    "relie": "links",
    "illustre": "illustrates",
    "présente": "presents",
    "démontre": "demonstrates",
    "décrit": "describes",
    "connecte": "connects",
    "identifie": "identifies",
    "résume": "summarizes",
    "explique": "explains",
    "montre": "shows",
    "fournit": "provides",
    "définit": "defines",
    "compare": "compares",
    "sépare": "separates",
    "évalue": "evaluates",
    
    # Other French phrases
    "a été": "was",
    "ont été": "were",
    "Il présente": "It presents",
    "Il montre": "It shows",
    "Il explique": "It explains",
    "Il démontre": "It demonstrates",
    "se passe": "happens",
    "lorsque": "when",
    "où": "where",
    "comme": "as",
    "chaque": "each",
    "aux": "to the",
    "of the": "of the",
    "of": "of",
    
    # Header text
    "REPUBLIQUE DU CAMEROUN": "REPUBLIC OF CAMEROON",
    "Paix - Travail - Patrie": "Peace - Work - Fatherland",
    "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR": "MINISTRY OF HIGHER EDUCATION",
}


def fix_paragraph_text(text):
    """Fix a paragraph by applying all replacements"""
    result = text
    
    # Apply all replacements
    for french, english in PARAGRAPH_REPLACEMENTS.items():
        if french in result:
            result = result.replace(french, english)
    
    # Clean up double spaces
    result = re.sub(r'\s+', ' ', result)
    
    return result.strip()


def contains_french(text):
    """Check if text contains French words"""
    french_patterns = [
        r'\bdiagramme\b', r'\bschéma\b', r'\btableau\b', r'\bflux\b',
        r'\bcapture\b', r'\bfeuille\b', r'\bcouche\b', r'\bdonnées\b',
        r'\butilisateur\b', r'\bfonctionnalité', r'\bscénario\b',
        r'\bacheteur\b', r'\bvisiteur\b', r'\bpreuves\b',
        r'\bimplémenté', r'\bévalué\b', r'\borganisé\b',
        r'\butilisées\b', r'\barchitecturales\b', r'\bdifférents\b',
        r'\bacteurs\b', r'\bdétaillé\b', r'\bdéveloppe\b',
        r'\bcirculent\b', r'\benregistre\b', r'\brelie\b',
        r'\billustre\b', r'\bprésente\b', r'\bdémontre\b',
        r'\bdécrit\b', r'\bconnecte\b', r'\bidentifie\b',
        r'\brésume\b', r'\bexplique\b', r'\bmontre\b',
        r'\bfournit\b', r'\bdéfinit\b', r'\bcompare\b',
        r'\bsépare\b', r'\bévalue\b',
        r"d'écran", r"d'utilisation", r"d'ensemble",
        r"de données", r"de bord", r"de route",
        r'\ba été\b', r'\bont été\b', r'\bse passe\b',
        r'\blorsque\b', r'\boù\b', r'\bchaque\b',
    ]
    
    for pattern in french_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def fix_document():
    """Fix all French text in the document"""
    print("="*70)
    print("COMPLETE ENGLISH REWRITE")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    para_fixes = 0
    table_fixes = 0
    
    # Process paragraphs
    for para in doc.paragraphs:
        original = para.text
        if not original.strip():
            continue
        
        new_text = fix_paragraph_text(original)
        
        if new_text != original:
            if para.runs:
                para.runs[0].text = new_text
                for run in para.runs[1:]:
                    run.text = ""
            para_fixes += 1
    
    # Process tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    original = para.text
                    if not original.strip():
                        continue
                    
                    new_text = fix_paragraph_text(original)
                    
                    if new_text != original:
                        if para.runs:
                            para.runs[0].text = new_text
                            for run in para.runs[1:]:
                                run.text = ""
                        table_fixes += 1
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n✅ Paragraph fixes: {para_fixes}")
    print(f"✅ Table fixes: {table_fixes}")
    print(f"\n📄 Saved: {OUTPUT_FILE}")
    
    # Verify
    print("\n" + "="*70)
    print("VERIFICATION - Checking for remaining French...")
    print("="*70)
    
    doc2 = Document(OUTPUT_FILE)
    remaining = []
    
    for i, para in enumerate(doc2.paragraphs):
        if contains_french(para.text):
            remaining.append((i, para.text[:80]))
    
    if remaining:
        print(f"\n⚠️  Found {len(remaining)} paragraphs with potential French:")
        for idx, text in remaining[:10]:
            print(f"  [{idx}] {text}...")
    else:
        print("\n✅ No French text detected!")


if __name__ == "__main__":
    fix_document()
