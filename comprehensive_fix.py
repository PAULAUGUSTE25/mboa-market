"""
COMPREHENSIVE FIX - Fix all remaining French and corrupted text
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_V2.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_FINAL_ENGLISH.docx"

# All fixes needed
FIXES = {
    # Corrupted words (thethis -> the, etc.)
    "absenthis": "absence",
    "performanthis": "performance",
    "pathis": "pace",
    "presenthis": "presence",
    "importanthis": "importance",
    "maintenanthis": "maintenance",
    "confidenthis": "confidence",
    "experienthis": "experience",
    "distanthis": "distance",
    "resistanthis": "resistance",
    "adherenthis": "adherence",
    "intelligenthis": "intelligence",
    "sequenthis": "sequence",
    "referenthis": "reference",
    "preferenthis": "preference",
    "differenthis": "difference",
    "existenthis": "existence",
    "persistenthis": "persistence",
    "consistenthis": "consistency",
    "dependenthis": "dependence",
    "independenthis": "independence",
    "evidenthis": "evidence",
    "patienthis": "patience",
    "audianthis": "audience",
    "scianthis": "science",
    "efficianthis": "efficiency",
    "sufficianthis": "sufficiency",
    "deficianthis": "deficiency",
    "proficianthis": "proficiency",
    "resilianthis": "resilience",
    "convenianthis": "convenience",
    "obedianthis": "obedience",
    "experianthis": "experience",
    "influanthis": "influence",
    "consequanthis": "consequence",
    "frequanthis": "frequency",
    "eloquanthis": "eloquence",
    "violanthis": "violence",
    "silanthis": "silence",
    "absanthis": "absence",
    "presanthis": "presence",
    "essanthis": "essence",
    "licanthis": "licence",
    "sentanthis": "sentence",
    "occurrenthis": "occurrence",
    "concurrenthis": "concurrence",
    "recurrenthis": "recurrence",
    "deterrenthis": "deterrence",
    "preferenthis": "preference",
    "interferenthis": "interference",
    "coherenthis": "coherence",
    "incoherenthis": "incoherence",
    "adherenthis": "adherence",
    "inherenthis": "inherence",
    "transparenthis": "transparency",
    "apparenthis": "appearance",
    "reverenthis": "reverence",
    "irreverenthis": "irreverence",
    "toleranthis": "tolerance",
    "intoleranthis": "intolerance",
    "abundanththis": "abundance",
    "redundanththis": "redundancy",
    "dominanththis": "dominance",
    "predominanththis": "predominance",
    "resonanththis": "resonance",
    "dissonanththis": "dissonance",
    "consonanththis": "consonance",
    "relevanththis": "relevance",
    "irrelevanththis": "irrelevance",
    "vigilanththis": "vigilance",
    "eleganthis": "elegance",
    "arroganththis": "arrogance",
    "ignoranththis": "ignorance",
    "fragranthis": "fragrance",
    "entranthis": "entrance",
    "substanthis": "substance",
    "instanthis": "instance",
    "distanthis": "distance",
    "assistanthis": "assistance",
    "resistanthis": "resistance",
    "persistenthis": "persistence",
    "insistenthis": "insistence",
    "consistenthis": "consistency",
    "existenthis": "existence",
    "coexistenthis": "coexistence",
    "subsistenthis": "subsistence",
    
    # French contractions
    "l'evolution": "the evolution",
    "l'organisation": "the organization",
    "l'authentification": "the authentication",
    "l'implementation": "the implementation",
    "l'interface": "the interface",
    "l'architecture": "the architecture",
    "l'application": "the application",
    "l'utilisateur": "the user",
    "l'Acheteur": "the Buyer",
    "l'Agriculteur": "the Farmer",
    "d'activites": "of activities",
    "d'elevage": "of livestock",
    "d'inclusion": "of inclusion",
    "d'extension": "of extension",
    "d'utilisation": "of use",
    
    # French words
    "Elle is basee": "It is based",
    "Elle utilise": "It uses",
    "Elle permet": "It allows",
    "Il inclut": "It includes",
    "Il presente": "It presents",
    "Il montre": "It shows",
    "Il explique": "It explains",
    "Les actors": "The actors",
    "Les modules": "The modules",
    "Les relations": "The relations",
    "presente a the": "presented in the",
    "basee on": "based on",
    "garantir the": "guarantee the",
    "robustesse of": "robustness of",
    "composants of": "components of",
    "criteres of": "criteria of",
    "qualite of": "quality of",
    "environments of": "environments of",
    "identifiess": "identifies",
    "couvrent": "cover",
    "functional": "functional",
    "souhai": "wish",
    "gestion of": "management of",
    "mesurer the": "measure the",
    "correspond a a": "corresponds to a",
    "ensemble": "set",
    "livrables": "deliverables",
    "specifiques": "specific",
    
    # More French phrases
    "a the figure below": "in the figure below",
    "of the serveur": "of the server",
    "internal of the server": "internal to the server",
    "maintenanthis and the evolution": "maintenance and evolution",
    "the maintenanthis": "the maintenance",
    
    # Keep Yaoundé as is (proper noun)
    # But fix other accented words
    "structuree": "structured",
    "generee": "generated",
    "automatiquement": "automatically",
    "fonctionnelle": "functional",
    "atteinte": "achieved",
    "navigue": "navigates",
    "processus": "process",
    "suivi": "followed",
    "visualle": "visual",
    "continue": "continuous",
    "informations": "information",
    "marche": "market",
    "affiches": "displayed",
    "cartes": "cards",
    "visualles": "visual",
    "formulaire": "form",
    "collecte": "collects",
    "numero": "number",
    "nouveaux": "new",
    "membres": "members",
    "tendances": "trends",
    "couverture": "coverage",
    "connectees": "connected",
    "implementeds": "implemented",
    "produits": "products",
    "agricoles": "agricultural",
    "vendeur": "seller",
    "annonces": "listings",
    "couleur": "color",
    "lies": "linked",
    "effectue": "performs",
    "tester": "test",
    "endpoints": "endpoints",
    "gerer": "manage",
    "gerent": "manage",
    "activite": "activity",
    "utilisee": "used",
    "compte": "account",
    "creation": "creation",
    "documentation": "documentation",
    "Swagger": "Swagger",
    "developsment": "development",
    "succes": "success",
    "metriques": "metrics",
    "evaluer": "evaluate",
    "organisé": "organized",
    "évalué": "evaluated",
    "implémenté": "implemented",
    "utilisées": "used",
    "présenté": "presented",
    "démontré": "demonstrated",
    "expliqué": "explained",
    "décrit": "described",
    "connecté": "connected",
    "identifié": "identified",
    "résumé": "summarized",
    "comparé": "compared",
    "séparé": "separated",
    "évalué": "evaluated",
}


def fix_text(text):
    """Apply all fixes to text"""
    result = text
    
    for french, english in FIXES.items():
        if french in result:
            result = result.replace(french, english)
    
    # Clean up double spaces
    result = re.sub(r'\s+', ' ', result)
    
    return result.strip()


def fix_document():
    """Fix all remaining issues"""
    print("="*70)
    print("COMPREHENSIVE FIX - ALL FRENCH AND CORRUPTED TEXT")
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
    
    # Process tables
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
