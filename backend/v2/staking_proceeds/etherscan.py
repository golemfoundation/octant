import aiohttp
import aiohttp.client_exceptions
from app.exceptions import ExternalApiException
from app.infrastructure.exception_handler import ExceptionHandler
from app.infrastructure.external_api.etherscan.req_params import AccountAction
from v2.core.types import Address


MAX_RESPONSE_SIZE = 10000


class EtherscanClient:
    def __init__(self, url: str, api_key: str):
        self.url = url
        self.api_key = api_key

    async def _get_transactions(
        self,
        address: Address,
        start_block: int,
        end_block: int,
        tx_type: AccountAction,
        session: aiohttp.ClientSession,
    ) -> list[dict]:
        """
        Get transactions from Etherscan API.
        """

        transactions = []

        while True:
            params = {
                "module": "account",
                "action": tx_type.value,
                "address": address.lower(),
                "apikey": self.api_key,
                "sort": "asc",
                "startblock": start_block,
                "endblock": end_block,
                "chainid": "1",
            }

            async with session.get(self.url, params=params) as response:
                response.raise_for_status()
                data = await response.json()

                # We expect the response to be OK or No transactions found,
                # otherwise it would mean that the API changed / is not working as expected
                if data["message"] not in ["OK", "No transactions found"]:
                    raise aiohttp.ClientError("Message not OK in the API response!")

                result = data.get("result", [])
                transactions.extend(result)

                # When there are more transactions to fetch, we update the start block
                if len(result) == MAX_RESPONSE_SIZE:
                    start_block = int(result[-1]["blockNumber"])
                    continue

                # No more transactions to fetch
                break

        return transactions

    async def get_transactions(
        self,
        address: Address,
        start_block: int,
        end_block: int,
        tx_type: AccountAction,
    ) -> list[dict]:
        """
        Get transactions from Etherscan API.
        """

        try:
            async with aiohttp.ClientSession() as session:
                # We delegate to helper function to handle pagination
                #  and reduce indentation
                return await self._get_transactions(
                    address,
                    start_block,
                    end_block,
                    tx_type,
                    session,
                )

        except aiohttp.ClientError as e:
            ExceptionHandler.print_stacktrace(e)
            raise ExternalApiException(e, 500)

    async def get_block_number(self, timestamp: int) -> int:
        """
        Get block number for a given timestamp.
        """

        query: dict[str, str | int] = {
            "module": "block",
            "action": "getblocknobytime",
            "timestamp": timestamp,
            "apikey": self.api_key,
            "closest": "before",
            "chainid": "1",
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.url, params=query) as response:
                    response.raise_for_status()
                    data = await response.json()
                    return int(data["result"])

        except aiohttp.ClientError as e:
            ExceptionHandler.print_stacktrace(e)
            raise ExternalApiException(e, 500)
