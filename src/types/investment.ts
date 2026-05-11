export interface Investment {
  id: number
  property_id: number
  token_amount: number
  usdc_paid: number
  share_type: 'major' | 'minor'
}
