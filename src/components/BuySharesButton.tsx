'use client'

import { useState } from 'react'
import { useEthersSigner } from '@/lib/useEthersSigner'
import { buyShares } from '@/lib/buyShares'
import type { Property } from '@/types/property'

interface Props {
  property: Property
  shareType: 'major' | 'minor'
  tokenAmount: number
  onSuccess: () => void
}

export default function BuySharesButton({ property, shareType, tokenAmount, onSuccess }: Props) {
  const signer = useEthersSigner()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = shareType === 'major' ? 'Buy Majority Share' : 'Buy Minority Share'
  const usdcAmount = shareType === 'major'
    ? property.flat_price * 0.85
    : property.flat_price * 0.15

  async function handleClick() {
    if (!signer) {
      setError('Connect your wallet first')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { txHash } = await buyShares(signer, property.id, tokenAmount, usdcAmount)

      const res = await fetch('/api/investment/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          investorAddress: await signer.getAddress(),
          tokenAmount,
          usdcPaid: usdcAmount,
          shareType,
          txHash,
        }),
      })

      if (!res.ok) {
        const { error: apiError } = await res.json()
        throw new Error(apiError ?? 'Failed to record investment')
      }

      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        className={shareType === 'major' ? 'btn-slide-primary' : 'btn-slide-ghost'}
        type="button"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Processing...' : label}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}
