// Demo community posts - Expert advice, tips, and announcements
export const generateDemoCommunityPosts = () => {
  const expertNames = [
    'Dr. Mbarga Jean', 'Ing. Amadou Hassan', 'Prof. Marie Nguema', 'Dr. Sophie Kamga',
    'Ing. Paul Nkolo', 'Dr. Fatima Bello', 'Ing. André Tchouta', 'Dr. Aissatou Diallo',
    'Prof. Ibrahim Sani', 'Ing. Mariama Fofana', 'Dr. Ousmane Traoré', 'Ing. Aminata Sy'
  ];

  const regions = [
    'Centre', 'Littoral', 'Ouest', 'Nord', 'Adamaoua', 'Est', 'Sud', 'Nord-Ouest', 'Sud-Ouest', 'Extrême-Nord'
  ];

  const posts: any[] = [];
  let id = 1;

  const createPost = (
    title: string,
    content: string,
    domain: 'agriculture' | 'elevage',
    type: 'expert_advice' | 'tip' | 'announcement' | 'warning' | 'success_story',
    hasImage: boolean = false,
    image?: string
  ) => {
    const expert = expertNames[Math.floor(Math.random() * expertNames.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    
    posts.push({
      id: `community-${id++}`,
      author: expert,
      author_role: type === 'expert_advice' ? 'expert' : 'community_member',
      title,
      content,
      domain,
      type,
      region,
      images: hasImage && image ? [image] : [],
      likes: Math.floor(Math.random() * 150),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  // === ANNONCE MAJEURE IRAD ===
  createPost(
    '🔬🌟 DÉCOUVERTE RÉVOLUTIONNAIRE DE L\'IRAD - Nouvelle Variété de Maïs !',
    '🎉 GRANDE NOUVELLE ! L\'Institut de Recherche Agricole pour le Développement (IRAD) vient d\'annoncer une découverte majeure qui va RÉVOLUTIONNER l\'agriculture camerounaise !\n\n✨ UNE NOUVELLE VARIÉTÉ DE MAÏS EXCEPTIONNELLE :\n• Rendement DOUBLÉ : 8-10 tonnes/hectare (vs 4-5 tonnes habituellement)\n• Résistance totale à la sécheresse - Parfait pour notre climat\n• Cycle court : Récolte en 90 jours au lieu de 120 jours\n• Résistance naturelle aux maladies et ravageurs\n• Grains plus gros et plus nutritifs\n\n💰 IMPACT ÉCONOMIQUE :\nVos revenus peuvent DOUBLER avec cette nouvelle variété ! Un hectare peut rapporter jusqu\'à 2 millions FCFA au lieu de 1 million.\n\n📍 DISPONIBILITÉ :\nLes semences seront disponibles dès le mois prochain dans tous les centres IRAD. Prix subventionné : 4 000 FCFA/kg.\n\n🎯 FORMATION GRATUITE :\nL\'IRAD organise des sessions de formation gratuites dans toutes les régions pour apprendre les techniques de culture optimales.\n\n👨‍🌾 C\'est le moment de moderniser votre agriculture ! Cette découverte est le fruit de 10 ans de recherche. Ne ratez pas cette opportunité historique !',
    'agriculture',
    'announcement'
  );

  createPost(
    '🐄🔬 IRAD ANNONCE : Nouveau Vaccin Révolutionnaire pour Bovins !',
    '🎊 ANNONCE EXCEPTIONNELLE ! L\'IRAD vient de développer un vaccin révolutionnaire qui va transformer l\'élevage bovin au Cameroun !\n\n✨ LE VACCIN "PROTEC-BOVIN 2024" :\n• Protection contre 5 maladies majeures en UNE SEULE injection\n• Efficacité prouvée à 98% pendant 12 mois\n• Réduit la mortalité de 80%\n• Augmente la production laitière de 30%\n• Sans effets secondaires\n\n💉 MALADIES COUVERTES :\n1. Péripneumonie contagieuse bovine\n2. Charbon symptomatique\n3. Fièvre aphteuse\n4. Pasteurellose\n5. Dermatose nodulaire\n\n💰 ÉCONOMIES MASSIVES :\nPlus besoin de 5 vaccins différents ! Un seul vaccin = 15 000 FCFA au lieu de 50 000 FCFA. Économisez 70% sur vos frais vétérinaires !\n\n📅 CAMPAGNE DE VACCINATION :\nLancement national le 1er mars. Vaccination gratuite pour les 1000 premiers éleveurs inscrits dans chaque région !\n\n🏆 RECONNAISSANCE INTERNATIONALE :\nCe vaccin a reçu le Prix d\'Excellence de l\'Union Africaine pour l\'Innovation Agricole 2024.\n\n👨‍🌾 Inscrivez-vous dès maintenant auprès de votre délégation d\'élevage ! Cette innovation va sauver des milliers de bovins et augmenter vos revenus. L\'avenir de l\'élevage commence aujourd\'hui !',
    'elevage',
    'announcement'
  );

  // === AGRICULTURE - CONSEILS EXPERTS SAISON SÈCHE ===
  createPost(
    '🌡️ Alerte Saison Sèche - Préparez vos cultures maintenant !',
    'La saison sèche approche dans 2 mois. Il est crucial de préparer vos champs dès maintenant. Voici les actions prioritaires : 1) Installer un système d\'irrigation goutte-à-goutte, 2) Pailler vos sols pour conserver l\'humidité, 3) Choisir des variétés résistantes à la sécheresse. N\'attendez pas le dernier moment !',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '💧 Gestion de l\'eau en saison sèche',
    'Avec la saison sèche qui arrive, voici mes recommandations pour optimiser votre consommation d\'eau : Arrosez tôt le matin ou tard le soir pour minimiser l\'évaporation. Installez des bassins de récupération d\'eau de pluie dès maintenant. Privilégiez le paillage organique (paille, feuilles mortes) autour de vos plants.',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '🌾 Cultures recommandées pour la saison sèche',
    'Pour la saison sèche à venir, je recommande fortement : le mil, le sorgho, le niébé (haricot), et l\'arachide. Ces cultures sont naturellement résistantes à la sécheresse et donnent de bons rendements même avec peu d\'eau. Commencez à vous procurer les semences dès maintenant !',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '⚠️ Attention aux maladies en saison sèche',
    'La saison sèche favorise certaines maladies et ravageurs. Surveillez particulièrement : les acariens (araignées rouges), la mouche blanche, et l\'oïdium. Préparez vos traitements bio : décoction d\'ail, savon noir, neem. Inspectez vos plants régulièrement.',
    'agriculture',
    'warning'
  );

  createPost(
    '🌱 Préparation du sol avant la saison sèche',
    'Il vous faut absolument enrichir votre sol maintenant ! Incorporez du compost ou du fumier bien décomposé. Un sol riche en matière organique retient mieux l\'eau. Faites aussi un labour léger pour améliorer la structure du sol. C\'est le moment ou jamais !',
    'agriculture',
    'expert_advice'
  );

  // === AGRICULTURE - CONSEILS PRATIQUES ===
  createPost(
    '🥕 Astuce : Conservation des légumes sans frigo',
    'Pour conserver vos légumes plus longtemps sans réfrigérateur : Enterrez les carottes dans du sable sec. Suspendez les oignons dans des filets. Gardez les tomates à l\'ombre sur des clayettes. Les pommes de terre se conservent bien dans un endroit sombre et frais.',
    'agriculture',
    'tip'
  );

  createPost(
    '🌿 Fabrication d\'insecticide naturel',
    'Recette efficace et économique : Mixez 5 gousses d\'ail + 1 oignon + 1 piment dans 1L d\'eau. Laissez macérer 24h. Filtrez et diluez dans 5L d\'eau. Pulvérisez sur vos plants le soir. Répétez tous les 7 jours. Efficace contre pucerons et chenilles !',
    'agriculture',
    'tip'
  );

  createPost(
    '💰 Subvention disponible pour l\'irrigation',
    'Le Ministère de l\'Agriculture annonce une subvention de 50% pour l\'achat de matériel d\'irrigation. Dossiers à déposer avant fin du mois. Documents requis : carte d\'identité, titre foncier ou bail, devis du matériel. Renseignez-vous vite auprès de votre délégation !',
    'agriculture',
    'announcement'
  );

  createPost(
    '📚 Formation gratuite : Techniques de compostage',
    'Formation pratique de 3 jours sur le compostage organisée à Yaoundé du 15 au 17 février. Apprenez à transformer vos déchets en or noir ! Inscription gratuite mais places limitées. Contactez la Chambre d\'Agriculture pour vous inscrire.',
    'agriculture',
    'announcement'
  );

  createPost(
    '🎉 Succès : 500 régimes de plantain récoltés !',
    'Je viens de terminer ma récolte : 500 régimes de plantain sur 1 hectare ! Mon secret : bon espacement (3m x 3m), fumure organique, et rejets sélectionnés. Investissement de 600 000 FCFA, revenu de 3 millions FCFA. Le plantain est vraiment rentable quand on maîtrise la technique !',
    'agriculture',
    'success_story',
    true,
    '/plantain-fresh.png'
  );

  // === AGRICULTURE - QUESTIONS & RÉPONSES ===
  createPost(
    '❓ Quelle densité pour le maïs ?',
    'Question fréquente : Pour le maïs, je recommande 62 500 plants/hectare, soit 80cm entre les lignes et 20cm entre les plants. Pour les variétés précoces, vous pouvez augmenter légèrement la densité. N\'oubliez pas : une bonne densité = meilleur rendement !',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '🌽 Calendrier cultural pour le Centre',
    'Région Centre - Calendrier recommandé : Mars-Avril : Maïs, arachide. Mai-Juin : Manioc, macabo. Juillet-Août : Haricot, légumes. Septembre-Octobre : Préparation sols. Adaptez selon votre micro-climat local. Notez bien ces dates !',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '🔬 Analyse de sol : Pourquoi c\'est important',
    'Beaucoup négligent l\'analyse de sol. C\'est une erreur ! Une analyse vous dit exactement quels engrais utiliser et en quelle quantité. Coût : 15 000 à 25 000 FCFA. Économies réalisées : jusqu\'à 40% sur les intrants. Rentabilité garantie !',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '🌾 Rotation des cultures : Le guide complet',
    'Ne plantez jamais la même culture 2 années de suite ! Rotation recommandée : Année 1 : Maïs. Année 2 : Haricot/niébé (fixe l\'azote). Année 3 : Tomate/légumes. Année 4 : Retour au maïs. Cette rotation maintient la fertilité du sol et réduit les maladies.',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '💡 Astuce : Germination rapide des semences',
    'Pour accélérer la germination : Trempez vos graines dans l\'eau tiède pendant 12h. Ajoutez une cuillère de miel (stimule la germination). Semez immédiatement après. Gain de temps : 2-3 jours. Taux de germination amélioré de 20% !',
    'agriculture',
    'tip'
  );

  // === AGRICULTURE - ALERTES & AVERTISSEMENTS ===
  createPost(
    '⚠️ Alerte : Chenilles légionnaires signalées',
    'Attention ! Des chenilles légionnaires ont été signalées dans la région de l\'Ouest. Elles attaquent le maïs, le riz et le sorgho. Inspectez vos champs quotidiennement. Traitement recommandé : Bacillus thuringiensis ou ramassage manuel. Agissez vite !',
    'agriculture',
    'warning'
  );

  createPost(
    '🌧️ Prévisions météo : Pluies précoces attendues',
    'Bonne nouvelle ! Les prévisions annoncent des pluies précoces cette année. Préparez vos champs dès maintenant pour profiter de ces premières pluies. Labourez, apportez le fumier, et ayez vos semences prêtes. Qui est prêt gagne !',
    'agriculture',
    'announcement'
  );

  createPost(
    '🚜 Nouveau : Service de labour mécanisé',
    'Je propose mes services de labour avec tracteur dans les régions Centre et Littoral. Tarif : 25 000 FCFA/hectare. Disponible dès maintenant. Réservez tôt pour la saison ! Contact : 237 6XX XXX XXX',
    'agriculture',
    'announcement'
  );

  createPost(
    '🌱 Semences certifiées disponibles',
    'Semences certifiées de maïs (variétés CMS 8704, Kasai) maintenant disponibles. Prix : 3 500 FCFA/kg. Rendement garanti : 4-6 tonnes/ha. Stock limité. Commandez avant rupture ! Livraison possible dans toute la région.',
    'agriculture',
    'announcement'
  );

  createPost(
    '📊 Prix du marché cette semaine',
    'Prix moyens au marché de Yaoundé : Tomate 800 FCFA/kg, Oignon 600 FCFA/kg, Maïs 250 FCFA/kg, Haricot 1200 FCFA/kg, Plantain 150 FCFA/régime. Tendance à la hausse pour les légumes. Bon moment pour vendre !',
    'agriculture',
    'announcement'
  );

  // === ÉLEVAGE - CONSEILS EXPERTS SAISON SÈCHE ===
  createPost(
    '🐄 Saison sèche : Préparez l\'alimentation de vos animaux',
    'La saison sèche arrive ! Il vous faut absolument constituer des réserves de fourrage dès maintenant. Fauchez et conservez l\'herbe en foin. Prévoyez aussi des aliments concentrés (tourteau, son). Un animal bien nourri = un animal productif !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '💧 Abreuvement en saison sèche',
    'L\'eau est vitale ! En saison sèche, un bovin boit 40-60L/jour, une chèvre 3-5L/jour, un poulet 0.5L/jour. Assurez-vous d\'avoir des points d\'eau suffisants. Nettoyez les abreuvoirs quotidiennement. L\'eau sale = maladies !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🐓 Volaille : Attention à la chaleur !',
    'Avec la saison sèche, vos poulets vont souffrir de la chaleur. Solutions : Ombrage suffisant, ventilation, eau fraîche en permanence. Ajoutez des vitamines C dans l\'eau (anti-stress thermique). Réduisez la densité dans les poulaillers.',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🐷 Porcs : Gestion de la chaleur',
    'Les porcs ne transpirent pas ! En saison sèche, ils sont très sensibles à la chaleur. Créez des zones de boue pour qu\'ils se rafraîchissent. Mouillez le sol de la porcherie. Donnez à manger tôt le matin et tard le soir. Température idéale : 18-24°C.',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🐐 Chèvres : Complémentation alimentaire',
    'En saison sèche, l\'herbe se raréfie. Complétez l\'alimentation de vos chèvres avec : feuilles de manioc, épluchures, son de maïs, tourteau. Une chèvre bien nourrie produit plus de lait et de viande. Investissez dans l\'alimentation !',
    'elevage',
    'expert_advice'
  );

  // === ÉLEVAGE - CONSEILS PRATIQUES ===
  createPost(
    '💉 Calendrier de vaccination',
    'Vaccinations essentielles : Bovins - Péripneumonie (tous les 6 mois), Charbon (annuel). Volaille - Newcastle (tous les 3 mois), Gumboro (21 jours). Porcs - Peste porcine (annuel). Chèvres - Peste des petits ruminants (annuel). Notez ces dates !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🏥 Trousse de premiers soins pour éleveurs',
    'Ayez toujours : Thermomètre, seringues, antibiotiques (Terramycine), anti-parasitaires, désinfectant (Bétadine), pansements, gants. Coût total : ~15 000 FCFA. Peut sauver vos animaux en urgence !',
    'elevage',
    'tip'
  );

  createPost(
    '🥚 Augmenter la ponte de vos poules',
    'Mes astuces pour plus d\'œufs : 1) Lumière 14-16h/jour, 2) Aliment riche en protéines (18%), 3) Calcium (coquilles d\'huîtres broyées), 4) Eau propre en permanence, 5) Nids confortables. Résultat : +30% de ponte !',
    'elevage',
    'tip'
  );

  createPost(
    '🐟 Pisciculture : Densité d\'empoissonnement',
    'Pour un bac de 2m x 1m (2m³) : 100-150 alevins de poisson-chat. Nourrissez 2-3 fois/jour (3-5% du poids total). Changez 20% de l\'eau chaque semaine. Récolte après 5-6 mois. Rendement : 30-40 kg de poisson !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🐓 Démarrer un poulailler : Budget réaliste',
    'Pour 100 poulets de chair : Poussin 250 FCFA x 100 = 25 000. Aliment 45 jours x 100 = 180 000. Vaccins et médicaments = 15 000. Infrastructure = 50 000. Total : 270 000 FCFA. Revenu attendu : 450 000 FCFA. Bénéfice : 180 000 FCFA en 45 jours !',
    'elevage',
    'expert_advice'
  );

  // === ÉLEVAGE - ANNONCES ===
  createPost(
    '📢 Formation : Élevage moderne de porcs',
    'Formation de 5 jours sur l\'élevage porcin moderne. Programme : Alimentation, santé, reproduction, gestion. Dates : 20-24 février à Douala. Coût : 50 000 FCFA (hébergement inclus). Certificat délivré. Inscriptions ouvertes !',
    'elevage',
    'announcement'
  );

  createPost(
    '🏆 Concours du meilleur éleveur 2024',
    'Le Ministère de l\'Élevage organise le concours du meilleur éleveur. Prix : 1er = 2 millions FCFA, 2ème = 1 million, 3ème = 500 000. Catégories : Bovins, Porcs, Volaille, Pisciculture. Dossiers avant le 28 février. Tentez votre chance !',
    'elevage',
    'announcement'
  );

  createPost(
    '💰 Crédit élevage : Taux réduit',
    'Nouvelle offre de crédit pour éleveurs : Taux 5% sur 2 ans. Montant : 500 000 à 5 millions FCFA. Garantie : Caution solidaire. Dossier simple. Contactez votre coopérative ou la banque agricole. Opportunité à saisir !',
    'elevage',
    'announcement'
  );

  createPost(
    '🐄 Vente de géniteurs de qualité',
    'Taureaux reproducteurs race Goudali disponibles. Âge : 2-3 ans. Prix : 350 000 - 500 000 FCFA. Excellente génétique. Certificat sanitaire fourni. Région Adamaoua. Contact pour visite.',
    'elevage',
    'announcement'
  );

  createPost(
    '🎉 Succès : De 10 à 100 poules en 1 an !',
    'Mon témoignage : J\'ai commencé avec 10 poules pondeuses il y a 1 an. Aujourd\'hui j\'en ai 100 ! Revenus mensuels : 120 000 FCFA (œufs + vente poussins). Mon secret : Bonne alimentation, suivi sanitaire rigoureux, réinvestissement des bénéfices. C\'est possible !',
    'elevage',
    'success_story',
    true,
    '/poulet-chair.png'
  );

  // === ÉLEVAGE - SANTÉ ANIMALE ===
  createPost(
    '⚠️ Alerte : Grippe aviaire - Mesures préventives',
    'Cas de grippe aviaire signalés dans la région Nord. Mesures : Isolez vos volailles, désinfectez quotidiennement, limitez les visiteurs, signalez tout oiseau mort. Vaccination recommandée. Soyez vigilants !',
    'elevage',
    'warning'
  );

  createPost(
    '🔬 Parasites internes : Déparasitage obligatoire',
    'Déparasitez vos animaux tous les 3 mois ! Signes de parasites : Amaigrissement, poil terne, diarrhée, baisse de production. Produits efficaces : Ivermectine, Albendazole. Coût : 500-2000 FCFA/animal. Négligence = pertes !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🐓 Coccidiose chez les poulets : Prévention',
    'La coccidiose tue 30% des poussins ! Prévention : Litière sèche, anticoccidien dans l\'eau (jours 1-5), hygiène stricte. Symptômes : Diarrhée sanglante, plumes ébouriffées. Traitement : Amprolium. Agissez vite !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '🐷 Peste porcine africaine : Restez vigilant',
    'La peste porcine est mortelle à 100% ! Aucun traitement. Seule solution : PRÉVENTION. Vaccinez, isolez les nouveaux porcs 21 jours, désinfectez, évitez les restes de cuisine. Un porc malade = abattage de tout le troupeau !',
    'elevage',
    'warning'
  );

  createPost(
    '🐐 Mammite chez les chèvres laitières',
    'Mammite = perte de production ! Prévention : Traite hygiénique, désinfection des trayons, litière propre. Traitement : Antibiotiques intra-mammaires. Détection précoce = guérison rapide. Inspectez le pis quotidiennement !',
    'elevage',
    'expert_advice'
  );

  // === ÉLEVAGE - ALIMENTATION ===
  createPost(
    '🌾 Fabriquer son aliment volaille maison',
    'Recette économique (100kg) : Maïs 60kg, Tourteau soja 20kg, Son de blé 10kg, Farine de poisson 5kg, Coquilles 3kg, Sel 0.5kg, Prémix 1.5kg. Coût : ~18 000 FCFA vs 25 000 FCFA du commerce. Économie : 28% !',
    'elevage',
    'tip'
  );

  createPost(
    '🐄 Bloc multi-nutritionnel pour bovins',
    'En saison sèche, donnez des blocs à lécher. Recette : Mélasse 40%, Urée 5%, Son 30%, Ciment 10%, Sel 5%, Minéraux 10%. Moule et laisse sécher 7 jours. Améliore la digestion et la production !',
    'elevage',
    'tip'
  );

  createPost(
    '🐟 Aliment poisson fait maison',
    'Formule économique : Farine de poisson 40%, Tourteau soja 30%, Son de riz 20%, Farine de maïs 10%. Ajoutez vitamines. Granulés de 2-5mm. Coût réduit de 40% vs aliment commercial. Croissance identique !',
    'elevage',
    'tip'
  );

  createPost(
    '🐓 Verdure pour les poules : Importance',
    'Les poules ont besoin de verdure ! Donnez : Feuilles de manioc, moringa, amarante, herbe fraîche. Avantages : Jaune d\'œuf plus foncé, meilleure santé, économie d\'aliment. 20-30% de l\'alimentation en verdure !',
    'elevage',
    'tip'
  );

  createPost(
    '🐷 Engraissement rapide des porcs',
    'Pour un engraissement optimal : Aliment 16-18% protéines, 3 repas/jour, eau à volonté, vermifuge tous les 2 mois. Poids de vente (90-100kg) atteint en 6 mois. Gain moyen : 500-600g/jour. Rentabilité maximale !',
    'elevage',
    'expert_advice'
  );

  // === POSTS SUPPLÉMENTAIRES VARIÉS ===
  createPost(
    '📱 Application mobile pour éleveurs',
    'Nouvelle appli gratuite "Élevage Pro" : Suivi sanitaire, rappels vaccination, calcul ration alimentaire, prix du marché. Disponible sur Android et iOS. Téléchargez maintenant ! Déjà 5000 utilisateurs satisfaits.',
    'elevage',
    'announcement'
  );

  createPost(
    '🌍 Changement climatique : Adapter son élevage',
    'Le climat change, adaptons-nous ! Choisissez des races résistantes (Goudali, Djallonké). Investissez dans l\'ombrage et la ventilation. Diversifiez (volaille + petits ruminants). Constituez des réserves fourragères. Anticipation = survie !',
    'elevage',
    'expert_advice'
  );

  createPost(
    '💼 Coopérative d\'éleveurs : Rejoignez-nous !',
    'Notre coopérative compte 150 membres. Avantages : Achat groupé d\'intrants (-20%), vente groupée (meilleurs prix), formations gratuites, accès au crédit. Cotisation : 5000 FCFA/an. Ensemble on est plus forts !',
    'elevage',
    'announcement'
  );

  createPost(
    '🌱 Cultures fourragères à planter maintenant',
    'Plantez dès maintenant pour la saison sèche : Brachiaria, Panicum, Stylosanthes, Mucuna. Ces cultures fourragères résistent bien et nourrissent vos animaux. 1 hectare nourrit 10 bovins pendant 3 mois !',
    'agriculture',
    'expert_advice'
  );

  createPost(
    '🚰 Système d\'irrigation solaire',
    'Investissez dans le solaire ! Pompe solaire 1CV = 300 000 FCFA. Aucun coût d\'électricité. Durée de vie : 15 ans. Irrigue 1 hectare. Rentabilité en 2 ans. L\'avenir de l\'agriculture !',
    'agriculture',
    'announcement'
  );

  createPost(
    '🌿 Agriculture biologique : Certification',
    'La demande en bio explose ! Certification bio = prix +50%. Processus : 3 ans de transition, contrôles annuels. Coût : 100 000 FCFA/an. Marchés : Export Europe, supermarchés locaux. Opportunité en or !',
    'agriculture',
    'announcement'
  );

  createPost(
    '🎓 Bourse d\'études en agronomie',
    'Le gouvernement offre 100 bourses pour études en agronomie. Niveau : Licence et Master. Destinations : Maroc, Sénégal, Côte d\'Ivoire. Dossiers avant le 15 mars. Critères : Bac scientifique, moins de 25 ans. Informez-vous !',
    'agriculture',
    'announcement'
  );

  // Shuffle posts to randomize order
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return shuffleArray(posts);
};
