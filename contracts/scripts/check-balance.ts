import { network } from "hardhat";
import { formatEther } from "ethers";

async function main() {
  const connection = await network.getOrCreate();
  const { ethers } = connection;

  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
