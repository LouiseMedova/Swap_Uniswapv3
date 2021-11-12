// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
pragma abicoder v2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import './libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';



contract Pool is IERC721Receiver{
   
    struct Deposit {
        address owner;
        uint liquidity;
        address tokenA;
        address tokenB;
        uint amountA;
        uint amountB;
    }

    event PoolCreated (
        address tokenA, 
        address tokenB, 
        uint24 fee,
        uint160 price
    );

    event NFTMinted (
        address pool, 
        uint tokenId, 
        uint liquidity
    );

    event LiquidityAdded (
        uint amountA,
        uint amountB,
        uint liquidity
    );

    event LiquidityDecreased (
        uint amountA,
        uint amountB,
        uint liquidity
    );

    IUniswapV3Factory public uniswapFactory;
    INonfungiblePositionManager public nonfungiblePositionManager;
    mapping(uint256 => Deposit) public deposits;
    mapping(address => uint[]) public poolToDeposits;

    constructor(
        address _uniswapFactory,
        address _nonfungiblePositionManager) {
        uniswapFactory = IUniswapV3Factory(_uniswapFactory);
        nonfungiblePositionManager = INonfungiblePositionManager(_nonfungiblePositionManager);
    }

    function createPool(
        address _tokenA, 
        address _tokenB, 
        uint24 _fee,
        uint160 _price) external returns(address pool)
    {
        pool = uniswapFactory.createPool(_tokenA, _tokenB, _fee);
        IUniswapV3Pool(pool).initialize(_price);
        emit PoolCreated (
            _tokenA,
            _tokenB,
            _fee,
            _price
        );
    }

    function  getPoolAddress(
        address _tokenA, 
        address _tokenB, 
        uint24 _fee) public view returns(address pool)
    {
        pool =  PoolAddress.computeAddress(
            address(uniswapFactory), 
            PoolAddress.getPoolKey(_tokenA, _tokenB, _fee));
    }

    function mintNewPosition(
        address _tokenA, 
        address _tokenB, 
        uint24 _fee,
        int24 _tickLower,
        int24 _tickUpper,
        uint amountA,
        uint amountB
    )
        external 
    {
        TransferHelper.safeTransferFrom(_tokenA, msg.sender, address(this), amountA);
        TransferHelper.safeTransferFrom(_tokenB, msg.sender, address(this), amountB);

        TransferHelper.safeApprove(_tokenA, address(nonfungiblePositionManager), amountA);
        TransferHelper.safeApprove(_tokenB, address(nonfungiblePositionManager), amountB);
        
        // slippage 1%
        uint amountAMin = amountA*(1e3) - (amountA*(1e3)) / (1e2);
        uint amountBMin = amountB*(1e3) - (amountB*(1e3)) / (1e2);

        INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                token0: _tokenA,
                token1: _tokenB,
                fee: _fee,
                tickLower: _tickLower,
                tickUpper: _tickUpper,
                amount0Desired: amountA,
                amount1Desired: amountB,
                amount0Min: amountAMin/(1e3),
                amount1Min: amountBMin/(1e3),
                recipient: address(this),
                deadline: block.timestamp + 120
            });

        (uint tokenId, uint liquidity, uint amount0, uint amount1) = nonfungiblePositionManager.mint(params);
        deposits[tokenId] = Deposit(
            msg.sender, 
            liquidity,
            _tokenA,
            _tokenB,
            amount0,
            amount1);

        address pool =  getPoolAddress(_tokenA, _tokenB, _fee);
        poolToDeposits[pool].push(tokenId);
    
        if (amount0 < amountA) {
            TransferHelper.safeApprove(_tokenA, address(nonfungiblePositionManager), 0);
            TransferHelper.safeTransfer(_tokenA, msg.sender, amountA - amount0);
        }

        if (amount1 < amountB) {
            TransferHelper.safeApprove(_tokenB, address(nonfungiblePositionManager), 0);
            TransferHelper.safeTransfer(_tokenB, msg.sender, amountB - amount1);
        }

        emit NFTMinted(
            pool, 
            tokenId, 
            liquidity
         );
    }

    function increaseLiquidity(
        uint _tokenId,
        uint _amountA,
        uint _amountB
    )
        external
    {
        TransferHelper.safeTransferFrom(deposits[_tokenId].tokenA, msg.sender, address(this), _amountA);
        TransferHelper.safeTransferFrom(deposits[_tokenId].tokenB, msg.sender, address(this), _amountB);

        TransferHelper.safeApprove(deposits[_tokenId].tokenA, address(nonfungiblePositionManager), _amountA);
        TransferHelper.safeApprove(deposits[_tokenId].tokenB, address(nonfungiblePositionManager), _amountB);
         // slippage 1%
        uint amountAMin = _amountA*(1e3) - (_amountA*(1e3)) / (1e2);
        uint amountBMin = _amountB*(1e3) - (_amountB*(1e3)) / (1e2);

        INonfungiblePositionManager.IncreaseLiquidityParams memory params =
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: _tokenId,
                amount0Desired: _amountA,
                amount1Desired: _amountB,
                amount0Min: amountAMin/(1e3),
                amount1Min: amountBMin/(1e3),
                deadline: block.timestamp + 120
            });

        (uint liquidity, uint amountA, uint amountB) = nonfungiblePositionManager.increaseLiquidity(params);
        deposits[_tokenId].liquidity += liquidity;
        deposits[_tokenId].amountA += amountA;
        deposits[_tokenId].amountB += amountB;
        emit LiquidityAdded(amountA, amountB, liquidity);  
    }

    function decreaseLiquidity(
         uint _tokenId, 
         uint128 _liquidity,
         uint _amountAmin,
         uint _amountBmin 
        ) external {
        require(msg.sender == deposits[_tokenId].owner, 'Not the owner');
        INonfungiblePositionManager.DecreaseLiquidityParams memory params =
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: _tokenId,
                liquidity: _liquidity,
                amount0Min: _amountAmin,
                amount1Min: _amountBmin,
                deadline: block.timestamp + 120
            });

        (uint amountA, uint amountB) = nonfungiblePositionManager.decreaseLiquidity(params);

        deposits[_tokenId].liquidity -= _liquidity;
        deposits[_tokenId].amountA -= amountA;
        deposits[_tokenId].amountB-= amountB;

        emit LiquidityDecreased(amountA, amountB, _liquidity);
    }

    function receiveFees(uint _tokenId) external {
        INonfungiblePositionManager.CollectParams memory params =
            INonfungiblePositionManager.CollectParams({
                tokenId: _tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (uint amountA, uint amountB) = nonfungiblePositionManager.collect(params);

        TransferHelper.safeTransfer(
            deposits[_tokenId].tokenA, 
            deposits[_tokenId].owner, 
            amountA
            );

        TransferHelper.safeTransfer(
            deposits[_tokenId].tokenB, 
            deposits[_tokenId].owner, 
            amountB
            );
    }
    
    function getPosition(uint _tokenId) 
        external view returns(
            address operator, 
            address tokenA, 
            address tokenB, 
            uint128 liquidity,
            uint128 owedA,
            uint128 owedB )  {
             ( , operator,tokenA ,tokenB, , , ,liquidity, , , owedA, owedB) = nonfungiblePositionManager.positions(_tokenId);
        }

    function onERC721Received(
        address operator,
        address,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}