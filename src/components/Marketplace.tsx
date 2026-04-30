'use client'

import { useState } from 'react'

type Filter = 'all' | 'funding' | 'new' | 'closing'

const listings = [
  {
    id: 1,
    name: 'Olympia Opaline 12B',
    meta: 'OMR, Chennai · 3BHK · 2,100 sqft',
    price: '$1.2M',
    bg: 'linear-gradient(140deg,#2E2480,#7F77DD)',
    status: 'closing' as Filter,
    statusLabel: 'Closing soon',
    statusClass: 'status-closing',
    raised: '$220.8k / $240k',
    pct: '92%',
    fillWidth: '92%',
    fillColor: '#534AB7',
  },
  {
    id: 2,
    name: 'Appaswamy Greens Ph.3',
    meta: 'Velachery, Chennai · 3BHK · 1,820 sqft',
    price: '$850k',
    bg: 'linear-gradient(140deg,#085041,#1D9E75)',
    status: 'funding' as Filter,
    statusLabel: 'Funding',
    statusClass: 'status-funding',
    raised: '$115.6k / $170k',
    pct: '68%',
    fillWidth: '68%',
    fillColor: '#1D9E75',
  },
  {
    id: 3,
    name: 'Arun Excello Skyline 7C',
    meta: 'Whitefield, Bangalore · 2BHK · 1,650 sqft',
    price: '$900k',
    bg: 'linear-gradient(140deg,#712B13,#D85A30)',
    status: 'new' as Filter,
    statusLabel: 'New',
    statusClass: 'status-new',
    raised: '$25.2k / $180k',
    pct: '14%',
    fillWidth: '14%',
    fillColor: '#D85A30',
  },
  {
    id: 4,
    name: 'Olympia Verdana 3A',
    meta: 'Sholinganallur, Chennai · 4BHK · 2,800 sqft',
    price: '$1.6M',
    bg: 'linear-gradient(140deg,#1E1754,#534AB7)',
    status: 'funding' as Filter,
    statusLabel: 'Funding',
    statusClass: 'status-funding',
    raised: '$144k / $320k',
    pct: '45%',
    fillWidth: '45%',
    fillColor: '#534AB7',
  },
  {
    id: 5,
    name: 'Appaswamy Pinnacle 8F',
    meta: 'Porur, Chennai · 2BHK · 1,400 sqft',
    price: '$620k',
    bg: 'linear-gradient(140deg,#04342C,#5DCAA5)',
    status: 'new' as Filter,
    statusLabel: 'New',
    statusClass: 'status-new',
    raised: '$9.9k / $124k',
    pct: '8%',
    fillWidth: '8%',
    fillColor: '#1D9E75',
  },
  {
    id: 6,
    name: 'Arun Excello Heritage 2B',
    meta: 'Koramangala, Bangalore · 3BHK · 2,050 sqft',
    price: '$1.1M',
    bg: 'linear-gradient(140deg,#4A1B0C,#F0997B)',
    status: 'funding' as Filter,
    statusLabel: 'Funding',
    statusClass: 'status-funding',
    raised: '$121k / $220k',
    pct: '55%',
    fillWidth: '55%',
    fillColor: '#D85A30',
  },
]

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'funding', label: 'Funding' },
  { key: 'new', label: 'New' },
  { key: 'closing', label: 'Closing soon' },
]

export default function Marketplace() {
  const [active, setActive] = useState<Filter>('all')

  const visible = active === 'all' ? listings : listings.filter((l) => l.status === active)

  return (
    <section className="market-section" id="marketplace">
      <div className="market-inner">
        <div className="market-header">
          <div>
            <div className="section-eyebrow">Open listings</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Active funding rounds</h2>
          </div>
          <div className="filter-row">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`filter-chip${active === f.key ? ' active' : ''}`}
                onClick={() => setActive(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="listings-grid">
          {visible.map((l) => (
            <div key={l.id} className="listing-card">
              <div className="listing-banner">
                <div className="listing-banner-inner" style={{ background: l.bg }} />
                <span className={`listing-status ${l.statusClass}`}>{l.statusLabel}</span>
              </div>
              <div className="listing-body">
                <div className="listing-name">{l.name}</div>
                <div className="listing-meta">{l.meta}</div>
                <div className="listing-price-row">
                  <span className="listing-price">{l.price}</span>
                  <span className="listing-price-label">flat price</span>
                </div>
                <div className="listing-progress-track">
                  <div
                    className="listing-progress-fill"
                    style={{ width: l.fillWidth, background: l.fillColor }}
                  />
                </div>
                <div className="listing-progress-row">
                  <span>{l.raised}</span>
                  <span className="listing-progress-pct">{l.pct}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
