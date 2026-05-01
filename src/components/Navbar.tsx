'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { connect, connectors } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null

  const handleWalletButton = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect({ connector: connectors[0] })
    }
  }

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
        {isConnected && shortAddress && (
          <span className="wallet-address">{shortAddress}</span>
        )}
        <button className="btn-connect" onClick={handleWalletButton}>
          {isConnected ? 'Disconnect' : 'Connect wallet'}
        </button>
      </div>
    </nav>
  )
}
