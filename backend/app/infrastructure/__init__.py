from flask_restx import Resource
from flask import g as request_context

from app.infrastructure.exception_handler import ExceptionHandler


default_decorators = {
    "delete": ExceptionHandler.print_stacktrace_on_exception(True, True),
    "get": ExceptionHandler.print_stacktrace_on_exception(False, True),
    "patch": ExceptionHandler.print_stacktrace_on_exception(True, True),
    "post": ExceptionHandler.print_stacktrace_on_exception(True, True),
    "put": ExceptionHandler.print_stacktrace_on_exception(True, True),
}


class OctantResource(Resource):
    def __init__(self, *args, **kwargs):
        Resource.__init__(self, *args, *kwargs)

    def __getattribute__(self, name):
        attr = object.__getattribute__(self, name)

        decorator = default_decorators.get(name)
        if decorator is not None:
            attr = decorator(attr)

        return attr
