import { ethers } from "ethers";
import { CONTRACTS, PROPERTY_TOKENS, assertContractExists } from "./contracts";
import PropertySellABI from "./abis/PropertySell.json";
import PropertyTokenABI from "./abis/PropertyToken.json";
import TestUSDCABI from "./abis/TestUSDC.json";

export async function sellShares(
  signer: ethers.Signer,
  propertyId: number,
  tokenAmount: number,
  usdcPayout: number
): Promise<{ success: boolean; txHash: string }> {
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
  }

  const tx = await propertySell.sellShares(propertyTokenAddress, tokenAmount, usdcRaw);
  const receipt = await tx.wait();

  return { success: true, txHash: receipt.hash };
}
