import asyncio
import logging

import aiohttp
from app.exceptions import ExternalApiException


class SafeClient:
    def __init__(self, url: str):
        self.url = url
        self._session: aiohttp.ClientSession | None = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session

    async def close(self) -> None:
        if self._session is not None and not self._session.closed:
            await self._session.close()
            self._session = None

    async def _request_with_retry(self, url: str, max_retries: int = 5) -> dict | None:
        session = await self._get_session()
        backoff = 1.0

        for attempt in range(max_retries + 1):
            try:
                async with session.get(url) as response:
                    if response.ok:
                        return await response.json()

                    if response.status == 429:
                        if attempt == max_retries:
                            response.raise_for_status()
                        retry_after = response.headers.get("Retry-After")
                        delay = float(retry_after) if retry_after else backoff
                        logging.warning(
                            f"Safe API 429 rate limited, retrying in {delay}s "
                            f"(attempt {attempt + 1}/{max_retries + 1})"
                        )
                        await asyncio.sleep(delay)
                        backoff *= 2
                        continue

                    if response.status == 404:
                        return None

                    response.raise_for_status()

            except aiohttp.ClientResponseError as e:
                raise ExternalApiException(e)

        raise ExternalApiException(Exception(f"Max retries exceeded for {url}"))

    async def get_message_details(self, message_hash: str) -> dict:
        api_url = f"{self.url}/messages/{message_hash}"
        result = await self._request_with_retry(api_url)
        if result is None:
            raise ExternalApiException(Exception(f"Message not found: {message_hash}"))
        return result

    async def get_user_details(self, address: str) -> dict | None:
        api_url = f"{self.url}/safes/{address}"
        return await self._request_with_retry(api_url)

    async def get_signature_if_confirmed(
        self, message_hash: str, address: str
    ) -> str | None:
        message_details = await self.get_message_details(message_hash)
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
