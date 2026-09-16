"""
FINAL FRENCH TO ENGLISH CORRECTION

This script fixes ALL remaining French text in the document.
Based on the user's pasted content, these French phrases were identified.
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_MEMOIR_CORRECTED.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_EN.docx"

# Complete French to English translations found in the document
FRENCH_TO_ENGLISH = {
    # Table captions and explanations (found in user's pasted content)
    "Ce tableau compare the plateforme MBOA Market implémentée with the limitations identifiées lors de l'analyse initiale. Il démontre comment our solution répond aux besoins.":
        "This table compares the implemented MBOA Market platform with the limitations identified during the initial analysis. It demonstrates how our solution addresses the identified needs.",
    
    "Ce tableau présente the principaux tests fonctionnels effectués on the système. Il confirme que the actions critiques fonctionnent comme prévu.":
        "This table presents the main functional tests performed on the system. It confirms that critical actions work as expected.",
    
    "Ce tableau évalue the projet by rapport aux objectifs spécifiques définis au Chapitre Un. Il montre the degré d'atteinte de chaque objectif.":
        "This table evaluates the project against the specific objectives defined in Chapter One. It shows the degree of achievement for each objective.",
    
    "Ce tableau sépare the limitations actuelles des améliorations futures planifiées. Il aide the conclusion à rester réaliste tout en montrant the potentiel d'évolution.":
        "This table separates current limitations from planned future improvements. It helps the conclusion remain realistic while showing the potential for evolution.",
    
    "Ce tableau donne a résumé direct du statut des modules de the plateforme après implémentation. Il distingue the fonctionnalités complètes de celles en cours.":
        "This table provides a direct summary of the module status of the platform after implementation. It distinguishes completed features from those in progress.",
    
    "Ce tableau résume the comportement observable en production. Il explique the différenthis entre the avertissements normaux and the erreurs critiques.":
        "This table summarizes the observable behavior in production. It explains the differences between normal warnings and critical errors.",
    
    # Other French phrases found
    "Cette représentation est illustrée à la figure ci-dessous.": "",
    "Cette représentation est illustrée à la figure ci-dessous": "",
    "Cette représentation est illustrée ci-dessous.": "",
    "Cette représentation est illustrée ci-dessous": "",
    
    # Mixed French-English phrases
    "the plateforme": "the platform",
    "the limitations": "the limitations",
    "the système": "the system",
    "the actions": "the actions",
    "the projet": "the project",
    "the conclusion": "the conclusion",
    "the potentiel": "the potential",
    "the fonctionnalités": "the features",
    "the comportement": "the behavior",
    "the différenthis": "the differences",
    "the avertissements": "the warnings",
    "the erreurs": "the errors",
    
    # Common French words that might appear
    "implémentée": "implemented",
    "implémentation": "implementation",
    "identifiées": "identified",
    "démontre": "demonstrates",
    "répond": "addresses",
    "besoins": "needs",
    "présente": "presents",
    "principaux": "main",
    "effectués": "performed",
    "confirme": "confirms",
    "critiques": "critical",
    "fonctionnent": "work",
    "prévu": "expected",
    "évalue": "evaluates",
    "rapport": "relation",
    "objectifs": "objectives",
    "spécifiques": "specific",
    "définis": "defined",
    "montre": "shows",
    "degré": "degree",
    "d'atteinte": "of achievement",
    "sépare": "separates",
    "actuelles": "current",
    "améliorations": "improvements",
    "futures": "future",
    "planifiées": "planned",
    "aide": "helps",
    "rester": "remain",
    "réaliste": "realistic",
    "montrant": "showing",
    "d'évolution": "of evolution",
    "donne": "provides",
    "résumé": "summary",
    "direct": "direct",
    "statut": "status",
    "modules": "modules",
    "après": "after",
    "distingue": "distinguishes",
    "complètes": "completed",
    "celles": "those",
    "cours": "progress",
    "résume": "summarizes",
    "observable": "observable",
    "production": "production",
    "explique": "explains",
    "entre": "between",
    "normaux": "normal",
    
    # Header translations
    "REPUBLIQUE DU CAMEROUN": "REPUBLIC OF CAMEROON",
    "Paix - Travail - Patrie": "Peace - Work - Fatherland",
    "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR": "MINISTRY OF HIGHER EDUCATION",
    
    # Common French connectors
    " et ": " and ",
    " ou ": " or ",
    " de ": " of ",
    " du ": " of the ",
    " des ": " of the ",
    " le ": " the ",
    " la ": " the ",
    " les ": " the ",
    " un ": " a ",
    " une ": " a ",
    " dans ": " in ",
    " sur ": " on ",
    " pour ": " for ",
    " avec ": " with ",
    " par ": " by ",
    " ce ": " this ",
    " cette ": " this ",
    " ces ": " these ",
    " qui ": " which ",
    " que ": " that ",
    " est ": " is ",
    " sont ": " are ",
    " nous ": " we ",
    " notre ": " our ",
    " nos ": " our ",
    
    # Specific phrases from the document
    "by rapport aux": "against the",
    "au Chapitre Un": "in Chapter One",
    "en cours": "in progress",
    "lors de l'analyse initiale": "during the initial analysis",
    "comment our solution": "how our solution",
    "on the système": "on the system",
    "que the actions": "that the actions",
    "comme prévu": "as expected",
    "the projet by rapport": "the project against",
    "the degré d'atteinte": "the degree of achievement",
    "de chaque objectif": "for each objective",
    "the limitations actuelles": "current limitations",
    "des améliorations futures": "future improvements",
    "the conclusion à rester": "the conclusion to remain",
    "tout en montrant": "while showing",
    "the potentiel d'évolution": "the potential for evolution",
    "du statut des modules": "of the module status",
    "de the plateforme": "of the platform",
    "the fonctionnalités complètes": "completed features",
    "de celles en cours": "from those in progress",
    "the comportement observable": "the observable behavior",
    "en production": "in production",
    "the différenthis entre": "the differences between",
    "the avertissements normaux": "normal warnings",
    "and the erreurs critiques": "and critical errors",
}


def fix_document():
    """Fix all remaining French text in the document"""
    print("="*70)
    print("FIXING ALL REMAINING FRENCH TEXT")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    total_fixes = 0
    
    # Process all paragraphs
    for para in doc.paragraphs:
        original = para.text
        new_text = original
        
        # Apply all translations
        for french, english in FRENCH_TO_ENGLISH.items():
            if french in new_text:
                new_text = new_text.replace(french, english)
        
        # Clean up extra spaces
        new_text = re.sub(r'\s+', ' ', new_text)
        new_text = new_text.strip()
        
        if new_text != original:
            if para.runs:
                para.runs[0].text = new_text
                for run in para.runs[1:]:
                    run.text = ""
            total_fixes += 1
    
    # Process all tables
    table_fixes = 0
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    original = para.text
                    new_text = original
                    
                    for french, english in FRENCH_TO_ENGLISH.items():
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
    
    # Save
    doc.save(OUTPUT_FILE)
    
    print(f"\n✅ Paragraph fixes: {total_fixes}")
    print(f"✅ Table cell fixes: {table_fixes}")
    print(f"\n📄 Document saved: {OUTPUT_FILE}")


if __name__ == "__main__":
    fix_document()
