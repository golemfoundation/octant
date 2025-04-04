import logging
import os

import backoff
from gql import Client, gql
from gql.client import log as requests_logger
from gql.transport.aiohttp import AIOHTTPTransport

from app.infrastructure.sablier.events import SablierStream
from v2.core.types import Address
from v2.epochs.subgraphs import BackoffParams

requests_logger.setLevel(logging.WARNING)


logger = logging.getLogger(__name__)


def is_e2e_env() -> bool:
    return os.getenv("ENV_TYPE") == "e2e"


class SablierSubgraph:
    def __init__(
        self,
        url: str,
        sender: str,
        token_address: str,
        incorrectly_cancelled_streams_ids: set,
        backoff_params: BackoffParams | None = None,
    ):
        requests_logger.setLevel(logging.WARNING)
        self.url = url
        self.sender = sender
        self.token_address = token_address
        self.incorrectly_cancelled_streams_ids = incorrectly_cancelled_streams_ids

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

    def _check_if_incorrectly_cancelled_stream(self, source_stream_id: str) -> bool:
        """
        This function fixes the issue with incorrectly cancelled streams.

        Source stream id is the stream id from the subgraph. Its format is: "0x{stream_id}-<nr>-<num_id>".
        The last part of the stream id is the id from the source of truth.
        """
        processed_stream_id = int(source_stream_id.split("-")[-1])
        return processed_stream_id in self.incorrectly_cancelled_streams_ids

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
                stream_id = stream.get("id")
                if self._check_if_incorrectly_cancelled_stream(stream_id) is True:
                    continue

                actions = stream.get("actions", [])
                final_intact_amount = stream.get("intactAmount", 0)
                is_cancelled = stream.get("canceled")
                end_time = stream.get("endTime")
                deposit_amount = stream.get("depositAmount")
                recipient = stream.get("recipient")

                all_streams.append(
                    SablierStream(
                        actions=actions,
                        intactAmount=final_intact_amount,
                        canceled=is_cancelled,
                        endTime=end_time,
                        depositAmount=deposit_amount,
                        recipient=recipient,
                    )
                )

            if len(streams) < limit:
                has_more = False
            else:
                skip += limit

        return all_streams

    async def get_all_streams_history(self) -> list[SablierStream]:
        """
        Get all the locks and unlocks in history.

        Returns empty list if E2E environment is detected.
        """

        # This is for E2E tests only!
        # these request timeout sometimes causing pending snapshot to fail and subsequently E2E tests to crash.
        if is_e2e_env():
            logger.info("E2E environment detected, skipping Sablier subgraph query")
            return []

        query = """
            query GetAllEvents($sender: String!, $tokenAddress: String!, $limit: Int!, $skip: Int!) {
            streams(
                where: {
                sender: $sender
                asset_: {address: $tokenAddress}
                }
                first: $limit
                skip: $skip
                orderBy: timestamp
            ) {
                id
                intactAmount
                canceled
                endTime
                depositAmount
                recipient
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

    async def get_user_events_history(
        self, user_address: Address
    ) -> list[SablierStream]:
        """
        Get all the locks and unlocks for a user.
        Query used for computing user's effective deposit and getting all sablier streams from an endpoint.

        Returns empty list if E2E environment is detected.
        """

        # This is for E2E tests only!
        # these request timeout sometimes causing pending snapshot to fail and subsequently E2E tests to crash.
        if is_e2e_env():
            logger.info("E2E environment detected, skipping Sablier subgraph query")
            return []

        query = """
            query GetEvents($sender: String!, $recipient: String!, $tokenAddress: String!, $limit: Int!, $skip: Int!) {
            streams(
                where: {
                sender: $sender
                recipient: $recipient
                asset_: {address: $tokenAddress}
                transferable: false
                }
                first: $limit
                skip: $skip
                orderBy: timestamp
            ) {
                id
                intactAmount
                canceled
                endTime
                depositAmount
                recipient
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
            "recipient": user_address,
            "tokenAddress": self.token_address,
        }

        return await self._fetch_streams(query, variables)
