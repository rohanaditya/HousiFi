'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      id="navbar"
      style={{
        background: scrolled ? 'rgba(13,13,12,0.92)' : 'rgba(13,13,12,0.7)',
      }}
    >
      <Link className="nav-logo" href="/">
        <div className="nav-logo-mark">H</div>
        <span className="nav-logo-text">HousiFi</span>
      </Link>

      <div className="nav-right">
        <span className="wallet-address">0x7a3f…e2c1</span>
        <button className="btn-connect">Connect wallet</button>
      </div>
    </nav>
  )
}
