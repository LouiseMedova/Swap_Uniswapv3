import { task } from 'hardhat/config'
const dotenv = require('dotenv')
const fs = require('fs')

const envConfig = dotenv.parse(fs.readFileSync(".env"))
			for (const k in envConfig) {
				process.env[k] = envConfig[k]
			} 
const swap = process.env.SWAP as string;
const tokenA = process.env.TOKEN_A as string;
const tokenB = process.env.TOKEN_B as string;
const token = process.env.TOKEN as string;

task('buyToken', '')
	.addParam('token', 'A pool token')
	.addParam('amount', '')
    .addParam('ethamount', '')
	.setAction(async ({ token, amount, ethamount }, { ethers }) => {	  
    const contract = await ethers.getContractAt('Swap', swap)
    await contract.swapEthForTokens(amount,token, {value: ethamount});
      
	})

task('addLiquidityETH', 'Adds liquidity to an ERC-20/WETH pool')
	.addParam('token', 'A pool token')
    .addParam('amount', 'The amount of token to add as liquidity')
    .addParam('ethamount', 'The amount of ETH to add as liquidity')
	.setAction(async ({ token, amount, ethamount }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Swap', swap)
		const result = await contract.addLiquidityETH(token, amount,{value: ethamount} )
		console.log(result);
	})

task('addLiquidity', 'Adds liquidity to an ERC-20/WETH pool')
	.addParam('amount1', 'The amount of tokenA to add as liquidity')
    .addParam('amount2', 'The amount of tokenB to add as liquidity')
	.setAction(async ({ amount1, amount2 }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Swap', swap)
		const result = await contract.addLiquidity(tokenA, tokenB, amount1, amount2 )
		console.log(result);
	})

task('removeLiquidity', 'Removes liquidity from an ERC-20/ERC-20 pool.')
	.setAction(async ({ }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Swap', swap)
		const result = await contract.removeLiquidity(tokenA, tokenB)
		console.log(result);
	})