from dataclasses import dataclass
from flask import current_app as app

from eth_utils.address import to_checksum_address

import json
from typing import List, Optional

from app.extensions import db
from app.infrastructure import database
from app.infrastructure.external_api.holonym.antisybil import check
from app.context.manager import Context
from app.pydantic import Model
from app.exceptions import UserNotFound


@dataclass
class HolonymAntisybilDTO:
    has_sbt: bool
    sbt_details: List[str]


class HolonymAntisybil(Model):
    def get_sbt_status(
        self, _: Context, user_address: str
    ) -> Optional[HolonymAntisybilDTO]:
        user_address = to_checksum_address(user_address)
        try:
            entry = database.user_antisybil.get_sbt_by_address(user_address)
        except UserNotFound as ex:
            app.logger.debug(
                f"User {user_address} antisybil status: except UserNotFound"
            )
            raise ex

        if entry is not None:
            return HolonymAntisybilDTO(
                has_sbt=entry.has_sbt, sbt_details=json.loads(entry.sbt_details)
            )
        return None

    def fetch_sbt_status(self, _: Context, user_address: str) -> HolonymAntisybilDTO:
        user_address = to_checksum_address(user_address)
        has_sbt, sbt_type = check(user_address)
        return HolonymAntisybilDTO(has_sbt=has_sbt, sbt_details=sbt_type)

    def update_sbt_status(
        self, _: Context, user_address: str, has_sbt: bool, cred_type: List[str]
    ):
        database.user_antisybil.add_sbt(user_address, has_sbt, cred_type)
        db.session.commit()
