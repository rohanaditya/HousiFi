'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Investment } from '@/types/investment'

export function useInvestments(address: string | undefined) {
  const [investments, setInvestments] = useState<Record<number, Investment>>({})

  const reload = useCallback(async (walletAddress: string) => {
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
    if (address) {
      reload(address)
    } else {
      setInvestments({})
    }
  }, [address, reload])

  return { investments, reload }
}
