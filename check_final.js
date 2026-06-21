import { ethers } from 'ethers';

const checkFinalBalance = async () => {
  const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
  const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
  const QUIZ_REWARDS_ADDRESS = "0x66A159A0F8E204383D3c32Acf5DaF97f23541989";
  
  const gdContract = new ethers.Contract(GD_TOKEN_ADDRESS, ["function balanceOf(address) view returns (uint256)"], provider);
  const balance = await gdContract.balanceOf(QUIZ_REWARDS_ADDRESS);
  
  console.log("RAW_BALANCE_STR:" + balance.toString());
  console.log("LENGTH:" + balance.toString().length);
};

checkFinalBalance();
