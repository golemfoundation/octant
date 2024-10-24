from gql import gql

from app.extensions import gql_octant_factory


def get_indexed_block_num() -> int:
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
    data = gql_octant_factory.build().execute(query)
    if data:
        return data["_meta"]["block"]["number"]
    else:
        return 0
