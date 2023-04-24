import sys
import traceback

from flask import jsonify


class OctantException(Exception):
    status_code = 500

    def __init__(self, message, status_code=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def to_json(self):
        return jsonify(self.message)


def handle_octant_exception(e: OctantException):
    __print_stacktrace()
    response = e.to_json()
    response.status_code = e.status_code
    return response


def handle_unexpected_exception(_):
    __print_stacktrace()
    response = jsonify({'message': 'An unexpected error has occurred'})
    response.status_code = 500
    return response


def __print_stacktrace():
    etype, value, tb = sys.exc_info()
    traceback.print_exception(etype, value, tb)
