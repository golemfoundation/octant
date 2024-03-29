// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "../interfaces/IWithdrawalsTarget.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {CommonErrors} from "../Errors.sol";

/// @title Contract that receives both ETH staking rewards and unstaked ETH
/// @author Golem Foundation
/// @notice
/// @dev This one is written to be upgradeable (hardhat-deploy variant).
/// Despite that, it can be deployed as-is without a proxy.
contract WithdrawalsTarget is Initializable, IWithdrawalsTarget {
    // This contract uses Proxy pattern.
    // Please read more here about limitations:
    //   https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
    // Note that this contract uses hardhat's upgradeable, not OpenZeppelin's!

    /// @dev Emitted when ETH is withdrawn from target.
    /// @param to The address to send the rewards ETH to.
    /// @param amount The amount of rewards ETH to send (WEI).
    event Withdrawn(address to, uint256 amount);

    /// @notice Multisig address
    address public multisig;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _multisig) external initializer {
        require(_multisig != address(0));
        multisig = _multisig;
    }

    function version() external pure returns (uint256) {
        return 1;
    }

    function withdraw(uint256 amount) external onlyMultisig {
        require(address(this).balance >= amount, CommonErrors.FAILED_TO_SEND);
        (bool success, ) = payable(multisig).call{value: amount}("");
        require(success, CommonErrors.FAILED_TO_SEND);

        emit Withdrawn(multisig, amount);
    }

    /// @dev Modifier that allows only multisig address to call a function.
    modifier onlyMultisig() {
        require(msg.sender == multisig, CommonErrors.UNAUTHORIZED_CALLER);
        _;
    }
}
