from typing import List

from flask import jsonify
from requests.exceptions import RequestException


class OctantException(Exception):
    status_code = 500

    def __init__(self, message, status_code=None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def to_json(self):
        return jsonify({"message": self.message})


class InvalidEpoch(OctantException):
    code = 400
    description = "Given epoch is not valid."

    def __init__(self):
        super().__init__(self.description, self.code)


class NotImplementedForGivenEpochState(OctantException):
    code = 400
    description = "Functionality is not implemented for given epoch state"

    def __init__(self):
        super().__init__(self.description, self.code)


class EpochNotStartedYet(OctantException):
    code = 400
    description = "Given epoch has not yet started."

    def __init__(self):
        super().__init__(self.description, self.code)


class EpochAllocationPeriodNotStartedYet(OctantException):
    code = 400
    description = "Allocation period for epoch {} has not yet started."

    def __init__(self, epoch):
        super().__init__(self.description.format(epoch), self.code)


class EpochNotIndexed(OctantException):
    code = 400
    description = "Epoch {} has not yet been indexed in the Graph."

    def __init__(self, epoch_no):
        super().__init__(self.description.format(epoch_no), self.code)


class NotInDecisionWindow(OctantException):
    code = 400
    description = "The decision window is not opened."

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidProjects(OctantException):
    code = 400
    description = "The following projects are not valid: {}"

    def __init__(self, projects):
        super().__init__(self.description.format(projects), self.code)


class ProjectAllocationToSelf(OctantException):
    code = 400
    description = "You cannot allocate funds to your own project."

    def __init__(self):
        super().__init__(self.description, self.code)


class RewardsBudgetExceeded(OctantException):
    code = 400
    description = "You cannot allocate more funds than your rewards budget."

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidBudgetEstimationDetails(OctantException):
    code = 400
    description = "You must specify all required input details: {} for estimating the user budget."

    def __init__(self, details: List[str]):
        super().__init__(self.description.format(", ".join(details)), self.code)


class BudgetNotFound(OctantException):
    code = 404
    description = "User {} does not have a budget for epoch {}"

    def __init__(self, user_address, epoch_num):
        super().__init__(self.description.format(user_address, epoch_num), self.code)


class DuplicatedProjects(OctantException):
    code = 400
    description = "The following projects are duplicated in the payload: {}"

    def __init__(self, projects):
        super().__init__(self.description.format(projects), self.code)


class MissingSnapshot(OctantException):
    code = 500
    description = "No snapshot has been taken. Try calling /snapshot/pending or /snapshot/finalized endpoint"

    def __init__(self):
        super().__init__(self.description, self.code)


class SnapshotAlreadyExists(OctantException):
    code = 400
    description = "Snapshot for given epoch already exists"

    def __init__(self):
        super().__init__(self.description, self.code)


class SnapshotTooEarly(OctantException):
    code = 500
    description = (
        "Is database inconsistent? Snapshot was taken before end of the voting period."
    )

    def __init__(self):
        super().__init__(self.description, self.code)


class MissingAddress(OctantException):
    code = 400
    description = (
        "The following address: {} was not found in merkle tree from given epoch"
    )

    def __init__(self, address: str):
        super().__init__(self.description.format(address), self.code)


class NotEligibleToClaimGLM(OctantException):
    code = 403
    description = "User with address: {} is not eligible to claim GLMs."

    def __init__(self, user_address: str):
        super().__init__(self.description.format(user_address), self.code)


class GlmClaimed(OctantException):
    code = 400
    description = "User with address: {} has already claimed GLMs."

    def __init__(self, user_address: str):
        super().__init__(self.description.format(user_address), self.code)


class InvalidSignature(OctantException):
    code = 400
    description = "Given signature {} is invalid or does not belong to {}"

    def __init__(self, address: str, signature: str):
        super().__init__(self.description.format(signature, address), self.code)


class UserNotFound(OctantException):
    code = 404
    description = "User with address {} not found"

    def __init__(self, address: str):
        super().__init__(self.description.format(address), self.code)


class DuplicateConsent(OctantException):
    code = 400
    description = "Given user {} has already accepted the Terms of Service"

    def __init__(self, address: str):
        super().__init__(self.description.format(address), self.code)


class RewardsException(OctantException):
    def __init__(self, description: str, code: int = 500):
        super().__init__(description, code)


class WrongAllocationsNonce(OctantException):
    code = 400
    description = "Attempt to use wrong value of nonce ({} instead of {}) when signing allocations"

    def __init__(self, used: int, expected: int):
        super().__init__(self.description.format(used, expected), self.code)


class ExternalApiException(OctantException):
    description = "Request to an external service failed."
    code = 500

    def __init__(self, e: RequestException, status_code: int = None):
        if status_code is not None:
            self.code = status_code
        else:
            if hasattr(e, "response") and e.response is not None:
                self.code = e.response.status_code
        super().__init__(
            self.description,
            self.code,
        )


class NotAllowedInPatronMode(OctantException):
    code = 403
    description = "This action is not allowed in patron mode; user address: {}"

    def __init__(self, user_address: str):
        super().__init__(self.description.format(user_address), self.code)


class InvalidEpochException(OctantException):
    code = 400
    description = "The epoch {} is not pending or finalized"

    def __init__(self, epoch: int):
        super().__init__(self.description.format(epoch), self.code)


class EffectiveDepositNotFoundException(OctantException):
    code = 400
    description = "The effective deposit for a user {} in the epoch {} is not found"

    def __init__(self, epoch: int, user_address: str):
        super().__init__(self.description.format(user_address, epoch), self.code)


class EmptyAllocations(OctantException):
    code = 400
    description = "Passed empty or zeroed allocations"

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidBlocksRange(OctantException):
    code = 400
    description = "Attempt to use wrong range of start and end block in epoch"

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidMultisigSignatureRequest(OctantException):
    code = 400
    description = "Given multisig signature request failed validation"

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidMultisigAddress(OctantException):
    code = 403
    description = "Given multisig address is invalid"

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidMatchedRewardsStrategy(OctantException):
    code = 500
    description = (
        "Can't calculate matched rewards when locked ratio is greater than TR percent"
    )

    def __init__(self):
        super().__init__(self.description, self.code)


class DelegationAlreadyExists(OctantException):
    code = 400
    description = "Delegation already exists"

    def __init__(self):
        super().__init__(self.description, self.code)


class AddressAlreadyDelegated(OctantException):
    code = 400
    description = "Address is already used for delegation"

    def __init__(self):
        super().__init__(self.description, self.code)


class DelegationDoesNotExist(OctantException):
    code = 400
    description = "Delegation does not exists"

    def __init__(self):
        super().__init__(self.description, self.code)


class DelegationCheckWrongParams(OctantException):
    code = 400
    description = "Please specify at least 2 and not more than 10 addresses"

    def __init__(self):
        super().__init__(self.description, self.code)


class AntisybilScoreTooLow(OctantException):
    code = 400
    description = "Antisybil score {} is lower then {}"

    def __init__(self, score: float, min_score: float):
        super().__init__(self.description.format(score, min_score), self.code)


class InvalidRecalculationRequest(OctantException):
    code = 400
    description = "Invalid recalculation request"

    def __init__(self):
        super().__init__(self.description, self.code)


class IndividualLeverageNotImplementedError(OctantException):
    code = 500
    description = "Individual leverage calculation is not implemented for given epoch"

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidDelegationForLockingAddress(OctantException):
    code = 400
    description = "Secondary address cannot lock any GLMs"

    def __init__(self):
        super().__init__(self.description, self.code)


class InvalidAddressFormat(OctantException):
    code = 400
    description = "Invalid address format"

    def __init__(self):
        super().__init__(self.description, self.code)
