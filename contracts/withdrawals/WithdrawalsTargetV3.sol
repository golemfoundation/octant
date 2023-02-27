// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";

/// @title Contract that receives both ETH staking rewards and unstaked ETH
/// @author Golem Foundation
/// @notice
/// @dev This one is written to be upgradeable (hardhat-deploy variant).
/// Despite that, it can be deployed as-is without a proxy.
contract WithdrawalsTargetV3 is Proxied {
    // This contract uses Proxy pattern.
    // Please read more here about limitations:
    //   https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
    // Note that this contract uses hardhat's upgradeable, not OpenZeppelin's!

    /// @notice Octant address will receive rewards ETH
    address public octant;

    event OctantSet(address oldValue, address newValue);
    event OwnerSet(address oldValue, address newValue);
    event GotEth(uint amount, address sender);

    constructor () {
    }

    function init() public proxied {
    }

    // replace with Ownable for mainnet
    function multisig() view public returns (address) {
        return _proxyAdmin();
    }

    function version() public pure returns (uint) {
        return 3;
    }

    function setOctant(address newOctant) public onlyMultisig {
        emit OctantSet(octant, newOctant);
        octant = newOctant;
    }

    function withdrawRewards(address payable rewardsVault) public onlyOctant {
        rewardsVault.transfer(address(this).balance);
    }

    function withdrawUnstaked(uint256 amount) public onlyMultisig {
        payable(multisig()).transfer(amount);
    }

    /// @dev This will be removed before mainnet launch.
    /// Was added as a work-around for EIP173Proxy reverting bare ETH transfers.
    function sendETH() public payable {
        emit GotEth(msg.value, msg.sender);
    }

    modifier onlyOctant() {
        require(msg.sender == octant, "HN:WithdrawalsTarget/unauthorized-caller");
        _;
    }

    modifier onlyMultisig() {
        require(msg.sender == multisig(), "HN:WithdrawalsTarget/unauthorized-caller");
        _;
    }
}
