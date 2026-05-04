import { createContext, useContext, useState, ReactNode } from 'react'

interface Field {
  id: string
  name: string
  area: number
  crop: string
  plantingDate: string
  expectedHarvestDate: string
  soilHealth: number
  nitrogenLevel: number
  phosphorusLevel: number
  potassiumLevel: number
  phLevel: number
  moistureLevel: number
}

interface Insurance {
  provider: string
  type: string
  startDate: string
  expiryDate: string
  premium: number
  coverage: number
}

interface FinancialService {
  provider: string
  type: 'loan' | 'savings' | 'insurance'
  amount: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'pending'
}

interface UserFarmData {
  userId: string
  farmName: string
  totalArea: number
  region: string
  locality: string
  fields: Field[]
  crops: string[]
  insurance?: Insurance
  financialServices: FinancialService[]
  advisors: {
    id: string
    name: string
    specialty: string
    lastConsultation: string
  }[]
  equipment: {
    id: string
    name: string
    type: string
    status: 'operational' | 'maintenance' | 'broken'
    lastMaintenance: string
  }[]
}

interface UserFarmContextType {
  farmData: UserFarmData
  updateFarmData: (data: Partial<UserFarmData>) => void
  addField: (field: Field) => void
  updateField: (fieldId: string, updates: Partial<Field>) => void
  deleteField: (fieldId: string) => void
}

const UserFarmContext = createContext<UserFarmContextType | undefined>(undefined)

export function UserFarmProvider({ children }: { children: ReactNode }) {
  const [farmData, setFarmData] = useState<UserFarmData>({
    userId: 'user-001',
    farmName: 'Ferme Agricole MBOA',
    totalArea: 192, // hectares (converti de 475 acres)
    region: 'Centre',
    locality: 'Yaoundé',
    fields: [
      {
        id: 'field-1',
        name: 'Champ Nord A',
        area: 48, // hectares
        crop: 'Maïs',
        plantingDate: '2024-01-15',
        expectedHarvestDate: '2024-04-20',
        soilHealth: 77,
        nitrogenLevel: 65,
        phosphorusLevel: 72,
        potassiumLevel: 68,
        phLevel: 6.5,
        moistureLevel: 45
      },
      {
        id: 'field-2',
        name: 'Champ Sud B',
        area: 60, // hectares
        crop: 'Cacao',
        plantingDate: '2023-11-20',
        expectedHarvestDate: '2024-05-10',
        soilHealth: 81,
        nitrogenLevel: 70,
        phosphorusLevel: 75,
        potassiumLevel: 73,
        phLevel: 6.8,
        moistureLevel: 52
      },
      {
        id: 'field-3',
        name: 'Champ Est C',
        area: 38, // hectares
        crop: 'Plantain',
        plantingDate: '2024-02-01',
        expectedHarvestDate: '2024-06-15',
        soilHealth: 65,
        nitrogenLevel: 45,
        phosphorusLevel: 68,
        potassiumLevel: 62,
        phLevel: 6.2,
        moistureLevel: 38
      },
      {
        id: 'field-4',
        name: 'Champ Ouest D',
        area: 46, // hectares
        crop: 'Manioc',
        plantingDate: '2024-03-10',
        expectedHarvestDate: '2024-08-25',
        soilHealth: 45,
        nitrogenLevel: 35,
        phosphorusLevel: 55,
        potassiumLevel: 48,
        phLevel: 5.8,
        moistureLevel: 30
      }
    ],
    crops: ['Maïs', 'Cacao', 'Plantain', 'Manioc'],
    insurance: {
      provider: 'AXA Assurances Cameroun',
      type: 'Assurance Récolte Multi-Risques',
      startDate: '2024-01-01',
      expiryDate: '2024-12-31',
      premium: 850000, // FCFA
      coverage: 25000000 // FCFA
    },
    financialServices: [
      {
        provider: 'Afriland First Bank',
        type: 'loan',
        amount: 5000000, // FCFA
        startDate: '2024-01-15',
        endDate: '2025-01-15',
        status: 'active'
      },
      {
        provider: 'AXA Assurances Cameroun',
        type: 'insurance',
        amount: 850000, // FCFA
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active'
      }
    ],
    advisors: [
      {
        id: 'adv-1',
        name: 'Dr. Kamga Jean',
        specialty: 'Agronomie - Cultures vivrières',
        lastConsultation: '2024-04-10'
      },
      {
        id: 'adv-2',
        name: 'Ing. Mballa Sarah',
        specialty: 'Protection des cultures',
        lastConsultation: '2024-04-05'
      },
      {
        id: 'adv-3',
        name: 'Prof. Nkolo Pierre',
        specialty: 'Analyse des sols',
        lastConsultation: '2024-03-28'
      }
    ],
    equipment: [
      {
        id: 'eq-1',
        name: 'Tracteur Massey Ferguson 385',
        type: 'Tracteur',
        status: 'operational',
        lastMaintenance: '2024-03-15'
      },
      {
        id: 'eq-2',
        name: 'Pulvérisateur 600L',
        type: 'Pulvérisateur',
        status: 'operational',
        lastMaintenance: '2024-04-01'
      },
      {
        id: 'eq-3',
        name: 'Charrue 3 socs',
        type: 'Charrue',
        status: 'maintenance',
        lastMaintenance: '2024-02-20'
      }
    ]
  })

  const updateFarmData = (data: Partial<UserFarmData>) => {
    setFarmData(prev => ({ ...prev, ...data }))
  }

  const addField = (field: Field) => {
    setFarmData(prev => ({
      ...prev,
      fields: [...prev.fields, field],
      totalArea: prev.totalArea + field.area
    }))
  }

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFarmData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const deleteField = (fieldId: string) => {
    setFarmData(prev => {
      const fieldToDelete = prev.fields.find(f => f.id === fieldId)
      return {
        ...prev,
        fields: prev.fields.filter(f => f.id !== fieldId),
        totalArea: prev.totalArea - (fieldToDelete?.area || 0)
      }
    })
  }

  return (
    <UserFarmContext.Provider value={{ farmData, updateFarmData, addField, updateField, deleteField }}>
      {children}
    </UserFarmContext.Provider>
  )
}

export function useUserFarm() {
  const context = useContext(UserFarmContext)
  if (context === undefined) {
    throw new Error('useUserFarm must be used within a UserFarmProvider')
  }
  return context
}
