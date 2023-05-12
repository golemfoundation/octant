// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory _name, string memory _symbol, uint256 _amountToMint) ERC20(_name, _symbol) {
        _mint(msg.sender, _amountToMint);
    }
}
