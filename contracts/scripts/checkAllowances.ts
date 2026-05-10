import { network } from "hardhat";

const PROPERTY_BUY_ADDRESS = "0x7b90Deaa6f8FF705f5BC9E04d7fec12dE53cAfe4";
const ADMIN_ADDRESS = "0xe0029D5931814c86Ff617501aD86306774cb76F8";
const PROPERTY_TOKENS = [
  "0x279788e9D617aC36E50D96e8f5dc2133fC245Cce",
  "0xf9C8f9Ea65788A0AbdD8874a70A7b51C4E0A8eA6",
  "0x4458617e048b4CF80095156fAe20e590C2175978",
  "0xBE4C743c7328fa29d01b66dB3746de49218F6286",
  "0x2D6fd3c94A313fcAeAddDd4DEe54889C172fd552",
];

async function main() {
  const { ethers } = await network.connect();
  const provider = ethers.provider;

  const PropertyTokenABI = [
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  console.log("Checking allowances and balances...\n");

  for (const tokenAddress of PROPERTY_TOKENS) {
    const token = new ethers.Contract(tokenAddress, PropertyTokenABI, provider);

    const allowance = await token.allowance(ADMIN_ADDRESS, PROPERTY_BUY_ADDRESS);
    const balance = await token.balanceOf(ADMIN_ADDRESS);

    console.log(`Token: ${tokenAddress}`);
    console.log(`  Admin balance  : ${balance.toString()}`);
    console.log(`  Allowance to PB: ${allowance.toString()}`);
    console.log(`  Can transfer   : ${allowance >= 15 ? "✓ YES" : "✗ NO"}`);
    console.log();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
