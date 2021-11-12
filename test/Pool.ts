import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { expect } from 'chai'
import { encodePriceSqrt } from './shared/encodePriceSqrt'
import { getMaxTick, getMinTick } from './shared/ticks'

import {
    abi as FACTORY_ABI,
    bytecode as FACTORY_BYTECODE,
  } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'

import {
    abi as NFT_MANAGER_ABI,
    bytecode as NFT_MANAGER_BYTECODE,
  } from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'


import BigNumber from 'bignumber.js'
BigNumber.config({ EXPONENTIAL_AT: 60 })

import Web3 from 'web3'
// @ts-ignore
const web3 = new Web3(network.provider) as Web3

  
import { Token, Pool  } from '../typechain'

let tokenA: Token
let tokenB: Token
let tokenC: Token
let pool: Pool
let admin: SignerWithAddress
let user0: SignerWithAddress
let user1: SignerWithAddress
let user2: SignerWithAddress

describe('Contract: Pool', () => {
	before(async () => {
		[admin, user0, user1, user2] = await ethers.getSigners()

        let Token = await ethers.getContractFactory('Token')
		let token_descriptor = await Token.deploy('My Custom Token 0', 'MCT0') as Token
        tokenA = await Token.deploy('Token_A', 'TKA') as Token
        tokenB = await Token.deploy('Token_B', 'TKB') as Token
        tokenC = await Token.deploy('Token_C', 'TKC') as Token

		let FACTORY = new ethers.ContractFactory(FACTORY_ABI,FACTORY_BYTECODE, admin);        
		let factory  = await FACTORY.deploy() 
        console.log(typeof(factory));
        
        let NFT_MANAGER = new ethers.ContractFactory(NFT_MANAGER_ABI,NFT_MANAGER_BYTECODE, admin);  
		let nft_manager  = await NFT_MANAGER.deploy(factory.address,token_descriptor.address, token_descriptor.address) 

        let Pool = await ethers.getContractFactory('Pool')
		pool = await Pool.deploy(factory.address, nft_manager.address) as Pool
        
      //  await pool.createPool(tokenA.address, tokenB.address, 3000,  encodePriceSqrt(1, 1))
        await tokenA.approve( nft_manager.address, 1000)
        await tokenB.approve( nft_manager.address, 1000)

        await tokenA.approve( pool.address, 10000)
        await tokenB.approve( pool.address, 10000)
          
	})

	describe('Pool', () => {
		it('should create pool pair', async () => {
			await expect(pool.createPool(
                tokenA.address, 
                tokenB.address, 
                3000,  
                encodePriceSqrt(1, 1)
                ))
                .to.emit(pool, 'PoolCreated')
                .withArgs(
                    tokenA.address, 
                    tokenB.address, 
                    3000,  
                    encodePriceSqrt(1, 1)
                )
		})

        it('should create NFT position', async () => {
            const poolAddress = await pool.getPoolAddress(tokenA.address, tokenB.address, 3000)
            await expect(pool.mintNewPosition(
                tokenA.address,
                tokenB.address, 
                3000,
                getMinTick(3000),
                getMaxTick(3000),
                1000,
                1000
                ))
                .to.emit(pool, 'NFTMinted')
                .withArgs(
                    poolAddress,
                    1,
                    1000
                )
		})

        it('should create deposit', async() => {
            const deposit = await pool.deposits(1)
            expect(deposit.liquidity).to.equal(1000)
            expect(deposit.tokenA).to.equal(tokenA.address)
            expect(deposit.tokenB).to.equal(tokenB.address)
            expect(deposit.amountA).to.equal(1000)
            expect(deposit.amountB).to.equal(1000)
        })

        it('should increase liquidity ', async () => {
            await expect(pool.increaseLiquidity(
                1, 
                2000, 
                2000
                ))
                .to.emit(pool, 'LiquidityAdded')
                .withArgs(
                    2000,
                    2000,
                    2000
                )
		})

        it('should decrease liquidity ', async () => {
            await expect(pool.decreaseLiquidity(
                1, 
                1800, 
                0, 
                0))
                .to.emit(pool, 'LiquidityDecreased')
                .withArgs(
                    1799,
                    1799,
                    1800
                 )
		})

        it('should send fees', async() => {
            const balanceA = await tokenA.balanceOf(admin.address)
            const balanceB = await tokenB.balanceOf(admin.address)
            
            await pool.receiveFees(1)
            
            expect(await tokenA.balanceOf(admin.address)).to.equal(balanceA.add(1799))
            expect(await tokenB.balanceOf(admin.address)).to.equal(balanceB.add(1799))
        })

    })
})