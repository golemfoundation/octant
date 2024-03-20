from flask_restx import Resource

from gql import Client
from gql.transport.requests import RequestsHTTPTransport

from app.settings import Config
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


class GQLConnectionFactory:
    def __init__(self):
        self._url = None

    def set_url(self, config: Config):
        self._url = config["SUBGRAPH_ENDPOINT"]

    def build(self):
        if not self._url:
            raise RuntimeError(
                "GQL Connection Factory hasn't been properly initialised."
            )

        client = Client()
        transport = RequestsHTTPTransport(url=self._url, timeout=2)
        client.transport = transport
        client.fetch_schema_from_transport = True

        return client
