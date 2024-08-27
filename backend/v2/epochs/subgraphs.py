import logging
from dataclasses import dataclass
from typing import Callable, Sequence, Type, Union

import backoff
from app import exceptions
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

    async def get_epoch_by_number(self, epoch_number: int) -> EpochDetails:
        """Get EpochDetails from the subgraph for a given epoch number."""

        logging.debug(
            f"[Subgraph] Getting epoch properties for epoch number: {epoch_number}"
        )

        # Prepare query and variables
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

        # Execute query
        response = await self.gql_client.execute_async(query, variable_values=variables)

        # Raise exception if no data received
        data = response["epoches"]
        if not data:
            logging.warning(
                f"[Subgraph] No epoch properties received for epoch number: {epoch_number}"
            )
            raise exceptions.EpochNotIndexed(epoch_number)

        # Parse response and return result
        logging.debug(f"[Subgraph] Received epoch properties: {data[0]}")

        epoch_details = data[0]

        return EpochDetails(
            epoch_num=epoch_details["epoch"],
            start=epoch_details["fromTs"],
            duration=epoch_details["duration"],
            decision_window=epoch_details["decisionWindow"],
            remaining_sec=0,
        )


# def get_epochs():
#     query = gql(
#         """
# query {
#   epoches(first: 1000) {
#     epoch
#     fromTs
#     toTs
#   }
#   _meta {
#     block {
#       number
#     }
#   }
# }
#     """
#     )

#     app.logger.debug("[Subgraph] Getting list of all epochs")
#     data = gql_factory.build().execute(query)
#     return data
