import { network } from "hardhat";

const PROPERTY_SELL_ADDRESS = "0x13fFA9145f8885B6765F028C6D5AFf450074bbd3";
const TEST_USDC_ADDRESS = "0x9076a4d4f905C109D5A8E41DdA4E767F44A16308";

async function main() {
  const { ethers } = await network.connect();
  const [admin] = await ethers.getSigners();

  const propertySell = new ethers.Contract(
    PROPERTY_SELL_ADDRESS,
    ["function adminWallet() external view returns (address)"],
    admin
  );
  const tusdc = new ethers.Contract(
    TEST_USDC_ADDRESS,
    [
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
    ],
    admin
  );

  const expectedAdmin = await propertySell.adminWallet();
  if (admin.address.toLowerCase() !== expectedAdmin.toLowerCase()) {
    throw new Error(`Connected signer ${admin.address} is not PropertySell admin ${expectedAdmin}`);
  }

  const balance = await tusdc.balanceOf(admin.address);
  const currentAllowance = await tusdc.allowance(admin.address, PROPERTY_SELL_ADDRESS);

  console.log(`Admin wallet: ${admin.address}`);
  console.log(`tUSDC balance: ${ethers.formatUnits(balance, 18)}`);
  console.log(`Current PropertySell allowance: ${ethers.formatUnits(currentAllowance, 18)}`);

  if (currentAllowance === ethers.MaxUint256) {
    console.log("PropertySell already has max tUSDC allowance.");
    return;
  }

  const tx = await tusdc.approve(PROPERTY_SELL_ADDRESS, ethers.MaxUint256);
  console.log(`Approval tx sent: ${tx.hash}`);
  await tx.wait();
  console.log("PropertySell tUSDC payout approval confirmed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
