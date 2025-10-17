"use client"

import { useReferralStore } from "@/lib/store/referral-store"
import { useHydration } from "@/lib/hooks/use-hydration"
import { User, X } from "lucide-react"

interface ReferralBadgeProps {
  compact?: boolean
  showClose?: boolean
}

export function ReferralBadge({ compact = false, showClose = false }: ReferralBadgeProps) {
  const { referralInfo, hasReferral, clearReferral } = useReferralStore()
  const isHydrated = useHydration()

  if (!isHydrated || !hasReferral() || !referralInfo) {
    return null
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-3 py-1">
        <User className="h-3 w-3 text-purple-400" />
        <span className="text-xs font-medium text-purple-300">
          {referralInfo.rrppName}
        </span>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-3">
      {showClose && (
        <button
          onClick={clearReferral}
          className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label="Remover referido"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30">
          <User className="h-5 w-5 text-purple-300" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-neutral-400">Invitado por</p>
          <p className="text-sm font-semibold text-purple-300">
            {referralInfo.rrppName}
          </p>
        </div>
      </div>
    </div>
  )
}
