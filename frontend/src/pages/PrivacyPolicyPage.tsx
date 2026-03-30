import { useTheme } from '@/contexts/ThemeContext';
import { getTextStyles } from '@/utils/cardStyles';
import { Shield, Lock, Eye, UserCheck, Database, Bell, Trash2, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: "Collecte des Données",
      content: `Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme :
      
• **Informations de compte** : Numéro de téléphone, email, nom d'affichage
• **Informations de profil** : Région, type d'activité (producteur, acheteur, fournisseur)
• **Données de transaction** : Historique des commandes, messages échangés
• **Données techniques** : Adresse IP, type d'appareil (pour la sécurité)

Nous ne collectons JAMAIS :
• Vos données bancaires directement (gérées par des prestataires certifiés)
• Vos contacts téléphoniques
• Votre localisation GPS précise sans consentement`
    },
    {
      icon: Lock,
      title: "Protection des Données",
      content: `Vos données sont protégées par plusieurs niveaux de sécurité :

• **Chiffrement** : Toutes les communications sont chiffrées (HTTPS)
• **Mots de passe** : Hashés avec l'algorithme bcrypt (impossible à récupérer)
• **Tokens JWT** : Sessions sécurisées avec expiration automatique
• **Authentification 2FA** : Option de double authentification disponible
• **Historique de connexion** : Surveillance des accès à votre compte`
    },
    {
      icon: Eye,
      title: "Utilisation des Données",
      content: `Vos données sont utilisées exclusivement pour :

• Permettre les transactions entre acheteurs et vendeurs
• Améliorer votre expérience sur la plateforme
• Vous envoyer des notifications importantes (commandes, messages)
• Assurer la sécurité de votre compte
• Générer des statistiques anonymisées pour améliorer nos services

Nous ne vendons JAMAIS vos données à des tiers.`
    },
    {
      icon: UserCheck,
      title: "Vos Droits",
      content: `Conformément à la loi camerounaise et au RGPD, vous avez le droit de :

• **Accès** : Consulter toutes vos données personnelles
• **Rectification** : Modifier vos informations à tout moment
• **Suppression** : Demander la suppression de votre compte et données
• **Portabilité** : Exporter vos données dans un format standard
• **Opposition** : Refuser certains traitements de données

Pour exercer ces droits, contactez-nous à : privacy@mboa-market.cm`
    },
    {
      icon: Bell,
      title: "Notifications et Communications",
      content: `Nous vous envoyons des notifications pour :

• Confirmations de commandes et mises à jour
• Messages reçus d'autres utilisateurs
• Alertes de sécurité (connexion suspecte, changement de mot de passe)
• Informations importantes sur votre compte

Vous pouvez gérer vos préférences de notification dans les paramètres de votre compte.`
    },
    {
      icon: Trash2,
      title: "Conservation et Suppression",
      content: `Durée de conservation de vos données :

• **Données de compte** : Conservées tant que votre compte est actif
• **Historique des transactions** : 5 ans (obligation légale)
• **Messages** : 2 ans après la dernière activité
• **Logs de connexion** : 1 an

Après suppression de votre compte :
• Vos données personnelles sont effacées sous 30 jours
• Les données anonymisées peuvent être conservées pour statistiques`
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: getTextStyles(theme).title }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #2E7D32, #1B5E20)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: getTextStyles(theme).title }}>
                Politique de Confidentialité
              </h1>
              <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                Dernière mise à jour : Février 2026
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className={`rounded-2xl p-6 mb-8 ${theme === 'dark' ? 'bg-[#2E7D32]/10 border border-[#2E7D32]/20' : 'bg-[#2E7D32]/5 border border-[#2E7D32]/20'}`}>
          <p className="text-sm leading-relaxed" style={{ color: getTextStyles(theme).body }}>
            Chez <strong>MBOA Market</strong>, la protection de vos données personnelles est notre priorité. 
            Cette politique explique comment nous collectons, utilisons et protégeons vos informations. 
            En utilisant notre plateforme, vous acceptez les pratiques décrites ci-dessous.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 border transition-all hover:shadow-lg ${
                theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  theme === 'dark' ? 'bg-[#2E7D32]/20' : 'bg-[#2E7D32]/10'
                }`}>
                  <section.icon className="w-6 h-6" style={{ color: '#2E7D32' }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-3" style={{ color: getTextStyles(theme).title }}>
                    {section.title}
                  </h2>
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: getTextStyles(theme).body }}
                  >
                    {section.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className={`rounded-2xl p-6 mt-8 ${theme === 'dark' ? 'bg-white/[0.02] border border-white/10' : 'bg-white border border-gray-100 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6" style={{ color: '#2E7D32' }} />
            <h2 className="text-lg font-bold" style={{ color: getTextStyles(theme).title }}>
              Nous Contacter
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: getTextStyles(theme).body }}>
            Pour toute question concernant cette politique ou vos données personnelles :
          </p>
          <div className="space-y-2 text-sm" style={{ color: getTextStyles(theme).muted }}>
            <p>📧 Email : <a href="mailto:privacy@mboa-market.cm" className="hover:underline" style={{ color: '#2E7D32' }}>privacy@mboa-market.cm</a></p>
            <p>📞 Téléphone : +237 6XX XXX XXX</p>
            <p>📍 Adresse : Douala, Cameroun</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4">
          <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
            © 2026 MBOA Market. Tous droits réservés.
          </p>
        </div>
      </main>
    </div>
  );
}
