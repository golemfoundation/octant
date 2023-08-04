from gql import Client
from gql.transport.aiohttp import AIOHTTPTransport

from app.settings import config


def get_graphql_client() -> Client:
    graphql_client = Client()
    transport = AIOHTTPTransport(
        url=config.SUBGRAPH_ENDPOINT,
    )
    graphql_client.transport = transport
    graphql_client.fetch_schema_from_transport = True

    return graphql_client
