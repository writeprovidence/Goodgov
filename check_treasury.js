import { ethers } from 'ethers';

const checkTreasury = async () => {
  const RPC_URL = "https://forno.celo.org";
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  const TREASURY_ADDRESS = "0xBBab0Ae09B7DBE12c6123D5449843f99F189f35e";
  const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
  
  const gdContract = new ethers.Contract(GD_TOKEN_ADDRESS, ["function balanceOf(address) view returns (uint256)"], provider);
  const gdBalance = await gdContract.balanceOf(TREASURY_ADDRESS);

  console.log("TREASURY_GD_BALANCE:" + gdBalance.toString());
};

checkTreasury();
