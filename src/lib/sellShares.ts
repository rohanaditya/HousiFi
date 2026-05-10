import { ethers } from "ethers";
import { CONTRACTS, PROPERTY_TOKENS } from "./contracts";
import PropertySellABI from "./abis/PropertySell.json";
import PropertyTokenABI from "./abis/PropertyToken.json";

export async function sellShares(
  signer: any,
  propertyId: number,
  tokenAmount: number,
  usdcPayout: number
): Promise<{ success: boolean; txHash: string }> {
  try {
    const usdcRaw = ethers.parseUnits(usdcPayout.toString(), 18);

    const propertyTokenAddress = PROPERTY_TOKENS[propertyId];

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

    const allowance = await propertyToken.allowance(sellerAddress, CONTRACTS.propertySell);

    if (allowance < tokenAmount) {
      const approveTx = await propertyToken.approve(CONTRACTS.propertySell, tokenAmount);
      await approveTx.wait();
      console.log("Property token approval confirmed");
    }

    const propertySell = new ethers.Contract(
      CONTRACTS.propertySell,
      PropertySellABI.abi,
      signer
    );

    const tx = await propertySell.sellShares(propertyTokenAddress, tokenAmount, usdcRaw);
    const receipt = await tx.wait();

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
