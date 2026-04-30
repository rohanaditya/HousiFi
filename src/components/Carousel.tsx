'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import propertiesData from '@/data/properties.json'

const DURATION = 5000

type Property = {
  id: number
  name: string
  location: string
  details: string
  image: string
  gradient: string
  glow: string
  tagClass: string
  tagDot: string
  tagText: string
  flatPrice: string
  buyerPays: string
  equityGap: string
  area: string
  investors: 0 | 1
  investorType: 'majority' | 'small' | null
  fundingProgress: number
  raised: string
  target: string
  progressFill: string
  status: string
}

const properties = propertiesData.properties as Property[]

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((n: number) => {
    setCurrent(n)
  }, [])

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % properties.length), [])
  const prev = useCallback(() => setCurrent((prev) => (prev - 1 + properties.length) % properties.length), [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (animRef.current) clearTimeout(animRef.current)

    setBarWidth(0)
    animRef.current = setTimeout(() => setBarWidth(100), 30)
    timerRef.current = setTimeout(next, DURATION)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [current, next])

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

          {properties.map((p, idx) => (
            <div key={p.id} className={`slide${current === idx ? ' active' : ''}`}>
              {/* Left: gradient + content */}
              <div className="slide-left">
                <div className="slide-bg" style={{ background: p.gradient }} />
                <div className="slide-noise" />
                <div style={{ position: 'absolute', inset: 0, background: p.glow }} />
                <div className="slide-overlay" />
                <div className="slide-content">
                  <span className={`slide-tag ${p.tagClass}`}>
                    <svg width="6" height="6" viewBox="0 0 6 6">
                      <circle cx="3" cy="3" r="3" fill={p.tagDot} />
                    </svg>
                    {p.tagText}
                  </span>
                  <h2 className="slide-title">{p.name}</h2>
                  <p className="slide-location">{p.location} · {p.details}</p>

                  <div className="slide-data-row">
                    {[
                      { label: 'Flat price', value: p.flatPrice },
                      { label: 'You pay', value: p.buyerPays },
                      { label: 'Equity gap', value: p.equityGap },
                      { label: 'Area', value: p.area },
                    ].map((d) => (
                      <div key={d.label} className="data-cell">
                        <div className="data-cell-label">{d.label}</div>
                        <div className="data-cell-value">{d.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="progress-row">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${p.fundingProgress}%`, background: p.progressFill }}
                      />
                    </div>
                    <span className="progress-label">{p.fundingProgress}% funded</span>
                    <span className="progress-count">{p.raised} / {p.target}</span>
                  </div>

                  <InvestorButtons investors={p.investors} investorType={p.investorType} />
                </div>
              </div>

              {/* Right: property image */}
              <div className="slide-right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/properties-images/${p.image}`}
                  alt={p.name}
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
          {properties.map((p, idx) => (
            <div
              key={p.id}
              className={`thumb${current === idx ? ' active' : ''}`}
              onClick={() => goTo(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goTo(idx)}
            >
              <div
                className="thumb-bg"
                style={{
                  backgroundImage: `url('/properties-images/${p.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="thumb-overlay">
                <div className="thumb-name">{p.name}</div>
                <div className="thumb-city">{p.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
