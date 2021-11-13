import { task } from 'hardhat/config'
const dotenv = require('dotenv')
const fs = require('fs')
import { encodePriceSqrt } from '../test/shared/encodePriceSqrt'
import { getMaxTick, getMinTick } from '../test/shared/ticks'

const envConfig = dotenv.parse(fs.readFileSync(".env"))
			for (const k in envConfig) {
				process.env[k] = envConfig[k]
			} 
const pool = process.env.POOL as string;
const tokenA = process.env.TOKEN_A as string;
const tokenB = process.env.TOKEN_B as string;
const tokenC = process.env.TOKEN_C as string;
const fee = 3000;

task('createPool', 'Creates a pool for the given two tokens and fee')
	.setAction(async ({  }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const result = await contract.createPool(tokenB, tokenC, fee, encodePriceSqrt(1, 1))
		console.log(result);
	})

task('mint', 'Creates a new position wrapped in a NFT')
	.addParam('amount1', 'The amount of tokenA to add as liquidity')
	.addParam('amount2', 'The amount of tokenB to add as liquidity')
	.setAction(async ({ amount1, amount2 }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const result = await contract.mintNewPosition(
			tokenB, 
			tokenC, 
			fee, 
			getMinTick(fee),
            getMaxTick(fee),
			amount1,
			amount2
			)
	})

task('increase', 'Adds liquidity')
	.addParam('id', 'The NFT ID of the position')	
	.addParam('amount1', 'The amount of tokenA to add as liquidity')
	.addParam('amount2', 'The amount of tokenB to add as liquidity')
	.setAction(async ({ id, amount1, amount2 }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const result = await contract.increaseLiquidity(
			id,
			amount1,
			amount2
			)
	})

task('decrease', 'Decreases liquidity')
	.addParam('id', 'The NFT ID of the position')	
	.addParam('liq', 'The amount of liquidity to decrease')
	.addParam('amount1', 'The minimum amount of tokenA')
	.addParam('amount2', 'The minimum amount of tokenB')
	.setAction(async ({ id, liq, amount1, amount2 }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		await contract.decreaseLiquidity(
			id,
			liq,
			amount1,
			amount2
			)
	})

task('receive', 'Decreases liquidity')
	.addParam('id', 'The NFT ID of the position')	
	.setAction(async ({ id  }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		await contract.receiveFees(id);
	})

task('getPoolAddress', 'Returns the position of deposit')
	.setAction(async ({  }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const id = await contract.getPoolAddress(tokenA, tokenB, fee);
		console.log(id);	
	})

task('getDepositInfo', 'Returns the position of deposit')
	.setAction(async ({}, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const id = await contract.deposits(9493);
		console.log(id);	
	})

