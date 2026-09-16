"""
Script to ensure ALL documentation is in ENGLISH
Removes any French text from the memoir
"""

from docx import Document
import re
import os

INPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_COMPLET.docx"
OUTPUT_FILE = r"c:\Users\HP\Desktop\mboa-market\NDEO PAUL AUGUSTE ICTU20212527_ENGLISH.docx"

# French to English translations for common phrases
FRENCH_TO_ENGLISH = {
    # Figure references
    "Cette représentation est illustrée à la figure ci-dessous.": 
        "This representation is illustrated in the figure below.",
    "Cette figure présente": "This figure presents",
    "Ce tableau": "This table",
    "Ce diagramme": "This diagram",
    "Cette capture d'écran": "This screenshot",
    "Ce diagramme de flux": "This flowchart",
    "Cette feuille de route": "This roadmap",
    "La courbe": "The curve",
    "Le schéma de base de données": "The database schema",
    "Le diagramme du cycle de vie de l'API": "The API lifecycle diagram",
    "Le flux de bout en bout": "The end-to-end flow",
    "Le mécanisme du ticker de prix": "The price ticker mechanism",
    "L'architecture frontend": "The frontend architecture",
    "L'architecture backend": "The backend architecture",
    
    # Verbs and common words
    "présente": "presents",
    "montre": "shows",
    "explique": "explains",
    "démontre": "demonstrates",
    "illustre": "illustrates",
    "décrit": "describes",
    "résume": "summarizes",
    "identifie": "identifies",
    "compare": "compares",
    "enregistre": "records",
    "relie": "links",
    "connecte": "connects",
    "confirme": "confirms",
    "évalue": "evaluates",
    "sépare": "separates",
    "rend": "makes",
    "donne": "gives",
    
    # UML Section - Full replacement
    "Pour modéliser les interactions entre les différents acteurs et le système MBOA Market, nous avons élaboré un diagramme de cas d'utilisation UML.":
        "To model the interactions between the different actors and the MBOA Market system, we have developed a UML use case diagram.",
    
    "Ce diagramme met en relation cinq acteurs principaux avec trente-sept cas d'utilisation répartis en sept modules fonctionnels.":
        "This diagram relates five main actors with thirty-seven use cases distributed across seven functional modules.",
    
    "Les acteurs identifiés sont le Visiteur (utilisateur non authentifié pouvant parcourir les annonces), l'Agriculteur ou Éleveur (vendeur de produits agricoles ou d'élevage), l'Acheteur (utilisateur souhaitant acquérir des produits), l'Administrateur (gestionnaire de la plateforme), et Bigiass (assistant virtuel intelligent intégré).":
        "The identified actors are the Visitor (unauthenticated user who can browse listings), the Farmer or Breeder (seller of agricultural or livestock products), the Buyer (user wishing to acquire products), the Administrator (platform manager), and Bigiass (integrated intelligent virtual assistant).",
    
    "Les modules fonctionnels couvrent l'authentification, la gestion des annonces, la recherche et découverte, les interactions sociales, les commandes et paiements, l'assistance IA, ainsi que l'administration.":
        "The functional modules cover authentication, listings management, search and discovery, social interactions, orders and payments, AI assistance, and administration.",
    
    "Les relations d'inclusion (include) et d'extension (extend) permettent de factoriser les comportements communs et d'exprimer les fonctionnalités optionnelles.":
        "The inclusion (include) and extension (extend) relationships allow factoring common behaviors and expressing optional functionalities.",
    
    "Le diagramme de cas d'utilisation est présenté à la figure ci-dessous.":
        "The use case diagram is presented in the figure below.",
    
    # Common French phrases that might appear
    "la plateforme": "the platform",
    "le système": "the system",
    "l'utilisateur": "the user",
    "l'application": "the application",
    "l'interface": "the interface",
    "le backend": "the backend",
    "le frontend": "the frontend",
    "la base de données": "the database",
    "la marketplace": "the marketplace",
    "le tableau de bord": "the dashboard",
    "l'authentification": "authentication",
    "l'inscription": "registration",
    "la connexion": "login",
    "les produits": "the products",
    "les utilisateurs": "the users",
    "les données": "the data",
    "les informations": "the information",
    "les fonctionnalités": "the features",
    "les modules": "the modules",
    "les technologies": "the technologies",
    "les tests": "the tests",
    "la validation": "the validation",
    "l'implémentation": "the implementation",
    "les limitations": "the limitations",
    "les améliorations": "the improvements",
}

# Full paragraph translations for the explanations we added
FULL_PARAGRAPH_TRANSLATIONS = {
    "Cette figure présente le contexte général du commerce agricole au Cameroun. Elle illustre les défis auxquels font face les agriculteurs et éleveurs dans la commercialisation de leurs produits.":
        "This figure presents the general context of agricultural trade in Cameroon. It illustrates the challenges faced by farmers and breeders in marketing their products. This representation is illustrated in the figure below.",
    
    "Cette figure illustre la problématique du projet. Elle met en évidence les difficultés de mise en relation entre producteurs et acheteurs dans le secteur agricole camerounais.":
        "This figure illustrates the project's problem statement. It highlights the difficulties in connecting producers and buyers in the Cameroonian agricultural sector. This representation is illustrated in the figure below.",
    
    "Ce tableau résume les principales plateformes existantes dans le domaine du commerce agricole. Il permet de comparer leurs fonctionnalités et d'identifier les lacunes que MBOA Market vise à combler.":
        "This table summarizes the main existing platforms in the agricultural trade domain. It allows comparing their features and identifying the gaps that MBOA Market aims to fill. This representation is illustrated in the figure below.",
    
    "Ce diagramme relie les résultats de la revue de littérature directement aux fonctionnalités implémentées dans MBOA Market. Il démontre comment notre solution répond aux besoins identifiés dans la recherche académique.":
        "This diagram links the literature review findings directly to the features implemented in MBOA Market. It demonstrates how our solution addresses the needs identified in academic research. This representation is illustrated in the figure below.",
    
    "Ce tableau fournit une comparaison directe entre MBOA Market et les solutions existantes. Il met en évidence les avantages compétitifs de notre plateforme.":
        "This table provides a direct comparison between MBOA Market and existing solutions. It highlights the competitive advantages of our platform. This representation is illustrated in the figure below.",
    
    "Le modèle d'acceptation technologique (TAM) est utilisé pour expliquer pourquoi les utilisateurs adoptent ou rejettent les nouvelles technologies. Dans le contexte de MBOA Market, ce modèle guide la conception de l'interface utilisateur.":
        "The Technology Acceptance Model (TAM) is used to explain why users adopt or reject new technologies. In the context of MBOA Market, this model guides the user interface design. This representation is illustrated in the figure below.",
    
    "Cette image montre comment MBOA Market réduit l'asymétrie d'information entre producteurs et acheteurs. La plateforme centralise les informations sur les produits, prix et disponibilités.":
        "This image shows how MBOA Market reduces information asymmetry between producers and buyers. The platform centralizes information about products, prices, and availability. This representation is illustrated in the figure below.",
    
    "Le diagramme de classes UML présente les principales entités logicielles utilisées dans MBOA Market. Il montre les relations entre les utilisateurs, les annonces, les commandes et les autres composants du système.":
        "The UML class diagram presents the main software entities used in MBOA Market. It shows the relationships between users, listings, orders, and other system components. This representation is illustrated in the figure below.",
    
    "Le diagramme de composants montre les principaux blocs techniques qui constituent la plateforme. Il illustre l'architecture modulaire adoptée pour faciliter la maintenance et l'évolution du système.":
        "The component diagram shows the main technical blocks that make up the platform. It illustrates the modular architecture adopted to facilitate system maintenance and evolution. This representation is illustrated in the figure below.",
    
    "Ce tableau montre comment le travail du projet a été organisé en phases distinctes. Chaque phase correspond à un ensemble d'activités et de livrables spécifiques.":
        "This table shows how the project work was organized into distinct phases. Each phase corresponds to a set of specific activities and deliverables. This representation is illustrated in the figure below.",
    
    "Ce tableau identifie les principaux outils utilisés pour construire la plateforme. Il inclut les environnements de développement, les frameworks et les services tiers.":
        "This table identifies the main tools used to build the platform. It includes development environments, frameworks, and third-party services. This representation is illustrated in the figure below.",
    
    "Ce tableau définit comment le projet a été évalué. Il présente les critères de succès et les métriques utilisées pour mesurer la qualité de l'implémentation.":
        "This table defines how the project was evaluated. It presents the success criteria and metrics used to measure implementation quality. This representation is illustrated in the figure below.",
    
    "Le diagramme d'architecture donne une vue d'ensemble des composants de la plateforme. Il montre comment le frontend, le backend et la base de données interagissent.":
        "The architecture diagram gives an overview of the platform components. It shows how the frontend, backend, and database interact. This representation is illustrated in the figure below.",
    
    "L'architecture frontend illustre comment l'interface utilisateur interagit avec les services backend. Elle est basée sur React.js avec TypeScript pour garantir la robustesse du code.":
        "The frontend architecture illustrates how the user interface interacts with backend services. It is based on React.js with TypeScript to ensure code robustness. This representation is illustrated in the figure below.",
    
    "L'architecture backend montre l'organisation interne du serveur. Elle utilise FastAPI (Python) pour fournir des API RESTful performantes et sécurisées.":
        "The backend architecture shows the internal server organization. It uses FastAPI (Python) to provide high-performance and secure RESTful APIs. This representation is illustrated in the figure below.",
    
    "Ce tableau présente les trois principales couches architecturales de la plateforme : présentation (frontend), logique métier (backend) et persistance (base de données).":
        "This table presents the three main architectural layers of the platform: presentation (frontend), business logic (backend), and persistence (database). This representation is illustrated in the figure below.",
    
    "Le diagramme de cas d'utilisation identifie les principaux acteurs du système et leurs interactions. Il montre les fonctionnalités accessibles à chaque type d'utilisateur.":
        "The use case diagram identifies the main actors of the system and their interactions. It shows the features accessible to each type of user. This representation is illustrated in the figure below.",
    
    "Ce diagramme de cas d'utilisation détaillé développe la vue générale des acteurs. Il présente les scénarios d'utilisation spécifiques pour chaque fonctionnalité.":
        "This detailed use case diagram expands the general actor view. It presents specific usage scenarios for each feature. This representation is illustrated in the figure below.",
    
    "Le schéma de base de données montre comment la couche de données est structurée. Il présente les tables, leurs attributs et les relations entre elles.":
        "The database schema shows how the data layer is structured. It presents the tables, their attributes, and the relationships between them. This representation is illustrated in the figure below.",
    
    "Ce tableau explique le langage visuel de l'application. Les choix de couleurs sont liés à l'agriculture (vert) et au commerce (orange), créant une identité visuelle cohérente.":
        "This table explains the visual language of the application. The color choices are linked to agriculture (green) and commerce (orange), creating a coherent visual identity. This representation is illustrated in the figure below.",
    
    "Le diagramme du cycle de vie de l'API montre ce qui se passe lorsqu'un utilisateur effectue une action dans le frontend. L'action déclenche une requête vers le backend qui traite et retourne les données.":
        "The API lifecycle diagram shows what happens when a user performs an action in the frontend. The action triggers a request to the backend which processes and returns the data. This representation is illustrated in the figure below.",
    
    "Le flux de bout en bout montre comment les données circulent à travers toute la plateforme, depuis l'écran de l'utilisateur jusqu'à la persistance en base de données.":
        "The end-to-end flow shows how data moves across the entire platform, from the user's screen to database persistence. This representation is illustrated in the figure below.",
    
    "Ce tableau rend explicite l'environnement d'implémentation. Il montre le matériel, les logiciels, les environnements d'exécution et les services utilisés pour le développement.":
        "This table makes the implementation environment explicit. It shows the hardware, software, runtime environments, and services used for development. This representation is illustrated in the figure below.",
    
    "Ce tableau explique les technologies frontend utilisées pour construire l'interface utilisateur de MBOA Market. React.js, TypeScript et TailwindCSS forment le socle technique.":
        "This table explains the frontend technologies used to build the MBOA Market user interface. React.js, TypeScript, and TailwindCSS form the technical foundation. This representation is illustrated in the figure below.",
    
    "Ce tableau explique les technologies backend utilisées pour fournir l'authentification, la validation des données, l'accès à la base de données et les endpoints API.":
        "This table explains the backend technologies used to provide authentication, data validation, database access, and API endpoints. This representation is illustrated in the figure below.",
    
    "Le mécanisme du ticker de prix montre comment les informations de marché sont affichées aux utilisateurs de manière continue et visuelle. Il permet de suivre les tendances des prix en temps réel.":
        "The price ticker mechanism shows how market information is displayed to users in a continuous and visual manner. It allows tracking price trends in real-time. This representation is illustrated in the figure below.",
    
    "Ce tableau enregistre les tests API effectués via Swagger UI et la validation manuelle des endpoints. Il montre les résultats des tests pour chaque fonctionnalité.":
        "This table records the API tests performed through Swagger UI and manual endpoint validation. It shows the test results for each feature. This representation is illustrated in the figure below.",
    
    "Ce tableau résume la validation des flux utilisateur visibles. Il confirme que l'inscription, la connexion, la navigation et les autres fonctionnalités fonctionnent correctement.":
        "This table summarizes the validation of visible user flows. It confirms that registration, login, navigation, and other features work correctly. This representation is illustrated in the figure below.",
    
    "Ce tableau relie chaque module implémenté à des preuves visibles dans le rapport. Il prépare le lecteur aux captures d'écran et démonstrations qui suivent.":
        "This table links each implemented module to visible evidence in the report. It prepares the reader for the screenshots and demonstrations that follow. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran démontre la fonctionnalité de connexion sécurisée de la plateforme. L'interface affiche un formulaire de connexion avec validation des champs.":
        "This screenshot demonstrates the secure login functionality of the platform. The interface displays a login form with field validation. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran montre l'interface de création de compte utilisée par les nouveaux membres. Le formulaire collecte le numéro de téléphone, le mot de passe et les informations de profil.":
        "This screenshot shows the account creation interface used by new members. The form collects phone number, password, and profile information. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran illustre ce qui se passe lorsque l'authentification échoue. L'interface affiche un message d'erreur clair guidant l'utilisateur vers la correction.":
        "This screenshot illustrates what happens when authentication fails. The interface displays a clear error message guiding the user toward correction. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran présente la fonctionnalité de navigation dans la marketplace. Les produits sont affichés sous forme de cartes visuelles avec images, prix et informations du vendeur.":
        "This screenshot presents the marketplace browsing functionality. Products are displayed as visual cards with images, prices, and seller information. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran montre la zone de gestion du profil où un utilisateur enregistré peut consulter ou mettre à jour ses informations personnelles.":
        "This screenshot shows the profile management area where a registered user can view or update personal information. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran démontre la zone où les utilisateurs gèrent leur activité sur la plateforme, notamment leurs publications et leurs interactions.":
        "This screenshot demonstrates the area where users manage their platform activity, especially their publications and interactions. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran présente le tableau de bord comme espace de synthèse des principales fonctions de la plateforme. Il rassemble les indicateurs clés et les accès rapides.":
        "This screenshot presents the dashboard as a summary space for the platform's main functions. It brings together key indicators and quick access links. This representation is illustrated in the figure below.",
    
    "Cette capture d'écran montre la documentation Swagger générée automatiquement pour le backend FastAPI. Elle permet de tester les endpoints directement depuis le navigateur.":
        "This screenshot shows the automatically generated Swagger documentation for the FastAPI backend. It allows testing endpoints directly from the browser. This representation is illustrated in the figure below.",
    
    "Ce diagramme de flux résume les principales fonctionnalités implémentées dans la plateforme et comment elles sont connectées entre elles.":
        "This flowchart summarizes the main features implemented in the platform and how they are connected to each other. This representation is illustrated in the figure below.",
    
    "Ce diagramme de flux explique le scénario d'authentification étape par étape. Il commence par l'inscription ou la connexion et se termine par l'accès aux fonctionnalités protégées.":
        "This flowchart explains the authentication scenario step by step. It starts from registration or login and ends with access to protected features. This representation is illustrated in the figure below.",
    
    "Ce diagramme de flux décrit comment un acheteur ou visiteur navigue dans la marketplace. L'utilisateur accède aux annonces, filtre par catégorie et consulte les détails.":
        "This flowchart describes how a buyer or visitor browses the marketplace. The user accesses listings, filters by category, and views details. This representation is illustrated in the figure below.",
    
    "Ce diagramme de flux décrit le processus de publication suivi par un producteur ou fournisseur. Après authentification, il peut créer, modifier et gérer ses annonces.":
        "This flowchart describes the publication process followed by a producer or supplier. After authentication, they can create, modify, and manage their listings. This representation is illustrated in the figure below.",
    
    "Ce diagramme de flux connecte le tableau de bord utilisateur à l'API backend. Il montre que les informations du dashboard sont récupérées dynamiquement depuis le serveur.":
        "This flowchart connects the user dashboard to the backend API. It shows that dashboard information is retrieved dynamically from the server. This representation is illustrated in the figure below.",
    
    "La courbe présente la couverture fonctionnelle atteinte par les modules implémentés. Elle montre une forte couverture des fonctionnalités essentielles.":
        "The curve presents the functional coverage achieved by the implemented modules. It shows strong coverage of essential features. This representation is illustrated in the figure below.",
    
    "Cette feuille de route identifie les limitations actuelles du système et les améliorations planifiées pour les versions futures.":
        "This roadmap identifies the current limitations of the system and the improvements planned for future versions. This representation is illustrated in the figure below.",
    
    "Ce tableau compare la plateforme MBOA Market implémentée avec les limitations identifiées lors de l'analyse initiale. Il démontre comment notre solution répond aux besoins.":
        "This table compares the implemented MBOA Market platform with the limitations identified during the initial analysis. It demonstrates how our solution addresses the needs. This representation is illustrated in the figure below.",
    
    "Ce tableau présente les principaux tests fonctionnels effectués sur le système. Il confirme que les actions critiques fonctionnent comme prévu.":
        "This table presents the main functional tests carried out on the system. It confirms that critical actions work as expected. This representation is illustrated in the figure below.",
    
    "Ce tableau donne un résumé direct du statut des modules de la plateforme après implémentation. Il distingue les fonctionnalités complètes de celles en cours.":
        "This table gives a direct status summary of the platform modules after implementation. It distinguishes complete features from those in progress. This representation is illustrated in the figure below.",
    
    "Ce tableau résume le comportement observable en production. Il explique la différence entre les avertissements normaux et les erreurs critiques.":
        "This table summarizes observable production behavior. It explains the difference between normal warnings and critical errors. This representation is illustrated in the figure below.",
    
    "Ce tableau évalue le projet par rapport aux objectifs spécifiques définis au Chapitre Un. Il montre le degré d'atteinte de chaque objectif.":
        "This table evaluates the project against the specific objectives defined in Chapter One. It shows the degree of achievement for each objective. This representation is illustrated in the figure below.",
    
    "Ce tableau sépare les limitations actuelles des améliorations futures planifiées. Il aide la conclusion à rester réaliste tout en montrant le potentiel d'évolution.":
        "This table separates current limitations from planned future improvements. It helps the conclusion remain realistic while showing the potential for evolution. This representation is illustrated in the figure below.",
}


def fix_document():
    """Fix all French text to English"""
    print("="*60)
    print("CONVERTING FRENCH TO ENGLISH")
    print("="*60)
    
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: File not found: {INPUT_FILE}")
        return
    
    doc = Document(INPUT_FILE)
    modifications = 0
    
    for i, para in enumerate(doc.paragraphs):
        original_text = para.text
        new_text = original_text
        
        # First, try full paragraph translations
        for french, english in FULL_PARAGRAPH_TRANSLATIONS.items():
            if french in new_text:
                new_text = new_text.replace(french, english)
                print(f"\n[{modifications + 1}] Full paragraph translated at {i}")
                modifications += 1
                break
        
        # Then, try individual phrase translations
        for french, english in FRENCH_TO_ENGLISH.items():
            if french in new_text:
                new_text = new_text.replace(french, english)
        
        # Update if changed
        if new_text != original_text:
            para.text = new_text
    
    # Save
    doc.save(OUTPUT_FILE)
    print(f"\n\n{'='*60}")
    print(f"TOTAL MODIFICATIONS: {modifications}")
    print(f"{'='*60}")
    print(f"\n✅ Document saved: {OUTPUT_FILE}")


if __name__ == "__main__":
    fix_document()
