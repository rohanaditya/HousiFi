'use client'

import { useEffect, useState } from 'react'
import { getSepoliaSigner, useEthersSigner } from '@/lib/useEthersSigner'
import { buyShares } from '@/lib/buyShares'
import type { Property } from '@/types/property'

interface Props {
  property: Property
  shareType: 'major' | 'minor'
  tokenAmount: number
  onSuccess: () => void
  onProcessingChange?: (processing: boolean) => void
}

export default function BuySharesButton({
  property,
  shareType,
  tokenAmount,
  onSuccess,
  onProcessingChange,
}: Props) {
  const signer = useEthersSigner()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = shareType === 'major' ? 'Buy Majority Share' : 'Buy Minority Share'
  const usdcAmount = shareType === 'major'
    ? property.flat_price * 0.85
    : property.flat_price * 0.15
  const payLabel = `Pay ${usdcAmount.toLocaleString()} tUSDC`

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timer)
  }, [error])

  async function handleClick() {
    setLoading(true)
    onProcessingChange?.(true)
    setError(null)
    try {
      const activeSigner = await getSepoliaSigner(signer)

      if (!activeSigner) {
        throw new Error('Connect your wallet first')
      }

      const { txHash } = await buyShares(activeSigner, property.id, tokenAmount, usdcAmount)

      const res = await fetch('/api/investment/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          investorAddress: await activeSigner.getAddress(),
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
      onProcessingChange?.(false)
    }
  }

  return (
    <div className="buy-share-control" data-pay={payLabel}>
      <button
        className={shareType === 'major' ? 'btn-slide-primary' : 'btn-slide-ghost'}
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={`${label}. ${payLabel}`}
      >
        {loading ? 'Processing...' : label}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}
