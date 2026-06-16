import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();
const key = process.env.TREASURY_PRIVATE_KEY;
const wallet = new ethers.Wallet(key);
console.log('Wallet Address:', wallet.address);
