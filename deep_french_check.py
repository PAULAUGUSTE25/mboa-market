"""
Deep check for any remaining French or corrupted text
"""

from docx import Document
import re

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_THESIS_FINAL.docx"

# Patterns that indicate French or corrupted text
PROBLEM_PATTERNS = [
    # French articles and pronouns
    (r"\bElle\b", "French pronoun 'Elle'"),
    (r"\bIl\b(?!\s+(is|was|has|had|will|would|can|could|should|must|may|might))", "French pronoun 'Il'"),
    (r"\bLes\b", "French article 'Les'"),
    (r"\bLe\b(?!\s+[A-Z])", "French article 'Le'"),
    (r"\bLa\b(?!\s+[A-Z])", "French article 'La'"),
    (r"\bl'[a-z]", "French contraction l'"),
    (r"\bd'[a-z]", "French contraction d'"),
    
    # French verbs
    (r"\bpermet\b", "French verb 'permet'"),
    (r"\bpresente\b", "French verb 'presente'"),
    (r"\bmontre\b", "French verb 'montre'"),
    (r"\butilise\b", "French verb 'utilise'"),
    (r"\bfournir\b", "French verb 'fournir'"),
    (r"\bsuivre\b", "French verb 'suivre'"),
    (r"\bgerer\b", "French verb 'gerer'"),
    (r"\bafficher\b", "French verb 'afficher'"),
    
    # French nouns
    (r"\bserveur\b", "French noun 'serveur'"),
    (r"\butilisateur\b", "French noun 'utilisateur'"),
    (r"\bproduits\b", "French noun 'produits'"),
    (r"\bformulaire\b", "French noun 'formulaire'"),
    (r"\btendances\b", "French noun 'tendances'"),
    (r"\bcouverture\b", "French noun 'couverture'"),
    (r"\bmarche\b", "French noun 'marche'"),
    
    # French prepositions
    (r"\bsous\b", "French preposition 'sous'"),
    (r"\bentre\b", "French preposition 'entre'"),
    
    # Corrupted/mixed text patterns
    (r"\bof the\s+[a-z]+e\b", "Possible corrupted text"),
    (r"\bthe\s+[a-z]+s\s+of\b", "Possible mixed language"),
    (r"lorsqu", "French 'lorsque'"),
    (r"qu'un", "French contraction"),
    (r"elles\b", "French pronoun 'elles'"),
    (r"leur\b", "French 'leur'"),
    
    # Accented characters that shouldn't be there
    (r"é(?!s\b)", "French accent é"),
    (r"è", "French accent è"),
    (r"ê", "French accent ê"),
    (r"à(?!\s)", "French accent à"),
    (r"ù", "French accent ù"),
    (r"ç", "French accent ç"),
]


def deep_check():
    """Deep check for French text"""
    print("="*70)
    print("DEEP CHECK FOR FRENCH/CORRUPTED TEXT")
    print("="*70)
    
    doc = Document(INPUT_FILE)
    
    issues = []
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text or len(text) < 10:
            continue
        
        for pattern, description in PROBLEM_PATTERNS:
            matches = re.findall(pattern, text)
            if matches:
                for match in matches:
                    # Get context
                    idx = text.find(match) if isinstance(match, str) else text.find(matches[0])
                    if idx >= 0:
                        context = text[max(0, idx-25):min(len(text), idx+35)]
                        issues.append({
                            'paragraph': i,
                            'issue': description,
                            'match': match if isinstance(match, str) else matches[0],
                            'context': context
                        })
    
    # Remove duplicates
    seen = set()
    unique_issues = []
    for item in issues:
        key = (item['paragraph'], item['match'])
        if key not in seen:
            seen.add(key)
            unique_issues.append(item)
    
    if unique_issues:
        print(f"\n⚠️  Found {len(unique_issues)} potential issues:\n")
        for item in unique_issues[:40]:
            print(f"  [{item['paragraph']}] {item['issue']}")
            print(f"    Match: '{item['match']}'")
            print(f"    Context: ...{item['context']}...")
            print()
    else:
        print("\n✅ NO ISSUES FOUND!")
        print("\nThe document appears to be 100% in English.")
    
    return unique_issues


if __name__ == "__main__":
    issues = deep_check()
    
    if issues:
        print("\n" + "="*70)
        print("SUMMARY OF ISSUES:")
        print("="*70)
        issue_types = {}
        for item in issues:
            issue_types[item['issue']] = issue_types.get(item['issue'], 0) + 1
        for issue, count in sorted(issue_types.items(), key=lambda x: -x[1]):
            print(f"  {count}x {issue}")
