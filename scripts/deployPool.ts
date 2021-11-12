import { Pool } from '../typechain'
import {ethers, run} from 'hardhat'
import {delay} from '../utils'
import { dotenv, fs } from "./imports";

const envConfig = dotenv.parse(fs.readFileSync(".env"))
	for (const k in envConfig) {
		process.env[k] = envConfig[k]
	}

const factory = process.env.UNISWAP_FACTORY as string;
const manager = process.env.NONFUNGIBLE_MANAGER as string;

async function deployPool() {
	const Pool = await ethers.getContractFactory('Pool')
	console.log('starting deploying pool...')
	const pool = await Pool.deploy(factory, manager) as Pool
	console.log('Pool deployed with address: ' + pool.address)
	console.log('wait of deploying...')
	await pool.deployed()
	console.log('wait of delay...')
	await delay(25000)
	console.log('starting verify pool...')
	try {
		await run('verify:verify', {
			address: pool!.address,
			contract: 'contracts/Pool.sol:Pool',
			constructorArguments: [ factory, manager ],
		});
		console.log('verify success')
	} catch (e: any) {
		console.log(e.message)
	}

}

deployPool()
.then(() => process.exit(0))
.catch(error => {
	console.error(error)
	process.exit(1)
})