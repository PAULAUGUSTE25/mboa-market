"""
FINAL Script - Ensure ALL text is in English
Including UML section and any remaining French
"""

from docx import Document
import os

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_ENGLISH.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_EN.docx"

# UML text in English
UML_TEXT_ENGLISH = """To model the interactions between the different actors and the MBOA Market system, we have developed a UML use case diagram. This diagram relates five main actors with thirty-seven use cases distributed across seven functional modules.

The identified actors are the Visitor (unauthenticated user who can browse listings), the Farmer or Breeder (seller of agricultural or livestock products), the Buyer (user wishing to acquire products), the Administrator (platform manager), and Bigiass (integrated intelligent virtual assistant).

The functional modules cover authentication, listings management, search and discovery, social interactions, orders and payments, AI assistance, and administration. The inclusion (include) and extension (extend) relationships allow factoring common behaviors and expressing optional functionalities. The use case diagram is presented in the figure below."""

# French patterns to detect and their English replacements
FRENCH_PATTERNS = {
    "Pour modéliser les interactions": "To model the interactions",
    "nous avons élaboré": "we have developed",
    "Ce diagramme met en relation": "This diagram relates",
    "cinq acteurs principaux": "five main actors",
    "trente-sept cas d'utilisation": "thirty-seven use cases",
    "sept modules fonctionnels": "seven functional modules",
    "Les acteurs identifiés sont": "The identified actors are",
    "le Visiteur": "the Visitor",
    "utilisateur non authentifié": "unauthenticated user",
    "pouvant parcourir les annonces": "who can browse listings",
    "l'Agriculteur ou Éleveur": "the Farmer or Breeder",
    "vendeur de produits agricoles ou d'élevage": "seller of agricultural or livestock products",
    "l'Acheteur": "the Buyer",
    "utilisateur souhaitant acquérir des produits": "user wishing to acquire products",
    "l'Administrateur": "the Administrator",
    "gestionnaire de la plateforme": "platform manager",
    "Bigiass": "Bigiass",
    "assistant virtuel intelligent intégré": "integrated intelligent virtual assistant",
    "Les modules fonctionnels couvrent": "The functional modules cover",
    "l'authentification": "authentication",
    "la gestion des annonces": "listings management",
    "la recherche et découverte": "search and discovery",
    "les interactions sociales": "social interactions",
    "les commandes et paiements": "orders and payments",
    "l'assistance IA": "AI assistance",
    "ainsi que l'administration": "and administration",
    "Les relations d'inclusion": "The inclusion relationships",
    "et d'extension": "and extension",
    "permettent de factoriser": "allow factoring",
    "les comportements communs": "common behaviors",
    "et d'exprimer les fonctionnalités optionnelles": "and expressing optional functionalities",
    "Le diagramme de cas d'utilisation est présenté à la figure ci-dessous": "The use case diagram is presented in the figure below",
    "Cette représentation est illustrée à la figure ci-dessous": "This representation is illustrated in the figure below",
    
    # Common French words that might remain
    "ci-dessous": "below",
    "ci-dessus": "above",
    "également": "also",
    "notamment": "especially",
    "ainsi": "thus",
    "donc": "therefore",
    "cependant": "however",
    "néanmoins": "nevertheless",
    "toutefois": "however",
    "afin de": "in order to",
    "grâce à": "thanks to",
    "à travers": "through",
    "au sein de": "within",
    "par rapport à": "compared to",
    "en ce qui concerne": "regarding",
    "il est important de noter": "it is important to note",
    "comme mentionné": "as mentioned",
    "tel que": "such as",
    "c'est-à-dire": "that is to say",
    "par exemple": "for example",
    "en effet": "indeed",
    "de plus": "moreover",
    "en outre": "furthermore",
    "par conséquent": "consequently",
    "en conclusion": "in conclusion",
}


def fix_document():
    """Final pass to ensure all English"""
    print("="*60)
    print("FINAL ENGLISH CONVERSION")
    print("="*60)
    
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: File not found: {INPUT_FILE}")
        return
    
    doc = Document(INPUT_FILE)
    modifications = 0
    
    for i, para in enumerate(doc.paragraphs):
        original_text = para.text
        new_text = original_text
        
        # Replace any remaining French patterns
        for french, english in FRENCH_PATTERNS.items():
            if french in new_text:
                new_text = new_text.replace(french, english)
                modifications += 1
        
        # Update if changed
        if new_text != original_text:
            para.text = new_text
            print(f"[Fixed] Paragraph {i}")
    
    # Find and fix UML section specifically
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if ('3.4' in text or '3.3.4' in text) and 'uml' in text.lower():
            print(f"\n[UML Section found at paragraph {i}]")
            # Check next paragraph
            if i + 1 < len(doc.paragraphs):
                next_para = doc.paragraphs[i + 1]
                # If it contains French, replace with English
                if any(french in next_para.text for french in ["Pour modéliser", "nous avons", "acteurs"]):
                    next_para.text = UML_TEXT_ENGLISH
                    print(f"[UML text replaced with English version]")
                    modifications += 1
            break
    
    # Save
    doc.save(OUTPUT_FILE)
    print(f"\n{'='*60}")
    print(f"MODIFICATIONS: {modifications}")
    print(f"{'='*60}")
    print(f"\n✅ FINAL Document saved: {OUTPUT_FILE}")
    print("\nThis is the version to use for your memoir.")


if __name__ == "__main__":
    fix_document()
