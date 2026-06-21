import { ethers } from 'ethers';

async function checkContract() {
  const RPC_URL = "https://forno.celo.org";
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  const QUIZ_REWARDS_ADDRESS = "0x66A159A0F8E204383D3c32Acf5DaF97f23541989";
  const contract = new ethers.Contract(
    QUIZ_REWARDS_ADDRESS,
    [
      "function signerWallet() view returns (address)",
      "function goodDollar() view returns (address)",
      "function owner() view returns (address)"
    ],
    provider
  );

  try {
    const signer = await contract.signerWallet();
    const gd = await contract.goodDollar();
    const owner = await contract.owner();
    const balance = await provider.getBalance(QUIZ_REWARDS_ADDRESS);
    
    // Check G$ balance
    const gdContract = new ethers.Contract(gd, ["function balanceOf(address) view returns (uint256)"], provider);
    const gdBalance = await gdContract.balanceOf(QUIZ_REWARDS_ADDRESS);

    const out = `
Contract: ${QUIZ_REWARDS_ADDRESS}
Signer: ${signer}
G$ Address: ${gd}
Owner: ${owner}
CELO Balance: ${ethers.utils.formatEther(balance)}
G$ Balance: ${ethers.utils.formatUnits(gdBalance, 18)}
`;
    process.stdout.write(out);

  } catch (err) {
    process.stdout.write("Error: " + err.message);
  }
}

checkContract();
