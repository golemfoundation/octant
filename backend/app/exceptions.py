import sys
import traceback

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


def handle_octant_exception(e: OctantException):
    print_stacktrace()
    response = e.to_json()
    response.status_code = e.status_code
    return response


def handle_unexpected_exception(_):
    print_stacktrace()
    response = jsonify({"message": UNEXPECTED_EXCEPTION})
    response.status_code = 500
    return response


def print_stacktrace():
    etype, value, tb = sys.exc_info()
    traceback.print_exception(etype, value, tb)
