import asyncio
import random
import aiohttp
from app.exceptions import ExternalApiException
from v2.epochs.subgraphs import BackoffParams


class SafeClient:
    def __init__(self, url: str, backoff_params: BackoffParams | None = None):
        self.url = url
        self.backoff_params = backoff_params

    async def get_message_details(self, message_hash: str, retries: int = 0) -> dict:
        assert retries >= 0, "Retries must be greater than or equal to 0"

        api_url = f"{self.url}/messages/{message_hash}"

        try:
            async with aiohttp.ClientSession() as session:
                for _ in range(retries):
                    async with session.get(api_url) as response:
                        if response.ok:
                            return await response.json()

                        await asyncio.sleep(random.uniform(0.75, 1.25))

                async with session.get(api_url) as response:
                    response.raise_for_status()
                    return await response.json()

        except aiohttp.ClientResponseError as e:
            raise ExternalApiException(e)

    async def get_user_details(self, address: str) -> dict | None:
        api_url = f"{self.url}/safes/{address}"

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(api_url) as response:
                    if response.status == 404:
                        return None

                    response.raise_for_status()
                    return await response.json()

            except aiohttp.ClientResponseError as e:
                raise ExternalApiException(e)

    async def get_signature_if_confirmed(
        self, message_hash: str, address: str, retries: int = 0
    ) -> str | None:
        assert retries >= 0, "Retries must be greater than or equal to 0"

        message_details = await self.get_message_details(message_hash, retries)
        if message_details is None:
            return None

        user_details = await self.get_user_details(address)
        if user_details is None:
            return None

        confirmations = len(message_details["confirmations"])
        threshold = int(user_details["threshold"])

        if confirmations < threshold:
            return None

        return message_details["preparedSignature"]
