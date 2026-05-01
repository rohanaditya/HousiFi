'use client'

import { useState } from 'react'

interface USDCModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function USDCModal({ isOpen, onClose }: USDCModalProps) {
  const [amount, setAmount] = useState('')

  const equivalentUSD = amount ? (parseFloat(amount) * 1.0025).toFixed(4) : '0.0000'

  const handleReceive = () => {
    if (amount && parseFloat(amount) > 0) {
      console.log(`Receiving ${amount} USDC`)
      // Add your receive logic here
      setAmount('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--gray-900)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Add USDC
          </h2>
          <p className="text-sm text-gray-400 mt-1">Enter the amount of USDC you want to deposit</p>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USDC)</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            style={{
              background: 'var(--gray-800)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* Equivalent USD Display */}
        <div
          className="mb-6 p-4 rounded-lg bg-gray-800"
          style={{
            background: 'rgba(83,74,183,0.08)',
            borderLeft: '3px solid var(--purple-600)',
          }}
        >
          <p className="text-xs text-gray-400 mb-1">Equivalent USD incl. Gas fee</p>
          <p className="text-lg font-semibold text-white">
            ${equivalentUSD}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all border"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleReceive}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex-1 px-4 py-3 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--purple-600)',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'var(--purple-500)'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'var(--purple-600)'
              }
            }}
          >
            Receive
          </button>
        </div>
      </div>
    </div>
  )
}
