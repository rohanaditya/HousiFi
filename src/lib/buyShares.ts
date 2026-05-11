import { ethers } from "ethers";
import { CONTRACTS, PROPERTY_TOKENS, assertContractExists } from "./contracts";
import PropertyBuyABI from "./abis/PropertyBuy.json";
import TestUSDCABI from "./abis/TestUSDC.json";

export async function buyShares(
  signer: ethers.Signer,
  propertyId: number,
  tokenAmount: number,
  usdcAmount: number
): Promise<{ success: true; txHash: string }> {
  const usdcRaw = ethers.parseUnits(usdcAmount.toString(), 18);

  const propertyTokenAddress = PROPERTY_TOKENS[propertyId];
  await assertContractExists(signer, CONTRACTS.testUSDC, "tUSDC");
  await assertContractExists(signer, CONTRACTS.propertyBuy, "PropertyBuy");
  await assertContractExists(signer, propertyTokenAddress, "PropertyToken");

  const tusdc = new ethers.Contract(CONTRACTS.testUSDC, TestUSDCABI.abi, signer);

  const buyerAddress = await signer.getAddress();
  const balance = await tusdc.balanceOf(buyerAddress);
  if (balance < usdcRaw) {
    throw new Error("Insufficient tUSDC balance");
  }

  const allowance = await tusdc.allowance(buyerAddress, CONTRACTS.propertyBuy);
  if (allowance < usdcRaw) {
    const approveTx = await tusdc.approve(CONTRACTS.propertyBuy, usdcRaw);
    await approveTx.wait();
  }

  const propertyBuy = new ethers.Contract(CONTRACTS.propertyBuy, PropertyBuyABI.abi, signer);
  const tx = await propertyBuy.buyShares(propertyTokenAddress, tokenAmount, usdcRaw);
  const receipt = await tx.wait();

  return { success: true, txHash: receipt.hash };
}
