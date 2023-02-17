// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";

/// @title Contract that receives both ETH staking rewards and unstaked ETH
/// @author Golem Foundation
/// @notice
/// @dev This one is written to be upgradeable (hardhat-deploy variant).
/// Despite that, it can be deployed as-is without a proxy.
contract WithdrawalsTarget is Proxied {
    // This contract uses Proxy pattern.
    // Please read more here about limitations:
    //   https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
    // Note that this contract uses hardhat's upgradeable, not OpenZeppelin's!

    /// @notice Hexagon address - expected to withdraw rewards ETH
    address public hexagon;

    event HexagonSet(address oldValue, address newValue);
    event OwnerSet(address oldValue, address newValue);

    constructor () {}

    function init() public proxied {}

    function version() public pure returns (uint) {
        return 1;
    }

    function setHexagon(address newHexagon) public {
        emit HexagonSet(hexagon, newHexagon);
        hexagon = newHexagon;
    }
}
