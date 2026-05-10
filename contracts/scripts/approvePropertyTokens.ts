import { network } from "hardhat";

const PROPERTY_BUY_ADDRESS = "0xd32ea960dB2C7EFF89677f5de3668E1bC29600Fd";
const PROPERTY_TOKENS = [
  "0x279788e9D617aC36E50D96e8f5dc2133fC245Cce",
  "0xf9C8f9Ea65788A0AbdD8874a70A7b51C4E0A8eA6",
  "0x4458617e048b4CF80095156fAe20e590C2175978",
  "0xBE4C743c7328fa29d01b66dB3746de49218F6286",
  "0x2D6fd3c94A313fcAeAddDd4DEe54889C172fd552",
];

// Expanded ABI to decode custom errors and check state
const PropertyTokenABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)",
  // Add any custom errors your contract defines, e.g.:
  // "error Unauthorized(address caller)",
  // "error ContractPaused()",
];

async function main() {
  const { ethers } = await network.connect();
  const [admin] = await ethers.getSigners();
  console.log("Admin account:", admin.address);

  const maxUint256 = ethers.MaxUint256;

  for (const tokenAddress of PROPERTY_TOKENS) {
    console.log(`\nProcessing PropertyToken: ${tokenAddress}`);
    const token = new ethers.Contract(tokenAddress, PropertyTokenABI, admin);

    // --- Diagnostic checks before approving ---
    try {
      const contractOwner = await token.owner();
      console.log(`  Contract owner : ${contractOwner}`);
      console.log(`  Admin is owner : ${contractOwner.toLowerCase() === admin.address.toLowerCase()}`);
    } catch {
      console.log("  owner() not available on this contract");
    }

    try {
      const isPaused = await token.paused();
      console.log(`  Paused         : ${isPaused}`);
      if (isPaused) {
        console.log(`  ⚠ Skipping — contract is paused`);
        continue;
      }
    } catch {
      console.log("  paused() not available on this contract");
    }

    try {
      const currentAllowance = await token.allowance(admin.address, PROPERTY_BUY_ADDRESS);
      console.log(`  Current allowance: ${currentAllowance.toString()}`);
    } catch (e) {
      console.log("  Could not read allowance:", e);
    }

    // --- Simulate the call first to surface the revert reason ---
    try {
      await token.approve.staticCall(PROPERTY_BUY_ADDRESS, maxUint256);
    } catch (e: any) {
      console.error(`  ✗ staticCall revert on ${tokenAddress}:`);
      console.error(`    Code   : ${e.code}`);
      console.error(`    Data   : ${e.data}`);       // raw custom error bytes
      console.error(`    Reason : ${e.reason}`);
      console.error(`    Message: ${e.message}`);
      continue; // skip sending the real tx if simulate failed
    }

    // --- Send the real transaction ---
    try {
      const tx = await token.approve(PROPERTY_BUY_ADDRESS, maxUint256);
      await tx.wait();
      console.log(`  ✓ Approved ${tokenAddress} for PropertyBuy`);
    } catch (e: any) {
      console.error(`  ✗ approve() failed on ${tokenAddress}: ${e.message}`);
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});