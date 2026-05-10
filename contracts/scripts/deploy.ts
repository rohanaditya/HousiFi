import { network } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const connection = await network.getOrCreate();
  const { ethers } = connection;

  const TestUSDC = await ethers.getContractFactory("TestUSDC");
  const testUSDC = await TestUSDC.deploy();

  await testUSDC.waitForDeployment();

  const address = await testUSDC.getAddress();
  console.log(`TestUSDC deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
