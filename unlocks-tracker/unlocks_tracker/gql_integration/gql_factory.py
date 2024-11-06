from gql import Client
from gql.transport.requests import RequestsHTTPTransport


class GQLWithRetryBackoff(Client):
    """
    A retry wrapper for async transports. It overrides execute()
    method to handle TransportQueryError and uses @backoff decorator
    to make it retryable for given period of time.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def execute(self, *args, **kwargs):
        return super().execute(*args, **kwargs)


class GQLConnectionFactory:
    def __init__(self):
        self._url = None

    def set_url(self, url: str):
        self._url = url

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


gql_factory = GQLConnectionFactory()
gql_factory.set_url("https://graph.mainnet.octant.app/subgraphs/name/octant")
