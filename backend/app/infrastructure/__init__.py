from flask_restx import Resource

from eth_utils import to_checksum_address

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

    @classmethod
    def canonize_address(cls, field_name: str, force=True):
        def _add_address_canonization(handler):
            def _decorated(*args, **kwargs):
                field_value = kwargs.get(field_name)
                if force or field_value is not None:
                    updated_field = to_checksum_address(field_value)
                    kwargs.update([(field_name, updated_field)])

                return handler(*args, **kwargs)

            return _decorated

        return _add_address_canonization

    @classmethod
    def _default_address_canonizer(cls, attr):
        user_address_canonizer = OctantResource.canonize_address(
            field_name="user_address", force=False
        )
        proposal_address_canonizer = OctantResource.canonize_address(
            field_name="proposal_address", force=False
        )
        return user_address_canonizer(proposal_address_canonizer(attr))

    def __getattribute__(self, name):
        attr = object.__getattribute__(self, name)

        decorator = default_decorators.get(name)
        if decorator is not None:
            attr = OctantResource._default_address_canonizer(decorator(attr))

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
