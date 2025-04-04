import aiohttp
import asyncio
from app.exceptions import ExternalApiException
from backend.v2.epochs.subgraphs import BackoffParams


class SafeClient:
    def __init__(
            self, 
            url: str,
            backoff_params: BackoffParams | None = None
        ):
        self.url = url
        self.backoff_params = backoff_params

    async def get_message_details(
            self, 
            message_hash: str, 
            retries: int = 0
        ) -> dict:

        assert retries >= 0, "Retries must be greater than or equal to 0"
        
        api_url = f"{self.url}/messages/{message_hash}"

        try:
            async with aiohttp.ClientSession() as session:
                for _ in range(retries + 1):
                    async with session.get(api_url) as response:
                        # As long as we are retrying we just jump to the next iteration
                        if not response.ok:
                            continue
                        
                        # Once we're done retrying we raise the error or return the json
                        response.raise_for_status()
                        return await response.json()

        except aiohttp.ClientResponseError as e:
            raise ExternalApiException(e)

    async def get_user_details(self, address: str) -> dict| None:
        api_url = f"{self.url}/users/{address}"

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(api_url) as response:
                    if response.status == 404:
                        return None
                    
                    response.raise_for_status()
                    return await response.json()

            except aiohttp.ClientResponseError as e:
                raise ExternalApiException(e)
