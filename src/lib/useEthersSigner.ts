import { useMemo } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import type { Eip1193Provider } from 'ethers'
import type { Address, WalletClient } from 'viem'

const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

function walletClientToSigner(walletClient: WalletClient): JsonRpcSigner {
  const { chain, transport, account } = walletClient
  if (!account) throw new Error("Wallet client has no account")
  const network = chain
    ? { chainId: chain.id, name: chain.name, ensAddress: chain.contracts?.ensRegistry?.address }
    : undefined
  const provider = new BrowserProvider(transport, network)
  return new JsonRpcSigner(provider, account.address)
}

export function useEthersSigner() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  return useMemo(
    () => {
      if (walletClient) {
        return walletClientToSigner(walletClient)
      }

      if (address && typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum)
        return new JsonRpcSigner(provider, address as Address)
      }

      return undefined
    },
    [address, walletClient]
  )
}

export async function getInjectedEthersSigner(): Promise<JsonRpcSigner | undefined> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return undefined
  }

  await switchToSepolia()
  const provider = new BrowserProvider(window.ethereum)
  const accounts = await provider.send('eth_requestAccounts', []) as string[]
  const account = accounts[0]

  return account ? new JsonRpcSigner(provider, account) : undefined
}

export async function getSepoliaSigner(
  signer?: JsonRpcSigner
): Promise<JsonRpcSigner | undefined> {
  if (signer) {
    const network = await signer.provider.getNetwork()
    if (Number(network.chainId) === SEPOLIA_CHAIN_ID) {
      return signer
    }
  }

  return getInjectedEthersSigner()
}

async function switchToSepolia() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    })
  } catch (error) {
    const switchError = error as { code?: number }

    if (switchError.code !== 4902) {
      throw error
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: SEPOLIA_CHAIN_ID_HEX,
        chainName: 'Sepolia',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: [
          process.env.NEXT_PUBLIC_ALCHEMY_URL || 'https://rpc.sepolia.org',
        ],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      }],
    })
  }
}
