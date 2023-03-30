// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

library AllocationErrors {
    /// @notice Thrown when the user trying to allocate before first epoch has started
    /// @return HN:Allocations/not-started-yet
    string public constant EPOCHS_HAS_NOT_STARTED_YET =
        "HN:Allocations/first-epoch-not-started-yet";

    /// @notice Thrown when the user trying to allocate after decision window is closed
    /// @return HN:Allocations/decision-window-closed
    string public constant DECISION_WINDOW_IS_CLOSED =
        "HN:Allocations/decision-window-closed";

    /// @notice Thrown when user trying to allocate more than he has in rewards budget for given epoch.
    /// @return HN:Allocations/allocate-above-rewards-budget
    string public constant ALLOCATE_ABOVE_REWARDS_BUDGET =
        "HN:Allocations/allocate-above-rewards-budget";

    /// @notice Thrown when user trying to allocate to a proposal that does not exist.
    /// @return HN:Allocations/no-such-proposal
    string public constant ALLOCATE_TO_NON_EXISTING_PROPOSAL =
        "HN:Allocations/no-such-proposal";
}

library OracleErrors {
    /// @notice Thrown when trying to set the balance in oracle for epochs other then previous.
    /// @return HN:Oracle/can-set-balance-for-previous-epoch-only
    string public constant CANNOT_SET_BALANCE_FOR_PAST_EPOCHS =
        "HN:Oracle/can-set-balance-for-previous-epoch-only";

    /// @notice Thrown when trying to set the balance in oracle when balance can't yet be determined.
    /// @return HN:Oracle/can-set-balance-at-earliest-in-second-epoch
    string public constant BALANCE_CANT_BE_KNOWN =
        "HN:Oracle/can-set-balance-at-earliest-in-second-epoch";

    /// @notice Thrown when trying to set the oracle balance multiple times.
    /// @return HN:Oracle/balance-for-given-epoch-already-exists
    string public constant BALANCE_ALREADY_SET =
        "HN:Oracle/balance-for-given-epoch-already-exists";

    /// @notice Thrown if contract is misconfigured
    /// @return HN:Oracle/WithdrawalsTarget-not-set
    string public constant NO_TARGET =
        "HN:Oracle/WithdrawalsTarget-not-set";

    /// @notice Thrown if contract is misconfigured
    /// @return HN:Oracle/PayoutsManager-not-set
    string public constant NO_PAYOUTS_MANAGER =
        "HN:Oracle/PayoutsManager-not-set";

}

library DepositsErrors {
    /// @notice Thrown when transfer operation fails in GLM smart contract.
    /// @return HN:Deposits/cannot-transfer-from-sender
    string public constant GLM_TRANSFER_FAILED =
        "HN:Deposits/cannot-transfer-from-sender";

    /// @notice Thrown when trying to withdraw more GLMs than are in deposit.
    /// @return HN:Deposits/deposit-is-smaller
    string public constant DEPOSIT_IS_TO_SMALL =
        "HN:Deposits/deposit-is-smaller";
}

library EpochsErrors {
    /// @notice Thrown when calling the contract before the first epoch started.
    /// @return HN:Epochs/not-started-yet
    string public constant NOT_STARTED = "HN:Epochs/not-started-yet";

    /// @notice Thrown when updating epoch props to invalid values (decision window bigger than epoch duration.
    /// @return HN:Epochs/decision-window-bigger-than-duration
    string public constant DECISION_WINDOW_TOO_BIG = "HN:Epochs/decision-window-bigger-than-duration";
}

library TrackerErrors {
    /// @notice Thrown when trying to get info about effective deposits in future epochs.
    /// @return HN:Tracker/future-is-unknown
    string public constant FUTURE_IS_UNKNOWN = "HN:Tracker/future-is-unknown";

    /// @notice Thrown when trying to get info about effective deposits in epoch 0.
    /// @return HN:Tracker/epochs-start-from-1
    string public constant EPOCHS_START_FROM_1 =
        "HN:Tracker/epochs-start-from-1";
}

library PayoutsErrors {
    /// @notice Thrown when trying to register more funds than possess.
    /// @return HN:Payouts/registering-withdrawal-of-unearned-funds
    string public constant REGISTERING_UNEARNED_FUNDS =
        "HN:Payouts/registering-withdrawal-of-unearned-funds";
}

library ProposalsErrors {
    /// @notice Thrown when trying to change proposals that could already have been voted upon.
    /// @return HN:Proposals/only-future-proposals-changing-is-allowed
    string public constant CHANGING_PROPOSALS_IN_THE_PAST =
        "HN:Proposals/only-future-proposals-changing-is-allowed";
}

library CommonErrors {
    /// @notice Thrown when trying to call as an unauthorized account.
    /// @return HN:Common/unauthorized-caller
    string public constant UNAUTHORIZED_CALLER =
        "HN:Common/unauthorized-caller";
}
