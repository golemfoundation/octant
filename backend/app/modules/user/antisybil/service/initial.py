from datetime import datetime
from http import HTTPStatus
from typing import List
from typing import Optional, Tuple

from eth_utils.address import to_checksum_address
from flask import current_app as app

from app.context.manager import Context
from app.exceptions import ExternalApiException, UserNotFound, AddressAlreadyDelegated
from app.extensions import db, cache
from app.infrastructure import database
from app.infrastructure.external_api.common import retry_request
from app.infrastructure.external_api.gc_passport.score import (
    issue_address_for_scoring,
    fetch_score,
    fetch_stamps,
)
from app.modules.common.delegation import get_hashed_addresses
from app.modules.user.antisybil.core import determine_antisybil_score
from app.modules.user.antisybil.dto import AntisybilStatusDTO
from app.pydantic import Model


class GitcoinPassportAntisybil(Model):
    timeout_list: set

    def get_antisybil_status(
        self, _: Context, user_address: str
    ) -> Optional[AntisybilStatusDTO]:
        user_address = to_checksum_address(user_address)
        try:
            score = database.user_antisybil.get_score_by_address(user_address)
        except UserNotFound as ex:
            app.logger.debug(
                f"User {user_address} antisybil status: except UserNotFound"
            )
            raise ex

        return determine_antisybil_score(score, user_address, self.timeout_list)

    def fetch_antisybil_status(
        self, _: Context, user_address: str
    ) -> Tuple[float, datetime, any]:
        score = issue_address_for_scoring(user_address)

        def _retry_fetch():
            score = fetch_score(user_address)
            if score["status"] != "DONE":
                raise ExternalApiException("GP: scoring is not completed yet", 503)

        if score["status"] != "DONE":
            score = retry_request(_retry_fetch, HTTPStatus.OK)

        all_stamps = fetch_stamps(user_address)["items"]
        cutoff = datetime.now()
        valid_stamps = _filter_older(cutoff, all_stamps)
        expires_at = datetime.now()
        if len(valid_stamps) != 0:
            expires_at = _parse_expiration_date(
                min([stamp["credential"]["expirationDate"] for stamp in valid_stamps])
            )

        if user_address in self.timeout_list:
            score["score"] = 0.0

        return float(score["score"]), expires_at, all_stamps

    def update_antisybil_status(
        self,
        _: Context,
        user_address: str,
        score: float,
        expires_at: datetime,
        stamps: dict,
    ):
        self._verify_address_is_not_delegated(user_address)
        database.user_antisybil.add_score(user_address, score, expires_at, stamps)
        db.session.commit()

    def _verify_address_is_not_delegated(self, user_address: str):
        all_hashes = database.score_delegation.get_all_delegations()
        primary, secondary, _ = get_hashed_addresses(user_address, user_address)
        if primary in all_hashes or secondary in all_hashes:
            raise AddressAlreadyDelegated()


def _parse_expiration_date(timestamp_str: str) -> datetime:
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
        lambda stamp: _parse_expiration_date(stamp["credential"]["expirationDate"])
        > cutoff
    )
    return list(filter(not_expired, stamps))
