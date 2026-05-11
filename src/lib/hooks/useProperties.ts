'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchPropertiesFromSupabase } from '@/lib/propertyTransform'
import type { Property } from '@/types/property'

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const data = await fetchPropertiesFromSupabase()
      setProperties(data)
    } catch (error) {
      console.error('Failed to load properties:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { properties, loading, reload }
}
