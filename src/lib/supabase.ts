import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
// const supabaseUrl = "https://cqckeadrimnuqhcwydxb.supabase.co"
// const supabaseAnonKey = "sb_publishable_QyFqObC4vmwEuLBaP5XGBg_IPZBFKFm"

console.log('Supabase URL:', supabaseUrl)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
