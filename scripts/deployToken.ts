import {Token } from '../typechain'
import {ethers, run} from 'hardhat'
import {delay} from '../utils'

async function deployToken() {
	const Token = await ethers.getContractFactory('Token')
	console.log('starting deploying token...')
	const token = await Token.deploy('MyToken1', 'MTK1') as Token
	console.log('MyToken deployed with address: ' + token.address)
	console.log('wait of deploying...')
	await token.deployed()
	console.log('wait of delay...')
	await delay(25000)
	console.log('starting verify token...')
	try {
		await run('verify:verify', {
			address: token!.address,
			contract: 'contracts/Token.sol:Token',
			constructorArguments: [ 'MyToken1', 'MTK1' ],
		});
		console.log('verify success')
	} catch (e: any) {
		console.log(e.message)
	}

}

deployToken()
.then(() => process.exit(0))
.catch(error => {
	console.error(error)
	process.exit(1)
})