'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchPropertiesFromSupabase } from '@/lib/propertyTransform'
import type { Property } from '@/types/property'

const DURATION = 5000

function InvestorButtons({ investors, investorType }: { investors: 0 | 1; investorType: 'majority' | 'small' | null }) {
  const majorityTaken = investors === 1 && investorType === 'majority'
  const smallTaken = investors === 1 && investorType === 'small'

  return (
    <div className="slide-actions">
      {majorityTaken ? (
        <button className="btn-slide-disabled" disabled>Buy Majority</button>
      ) : (
        <button className="btn-slide-primary">Buy Majority</button>
      )}
      {smallTaken ? (
        <button className="btn-slide-disabled" disabled>Buy Smaller %</button>
      ) : (
        <button className="btn-slide-ghost">Buy Smaller %</button>
      )}
    </div>
  )
}

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const [barWidth, setBarWidth] = useState(0)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch properties from Supabase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchPropertiesFromSupabase()
        setProperties(data)
      } catch (error) {
        console.error('Failed to load properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

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

    setBarWidth(0)
    animRef.current = setTimeout(() => setBarWidth(100), 30)
    timerRef.current = setTimeout(next, DURATION)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [current, next, properties.length])

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

  const p = properties[current]

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

          {properties.map((prop, idx) => (
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
                      { label: 'Flat price', value: prop.flat_price },
                      { label: 'Area', value: prop.area },
                    ].map((d) => (
                      <div key={d.label} className="data-cell">
                        <div className="data-cell-label">{d.label}</div>
                        <div className="data-cell-value">{d.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* <InvestorButtons investors={prop.investors} investorType={prop.investorType} /> */}
                </div>
              </div>

              {/* Right: property image */}
              <div className="slide-right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/properties-images/${prop.image}`}
                  alt={prop.name}
                />
                <div className="slide-right-fade" />
              </div>
            </div>
          ))}

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
