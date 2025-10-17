"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useReferralStore } from "@/lib/store/referral-store"
import { toast } from "sonner"

interface ReferralHandlerProps {
  eventId: number
}

export function ReferralHandler({ eventId }: ReferralHandlerProps) {
  const searchParams = useSearchParams()
  const { setReferral, hasReferral } = useReferralStore()
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    const refCode = searchParams.get('ref')

    // Si no hay código en URL o ya tenemos un referido válido, no hacer nada
    if (!refCode || hasReferral()) {
      return
    }

    const validateAndSetReferral = async () => {
      setIsValidating(true)

      try {
        const res = await fetch(
          `/api/referrals/validate?code=${encodeURIComponent(refCode)}&eventId=${eventId}`
        )

        const data = await res.json()

        if (data.valid && data.rrpp) {
          // Guardar el referido en el store
          setReferral({
            code: data.rrpp.code,
            rrppName: data.rrpp.name,
            rrppId: data.rrpp.id,
            capturedAt: Date.now(),
          })

          // Mostrar toast de confirmación
          toast.success(`Comprando con referido de ${data.rrpp.name}`, {
            duration: 3000,
          })
        } else {
          // Código inválido, mostrar error discreto
          console.warn('Invalid referral code:', refCode)
        }
      } catch (error) {
        console.error('Error validating referral:', error)
      } finally {
        setIsValidating(false)
      }
    }

    validateAndSetReferral()
  }, [searchParams, eventId, setReferral, hasReferral])

  // Este componente no renderiza nada
  return null
}
