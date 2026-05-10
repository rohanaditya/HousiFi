import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const USDC_ABI = [
  "function mintFakeMoney(address to, uint256 amount) external",
];

export async function POST(req: NextRequest) {
  try {
    const { userAddress, usdcAmount } = await req.json();

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }
    if (!usdcAmount || isNaN(Number(usdcAmount)) || Number(usdcAmount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_URL,
    );
    const adminWallet = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY!,
      provider,
    );

    // Step 1 — send 0.01 SepoliaETH to cover the user's future gas
    const ethTx = await adminWallet.sendTransaction({
      to: userAddress,
      value: ethers.parseEther("0.01"),
    });
    await ethTx.wait();

    // Step 2 — mint TestUSDC (6 decimals, matching real USDC)
    const usdc = new ethers.Contract(
      process.env.TEST_USDC_ADDRESS!,
      USDC_ABI,
      adminWallet,
    );
    
    const amountInWei = ethers.parseUnits(String(usdcAmount), 18);
    console.log("usdcAmount received:", usdcAmount);
    console.log("amountInWei:", amountInWei.toString());
    const mintTx = await usdc.mintFakeMoney(userAddress, amountInWei);
    await mintTx.wait();

    return NextResponse.json({
      success: true,
      ethTxHash: ethTx.hash,
      usdcTxHash: mintTx.hash,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Relay failed";
    console.error("[faucet]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
