'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface USDCModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function USDCModal({ isOpen, onClose }: USDCModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [txHash, setTxHash] = useState('')

  const equivalentUSD = amount ? (parseFloat(amount) * 1.0025).toFixed(4) : '0.0000'

  const handleClose = () => {
    setStatus('idle')
    setErrorMsg('')
    setTxHash('')
    onClose()
  }

  const handleReceive = async () => {
    if (!address || !amount || parseFloat(amount) <= 0) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, usdcAmount: amount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')

      setTxHash(data.usdcTxHash)
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        className="rounded-lg p-8 w-full max-w-md border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--gray-900)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {status === 'success' ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center py-2">
            <div
              className="flex items-center justify-center mb-4 text-2xl"
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(29,158,117,0.15)',
                border: '1px solid rgba(29,158,117,0.4)',
                color: 'var(--teal-300)',
              }}
            >✓</div>
            <h2 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Funds sent!
            </h2>
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {amount} USDC + 0.01 SepoliaETH dispatched to your wallet.
            </p>
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mb-6"
                style={{ color: 'var(--teal-300)', fontFamily: 'var(--font-mono)' }}
              >
                View on Etherscan ↗
              </a>
            )}
            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--teal-500)' }}
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Add USDC
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                We&#39;ll send test USDC + 0.01 ETH for gas — no action required from you.
              </p>
            </div>

            {/* Amount input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Amount (USDC)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={status === 'loading'}
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none"
                style={{ background: 'var(--gray-800)', border: '0.5px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Info box */}
            <div
              className="mb-6 p-4 rounded-lg"
              style={{ background: 'rgba(83,74,183,0.08)', borderLeft: '3px solid var(--purple-600)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Equivalent USD incl. gas fee
              </p>
              <p className="text-lg font-semibold text-white">${equivalentUSD}</p>
            </div>

            {/* Error */}
            {status === 'error' && (
              <div
                className="mb-4 px-4 py-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(216,90,48,0.12)',
                  border: '0.5px solid rgba(216,90,48,0.3)',
                  color: '#F0997B',
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border"
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReceive}
                disabled={status === 'loading' || !amount || parseFloat(amount) <= 0}
                className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'var(--purple-600)' }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--purple-500)' }}
                onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--purple-600)' }}
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Sending…
                  </>
                ) : 'Receive'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
