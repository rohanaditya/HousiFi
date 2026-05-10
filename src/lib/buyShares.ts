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

    const tusdc = new ethers.Contract(CONTRACTS.testUSDC, TestUSDCABI.abi, signer);

    const buyerAddress = await signer.getAddress();
    const balance = await tusdc.balanceOf(buyerAddress);
    console.log(`tUSDC Balance: ${ethers.formatUnits(balance, 18)} tUSDC`);
    console.log(`Required tUSDC: ${ethers.formatUnits(usdcRaw, 18)} tUSDC`);
    console.log("tUSDC contract address being used:", CONTRACTS.testUSDC);
    if (balance < usdcRaw) {
      throw new Error("Insufficient tUSDC balance");
    }

    const allowance = await tusdc.allowance(buyerAddress, CONTRACTS.propertyBuy);
    console.log(`Current allowance: ${ethers.formatUnits(allowance, 18)} tUSDC`);
    if (allowance < usdcRaw) {
      console.log("Approving tUSDC...");
      const approveTx = await tusdc.approve(CONTRACTS.propertyBuy, usdcRaw);
      console.log(`Approval tx sent: ${approveTx.hash}`);
      const approveReceipt = await approveTx.wait();
      console.log("tUSDC approval confirmed:", approveReceipt?.hash);
    } else {
      console.log("Already approved, skipping approval");
    }

    const propertyBuy = new ethers.Contract(CONTRACTS.propertyBuy, PropertyBuyABI.abi, signer);
    const tx = await propertyBuy.buyShares(propertyTokenAddress, tokenAmount, usdcRaw);
    const receipt = await tx.wait();

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
