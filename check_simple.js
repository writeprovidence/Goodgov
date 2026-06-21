import { ethers } from 'ethers';

const checkContract = async () => {
  const RPC_URL = "https://forno.celo.org";
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  const QUIZ_REWARDS_ADDRESS = "0x66A159A0F8E204383D3c32Acf5DaF97f23541989";
  const contract = new ethers.Contract(
    QUIZ_REWARDS_ADDRESS,
    [
      "function signerWallet() view returns (address)",
      "function goodDollar() view returns (address)"
    ],
    provider
  );

  const signer = await contract.signerWallet();
  const gd = await contract.goodDollar();
  const gdContract = new ethers.Contract(gd, ["function balanceOf(address) view returns (uint256)"], provider);
  const gdBalance = await gdContract.balanceOf(QUIZ_REWARDS_ADDRESS);

  console.log("SIGNER_ADDRESS:" + signer);
  console.log("GD_BALANCE:" + gdBalance.toString());
};

checkContract();
