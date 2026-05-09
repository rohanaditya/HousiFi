import { ethers } from "ethers";
import { CONTRACTS, PROPERTY_TOKENS } from "./contracts";
import PropertyBuyABI from "./abis/PropertyBuy.json";
import TestUSDCABI from "./abis/TestUSDC.json";

export async function buyShares(
  signer: any,
  propertyId: number,
  tokenAmount: number,
  usdcAmount: number
): Promise<{ success: true; txHash: string }> {
  try {
    const usdcRaw = ethers.parseUnits(usdcAmount.toString(), 18);

    const propertyTokenAddress = PROPERTY_TOKENS[propertyId];

    const tusdc = new ethers.Contract(CONTRACTS.testUSDC, TestUSDCABI, signer);

    const buyerAddress = await signer.getAddress();
    const balance = await tusdc.balanceOf(buyerAddress);
    if (balance < usdcRaw) {
      throw new Error("Insufficient tUSDC balance");
    }

    const allowance = await tusdc.allowance(buyerAddress, CONTRACTS.propertyBuy);
    if (allowance < usdcRaw) {
      const approveTx = await tusdc.approve(CONTRACTS.propertyBuy, usdcRaw);
      await approveTx.wait();
      console.log("tUSDC approval confirmed");
    }

    const propertyBuy = new ethers.Contract(CONTRACTS.propertyBuy, PropertyBuyABI, signer);

    const tx = await propertyBuy.buyShares(propertyTokenAddress, tokenAmount, usdcRaw);
    const receipt = await tx.wait();

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
