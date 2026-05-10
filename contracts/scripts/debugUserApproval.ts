import { network } from "hardhat";

const PROPERTY_BUY_ADDRESS = "0x7b90Deaa6f8FF705f5BC9E04d7fec12dE53cAfe4";
const TEST_USDC_ADDRESS = "0x9076a4d4f905C109D5A8E41DdA4E767F44A16308";
const USER_ADDRESS = "0x904239597688E9Fc565A1Bd9C7eD6e269152da37"; // Change this to your user wallet

async function main() {
  const { ethers } = await network.connect();
  const provider = ethers.provider;

  const ERC20ABI = [
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  const usdc = new ethers.Contract(TEST_USDC_ADDRESS, ERC20ABI, provider);

  const balance = await usdc.balanceOf(USER_ADDRESS);
  const allowance = await usdc.allowance(USER_ADDRESS, PROPERTY_BUY_ADDRESS);

  console.log("\n=== User tUSDC Status ===");
  console.log(`User address    : ${USER_ADDRESS}`);
  console.log(`tUSDC balance   : ${ethers.formatUnits(balance, 18)} tUSDC`);
  console.log(`Allowance to PB : ${ethers.formatUnits(allowance, 18)} tUSDC`);
  console.log(`\nCan buy?        : ${allowance > 0 ? "✓ YES (has approval)" : "✗ NO (needs approval)"}`);

  if (allowance === 0n) {
    console.log("\n⚠ Issue found: User has NOT approved PropertyBuy to spend tUSDC!");
    console.log("This should happen automatically in buyShares.ts, but it may be failing.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
