import logging
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
from gql.client import log as requests_logger


import backoff
from app.infrastructure.sablier.events import SablierStream
from v2.epochs.subgraphs import BackoffParams

requests_logger.setLevel(logging.WARNING)


class SablierSubgraph:
    def __init__(
        self,
        url: str,
        sender: str,
        token_address: str,
        backoff_params: BackoffParams | None = None,
    ):
        requests_logger.setLevel(logging.WARNING)
        self.url = url
        self.sender = sender
        self.token_address = token_address

        self.gql_client = Client(
            transport=AIOHTTPTransport(
                url=self.url,
                timeout=2,
            ),
            fetch_schema_from_transport=False,
        )

        if backoff_params is not None:
            backoff_decorator = backoff.on_exception(
                backoff.expo,
                backoff_params.exception,
                max_time=backoff_params.max_time,
                giveup=backoff_params.giveup,
            )

            self.gql_client.execute_async = backoff_decorator(
                self.gql_client.execute_async
            )

    async def _fetch_streams(self, query: str, variables: dict) -> list[SablierStream]:
        all_streams = []
        has_more = True
        limit = 1000
        skip = 0

        while has_more:
            variables.update({"limit": limit, "skip": skip})

            result = await self.gql_client.execute_async(
                gql(query), variable_values=variables
            )

            streams = result.get("streams", [])

            for stream in streams:
                actions = stream.get("actions", [])
                final_intact_amount = stream.get("intactAmount", 0)
                all_streams.append(
                    SablierStream(actions=actions, intactAmount=final_intact_amount)
                )

            if len(streams) < limit:
                has_more = False
            else:
                skip += limit

        return all_streams

    async def get_all_streams_history(self) -> list[SablierStream]:
        """
        Get all the locks and unlocks in history.
        """

        query = """
            query GetAllEvents($sender: String!, $tokenAddress: String!, $limit: Int!, $skip: Int!) {
            streams(
                where: {
                sender: $sender
                asset_: {address: $tokenAddress}
                transferable: false
                }
                first: $limit
                skip: $skip
                orderBy: timestamp
            ) {
                id
                intactAmount
                actions(where: {category_in: [Cancel, Withdraw, Create]}, orderBy: timestamp) {
                category
                addressA
                addressB
                amountA
                amountB
                timestamp
                hash
                }
            }
            }
        """
        variables = {
            "sender": self.sender,
            "tokenAddress": self.token_address,
        }

        return await self._fetch_streams(query, variables)
