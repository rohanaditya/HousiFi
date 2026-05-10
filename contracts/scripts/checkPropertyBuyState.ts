import { network } from "hardhat";

const PROPERTY_BUY_ADDRESS = "0xd32ea960dB2C7EFF89677f5de3668E1bC29600Fd";

async function main() {
  const { ethers } = await network.connect();
  const provider = ethers.provider;

  const PropertyBuyABI = [
    "function adminWallet() external view returns (address)",
    "function usdcTokenAddress() external view returns (address)",
  ];

  const propertyBuy = new ethers.Contract(PROPERTY_BUY_ADDRESS, PropertyBuyABI, provider);

  const adminWallet = await propertyBuy.adminWallet();
  const usdcAddress = await propertyBuy.usdcTokenAddress();

  console.log("\n=== PropertyBuy Contract State ===");
  console.log(`Admin wallet    : ${adminWallet}`);
  console.log(`USDC address    : ${usdcAddress}`);
  console.log("\nExpected values:");
  console.log(`Admin should be : 0xe0029D5931814c86Ff617501aD86306774cb76F8`);
  console.log(`USDC should be  : 0x9076a4d4f905C109D5A8E41DdA4E767F44A16308`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
