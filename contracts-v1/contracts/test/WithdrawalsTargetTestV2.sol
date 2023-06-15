// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/IWithdrawalsTarget.sol";

import "hardhat-deploy/solc_0.8/openzeppelin/proxy/utils/Initializable.sol";
import {CommonErrors} from "../Errors.sol";


contract WithdrawalsTargetTestV2 is Initializable, IWithdrawalsTarget {

    /// @notice Multisig address
    address public multisig;
    string public greeting;

    function version() external pure returns (uint256) {
        return 2;
    }

    function withdraw(uint256 amount) external onlyMultisig {
        payable(multisig).transfer(amount);
    }

    function setGreeting(string memory _greeting) external onlyMultisig {
        greeting = _greeting;
    }

    function test() external view returns (string memory) {
        return greeting;
    }

    /// @dev Modifier that allows only multisig address to call a function.
    modifier onlyMultisig() {
        require(msg.sender == multisig, CommonErrors.UNAUTHORIZED_CALLER);
        _;
    }
}
