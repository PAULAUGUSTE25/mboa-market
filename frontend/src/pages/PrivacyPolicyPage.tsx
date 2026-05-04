import { Shield, Lock, Database, Key, Server, Eye, FileCheck } from 'lucide-react'
import BackButton from '../components/BackButton'
import { useLanguage } from '../contexts/LanguageContext'

export default function PrivacyPolicyPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-[#3F441C]" />
            <h1 className="text-4xl font-bold text-gray-800">{t('Politique de Confidentialité', 'Privacy Policy')}</h1>
          </div>

          <div className="prose max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('1. Informations que nous collectons', '1. Information we collect')}</h2>
              <p>
                {t('Nous collectons les informations que vous nous fournissez directement, notamment votre nom, adresse e-mail, numéro de téléphone, localisation, et toute autre information que vous choisissez de fournir lors de l\'utilisation de MBOA Market.', 'We collect information you provide directly, including your name, email address, phone number, location, and any other information you choose to provide when using MBOA Market.')}
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>{t('Informations de profil (nom, photo, domaine d\'activité)', 'Profile information (name, photo, business domain)')}</li>
                <li>{t('Informations de contact (email, téléphone)', 'Contact information (email, phone)')}</li>
                <li>{t('Données de localisation pour les transactions', 'Location data for transactions')}</li>
                <li>{t('Historique des publications et transactions', 'Publication and transaction history')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('2. Comment nous utilisons vos informations', '2. How we use your information')}</h2>
              <p>
                {t('Nous utilisons les informations collectées pour fournir, maintenir et améliorer nos services, communiquer avec vous, faciliter les transactions entre agriculteurs et éleveurs, et protéger la sécurité de nos utilisateurs.', 'We use collected information to provide, maintain and improve our services, communicate with you, facilitate transactions between farmers and breeders, and protect the safety of our users.')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('3. Partage d\'informations', '3. Information Sharing')}</h2>
              <p>
                {t('Nous ne partageons pas vos informations personnelles avec des tiers, sauf dans les cas suivants :', 'We do not share your personal information with third parties, except in the following cases:')}
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>{t('Avec votre consentement explicite', 'With your explicit consent')}</li>
                <li>{t('Pour faciliter les transactions que vous initiez', 'To facilitate transactions you initiate')}</li>
                <li>{t('Pour se conformer aux obligations légales', 'To comply with legal obligations')}</li>
                <li>{t('Pour protéger nos droits et la sécurité de nos utilisateurs', 'To protect our rights and the safety of our users')}</li>
              </ul>
            </section>

            <section className="bg-green-50 p-6 rounded-lg border-l-4 border-[#3F441C]">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-6 h-6 text-[#3F441C]" />
                <h2 className="text-2xl font-bold text-gray-800">{t('4. Sécurité des données - Technologies utilisées', '4. Data Security - Technologies Used')}</h2>
              </div>
              <p className="mb-4 font-semibold text-gray-800">
                {t('Nous prenons la sécurité de vos données très au sérieux. Voici les technologies et mesures que nous utilisons pour protéger vos informations :', 'We take the security of your data very seriously. Here are the technologies and measures we use to protect your information:')}
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Key className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">{t('Chiffrement des données (Encryption)', 'Data Encryption')}</h3>
                    <p className="text-sm">
                      <strong>HTTPS/TLS 1.3</strong> : {t('Toutes les communications entre votre appareil et nos serveurs sont chiffrées avec le protocole TLS 1.3, garantissant que vos données ne peuvent pas être interceptées pendant la transmission.', 'All communications between your device and our servers are encrypted with the TLS 1.3 protocol, ensuring that your data cannot be intercepted during transmission.')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Database className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">{t('Chiffrement de la base de données', 'Database Encryption')}</h3>
                    <p className="text-sm">
                      <strong>AES-256</strong> : {t('Vos mots de passe sont hachés avec bcrypt (algorithme de hachage sécurisé) et toutes les données sensibles sont chiffrées au repos avec AES-256, l\'un des standards de chiffrement les plus robustes.', 'Your passwords are hashed with bcrypt (a secure hashing algorithm) and all sensitive data is encrypted at rest with AES-256, one of the most robust encryption standards.')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Server className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">{t('Infrastructure sécurisée', 'Secure Infrastructure')}</h3>
                    <p className="text-sm">
                      <strong>Supabase</strong> : {t('Nous utilisons Supabase, une plateforme certifiée SOC 2 Type II, qui garantit des normes de sécurité strictes. Nos serveurs sont hébergés dans des centres de données sécurisés avec surveillance 24/7.', 'We use Supabase, a SOC 2 Type II certified platform, which guarantees strict security standards. Our servers are hosted in secure data centers with 24/7 monitoring.')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Eye className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">{t('Authentification sécurisée', 'Secure Authentication')}</h3>
                    <p className="text-sm">
                      <strong>JWT (JSON Web Tokens)</strong> : {t('Nous utilisons des tokens JWT pour l\'authentification, avec expiration automatique et renouvellement sécurisé. Vos sessions sont protégées contre les attaques CSRF et XSS.', 'We use JWT tokens for authentication, with automatic expiration and secure renewal. Your sessions are protected against CSRF and XSS attacks.')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FileCheck className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">{t('Contrôle d\'accès et audits', 'Access Control and Audits')}</h3>
                    <p className="text-sm">
                      <strong>Row Level Security (RLS)</strong> : {t('Chaque utilisateur ne peut accéder qu\'à ses propres données grâce à des politiques de sécurité au niveau des lignes. Nous effectuons des audits réguliers de sécurité et des tests de pénétration.', 'Each user can only access their own data through Row Level Security (RLS) policies. We conduct regular security audits and penetration testing.')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">{t('Protection contre les attaques', 'Protection Against Attacks')}</h3>
                    <p className="text-sm">
                      <strong>Pare-feu et WAF</strong> : {t('Nous utilisons des pare-feu applicatifs (Web Application Firewall) pour bloquer les tentatives d\'intrusion, les attaques DDoS, et les injections SQL. Surveillance en temps réel des activités suspectes.', 'We use Web Application Firewalls (WAF) to block intrusion attempts, DDoS attacks, and SQL injections. Real-time monitoring of suspicious activities.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded border border-[#3F441C]/20">
                <p className="text-sm font-semibold text-gray-800">
                  🔒 {t('Engagement de sécurité : Nous mettons à jour régulièrement nos systèmes de sécurité et suivons les meilleures pratiques de l\'industrie (OWASP, GDPR) pour garantir la protection maximale de vos données personnelles.', 'Security Commitment: We regularly update our security systems and follow industry best practices (OWASP, GDPR) to ensure the maximum protection of your personal data.')}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('5. Vos droits', '5. Your Rights')}</h2>
              <p>
                {t('Conformément au RGPD et aux lois sur la protection des données, vous disposez des droits suivants :', 'In accordance with the GDPR and data protection laws, you have the following rights:')}
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>{t('Droit d\'accès', 'Right of access')}</strong> : {t('Consulter vos données personnelles à tout moment', 'Consult your personal data at any time')}</li>
                <li><strong>{t('Droit de rectification', 'Right to rectification')}</strong> : {t('Modifier ou corriger vos informations', 'Modify or correct your information')}</li>
                <li><strong>{t('Droit à l\'effacement', 'Right to erasure')}</strong> : {t('Supprimer votre compte et vos données', 'Delete your account and your data')}</li>
                <li><strong>{t('Droit à la portabilité', 'Right to data portability')}</strong> : {t('Récupérer vos données dans un format structuré', 'Retrieve your data in a structured format')}</li>
                <li><strong>{t('Droit d\'opposition', 'Right to object')}</strong> : {t('Refuser certains traitements de vos données', 'Refuse certain processing of your data')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('6. Conservation des données', '6. Data Retention')}</h2>
              <p>
                {t('Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Vous pouvez demander la suppression de vos données à tout moment.', 'We retain your personal data for as long as necessary to provide our services and comply with our legal obligations. You can request the deletion of your data at any time.')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('7. Nous contacter', '7. Contact Us')}</h2>
              <p>
                {t('Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous :', 'For any questions regarding this privacy policy or to exercise your rights, please contact us:')}
              </p>
              <ul className="list-none pl-0 mt-2 space-y-1">
                <li>📧 Email : <strong>sixcomp8@gmail.com</strong></li>
                <li>📱 {t('Téléphone :', 'Phone:')} <strong>+237 654 773 746</strong></li>
                <li>📍 {t('Adresse :', 'Address:')} <strong>Yaoundé, Cameroun</strong></li>
              </ul>
            </section>

            <p className="text-sm text-gray-600 mt-8 pt-4 border-t">
              {t('Dernière mise à jour : Avril 2026 | Propulsé par', 'Last updated: April 2026 | Powered by')} <strong>Ndefo Paul Auguste</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
