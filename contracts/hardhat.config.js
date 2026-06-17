require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

if (!TREASURY_PRIVATE_KEY) {
  console.warn("⚠️  TREASURY_PRIVATE_KEY not found in .env — deployment will fail.");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: TREASURY_PRIVATE_KEY ? [TREASURY_PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
