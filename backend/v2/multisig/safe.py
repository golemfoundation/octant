import aiohttp
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

    async def get_message_details(self, message_hash: str) -> dict| None:
        api_url = f"{self.url}/messages/{message_hash}"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(api_url) as response:
                    if response.status == 404:
                        return None
                    
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
