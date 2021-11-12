import { task } from 'hardhat/config'
const dotenv = require('dotenv')
const fs = require('fs')

const envConfig = dotenv.parse(fs.readFileSync(".env"))
			for (const k in envConfig) {
				process.env[k] = envConfig[k]
			} 
const swap = process.env.SWAP as string;
const pool = process.env.POOL as string;


task('getBalance', 'Balance of user')
    .addParam('token', 'the token address')
	.addParam('user', 'The address of the user')
	.setAction(async ({ user , token }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Token', token)
        const balance = await contract.balanceOf(user);
		console.log(balance.toString());
	})

task('transfer', 'transfer tokens')
    .addParam('token', 'the token address') 
    .addParam('amount', 'the amount of tokens')
	.setAction(async ({ amount, token }, { ethers }) => {
		const contract = await ethers.getContractAt('Token', token)
        await contract.transfer(swap, amount);
	})

task('approve', 'approve tokens')
    .addParam('token', 'the token address')
    .addParam('amount', 'the amount of tokens')
	.setAction(async ({ token, amount }, { ethers }) => {
		const contract = await ethers.getContractAt('Token', token)
        await contract.approve(pool, amount);
	})