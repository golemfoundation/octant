from dataclasses import dataclass
from datetime import datetime, timezone

import backoff
import aiohttp
from app.constants import GC_PASSPORT_SCORER_API
from app.exceptions import ExternalApiException


@dataclass
class GitcoinPassportScore:
    score: float
    expires_at: datetime
    stamps: list[dict]


@dataclass
class GitcoinScorerClient:
    api_key: str
    scorer_id: str
    base_url: str = GC_PASSPORT_SCORER_API

    @property
    def _headers(self) -> dict:
        return {"X-API-KEY": self.api_key}

    async def fetch_score(self, address: str, now: datetime) -> GitcoinPassportScore:
        """
        Fetch the Gitcoin Passport score for a given address.

        1. Submit for scoring (call submit-passport)
        2. Fetch score with retries until DONE (call score/{address})
        3. Fetch stamps (call stamps/{address})
        4. Filter stamps by expiration date
        5. Return score, expiration date, and stamps
        """

        async with aiohttp.ClientSession() as session:
            # Submit for scoring
            data = await self._submit_request(session, address)

            # It's possible that the score is not yet done, so we need to fetch it with retries
            if data["status"] != "DONE":
                data = await self._fetch_score_with_retries(session, address)

            # Once ready, fetch all stamps
            all_stamps = await self._fetch_stamps(session, address)

            valid_stamps = []
            expires_at = now  # earliest expiration date
            for stamp in all_stamps:
                # We want internally to have all datetimes in UTC but no timezone info (db related)
                expiration_date = datetime.fromisoformat(
                    stamp["credential"]["expirationDate"]
                )
                expiration_date = expiration_date.astimezone(timezone.utc).replace(
                    tzinfo=None
                )

                # Skip expired stamps
                if expiration_date < now:
                    continue

                valid_stamps.append(stamp)

                # Update expiration date if it's the earliest
                if expiration_date < expires_at:
                    expires_at = expiration_date

            return GitcoinPassportScore(
                score=float(data["score"]),
                expires_at=expires_at,
                stamps=valid_stamps,
            )

    async def _submit_request(
        self, session: aiohttp.ClientSession, address: str
    ) -> dict:
        """
        Submit scoring request for Gitcoin Passport for a given address.
        """
        url = f"{self.base_url}/registry/submit-passport"
        response = await session.post(
            url,
            json={"address": address, "scorer_id": self.scorer_id},
            headers=self._headers,
        )
        response.raise_for_status()
        return await response.json()

    @backoff.on_exception(
        backoff.expo,
        [ExternalApiException, aiohttp.ClientResponseError],
        max_tries=5,
        giveup=lambda e: not isinstance(e, ExternalApiException)
        or e.status_code != 503,
    )
    async def _fetch_score_with_retries(
        self, session: aiohttp.ClientSession, address: str
    ):
        """
        Retry fetching the Gitcoin Passport score for a given address until DONE.
        """
        url = f"{self.base_url}/registry/score/{self.scorer_id}/{address}"
        response = await session.get(url, headers=self._headers)
        response.raise_for_status()

        data = await response.json()
        if data["status"] != "DONE":
            raise ExternalApiException("GP: scoring is not completed yet", 503)

        return data

    async def _fetch_stamps(self, session: aiohttp.ClientSession, address: str) -> dict:
        """
        Fetch all stamps for a given address.
        """
        url = f"{self.base_url}/registry/stamps/{address}"
        response = await session.get(url, headers=self._headers)
        response.raise_for_status()
        data = await response.json()

        return data["items"]
