import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sprout, Beef, Users } from 'lucide-react';
import SectorCard from '@/components/SectorCard';
import { useTheme } from '@/contexts/ThemeContext';

export default function ExpertsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const sectors = [
    {
      id: 'agriculture',
      title: 'AGRICULTURE',
      subtitle: 'Cultures et Produits Agricoles',
      description: 'Accédez au plus large choix de semences, plants et de semences du pays',
      icon: Sprout,
      iconColor: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
      tags: [
        { label: '🌱 Semences', icon: '' },
        { label: '🌾 Légumes', icon: '' },
        { label: '🍎 Fruits', icon: '' },
        { label: '🌿 Céréales', icon: '' },
      ],
      buttonText: 'ENTRER DANS LE MARCHÉ',
      buttonColor: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
    },
    {
      id: 'elevage',
      title: 'ÉLEVAGE',
      subtitle: 'Animaux et Produits d\'Élevage',
      description: 'Trouvez les meilleurs animaux et produits d\'élevage pour votre ferme',
      icon: Beef,
      iconColor: 'linear-gradient(135deg, #D4AF37 0%, #C9A227 100%)',
      tags: [
        { label: '🐄 Bovins', icon: '' },
        { label: '🐔 Volailles', icon: '' },
        { label: '🐷 Porcins', icon: '' },
        { label: '🐟 Poissons', icon: '' },
      ],
      buttonText: 'DÉCOUVRIR LES OFFRES',
      buttonColor: 'linear-gradient(135deg, #D2691E 0%, #C85A17 100%)',
    },
    {
      id: 'fournisseurs',
      title: 'FOURNISSEURS',
      subtitle: 'Semences et Animaux',
      description: 'Connectez-vous avec les meilleurs fournisseurs certifiés',
      icon: Users,
      iconColor: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
      tags: [
        { label: '✓ Certifiés', icon: '' },
        { label: '📦 Livraison', icon: '' },
        { label: '💰 Prix Pro', icon: '' },
        { label: '🏆 Qualité', icon: '' },
      ],
      buttonText: 'VOIR LES FOURNISSEURS',
      buttonColor: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sectors.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sectors.length) % sectors.length);
  };


  return (
    <div className="min-h-screen flex flex-col relative font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/background pic.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-black/40'}`} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header avec boutons */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>
            <div className="flex items-center gap-4">
              <button
                className="px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border border-emerald-500/50"
              >
                Se Connecter
              </button>
              <button
                className="px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="relative w-full max-w-6xl">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-sm shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-sm shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Cards Container */}
            <div className="overflow-hidden px-16">
              <div 
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * (320 + 24)}px)`,
                }}
              >
                {sectors.map((sector) => (
                  <SectorCard
                    key={sector.id}
                    title={sector.title}
                    subtitle={sector.subtitle}
                    description={sector.description}
                    icon={sector.icon}
                    iconColor={sector.iconColor}
                    tags={sector.tags}
                    buttonText={sector.buttonText}
                    buttonColor={sector.buttonColor}
                    onAction={() => navigate(`/${sector.id}`)}
                  />
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {sectors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index ? 'bg-emerald-500 scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
