import sys
import traceback
import logging
from flask import jsonify
from flask import g as request_context

from app.exceptions import OctantException

UNEXPECTED_EXCEPTION = "An unexpected error has occurred"

logger = logging.getLogger("gunicorn.error")


class ExceptionHandler:
    def __init__(self):
        self.default_opts = ExceptionHandlerOpts()

    @classmethod
    def print_stacktrace_on_exception(cls, octant=True, unexpected=True):
        def _add_print_stacktrace_to_context(handler):
            def _decorated(*args, **kwargs):
                request_context.exception_handler_opts = ExceptionHandlerOpts(
                    octant, unexpected
                )
                return handler(*args, **kwargs)

            return _decorated

        return _add_print_stacktrace_to_context

    def __call__(self, exception):
        opts = request_context.get("exception_handler_opts", self.default_opts)
        self.print_stacktrace(exception, opts)

        if isinstance(exception, OctantException):
            response = self._handle_octant_exception(exception)
        else:
            response = self._handle_unexpected_exception()

        return response

    def _handle_octant_exception(self, e: OctantException):
        response = e.to_json()
        response.status_code = e.status_code
        return response

    def _handle_unexpected_exception(self):
        response = jsonify({"message": UNEXPECTED_EXCEPTION})
        response.status_code = 500
        return response

    @classmethod
    def print_stacktrace(cls, exception, opts=None):
        opts = ExceptionHandlerOpts() if opts is None else opts
        if opts.should_print_stacktrace(exception):
            logger.error("An exception occurred:", exc_info=True)


class ExceptionHandlerOpts:
    def __init__(self, print_octant_exceptions=True, print_unexpected_exceptions=True):
        self.print_octant_exceptions = print_octant_exceptions
        self.print_unexpected_exceptions = print_unexpected_exceptions

    def should_print_stacktrace(self, exception):
        if isinstance(exception, OctantException):
            return self.print_octant_exceptions
        else:
            return self.print_unexpected_exceptions
