import { network } from "hardhat";

const ADMIN_ADDRESS = "0xe0029D5931814c86Ff617501aD86306774cb76F8";
const TEST_USDC_ADDRESS = "0x9076a4d4f905C109D5A8E41DdA4E767F44A16308";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log(`Admin address: ${ADMIN_ADDRESS}`);
  console.log(`TestUSDC address: ${TEST_USDC_ADDRESS}\n`);

  // Deploy PropertyBuy
  const PropertyBuy = await ethers.getContractFactory("PropertyBuy");
  const propertyBuy = await PropertyBuy.deploy(ADMIN_ADDRESS, TEST_USDC_ADDRESS);
  await propertyBuy.waitForDeployment();
  const propertyBuyAddress = await propertyBuy.getAddress();
  console.log(`PropertyBuy deployed: ${propertyBuyAddress}`);

  // Deploy PropertySell
  const PropertySell = await ethers.getContractFactory("PropertySell");
  const propertySell = await PropertySell.deploy(ADMIN_ADDRESS, TEST_USDC_ADDRESS);
  await propertySell.waitForDeployment();
  const propertySellAddress = await propertySell.getAddress();
  console.log(`PropertySell deployed: ${propertySellAddress}`);

  console.log("\n✓ Update your .env.local with:");
  console.log(`NEXT_PUBLIC_PROPERTY_BUY_ADDRESS=${propertyBuyAddress}`);
  console.log(`NEXT_PUBLIC_PROPERTY_SELL_ADDRESS=${propertySellAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
