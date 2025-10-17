import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReferralInfo {
  code: string
  rrppName: string
  rrppId: number
  capturedAt: number
}

interface ReferralState {
  referralInfo: ReferralInfo | null
  setReferral: (info: ReferralInfo) => void
  clearReferral: () => void
  hasReferral: () => boolean
  getReferralCode: () => string | null
  getReferralId: () => number | null
  isExpired: () => boolean
}

const REFERRAL_EXPIRY_DAYS = 7
const REFERRAL_EXPIRY_MS = REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000

const referralStore = (
  set: (partial: Partial<ReferralState> | ((state: ReferralState) => Partial<ReferralState>)) => void,
  get: () => ReferralState
): ReferralState => ({
  referralInfo: null,

  setReferral: (info: ReferralInfo) => {
    set({ referralInfo: { ...info, capturedAt: Date.now() } })
  },

  clearReferral: () => {
    set({ referralInfo: null })
  },

  hasReferral: () => {
    const { referralInfo, isExpired } = get()
    if (!referralInfo) return false
    if (isExpired()) {
      get().clearReferral()
      return false
    }
    return true
  },

  getReferralCode: () => {
    const { hasReferral, referralInfo } = get()
    return hasReferral() ? referralInfo!.code : null
  },

  getReferralId: () => {
    const { hasReferral, referralInfo } = get()
    return hasReferral() ? referralInfo!.rrppId : null
  },

  isExpired: () => {
    const { referralInfo } = get()
    if (!referralInfo) return true
    const elapsed = Date.now() - referralInfo.capturedAt
    return elapsed > REFERRAL_EXPIRY_MS
  }
})

export const useReferralStore = create<ReferralState>()(
  persist(referralStore as any, {
    name: 'referral-storage',
    skipHydration: typeof window === 'undefined',
  })
)
