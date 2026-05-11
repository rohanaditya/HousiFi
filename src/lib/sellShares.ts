import { ethers } from "ethers";
import { CONTRACTS, PROPERTY_TOKENS } from "./contracts";
import PropertySellABI from "./abis/PropertySell.json";
import PropertyTokenABI from "./abis/PropertyToken.json";
import TestUSDCABI from "./abis/TestUSDC.json";

export async function sellShares(
  signer: ethers.Signer,
  propertyId: number,
  tokenAmount: number,
  usdcPayout: number
): Promise<{ success: boolean; txHash: string }> {
  try {
    const usdcRaw = ethers.parseUnits(usdcPayout.toString(), 18);

    const propertyTokenAddress = PROPERTY_TOKENS[propertyId];
    await assertContractExists(signer, CONTRACTS.testUSDC, "tUSDC");
    await assertContractExists(signer, CONTRACTS.propertySell, "PropertySell");
    await assertContractExists(signer, propertyTokenAddress, "PropertyToken");

    const propertyToken = new ethers.Contract(
      propertyTokenAddress,
      PropertyTokenABI.abi,
      signer
    );

    const sellerAddress = await signer.getAddress();
    const balance = await propertyToken.balanceOf(sellerAddress);

    if (balance < tokenAmount) {
      throw new Error("Insufficient property token balance");
    }

    const propertySell = new ethers.Contract(
      CONTRACTS.propertySell,
      PropertySellABI.abi,
      signer
    );
    const adminWallet = await propertySell.adminWallet();
    const tusdc = new ethers.Contract(CONTRACTS.testUSDC, TestUSDCABI.abi, signer);
    const adminUsdcBalance = await tusdc.balanceOf(adminWallet);
    const adminUsdcAllowance = await tusdc.allowance(adminWallet, CONTRACTS.propertySell);

    if (adminUsdcBalance < usdcRaw) {
      throw new Error(
        `Admin wallet has insufficient tUSDC for this payout. Needed ${ethers.formatUnits(usdcRaw, 18)} tUSDC, available ${ethers.formatUnits(adminUsdcBalance, 18)} tUSDC.`
      );
    }

    if (adminUsdcAllowance < usdcRaw) {
      throw new Error(
        `Admin wallet must approve PropertySell to spend at least ${ethers.formatUnits(usdcRaw, 18)} tUSDC before users can sell.`
      );
    }

    const allowance = await propertyToken.allowance(sellerAddress, CONTRACTS.propertySell);

    if (allowance < tokenAmount) {
      const approveTx = await propertyToken.approve(CONTRACTS.propertySell, tokenAmount);
      await approveTx.wait();
      console.log("Property token approval confirmed");
    }

    const tx = await propertySell.sellShares(propertyTokenAddress, tokenAmount, usdcRaw);
    const receipt = await tx.wait();

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    throw error;
  }
}

async function assertContractExists(
  signer: ethers.Signer,
  address: string | undefined,
  label: string
) {
  if (!address) {
    throw new Error(`${label} contract address is not configured for this property.`);
  }

  const provider = signer.provider;
  if (!provider) {
    throw new Error("Wallet provider is not available.");
  }

  const network = await provider.getNetwork();
  if (Number(network.chainId) !== 11155111) {
    throw new Error("Please switch MetaMask to Sepolia and try again.");
  }

  const code = await provider.getCode(address);
  if (code === "0x") {
    throw new Error(`${label} contract was not found on Sepolia at ${address}.`);
  }
}
