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
    abi as ROUTER_ABI,
    bytecode as ROUTER_BYTECODE,
  } from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'

import {
    abi as NFT_MANAGER_ABI,
    bytecode as NFT_MANAGER_BYTECODE,
  } from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'


import BigNumber from 'bignumber.js'
BigNumber.config({ EXPONENTIAL_AT: 60 })

import Web3 from 'web3'
// @ts-ignore
const web3 = new Web3(network.provider) as Web3

  
import { Token, Pool, Swap, Swap__factory  } from '../typechain'
import { loadFixture } from 'ethereum-waffle'

let tokenA: Token
let tokenB: Token
let tokenC: Token
let pool: Pool
let swap: Swap
let admin: SignerWithAddress
let user: SignerWithAddress

describe('Contract: Swap', () => {
	before(async () => {
		[admin, user] = await ethers.getSigners()

        let Token = await ethers.getContractFactory('Token')
		let token = await Token.deploy('My Custom Token 0', 'MCT0') as Token
        tokenA = await Token.deploy('Token_A', 'TKA') as Token
        tokenB = await Token.deploy('Token_B', 'TKB') as Token
        tokenC = await Token.deploy('Token_C', 'TKC') as Token
      
        if(Number(tokenA.address) > Number(tokenB.address)) {            
            let tmp = tokenB;
            tokenB = tokenA;
            tokenA = tmp
        }

        if(Number(tokenB.address) > Number(tokenC.address)) {
            let tmp = tokenC;
            tokenC = tokenB;
            tokenB = tmp
        }

        let FACTORY = new ethers.ContractFactory(FACTORY_ABI,FACTORY_BYTECODE, admin);        
		let factory  = await FACTORY.deploy() 

        let NFT_MANAGER = new ethers.ContractFactory(NFT_MANAGER_ABI,NFT_MANAGER_BYTECODE, admin);  
		let nft_manager  = await NFT_MANAGER.deploy(factory.address,token.address, token.address) 

        let Pool = await ethers.getContractFactory('Pool')
		pool = await Pool.deploy(factory.address, nft_manager.address) as Pool

		let Router = new ethers.ContractFactory(ROUTER_ABI, ROUTER_BYTECODE, admin);        
		let router  = await Router.deploy(factory.address, token.address) 
       
        let Swap = await ethers.getContractFactory('Swap')
		swap = await Swap.deploy(router.address) as Swap
        
        await pool.createPool(tokenA.address, tokenB.address, 3000,  encodePriceSqrt(1, 1))
        await pool.createPool(tokenC.address, tokenB.address, 3000,  encodePriceSqrt(1, 1))
        await tokenA.approve( pool.address, 10000000000000)
        await tokenB.approve( pool.address, 10000000000000)
        await tokenC.approve( pool.address, 10000000000000)

        await pool.mintNewPosition(
            tokenA.address,
            tokenB.address, 
            3000,
            getMinTick(3000),
            getMaxTick(3000),
            1000000000000,
            1000000000000
            );
        await pool.mintNewPosition(
            tokenB.address,
            tokenC.address, 
            3000,
            getMinTick(3000),
            getMaxTick(3000),
            1000000000000,
            1000000000000
            );
        await tokenA.transfer(user.address, 10000)
        await tokenA.connect(user).approve( swap.address, 10000)          
	})

	describe('Swap', () => {
		it('should swap exact input (single swap)', async () => {
            await expect(swap.connect(user).swapExactInputSingle(
                tokenA.address,
                tokenB.address,
                3000,
                100,
                96
            ))
            .to.emit(swap, 'SwapDone')
            .withArgs(
                100,
                98
            )
		})

        it('should swap exact output (single swap)', async () => {
            await expect(swap.connect(user).swapExactOutputSingle(
                tokenA.address,
                tokenB.address,
                3000,
                100,
                105
            ))
            .to.emit(swap, 'SwapDone')
            .withArgs(
                102,
                100
            )
        })

        it('should swap exact input (multi swap)', async () => {
            await expect(swap.connect(user).swapExactInputMultihop(
                tokenA.address,
                tokenB.address,
                tokenC.address,
                3000,
                3000,
                100,
                96
            ))
            .to.emit(swap, 'SwapDone')
            .withArgs(
                100,
                96
            )            
        })

        it('should swap exact output (multi swap)', async() => {
            await expect(swap.connect(user).swapExactOutputMultihop(
                tokenA.address,
                tokenB.address,
                tokenC.address,
                3000,
                3000,
                100,
                108
            ))
            .to.emit(swap, 'SwapDone')
            .withArgs(
                104,
                100
            )             
        })
    })
})