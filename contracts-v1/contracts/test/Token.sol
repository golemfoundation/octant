// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(address[] memory initialRecipients) ERC20("Token", "TKN") {
        for(uint256 i = 0; i < initialRecipients.length; ++i){
            _mint(initialRecipients[i], 500000000 ether);
        }
    }
}
