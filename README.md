# HousiFi

Fractional real estate investment on Sepolia. Users pool a down payment by buying a majority (85%) or minority (15%) share of a property. Ownership and payouts are settled on-chain via ERC-20 property tokens and USDC.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS + global CSS variables |
| Web3 | wagmi, ethers.js v6, MetaMask |
| Database | Supabase (Postgres) |
| Smart contracts | Solidity / Hardhat (Sepolia testnet) |

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── faucet/route.ts          # Mints tUSDC + sends Sepolia ETH to user
│   │   └── investment/
│   │       ├── buy/route.ts         # Records a buy in Supabase
│   │       └── sell/route.ts        # Records a sell in Supabase
│   ├── layout.tsx                   # Root layout (Web3Provider)
│   └── page.tsx                     # Landing page (Navbar + Carousel)
├── components/
│   ├── BuySharesButton.tsx          # Triggers on-chain buy + API record
│   ├── Carousel.tsx                 # Property carousel with investment panels
│   ├── Navbar.tsx                   # Wallet connect/disconnect, USDC modal
│   ├── USDCModal.tsx                # Faucet UI for test USDC
│   └── Web3Provider.tsx             # wagmi + react-query providers
├── lib/
│   ├── hooks/
│   │   ├── useInvestments.ts        # Fetches active investments for connected wallet
│   │   └── useProperties.ts        # Fetches properties from Supabase
│   ├── abis/                        # Contract ABIs (PropertyBuy, PropertySell, PropertyToken, TestUSDC)
│   ├── buyShares.ts                 # On-chain buy flow (approve tUSDC → buyShares)
│   ├── contracts.ts                 # Addresses, PROPERTY_TOKENS map, assertContractExists
│   ├── propertyTransform.ts        # Supabase row → Property display type
│   ├── sellShares.ts               # On-chain sell flow (approve token → sellShares)
│   ├── supabase.ts                 # Supabase anon client singleton
│   └── useEthersSigner.ts          # wagmi → ethers.js signer bridge + Sepolia switcher
├── types/
│   ├── investment.ts               # Investment interface
│   └── property.ts                 # SupabaseProperty + Property interfaces
contracts/                          # Hardhat workspace (separate package.json + tsconfig)
```

## Environment variables

Create a `.env` file (never commit it):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-only — used by API routes

# Alchemy (Sepolia RPC)
NEXT_PUBLIC_ALCHEMY_URL=            # Also injected as RPC URL when switching chains

# Faucet admin wallet
ADMIN_PRIVATE_KEY=                  # Signs faucet transactions server-side
TEST_USDC_ADDRESS=                  # TestUSDC contract address

# Optional — kept in sync with contracts.ts
NEXT_PUBLIC_PROPERTY_BUY_ADDRESS=
NEXT_PUBLIC_PROPERTY_SELL_ADDRESS=
NEXT_PUBLIC_ADMIN_ADDRESS=
```

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Connect MetaMask to **Sepolia**. Use the "Add USDC" button in the navbar to receive test funds before investing.

## Smart contracts

The Hardhat workspace lives in `contracts/` and has its own `package.json`. Deployed on Sepolia:

| Contract | Address |
|---|---|
| TestUSDC | `0x9076a4d4f905C109D5A8E41DdA4E767F44A16308` |
| PropertyBuy | `0xd32ea960dB2C7EFF89677f5de3668E1bC29600Fd` |
| PropertySell | `0x13fFA9145f8885B6765F028C6D5AFf450074bbd3` |

## Investment flow

**Buy:** approve tUSDC → `PropertyBuy.buyShares` → API records investment in Supabase

**Sell:** approve PropertyToken → `PropertySell.sellShares` → API marks investment as sold and returns the slot
