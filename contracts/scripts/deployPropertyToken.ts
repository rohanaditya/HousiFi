import { network } from "hardhat";

async function main() {

  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("");


  const TestUSDC = await ethers.getContractFactory("TestUSDC");
  const testUSDC = await TestUSDC.deploy();
  await testUSDC.waitForDeployment();
  const testUSDCAddress = await testUSDC.getAddress();
  console.log(`TestUSDC deployed: ${testUSDCAddress}`);


  const PropertyBuy = await ethers.getContractFactory("PropertyBuy");
  const propertyBuy = await PropertyBuy.deploy(deployer.address, testUSDCAddress);
  await propertyBuy.waitForDeployment();
  const propertyBuyAddress = await propertyBuy.getAddress();
  console.log(`PropertyBuy deployed: ${propertyBuyAddress}`);

  const PropertySell = await ethers.getContractFactory("PropertySell");
  const propertySell = await PropertySell.deploy(deployer.address, testUSDCAddress);
  await propertySell.waitForDeployment();
  const propertySellAddress = await propertySell.getAddress();
  console.log(`PropertySell deployed: ${propertySellAddress}`);
  console.log("");

  const properties = [
    { id: 1, name: "Sunset Villa Token",     symbol: "SVT" },
    { id: 2, name: "Harbour Loft Token",     symbol: "HLT" },
    { id: 3, name: "Mountain Chalet Token",  symbol: "MCT" },
    { id: 4, name: "City Plaza Token",       symbol: "CPT" },
    { id: 5, name: "Riverside House Token",  symbol: "RHT" },
  ];

  const PropertyToken = await ethers.getContractFactory("PropertyToken");

  const deployedTokens: Array<{
    id: number;
    symbol: string;
    address: string;
    contract: Awaited<ReturnType<typeof PropertyToken.deploy>>;
  }> = [];

  for (const property of properties) {
    const propertyToken = await PropertyToken.deploy(
      property.id,
      property.name,
      property.symbol,
      deployer.address
    );
    await propertyToken.waitForDeployment();
    const address = await propertyToken.getAddress();

    console.log(
      `PropertyToken ${property.symbol} (id: ${property.id}) deployed: ${address}`
    );

    deployedTokens.push({
      id: property.id,
      symbol: property.symbol,
      address,
      contract: propertyToken,
    });
  }
  console.log("");

  for (const { symbol, contract } of deployedTokens) {
    const tx = await contract.approve(propertyBuyAddress, 100);
    await tx.wait();
    console.log(`Admin approved PropertyBuy for ${symbol} ✓`);
  }
  console.log("");


  const usdcApprovalAmount = ethers.parseUnits("1000000000", 6); // 1B tUSDC
  const usdcApprovalTx = await testUSDC.approve(
    propertySellAddress,
    usdcApprovalAmount
  );
  await usdcApprovalTx.wait();
  console.log("Admin approved PropertySell for tUSDC ✓");
  console.log("");

  const DEPLOYED_ADDRESSES = {
    testUSDC: testUSDCAddress,
    propertyBuy: propertyBuyAddress,
    propertySell: propertySellAddress,
    propertyTokens: deployedTokens.reduce<Record<number, string>>(
      (acc, { id, address }) => {
        acc[id] = address;
        return acc;
      },
      {}
    ),
  };

  console.log("DEPLOYED_ADDRESSES =");
  console.log(JSON.stringify(DEPLOYED_ADDRESSES, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


