import { SupabaseProperty, Property } from '@/types/property'
import { supabase } from './supabase'


export function transformPropertyForDisplay(supabaseProperty: SupabaseProperty): Property {
  return {
    id: supabaseProperty.id,
    name: supabaseProperty.name,
    location: supabaseProperty.location,
    details: supabaseProperty.details || '',
    image: supabaseProperty.image || 'house1.png',
    flat_price: supabaseProperty.flat_price,
    remaining: supabaseProperty.remaining,
    area: supabaseProperty.area || 'N/A',
    investor_count: supabaseProperty.investor_count,
  }
}

export async function fetchPropertiesFromSupabase(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error)
      return []
    }

    if (!data) {
      return []
    }

    return (data as SupabaseProperty[]).map((prop) =>
      transformPropertyForDisplay(prop)
    )
  } catch (error) {
    console.error('Error fetching properties from Supabase:', error)
    return []
  }
}
