import { createContext, useContext, useState, ReactNode } from 'react';
import { Domain } from '@/utils/colors';

interface DomainContextType {
  selectedDomain: Domain;
  setSelectedDomain: (domain: Domain) => void;
}

const DomainContext = createContext<DomainContextType>({
  selectedDomain: 'agriculture',
  setSelectedDomain: () => {},
});

export function DomainProvider({ children }: { children: ReactNode }) {
  const [selectedDomain, setSelectedDomain] = useState<Domain>('agriculture');

  return (
    <DomainContext.Provider value={{ selectedDomain, setSelectedDomain }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  return useContext(DomainContext);
}
