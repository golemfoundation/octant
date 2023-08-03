import logging

from flask import jsonify

UNEXPECTED_EXCEPTION = "An unexpected error has occurred"


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


class EpochNotStartedYet(OctantException):
    code = 400
    description = "Given epoch has not yet started."

    def __init__(self):
        super().__init__(self.description, self.code)


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


class InvalidProposals(OctantException):
    code = 400
    description = "The following proposals are not valid: {}"

    def __init__(self, proposals):
        super().__init__(self.description.format(proposals), self.code)


class ProposalAllocateToItself(OctantException):
    code = 400
    description = "You cannot allocate funds to your own project."

    def __init__(self):
        super().__init__(self.description, self.code)


class RewardsBudgetExceeded(OctantException):
    code = 400
    description = "You cannot allocate more funds than your rewards budget."

    def __init__(self):
        super().__init__(self.description, self.code)


class DuplicatedProposals(OctantException):
    code = 400
    description = "The following proposals are duplicated in the payload: {}"

    def __init__(self, proposals):
        super().__init__(self.description.format(proposals), self.code)


class MissingSnapshot(OctantException):
    code = 500
    description = "No snapshot has been taken. Try calling /snapshot/pending or /snapshot/finalized endpoint"

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


class DuplicateConsent(OctantException):
    code = 400
    description = "Given user {} has already accepted the Terms of Service"

    def __init__(self, address: str):
        super().__init__(self.description.format(address), self.code)


def handle_octant_exception(e: OctantException):
    logger = logging.getLogger("gunicorn.error")
    logger.error("Octant exception occurred:", exc_info=True)
    response = e.to_json()
    response.status_code = e.status_code
    return response


def handle_unexpected_exception(_):
    logger = logging.getLogger("gunicorn.error")
    logger.error("Unexpected exception occurred:", exc_info=True)
    response = jsonify({"message": UNEXPECTED_EXCEPTION})
    response.status_code = 500
    return response
