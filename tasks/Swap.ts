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
const tokenC = process.env.TOKEN_C as string;
const fee = 3000;

task('swapExactInputSingle', 'Swaps a fixed amount amount of `_tokenIn` for a maximum possible amount of `_tokenOut`')
	.addParam('amountin', 'The exact amount of `_tokenIn` that will be swapped for `_tokenOut`')
	.addParam('amountmin', 'The minimum allowed amount of `_tokenOut` to receive for a swap')
	.setAction(async ({ amountin, amountmin }, { ethers }) => {	  
    const contract = await ethers.getContractAt('Swap', swap)
    await contract.swapExactInputSingle(
		tokenA,
		tokenB,
		fee,
		amountin,
		amountmin);   
	})

task('swapExactOutputSingle', 'Swaps a minumim possible amount of the `_tokenIn` for a fixed amount of the `_tokenOut`')
	.addParam('amountout', 'The exact amount of `_tokenOut` to receive from a swap')
	.addParam('amountmax', 'The maximum allowed amount of `_tokenOut` to spend to receive the specified amount of `_tokenId`')
	.setAction(async ({ amountout, amountmax }, { ethers }) => {	  
    const contract = await ethers.getContractAt('Swap', swap)
    await contract.swapExactOutputSingle(
		tokenA,
		tokenB,
		fee,
		amountout,
		amountmax);   
	})

task('swapExactInputMultihop', 'Swaps a fixed amount of `_tokenIn` for a maximum possible amount of `_tokenOut` through an intermediary pool')
	.addParam('amountin', 'The exact amount of `_tokenIn` that will be swapped for `_tokenOut`')
	.addParam('amountmin', 'The minimum allowed amount of `_tokenOut` to receive for a swap')
	.setAction(async ({ amountin, amountmin }, { ethers }) => {	  
    const contract = await ethers.getContractAt('Swap', swap)
    await contract.swapExactInputMultihop(
		tokenA,
		tokenB,
		tokenC,
		fee,
		fee,
		amountin,
		amountmin);   
	})

task('swapExactOutputMultihop', 'Swaps a minimum possible amount of `_tokenIn` for a fixed amount of `_tokenOut` through an intermediary pool')
	.addParam('amountout', 'The exact amount of `_tokenOut` to receive from a swap')
	.addParam('amountmax', 'The maximum allowed amount of `_tokenOut` to spend to receive the specified amount of `_tokenId`')
	.setAction(async ({ amountout, amountmax }, { ethers }) => {	  
    const contract = await ethers.getContractAt('Swap', swap)
    await contract.swapExactOutputMultihop(
		tokenA,
		tokenB,
		tokenC,
		fee,
		fee,
		amountout,
		amountmax);   
	})
