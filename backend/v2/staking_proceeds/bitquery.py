from app.exceptions import ExternalApiException
from app.infrastructure.exception_handler import ExceptionHandler
from v2.core.types import Address
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport


class BitqueryClient:
    def __init__(self, url: str, api_key: str, bearer: str):
        self.url = url
        self.api_key = api_key
        self.bearer = bearer
        self.gql_client = Client(
            transport=AIOHTTPTransport(
                url=self.url,
                headers={
                    "Content-Type": "application/json",
                    "X-API-KEY": self.api_key,
                    "Authorization": f"Bearer {self.bearer}",
                },
            ),
            fetch_schema_from_transport=False,
        )

    async def get_blocks_rewards(
        self,
        address: Address,
        start_block: int,
        end_block: int,
    ) -> float:
        """
        Fetch Ethereum blocks rewards for given address (the miner - fee recipient)
        and start and end block.
        """
        query = gql(
            """
            query GetBlockRewards($address: String!, $startBlock: String!, $endBlock: String!) {
                EVM(dataset: combined, network: eth) {
                    MinerRewards(where: {
                        Block: {
                            Coinbase: {is: $address},
                            Number: {ge: $startBlock, le: $endBlock}
                        }
                    }) {
                        sum(of: Reward_Total)
                    }
                }
            }
            """
        )

        variables = {
            "address": str(address).lower(),
            "startBlock": str(start_block),
            "endBlock": str(end_block),
        }

        try:
            response = await self.gql_client.execute_async(
                query, variable_values=variables
            )
            return float(response["EVM"]["MinerRewards"][0]["sum"])
        except Exception as e:
            ExceptionHandler.print_stacktrace(e)
            raise ExternalApiException(e, 500)
