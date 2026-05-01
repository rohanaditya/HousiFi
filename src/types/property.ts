// Supabase database types
export interface SupabaseProperty {
  id: number
  name: string
  location: string
  details: string | null
  image: string | null
  flat_price: number
  remaining: number
  area: string | null
  investor_count: number
}

// Frontend display type
export interface Property {
  id: number
  name: string
  location: string
  details: string
  image: string
  flat_price: number
  remaining: number
  area: string
  investor_count: number
}
