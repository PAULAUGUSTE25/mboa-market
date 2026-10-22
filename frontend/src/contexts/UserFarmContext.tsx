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

const computeTotalArea = (fields: Field[]) =>
  fields.reduce((sum, field) => sum + (Number.isFinite(field.area) ? field.area : 0), 0)

export function UserFarmProvider({ children }: { children: ReactNode }) {
  const [farmData, setFarmData] = useState<UserFarmData>({
    userId: '',
    farmName: '',
    totalArea: 0,
    region: '',
    locality: '',
    fields: [],
    crops: [],
    financialServices: [],
    advisors: [],
    equipment: []
  })

  const updateFarmData = (data: Partial<UserFarmData>) => {
    setFarmData(prev => ({
      ...prev,
      ...data,
      totalArea: data.fields ? computeTotalArea(data.fields) : prev.totalArea
    }))
  }

  const addField = (field: Field) => {
    setFarmData(prev => {
      const fields = [...prev.fields, field]
      return {
        ...prev,
        fields,
        totalArea: computeTotalArea(fields)
      }
    })
  }

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFarmData(prev => {
      const fields = prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )

      return {
        ...prev,
        fields,
        totalArea: computeTotalArea(fields)
      }
    })
  }

  const deleteField = (fieldId: string) => {
    setFarmData(prev => {
      const fields = prev.fields.filter(f => f.id !== fieldId)
      return {
        ...prev,
        fields,
        totalArea: computeTotalArea(fields)
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
