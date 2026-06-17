const hre = require("hardhat");

async function main() {
  // GoodDollar (G$) ERC-20 on Celo Mainnet
  const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";

  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("═══════════════════════════════════════════════");
  console.log("  GoodGov QuizRewards — Celo Mainnet Deployment");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Deployer:       ${deployerAddress}`);
  console.log(`  G$ Token:       ${GD_TOKEN_ADDRESS}`);
  console.log(`  Signer Wallet:  ${deployerAddress}`);
  console.log("───────────────────────────────────────────────");

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  const balanceInCelo = hre.ethers.formatEther(balance);
  console.log(`  CELO Balance:   ${balanceInCelo} CELO`);

  if (balance === 0n) {
    throw new Error("Deployer has 0 CELO. You need CELO for gas fees. Buy some on an exchange or transfer from another wallet.");
  }

  console.log("\n  Deploying QuizRewards...\n");

  // Deploy the contract
  // Constructor: QuizRewards(address _goodDollar, address _signerWallet)
  // The signer wallet = deployer (same treasury key that will sign reward messages from the backend)
  const QuizRewards = await hre.ethers.getContractFactory("QuizRewards");
  const quizRewards = await QuizRewards.deploy(GD_TOKEN_ADDRESS, deployerAddress);

  await quizRewards.waitForDeployment();
  const contractAddress = await quizRewards.getAddress();

  console.log("═══════════════════════════════════════════════");
  console.log("  ✅ DEPLOYMENT SUCCESSFUL");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  G$ Token:         ${GD_TOKEN_ADDRESS}`);
  console.log(`  Signer:           ${deployerAddress}`);
  console.log(`  Owner:            ${deployerAddress}`);
  console.log("───────────────────────────────────────────────");
  console.log("\n  ⚠️  NEXT STEPS:");
  console.log(`  1. Send G$ tokens to the contract: ${contractAddress}`);
  console.log("     The contract needs G$ to distribute as rewards.");
  console.log("  2. Update your frontend with the contract address.");
  console.log("  3. Verify on Celoscan (optional):");
  console.log(`     npx hardhat verify --network celo ${contractAddress} "${GD_TOKEN_ADDRESS}" "${deployerAddress}"`);
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message || error);
    process.exit(1);
  });
