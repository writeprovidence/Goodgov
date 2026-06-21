import { ethers } from 'ethers';

const checkDecimals = async () => {
  const RPC_URL = "https://forno.celo.org";
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
  
  const gdContract = new ethers.Contract(GD_TOKEN_ADDRESS, ["function decimals() view returns (uint8)", "function symbol() view returns (string)", "function balanceOf(address) view returns (uint256)"], provider);
  const decimals = await gdContract.decimals();
  const symbol = await gdContract.symbol();
  const balance = await gdContract.balanceOf("0x66A159A0F8E204383D3c32Acf5DaF97f23541989");

  console.log("SYMBOL:" + symbol);
  console.log("DECIMALS:" + decimals);
  console.log("RAW_BALANCE:" + balance.toString());
  console.log("FORMATTED_BALANCE:" + ethers.utils.formatUnits(balance, decimals));
};

checkDecimals();
