'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { fetchPropertiesFromSupabase } from '@/lib/propertyTransform'
import { supabase } from '@/lib/supabase'
import { sellShares } from '@/lib/sellShares'
import { getSepoliaSigner, useEthersSigner } from '@/lib/useEthersSigner'
import type { Property } from '@/types/property'
import BuySharesButton from '@/components/BuySharesButton'

const DURATION = 25000

interface Investment {
  id: number
  property_id: number
  token_amount: number
  usdc_paid: number
  share_type: 'major' | 'minor'
}

function UserInvestmentPanel({
  investment,
  property,
  onSuccess,
  onProcessingChange,
}: {
  investment: Investment
  property: Property
  onSuccess: () => void
  onProcessingChange: (processing: boolean) => void
}) {
  const signer = useEthersSigner()
  const [selling, setSelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentValue = (investment.token_amount / 100) * property.flat_price
  const pnl = currentValue - investment.usdc_paid
  const pnlPositive = pnl >= 0

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timer)
  }, [error])

  async function handleSell() {
    setSelling(true)
    onProcessingChange(true)
    setError(null)
    try {
      const activeSigner = await getSepoliaSigner(signer)

      if (!activeSigner) {
        throw new Error('Connect your wallet first')
      }

      const usdcPayout = (investment.token_amount / 100) * property.flat_price
      const { txHash } = await sellShares(activeSigner, property.id, investment.token_amount, usdcPayout)

      const investorAddress = await activeSigner.getAddress()
      const res = await fetch('/api/investment/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          investorAddress,
          tokenAmount: investment.token_amount,
          usdcReceived: usdcPayout,
          txHash,
        }),
      })
      if (!res.ok) {
        const { error: apiError } = await res.json()
        throw new Error(apiError ?? 'Failed to record sale')
      }
      alert(`Sale successful! ${usdcPayout.toLocaleString()} tUSDC has been sent to your wallet`)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setSelling(false)
      onProcessingChange(false)
    }
  }

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.07)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
        Your investment
      </p>
      <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0 }}>
        {investment.token_amount} tokens · {investment.token_amount}% ownership ({investment.share_type})
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: 0 }}>
        Paid: {investment.usdc_paid.toLocaleString()} tUSDC
      </p>
      <p style={{ fontSize: '0.8rem', margin: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Current value at market price: </span>
        <span style={{ color: pnlPositive ? '#4ade80' : '#f87171', fontWeight: 600 }}>
          {currentValue.toLocaleString()} tUSDC
        </span>
        <span style={{ color: pnlPositive ? '#4ade80' : '#f87171', fontSize: '0.72rem', marginLeft: '6px' }}>
          ({pnlPositive ? '+' : ''}{pnl.toLocaleString()} tUSDC)
        </span>
      </p>
      <div style={{ marginTop: '4px' }}>
        <button
          className="btn-slide-ghost"
          style={{ fontSize: '0.78rem', padding: '6px 16px' }}
          onClick={handleSell}
          disabled={selling}
        >
          {selling ? 'Processing...' : 'Sell'}
        </button>
        {error && <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '4px', margin: 0 }}>{error}</p>}
      </div>
    </div>
  )
}

function InvestorButtons({
  property,
  onSuccess,
  onProcessingChange,
}: {
  property: Property
  onSuccess: () => void
  onProcessingChange: (processing: boolean) => void
}) {
  const { investor_count, flat_price, remaining } = property

  if (investor_count === 2) {
    return null
  }

  if (investor_count === 0) {
    return (
      <div className="slide-actions">
        <BuySharesButton property={property} shareType="major" tokenAmount={85} onSuccess={onSuccess} onProcessingChange={onProcessingChange} />
        <BuySharesButton property={property} shareType="minor" tokenAmount={15} onSuccess={onSuccess} onProcessingChange={onProcessingChange} />
      </div>
    )
  }

  if (investor_count === 1) {
    const ratio = remaining / flat_price
    if (ratio > 0.75) {
      return (
        <div className="slide-actions">
          <BuySharesButton property={property} shareType="major" tokenAmount={85} onSuccess={onSuccess} onProcessingChange={onProcessingChange} />
        </div>
      )
    }
    if (ratio < 0.25) {
      return (
        <div className="slide-actions">
          <BuySharesButton property={property} shareType="minor" tokenAmount={15} onSuccess={onSuccess} onProcessingChange={onProcessingChange} />
        </div>
      )
    }
  }

  return null
}

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const [barWidth, setBarWidth] = useState(0)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<Record<number, Investment>>({})
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { address } = useAccount()

  const loadProperties = useCallback(async () => {
    try {
      const data = await fetchPropertiesFromSupabase()
      setProperties(data)
    } catch (error) {
      console.error('Failed to load properties:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadInvestments = useCallback(async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('id, property_id, token_amount, usdc_paid, share_type')
        .ilike('investor_address', walletAddress)
        .eq('status', 'active')
      if (error) throw error
      const byProperty: Record<number, Investment> = {}
      for (const inv of data ?? []) {
        byProperty[inv.property_id] = inv
      }
      setInvestments(byProperty)
    } catch (err) {
      console.error('Failed to load investments:', err)
    }
  }, [])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  useEffect(() => {
    if (address) {
      loadInvestments(address)
    } else {
      setInvestments({})
    }
  }, [address, loadInvestments])

  const handleSuccess = useCallback(() => {
    loadProperties()
    if (address) loadInvestments(address)
  }, [loadProperties, loadInvestments, address])

  const goTo = useCallback((n: number) => {
    if (properties.length > 0) {
      setCurrent(n % properties.length)
    }
  }, [properties.length])

  const next = useCallback(() => {
    if (properties.length > 0) {
      setCurrent((prev) => (prev + 1) % properties.length)
    }
  }, [properties.length])

  const prev = useCallback(() => {
    if (properties.length > 0) {
      setCurrent((prev) => (prev - 1 + properties.length) % properties.length)
    }
  }, [properties.length])

  useEffect(() => {
    if (properties.length === 0) return

    if (timerRef.current) clearTimeout(timerRef.current)
    if (animRef.current) clearTimeout(animRef.current)

    if (transactionProcessing) {
      return
    }

    const resetTimer = setTimeout(() => {
      setBarWidth(0)
      animRef.current = setTimeout(() => setBarWidth(100), 30)
    }, 0)
    timerRef.current = setTimeout(next, DURATION)

    return () => {
      clearTimeout(resetTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [current, next, properties.length, transactionProcessing])

  if (loading) {
    return (
      <div className="carousel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading properties...</p>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="carousel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>No properties available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="carousel-section">
      <div style={{ position: 'relative' }}>
        {/* Main carousel */}
        <div className="carousel-wrap">
          <div
            className="timer-bar"
            style={{
              width: `${barWidth}%`,
              transition: barWidth === 0 ? 'none' : `width ${DURATION}ms linear`,
            }}
          />

          {properties.map((prop, idx) => {
            const userInvestment = investments[prop.id]
            return (
              <div key={prop.id} className={`slide${current === idx ? ' active' : ''}`}>
                {/* Left: gradient + content */}
                <div className="slide-left">
                  <div className="slide-noise" />
                  <div className="slide-overlay" />
                  <div className="slide-content">
                    <h2 className="slide-title">{prop.name}</h2>
                    <p className="slide-location">{prop.location} · {prop.details}</p>

                    <div className="slide-data-row">
                      {[
                        { label: 'Total Property Price', value: prop.flat_price },
                        { label: 'Area', value: prop.area },
                      ].map((d) => (
                        <div key={d.label} className="data-cell">
                          <div className="data-cell-label">{d.label}</div>
                          <div className="data-cell-value">{d.value}</div>
                        </div>
                      ))}
                    </div>

                    <InvestorButtons
                      property={prop}
                      onSuccess={handleSuccess}
                      onProcessingChange={setTransactionProcessing}
                    />

                    {userInvestment && (
                      <UserInvestmentPanel
                        investment={userInvestment}
                        property={prop}
                        onSuccess={handleSuccess}
                        onProcessingChange={setTransactionProcessing}
                      />
                    )}
                  </div>
                </div>

                {/* Right: property image */}
                <div className="slide-right">
                  {prop.investor_count === 2 && (
                    <div className="sold-out-banner">Sold out</div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/properties-images/${prop.image}`}
                    alt={prop.name}
                  />
                  <div className="slide-right-fade" />
                </div>
              </div>
            )
          })}

          <button className="carousel-nav left" onClick={prev} aria-label="Previous">&#8592;</button>
          <button className="carousel-nav right" onClick={next} aria-label="Next">&#8594;</button>
        </div>

        {/* Thumbnails — real property images */}
        <div className="thumbs-strip">
          {properties.map((prop, idx) => (
            <div
              key={prop.id}
              className={`thumb${current === idx ? ' active' : ''}`}
              onClick={() => goTo(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goTo(idx)}
            >
              <div
                className="thumb-bg"
                style={{
                  backgroundImage: `url('/properties-images/${prop.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="thumb-overlay">
                <div className="thumb-name">{prop.name}</div>
                <div className="thumb-city">{prop.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
