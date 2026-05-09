import { useMemo } from 'react'
import { useWalletClient } from 'wagmi'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import type { WalletClient } from 'viem'

function walletClientToSigner(walletClient: WalletClient): JsonRpcSigner {
  const { chain, transport, account } = walletClient
  const network = chain
    ? { chainId: chain.id, name: chain.name, ensAddress: chain.contracts?.ensRegistry?.address }
    : undefined
  const provider = new BrowserProvider(transport, network)
  return new JsonRpcSigner(provider, account.address)
}

export function useEthersSigner() {
  const { data: walletClient } = useWalletClient()
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  )
}
