import logging
from dataclasses import dataclass
from typing import Any, Callable, Sequence, Type, Union, List

from pydantic import TypeAdapter
import backoff
from app import exceptions
from app.infrastructure.graphql.locks import LockEvent
from app.infrastructure.graphql.unlocks import UnlockEvent
from v2.core.types import Address, OctantModel
from v2.core.exceptions import EpochsNotFound
from app.context.epoch.details import EpochDetails
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport, log as requests_logger
from gql.transport.exceptions import TransportQueryError


requests_logger.setLevel(logging.WARNING)


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


class WithdrawalEvent(OctantModel):
    amount: int
    timestamp: int
    user: Address
    transaction_hash: str


class EpochsSubgraph:
    def __init__(
        self,
        url: str,
        backoff_params: BackoffParams | None = None,
    ):
        self.url = url
        self.backoff_params = backoff_params

    @property
    def gql_client(self) -> Client:
        gql_client = Client(
            transport=AIOHTTPTransport(url=self.url, timeout=2),
            fetch_schema_from_transport=False,
        )

        if self.backoff_params is not None:
            backoff_decorator = backoff.on_exception(
                backoff.expo,
                self.backoff_params.exception,
                max_time=self.backoff_params.max_time,
                giveup=self.backoff_params.giveup,
            )

            gql_client.execute_async = backoff_decorator(gql_client.execute_async)

        return gql_client

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
        user_address: Address,
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
        user_address: Address,
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

    async def fetch_user_locks_history(
        self,
        user_address: Address,
        from_ts: int,
        limit: int,
    ) -> list[LockEvent]:
        query = gql(
            """
            query GetLocks($userAddress: Bytes!, $fromTimestamp: Int!, $limit: Int!) {
              lockeds(
                orderBy: timestamp
                orderDirection: desc
                where: {user: $userAddress, timestamp_lte: $fromTimestamp}
                first: $limit
              ) {
                __typename
                depositBefore
                amount
                timestamp
                transactionHash
                user
              }
            }
            """
        )

        variables = {
            "userAddress": user_address,
            "fromTimestamp": from_ts,
            "limit": limit,
        }

        results = await self.gql_client.execute_async(query, variable_values=variables)
        locks = results["lockeds"]

        if len(locks) == 0:
            return []

        limit_timestamp = locks[-1]["timestamp"]
        events_at_timestamp_limit = (
            await self.fetch_locks_by_address_and_timestamp_range(
                user_address, limit_timestamp, limit_timestamp + 1
            )
        )
        result_without_events_at_timestamp_limit = [
            lock for lock in locks if lock["timestamp"] != limit_timestamp
        ]
        return result_without_events_at_timestamp_limit + events_at_timestamp_limit

    async def fetch_user_unlocks_history(
        self,
        user_address: Address,
        from_ts: int,
        limit: int,
    ) -> list[UnlockEvent]:
        query = gql(
            """
            query GetUnlocks($userAddress: Bytes!, $fromTimestamp: Int!, $limit: Int!) {
            unlockeds(
                orderBy: timestamp
                orderDirection: desc
                where: {user: $userAddress, timestamp_lte: $fromTimestamp}
                first: $limit
              ) {
                __typename
                depositBefore
                amount
                timestamp
                transactionHash
                user
              }
            }
            """
        )

        variables = {
            "userAddress": user_address,
            "fromTimestamp": from_ts,
            "limit": limit,
        }

        results = await self.gql_client.execute_async(query, variable_values=variables)
        unlocks = results["unlockeds"]

        if len(unlocks) == 0:
            return []

        limit_timestamp = unlocks[-1]["timestamp"]
        events_at_timestamp_limit = (
            await self.fetch_unlocks_by_address_and_timestamp_range(
                user_address, limit_timestamp, limit_timestamp + 1
            )
        )
        result_without_events_at_timestamp_limit = [
            unlock for unlock in unlocks if unlock["timestamp"] != limit_timestamp
        ]
        return result_without_events_at_timestamp_limit + events_at_timestamp_limit

    async def fetch_withdrawals_by_address_and_timestamp_range(
        self,
        user_address: Address,
        from_ts: int,
        to_ts: int,
    ) -> list[WithdrawalEvent]:
        """
        Get withdrawals by address and timestamp range.
        """
        query = gql(
            """
            query GetWithdrawals($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
              withdrawals(
                orderBy: timestamp
                where: {user: $userAddress, timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp}
              ) {
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
        return TypeAdapter(list[WithdrawalEvent]).validate_python(
            response["withdrawals"]
        )

    async def get_user_withdrawals_history(
        self,
        user_address: Address,
        from_ts: int,
        limit: int,
    ) -> list[WithdrawalEvent]:
        """
        Get user withdrawals history before a given timestamp.
        Returns withdrawals from most recent to oldest.
        """
        query = gql(
            """
            query GetWithdrawals($userAddress: Bytes!, $fromTimestamp: Int!, $limit: Int!) {
              withdrawals(
                orderBy: timestamp
                orderDirection: desc
                where: {user: $userAddress, timestamp_lte: $fromTimestamp}
                first: $limit
              ) {
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
            "limit": limit,
        }

        partial_result = await self.gql_client.execute_async(
            query, variable_values=variables
        )
        withdrawals = TypeAdapter(list[WithdrawalEvent]).validate_python(
            partial_result["withdrawals"]
        )

        if len(withdrawals) == 0:
            return []

        limit_timestamp = withdrawals[-1].timestamp
        events_at_timestamp_limit = (
            await self.fetch_withdrawals_by_address_and_timestamp_range(
                user_address, limit_timestamp, limit_timestamp + 1
            )
        )
        result_without_events_at_timestamp_limit = [
            w for w in withdrawals if w.timestamp != limit_timestamp
        ]
        return result_without_events_at_timestamp_limit + events_at_timestamp_limit

    async def get_epochs_range(
        self, from_epoch: int, to_epoch: int
    ) -> List[EpochDetails]:
        """Get EpochDetails from the subgraph for a range of epochs.

        Args:
            from_epoch: The starting epoch number (inclusive)
            to_epoch: The ending epoch number (inclusive)

        Returns:
            List of EpochDetails ordered from oldest to newest
        """
        if from_epoch > to_epoch:
            raise ValueError("from_epoch must be less than or equal to to_epoch")

        query = gql(
            """\
            query GetEpochs($fromEpoch: Int!, $toEpoch: Int!) {
                epoches(
                    where: {epoch_gte: $fromEpoch, epoch_lte: $toEpoch}
                    orderBy: epoch
                    orderDirection: asc
                ) {
                    epoch
                    fromTs
                    toTs
                    duration
                    decisionWindow
                }
            }
            """
        )
        variables = {
            "fromEpoch": from_epoch,
            "toEpoch": to_epoch,
        }

        response = await self.gql_client.execute_async(query, variable_values=variables)
        epochs_data = response["epoches"]

        if not epochs_data:
            return []

        return [
            EpochDetails(
                epoch_num=epoch["epoch"],
                start=epoch["fromTs"],
                duration=epoch["duration"],
                decision_window=epoch["decisionWindow"],
                remaining_sec=0,
            )
            for epoch in epochs_data
        ]
