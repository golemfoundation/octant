from flask_restx import Resource

from eth_utils import to_checksum_address

from gql import Client
from gql.transport.requests import RequestsHTTPTransport
from gql.transport.exceptions import TransportQueryError
import backoff

from app.settings import Config, config
from app.infrastructure.exception_handler import ExceptionHandler
from flask import current_app as app

from app.exceptions import InvalidAddressFormat

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
                    try:
                        updated_field = to_checksum_address(field_value)
                    except ValueError:
                        raise InvalidAddressFormat()
                    else:
                        kwargs.update([(field_name, updated_field)])

                return handler(*args, **kwargs)

            return _decorated

        return _add_address_canonization

    @classmethod
    def _default_address_canonizer(cls, attr):
        user_address_canonizer = OctantResource.canonize_address(
            field_name="user_address", force=False
        )
        project_address_canonizer = OctantResource.canonize_address(
            field_name="project_address", force=False
        )
        return user_address_canonizer(project_address_canonizer(attr))

    def __getattribute__(self, name):
        attr = object.__getattribute__(self, name)

        decorator = default_decorators.get(name)
        if decorator is not None:
            attr = OctantResource._default_address_canonizer(decorator(attr))

        return attr


def lookup_max_time():
    return config.SUBGRAPH_RETRY_TIMEOUT_SEC


def is_graph_error_permanent(error):
    # TODO: if we differentiate between reasons for the error,
    #       we can differentiate between transient and permanent ones,
    #       so we can return True for permanent ones saving
    #       up to SUBGRAPH_RETRY_TIMEOUT_SEC.
    #       Look for these prints in logs and find
    #       "the chain was reorganized while executing the query" line.
    app.logger.debug("going through giveup...")
    app.logger.debug(f"got TransportQueryError.query_id: {error.query_id}")
    app.logger.debug(f"got TransportQueryError.errors: {error.errors}")
    app.logger.debug(f"got TransportQueryError.data: {error.data}")
    app.logger.debug(f"got TransportQueryError.extensions: {error.extensions}")
    return False


class GQLWithRetryBackoff(Client):
    """
    A retry wrapper for async transports. It overrides execute()
    method to handle TransportQueryError and uses @backoff decorator
    to make it retryable for given period of time.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @backoff.on_exception(
        backoff.expo,
        TransportQueryError,
        max_time=lookup_max_time,
        giveup=is_graph_error_permanent,
    )
    def execute(self, *args, **kwargs):
        return super().execute(*args, **kwargs)


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

        client = GQLWithRetryBackoff()
        transport = RequestsHTTPTransport(url=self._url, timeout=2)
        client.transport = transport
        client.fetch_schema_from_transport = False

        return client
