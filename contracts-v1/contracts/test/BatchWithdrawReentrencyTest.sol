// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "../Vault.sol";

contract BatchWithdrawReentrencyTest {
    Vault private vault;
    Vault.WithdrawPayload[] private reentryPayloads;

    constructor(address payable _vault) {
        vault = Vault(_vault);
    }

    function attack(Vault.WithdrawPayload[] calldata payloads) external {
        vault.batchWithdraw(payloads);
    }

    fallback() external payable {
        if (msg.sender == address(vault) && address(vault).balance >= 10 ether) {
            bytes32[] memory proof = new bytes32[](0);
            reentryPayloads.push(Vault.WithdrawPayload(1, 10 ether, proof));
            vault.batchWithdraw(reentryPayloads);
        }
    }
}
