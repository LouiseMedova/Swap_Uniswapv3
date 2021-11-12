// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';


contract Swap {

  ISwapRouter public swapRouter;
  
  // 0.3%.
  uint24 public constant poolFee = 3000;

  constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

  event LiquidityAdded (
    uint amountA,
    uint amountB,
    uint liquidity
  );

  event LiquidityRemoved (
    uint amountA,
    uint amountB
  );

  event SwapDone (
    uint amountIn,
    uint amountOut
  );

  // constructor(address _routerAddress, address _factoryAddress){
  //   router = IUniswapV2Router02(_routerAddress);
  //   factory = IUniswapV2Factory(_factoryAddress);
  // }

  receive() payable external {}

  // function swapEthForTokens(uint _amount, address _token) external payable {
  //     address[] memory path = new address[](2);
  //     path[0] = router.WETH();
  //     path[1] = _token;
  //     uint[] memory amounts = router.swapETHForExactTokens{value: msg.value}(
  //       _amount, 
  //       path, 
  //       address(this), 
  //       block.timestamp + 120);
  //   emit SwapDone(amounts[0], amounts[1]);
  //   (bool success,) = msg.sender.call{ value: address(this).balance }("");
  //   require(success, "refund failed");
  // }

  // function addLiquidityETH(address _token, uint _amount) external payable {
  //     ERC20(_token).transferFrom(msg.sender, address(this), _amount);
  //     ERC20(_token).approve(address(router), _amount);
  //     (uint amountToken, uint amountEth, uint liquidity) = router.addLiquidityETH
  //     { value: msg.value }(
  //       _token, 
  //       _amount,  
  //       _amount, 
  //       msg.value, 
  //       address(this),
  //       block.timestamp + 120);
  //       emit LiquidityAdded(
  //         amountToken, 
  //         amountEth, 
  //         liquidity);
  // }

  // function addLiquidity(
  //   address _tokenA,
  //   address _tokenB,
  //   uint _amountA,
  //   uint _amountB) external {
  //     ERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);
  //     ERC20(_tokenB).transferFrom(msg.sender, address(this), _amountB);
  //     ERC20(_tokenA).approve(address(router), _amountA);
  //     ERC20(_tokenB).approve(address(router), _amountB);
  //     (uint amountA, uint amountB, uint liquidity) = router.addLiquidity(
  //       _tokenA, 
  //       _tokenB,
  //       _amountA,
  //       _amountB,
  //       1,
  //       1,
  //       address(this),
  //       block.timestamp + 120);
  //       emit LiquidityAdded(
  //         amountA,
  //         amountB,
  //         liquidity
  //       );
  //   }
    
  // function removeLiquidity(address _tokenA, address _tokenB) external {
  //   address pair = factory.getPair(_tokenA, _tokenB);
  //   uint liquidity = ERC20(pair).balanceOf(address(this));
  //   ERC20(pair).approve(address(router), liquidity);
  //   (uint amountA, uint amountB) = router.removeLiquidity(
  //     _tokenA, 
  //     _tokenB, 
  //     liquidity, 
  //     1, 
  //     1, 
  //     address(this), 
  //     block.timestamp + 120);
  //    emit LiquidityRemoved(
  //         amountA,
  //         amountB
  //       );
  // }
}