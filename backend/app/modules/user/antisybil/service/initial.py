from flask import current_app as app

from typing import Optional, Tuple

from datetime import datetime
from typing import List

from app.extensions import db
from app.exceptions import ExternalApiException, UserNotFound
from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model
from app.infrastructure.external_api.common import retry_request
from app.infrastructure.external_api.gc_passport.score import (
    issue_address_for_scoring,
    fetch_score,
    fetch_stamps,
)


class GitcoinPassportAntisybil(Model):
    def get_antisybil_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[float, datetime]]:
        score = None
        try:
            score = database.user_antisybil.get_score_by_address(user_address)
        except UserNotFound as ex:
            app.logger.debug(
                f"User {user_address} antisybil status: except UserNotFound"
            )
            raise ex
        if score is not None:
            return score.score, score.expires_at
        return None

    def fetch_antisybil_status(
        self, _: Context, user_address: str
    ) -> (float, datetime, any):
        score = issue_address_for_scoring(user_address)

        def _retry_fetch():
            score = fetch_score(user_address)
            if score["status"] != "DONE":
                raise ExternalApiException("GP: scoring is not completed yet", 503)

        if score["status"] != "DONE":
            score = retry_request(self._retry_fetch, 200)

        all_stamps = fetch_stamps(user_address)["items"]
        cutoff = datetime.now()
        valid_stamps = _filter_older(cutoff, all_stamps)
        expires_at = datetime.now()
        if len(valid_stamps) != 0:
            expires_at = _parse_expirationDate(
                min([stamp["credential"]["expirationDate"] for stamp in valid_stamps])
            )
        return float(score["score"]), expires_at, all_stamps

    def update_antisybil_status(
        self,
        _: Context,
        user_address: str,
        score: float,
        expires_at: datetime,
        stamps: dict,
    ):
        database.user_antisybil.add_score(user_address, score, expires_at, stamps)
        db.session.commit()


def _parse_expirationDate(timestamp_str: str) -> datetime:
    gp_api_formats = ["%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ"]
    for format_str in gp_api_formats:
        try:
            return datetime.strptime(timestamp_str, format_str)
        except ValueError:
            pass
    raise ValueError(
        f"Gitcoin Passport returned expirationDate in unknown format: {timestamp_str}"
    )


def _filter_older(cutoff, stamps: List[dict]) -> List[dict]:
    not_expired = (
        lambda stamp: _parse_expirationDate(stamp["credential"]["expirationDate"])
        < cutoff
    )
    return list(filter(not_expired, stamps))
