import { Leaf, Sprout } from 'lucide-react';

interface SectorSwitcherProps {
  currentSector: 'agriculture' | 'elevage';
  onSectorChange: (sector: 'agriculture' | 'elevage') => void;
}

export default function SectorSwitcher({ currentSector, onSectorChange }: SectorSwitcherProps) {
  return (
    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
      <button
        onClick={() => onSectorChange('agriculture')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          currentSector === 'agriculture'
            ? 'bg-green-600 text-white shadow-lg'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <Leaf className="h-5 w-5" />
        <span className="font-medium">Agriculture</span>
      </button>
      
      <button
        onClick={() => onSectorChange('elevage')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          currentSector === 'elevage'
            ? 'bg-amber-600 text-white shadow-lg'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <Sprout className="h-5 w-5" />
        <span className="font-medium">Élevage</span>
      </button>
    </div>
  );
}
