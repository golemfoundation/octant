from gql import gql

from app.infrastructure.qraphql.client import get_graphql_client


def get_indexed_block_num() -> int:
    graphql_client = get_graphql_client()
    query = gql(
        """
        query {
             _meta {
                block {
                    number
                }
            }
        }
    """
    )
    data = graphql_client.execute(query)
    if data:
        return data["_meta"]["block"]["number"]
    else:
        return 0
