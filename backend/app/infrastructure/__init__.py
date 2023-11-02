from flask_restx import Resource
from flask import make_response
from io import StringIO
import csv

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

    @classmethod
    def response_mimetype(cls, request):
        return request.accept_mimetypes.best_match(cls.representations)

    @staticmethod
    def encode_csv_response(data, code, headers):
        # first row should contain an empty object to enable header resolution
        header = data[0].keys()
        data = data[1:]

        si = StringIO()
        cw = csv.DictWriter(si, fieldnames=header, dialect=csv.excel)

        cw.writeheader()
        cw.writerows(data)

        return make_response(si.getvalue(), code, headers)

    @staticmethod
    def encode_json_response(data, code, headers):
        return make_response(data, code, headers)

    # Columns should contain all columns that are required. Keys in data that are not in colums are ignored.
    @staticmethod
    def csv_matrix(data, columns, column_field, row_field, value_field):
        store = {}
        for row in data:
            if row[row_field] in store.keys():
                obj = store[row[row_field]]
            else:
                obj = {row_field: row[row_field]}
                store[row[row_field]] = obj
            for column in columns:
                if row[column_field] == column:
                    obj[column] = row[value_field]
        return sorted(store.values(), key=lambda x: x[row_field])
