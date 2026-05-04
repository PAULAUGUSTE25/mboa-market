import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@/components/icons/UnifiedIcons'

interface BackButtonProps {
  to?: string
}

export default function BackButton({ to }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, #3F441C 0%, #4A4F23 100%)',
      }}
      title="Retour"
    >
      <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
    </button>
  )
}
