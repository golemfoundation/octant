import logging
from dataclasses import dataclass
from typing import Any, Callable, Sequence, Type, Union

from pydantic import TypeAdapter
import backoff
from app import exceptions
from app.infrastructure.graphql.locks import LockEvent
from app.infrastructure.graphql.unlocks import UnlockEvent
from v2.core.types import OctantModel
from v2.core.exceptions import EpochsNotFound
from app.context.epoch.details import EpochDetails
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.exceptions import TransportQueryError

# def lookup_max_time():
#     return config.SUBGRAPH_RETRY_TIMEOUT_SEC


exception_type = TransportQueryError


def is_graph_error_permanent(error: TransportQueryError) -> bool:
    # TODO: if we differentiate between reasons for the error,
    #       we can differentiate between transient and permanent ones,
    #       so we can return True for permanent ones saving
    #       up to SUBGRAPH_RETRY_TIMEOUT_SEC.
    #       Look for these prints in logs and find
    #       "the chain was reorganized while executing the query" line.
    logging.debug("going through giveup...")
    logging.debug(f"got TransportQueryError.query_id: {error.query_id}")
    logging.debug(f"got TransportQueryError.errors: {error.errors}")
    logging.debug(f"got TransportQueryError.data: {error.data}")
    logging.debug(f"got TransportQueryError.extensions: {error.extensions}")
    return False


# url = config["SUBGRAPH_ENDPOINT"]


@dataclass
class BackoffParams:
    exception: Union[Type[Exception], Sequence[Type[Exception]]]
    max_time: int
    giveup: Callable[[Exception], bool] = lambda e: False


class EpochSubgraphItem(OctantModel):
    epoch: int
    fromTs: int
    toTs: int
    duration: int
    decisionWindow: int


class EpochsSubgraph:
    def __init__(
        self,
        url: str,
        backoff_params: BackoffParams | None = None,
    ):
        self.url = url
        self.gql_client = Client(
            transport=AIOHTTPTransport(url=self.url, timeout=2),
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

    async def fetch_locks_by_timestamp_range(
        self, from_ts: int, to_ts: int
    ) -> list[LockEvent]:
        """
        Get locks by timestamp range.
        """
        query = gql(
            """
            query GetLocks($fromTimestamp: Int!, $toTimestamp: Int!) {
              lockeds(
                first: 1000,
                skip: 0,
                orderBy: timestamp
                where: {timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp}
              ) {
                __typename
                depositBefore
                amount
                timestamp
                user
                transactionHash
              }
            }
            """
        )
        variables = {
            "fromTimestamp": from_ts,
            "toTimestamp": to_ts,
        }
        response = await self.gql_client.execute_async(query, variable_values=variables)
        return response["lockeds"]

    async def fetch_unlocks_by_timestamp_range(
        self, from_ts: int, to_ts: int
    ) -> list[UnlockEvent]:
        """
        Get unlocks by timestamp range.
        """
        query = gql(
            """
            query GetUnlocks($fromTimestamp: Int!, $toTimestamp: Int!) {
              unlockeds(
                first: 1000,
                skip: 0,
                orderBy: timestamp
                where: {timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp}
              ) {
                __typename
                depositBefore
                amount
                timestamp
                user
                transactionHash
              }
            }
            """
        )
        variables = {
            "fromTimestamp": from_ts,
            "toTimestamp": to_ts,
        }
        response = await self.gql_client.execute_async(query, variable_values=variables)
        return response["unlockeds"]

    async def fetch_epoch_by_number(self, epoch_number: int) -> EpochSubgraphItem:
        """Get EpochDetails from the subgraph for a given epoch number."""
        query = gql(
            """\
            query GetEpoch($epochNo: Int!) {
            epoches(where: {epoch: $epochNo}) {
                epoch
                fromTs
                toTs
                duration
                decisionWindow
            }
            }
            """
        )
        variables = {"epochNo": epoch_number}

        response = await self.gql_client.execute_async(query, variable_values=variables)

        data = response["epoches"]
        if not data:
            raise exceptions.EpochNotIndexed(epoch_number)

        return TypeAdapter(EpochSubgraphItem).validate_python(data[0])

    async def get_epoch_by_number(self, epoch_number: int) -> EpochDetails:
        """Get EpochDetails from the subgraph for a given epoch number."""

        epoch_details = await self.fetch_epoch_by_number(epoch_number)

        return EpochDetails(
            epoch_num=epoch_details.epoch,
            start=epoch_details.fromTs,
            duration=epoch_details.duration,
            decision_window=epoch_details.decisionWindow,
            remaining_sec=0,
        )

    async def _fetch_latest_epoch(self) -> dict[str, Any]:
        """
        Fetch the latest epoch from the subgraph.
        """
        query = gql(
            """
            query {
              epoches(first: 1, orderBy: epoch, orderDirection: desc) {
                epoch
                fromTs
                toTs
                duration
                decisionWindow
              }
              _meta {
                block {
                  number
                }
              }
            }
            """
        )

        return await self.gql_client.execute_async(query)

    async def get_latest_epoch(self) -> EpochDetails:
        """Get latest epoch from the subgraph."""
        logging.debug("[Subgraph] Getting latest epoch from subgraph.")

        response = await self._fetch_latest_epoch()
        data = response["epoches"]

        if not data:
            logging.warning("[Subgraph] No epochs included in the subgraph.")
            raise EpochsNotFound()

        logging.debug(f"[Subgraph] Received the latest epoch: {data}")

        epoch_details = data[0]
        return EpochDetails(
            epoch_num=epoch_details["epoch"],
            start=epoch_details["fromTs"],
            duration=epoch_details["duration"],
            decision_window=epoch_details["decisionWindow"],
            remaining_sec=0,
        )

    async def fetch_locks_by_address_and_timestamp_range(
        self,
        user_address: str,
        from_ts: int,
        to_ts: int,
    ) -> list[LockEvent]:
        """
        Get locks by address and timestamp range.
        """
        query = gql(
            """
            query GetLocks($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
            lockeds(
                orderBy: timestamp
                where: {timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp, user: $userAddress}
            ) {
                __typename
                depositBefore
                amount
                timestamp
                user
                transactionHash
            }
            }
            """
        )

        variables = {
            "userAddress": user_address,
            "fromTimestamp": from_ts,
            "toTimestamp": to_ts,
        }

        response = await self.gql_client.execute_async(query, variable_values=variables)
        return response["lockeds"]

    async def fetch_unlocks_by_address_and_timestamp_range(
        self,
        user_address: str,
        from_ts: int,
        to_ts: int,
    ) -> list[UnlockEvent]:
        """
        Get unlocks by address and timestamp range.
        """

        query = gql(
            """
            query GetUnlocks($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
            unlockeds(
                orderBy: timestamp
                where: {timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp, user: $userAddress}
            ) {
                __typename
                depositBefore
                amount
                timestamp
                user
                transactionHash
            }
            }
            """
        )

        variables = {
            "userAddress": user_address,
            "fromTimestamp": from_ts,
            "toTimestamp": to_ts,
        }

        response = await self.gql_client.execute_async(query, variable_values=variables)
        return response["unlockeds"]

    async def get_all_vault_merkle_root_epochs(self) -> list[int]:
        query = gql(
            """
            query {
              vaultMerkleRoots {
                epoch
                root
                timestamp
              }
            }
            """
        )

        response = await self.gql_client.execute_async(query)
        return [item["epoch"] for item in response["vaultMerkleRoots"]]

    async def get_indexed_block_num(self) -> int:
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
        response = await self.gql_client.execute_async(query)
        if response:
            return response["_meta"]["block"]["number"]
        else:
            return 0

    async def get_last_indexed_epoch_and_height(self) -> tuple[int, int]:
        """
        Get the last indexed epoch and block number.
        """
        last_indexed_epoch = await self._fetch_latest_epoch()

        if last_indexed_epoch["epoches"]:
            indexed_epoch = last_indexed_epoch["epoches"][0]["epoch"]
        else:
            indexed_epoch = 0

        indexed_height = last_indexed_epoch["_meta"]["block"]["number"]

        return indexed_epoch, indexed_height
