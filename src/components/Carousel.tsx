'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const DURATION = 5000

const slides = [
  {
    id: 0,
    bg: 'linear-gradient(140deg, #0F0A40 0%, #2E2480 30%, #534AB7 65%, #7F77DD 85%, #AFA9EC 100%)',
    glow: 'radial-gradient(ellipse 70% 60% at 75% 30%, rgba(127,119,221,0.25) 0%, transparent 70%)',
    tagClass: 'tag-closing',
    tagDot: '#F0997B',
    tagText: '92% funded · closes in 3 days',
    title: 'Olympia Opaline – Tower B',
    location: 'OMR, Chennai · RERA TN/01/2024/0041 · Possession Dec 2025 · 3BHK',
    data: [
      { label: 'Flat price', value: '$1.2M' },
      { label: 'You pay', value: '$960k' },
      { label: 'Equity gap', value: '$240k' },
      { label: 'Area', value: '2,100 sqft' },
      { label: 'Investors', value: '31' },
    ],
    progressWidth: '92%',
    progressFill: '#9FE1CB',
    progressLabel: '92% funded',
    progressCount: '$220.8k / $240k raised',
  },
  {
    id: 1,
    bg: 'linear-gradient(140deg, #021E17 0%, #085041 30%, #0F6E56 60%, #1D9E75 80%, #5DCAA5 100%)',
    glow: 'radial-gradient(ellipse 60% 55% at 70% 25%, rgba(93,202,165,0.2) 0%, transparent 65%)',
    tagClass: 'tag-funding',
    tagDot: '#5DCAA5',
    tagText: '68% funded · 14 investors',
    title: 'Appaswamy Greens – Phase 3',
    location: 'Velachery, Chennai · Corner unit · North facing · Semi-furnished',
    data: [
      { label: 'Flat price', value: '$850k' },
      { label: 'You pay', value: '$680k' },
      { label: 'Equity gap', value: '$170k' },
      { label: 'Area', value: '1,820 sqft' },
      { label: 'Investors', value: '14' },
    ],
    progressWidth: '68%',
    progressFill: '#FAC775',
    progressLabel: '68% funded',
    progressCount: '$115.6k / $170k raised',
  },
  {
    id: 2,
    bg: 'linear-gradient(140deg, #200D05 0%, #712B13 30%, #993C1D 60%, #D85A30 80%, #F0997B 100%)',
    glow: 'radial-gradient(ellipse 55% 50% at 80% 20%, rgba(240,153,123,0.2) 0%, transparent 65%)',
    tagClass: 'tag-new',
    tagDot: '#EF9F27',
    tagText: 'New listing · be first',
    title: 'Arun Excello Skyline – 7C',
    location: 'Whitefield, Bangalore · Smart home ready · 2BHK premium',
    data: [
      { label: 'Flat price', value: '$900k' },
      { label: 'You pay', value: '$720k' },
      { label: 'Equity gap', value: '$180k' },
      { label: 'Area', value: '1,650 sqft' },
      { label: 'Investors', value: '3' },
    ],
    progressWidth: '14%',
    progressFill: '#FAC775',
    progressLabel: '14% funded',
    progressCount: '$25.2k / $180k raised',
  },
]

const thumbs = [
  { id: 0, bg: 'linear-gradient(135deg,#2E2480,#7F77DD)', name: 'Olympia Opaline · B', city: 'OMR, Chennai' },
  { id: 1, bg: 'linear-gradient(135deg,#085041,#1D9E75)', name: 'Appaswamy Greens · Ph3', city: 'Velachery, Chennai' },
  { id: 2, bg: 'linear-gradient(135deg,#712B13,#D85A30)', name: 'Arun Excello Skyline · 7C', city: 'Whitefield, Bangalore' },
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const [barWidth, setBarWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((n: number) => {
    setCurrent(n)
    setBarWidth(0)

    if (timerRef.current) clearTimeout(timerRef.current)
    if (animRef.current) clearTimeout(animRef.current)

    animRef.current = setTimeout(() => {
      setBarWidth(100)
    }, 30)

    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, DURATION)
  }, [])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])

  useEffect(() => {
    goTo(0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (animRef.current) clearTimeout(animRef.current)

    setBarWidth(0)
    animRef.current = setTimeout(() => setBarWidth(100), 30)
    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, DURATION)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [current])

  return (
    <div className="carousel-section" id="carousel-section">
      <div style={{ position: 'relative' }}>
        <div className="carousel-wrap">
          {/* Timer bar */}
          <div
            className="timer-bar"
            style={{
              width: `${barWidth}%`,
              transition: barWidth === 0 ? 'none' : `width ${DURATION}ms linear`,
            }}
          />

          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`slide${current === slide.id ? ' active' : ''}`}
            >
              <div className="slide-bg" style={{ background: slide.bg }} />
              <div className="slide-noise" />
              <div style={{ position: 'absolute', inset: 0, background: slide.glow }} />
              <div className="slide-overlay" />
              <div className="slide-content">
                <span className={`slide-tag ${slide.tagClass}`}>
                  <svg width="6" height="6" viewBox="0 0 6 6">
                    <circle cx="3" cy="3" r="3" fill={slide.tagDot} />
                  </svg>
                  {slide.tagText}
                </span>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-location">{slide.location}</p>
                <div className="slide-data-row">
                  {slide.data.map((d) => (
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
                      style={{ width: slide.progressWidth, background: slide.progressFill }}
                    />
                  </div>
                  <span className="progress-label">{slide.progressLabel}</span>
                  <span className="progress-count">{slide.progressCount}</span>
                </div>
                <div className="slide-actions">
                  <button className="btn-slide-primary">Apply as buyer</button>
                  <button className="btn-slide-ghost">Invest USDC →</button>
                  <button className="btn-slide-ghost">View on Etherscan</button>
                </div>
              </div>
            </div>
          ))}

          <button className="carousel-nav left" onClick={prev} aria-label="Previous">&#8592;</button>
          <button className="carousel-nav right" onClick={next} aria-label="Next">&#8594;</button>
        </div>

        {/* Thumbnails */}
        <div className="thumbs-strip">
          {thumbs.map((t) => (
            <div
              key={t.id}
              className={`thumb${current === t.id ? ' active' : ''}`}
              onClick={() => goTo(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goTo(t.id)}
            >
              <div className="thumb-bg" style={{ background: t.bg }} />
              <div className="thumb-overlay">
                <div className="thumb-name">{t.name}</div>
                <div className="thumb-city">{t.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
